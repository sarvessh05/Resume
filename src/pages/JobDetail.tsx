import { useState, useCallback, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Briefcase,
  Clock,
  Users,
  Upload,
  FileText,
  CheckCircle,
  Loader2,
  Trash2,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { SkillBadge } from '@/components/ui/skill-badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { analyzeResume } from '@/lib/groq';
import { extractTextFromFile } from '@/lib/resumeParser';

interface Job {
  id: string;
  title: string;
  description: string;
  experience_min: number;
  experience_max: number;
  required_skills: string[];
  optional_skills: string[];
  status: 'active' | 'closed' | 'draft';
  total_resumes: number;
  processed_resumes: number;
  created_at: string;
}

export default function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [candidatesCount, setCandidatesCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);

  useEffect(() => {
    if (id) {
      fetchJobDetails();
    }
  }, [id]);

  const fetchJobDetails = async () => {
    try {
      const { data: jobData, error: jobError } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', id)
        .single();

      if (jobError) throw jobError;
      setJob(jobData);

      const { count } = await supabase
        .from('candidates')
        .select('*', { count: 'exact', head: true })
        .eq('job_id', id);

      setCandidatesCount(count || 0);
    } catch (error) {
      console.error('Error fetching job:', error);
      toast.error('Failed to load job details');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteJob = async () => {
    if (!id) return;

    try {
      // First delete all candidates for this job
      const { error: candidatesError } = await supabase
        .from('candidates')
        .delete()
        .eq('job_id', id);

      if (candidatesError) throw candidatesError;

      // Then delete the job
      const { error: jobError } = await supabase
        .from('jobs')
        .delete()
        .eq('id', id);

      if (jobError) throw jobError;

      toast.success('Job deleted successfully');
      navigate('/jobs');
    } catch (error) {
      console.error('Error deleting job:', error);
      toast.error('Failed to delete job');
    }
  };

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      const files = Array.from(e.dataTransfer.files).filter(
        (file) =>
          file.type === 'application/pdf' ||
          file.type ===
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      );

      if (files.length === 0) {
        toast.error('Invalid file type', {
          description: 'Please upload PDF or DOCX files only',
        });
        return;
      }

      await processFiles(files);
    },
    [job]
  );

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length > 0) {
      await processFiles(files);
    }
  };

  const processFiles = async (files: File[]) => {
    if (!job) return;

    setIsUploading(true);
    setUploadProgress(0);
    setUploadedFiles([]);

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setUploadedFiles((prev) => [...prev, file.name]);

      try {
        // Upload to Supabase Storage
        const fileExt = file.name.split('.').pop();
        const fileName = `${job.id}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('resumes')
          .upload(fileName, file);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          throw new Error(`Upload failed: ${uploadError.message}`);
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('resumes')
          .getPublicUrl(fileName);

        // Extract text from resume
        let resumeText: string;
        try {
          resumeText = await extractTextFromFile(file);
          console.log(`Extracted ${resumeText.length} characters from ${file.name}`);
        } catch (extractError) {
          console.error('Text extraction error:', extractError);
          throw new Error(`Failed to read resume: ${extractError instanceof Error ? extractError.message : 'Unknown error'}`);
        }

        // Analyze with Groq AI
        let analysis;
        try {
          analysis = await analyzeResume(resumeText, {
            title: job.title,
            description: job.description,
            required_skills: job.required_skills,
            optional_skills: job.optional_skills,
            experience_min: job.experience_min,
            experience_max: job.experience_max,
          });
          console.log(`Analysis complete for ${file.name}:`, analysis);
        } catch (aiError) {
          console.error('AI analysis error:', aiError);
          throw new Error(`AI analysis failed: ${aiError instanceof Error ? aiError.message : 'Unknown error'}`);
        }

        // Save candidate to database
        const { error: insertError } = await supabase.from('candidates').insert({
          job_id: job.id,
          resume_filename: file.name,
          resume_url: publicUrl,
          parsed_data: analysis.parsed_data,
          match_score: analysis.match_score,
          skill_match_score: analysis.skill_match_score,
          experience_match_score: analysis.experience_match_score,
          explanation: analysis.explanation,
          strengths: analysis.strengths,
          gaps: analysis.gaps,
          recommendation: analysis.recommendation,
          processed_at: new Date().toISOString(),
        });

        if (insertError) {
          console.error('Database insert error:', insertError);
          throw new Error(`Database error: ${insertError.message}`);
        }

        successCount++;
      } catch (error) {
        console.error(`Error processing ${file.name}:`, error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        toast.error(`Failed to process ${file.name}`, {
          description: errorMessage,
        });
        failCount++;
      }

      setUploadProgress(Math.round(((i + 1) / files.length) * 100));
    }

    // Update job stats
    await supabase
      .from('jobs')
      .update({
        total_resumes: job.total_resumes + successCount,
        processed_resumes: job.processed_resumes + successCount,
      })
      .eq('id', job.id);

    setIsUploading(false);
    await fetchJobDetails();

    if (successCount > 0) {
      toast.success('Resumes processed!', {
        description: `${successCount} resume(s) analyzed successfully.${failCount > 0 ? ` ${failCount} failed.` : ''}`,
      });
    } else {
      toast.error('Failed to process resumes', {
        description: 'Please try again.',
      });
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!job) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold">Job not found</h1>
          <Link to="/jobs">
            <Button className="mt-4">Back to Jobs</Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Button
            variant="ghost"
            className="mb-4 gap-2"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl gradient-primary">
                <Briefcase className="h-7 w-7 text-primary-foreground" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-heading text-2xl font-bold">{job.title}</h1>
                  <Badge
                    className={
                      job.status === 'active'
                        ? 'bg-accent/10 text-accent'
                        : ''
                    }
                  >
                    {job.status}
                  </Badge>
                </div>
                <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {job.experience_min}-{job.experience_max} years
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {job.total_resumes} candidates
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Link to={`/jobs/${id}/candidates`}>
                <Button className="gap-2 gradient-primary text-primary-foreground hover:opacity-90">
                  <Users className="h-4 w-4" />
                  View Candidates ({candidatesCount})
                </Button>
              </Link>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="icon">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Job</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this job? This will also delete all {candidatesCount} candidate(s) associated with it. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteJob} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Job Details */}
          <div className="space-y-6 lg:col-span-2">
            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-xl border border-border bg-card p-6 shadow-soft"
            >
              <h2 className="font-heading text-lg font-semibold">Description</h2>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                {job.description}
              </p>
            </motion.div>

            {/* Skills */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-xl border border-border bg-card p-6 shadow-soft"
            >
              <h2 className="font-heading text-lg font-semibold">Required Skills</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {job.required_skills.map((skill) => (
                  <SkillBadge key={skill} skill={skill} variant="required" />
                ))}
              </div>

              {job.optional_skills.length > 0 && (
                <>
                  <h3 className="mt-6 font-medium text-muted-foreground">
                    Nice to Have
                  </h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {job.optional_skills.map((skill) => (
                      <SkillBadge key={skill} skill={skill} variant="optional" />
                    ))}
                  </div>
                </>
              )}
            </motion.div>

            {/* Upload Area */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-xl border border-border bg-card p-6 shadow-soft"
            >
              <h2 className="font-heading text-lg font-semibold">Upload Resumes</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Upload PDF or DOCX files for AI-powered analysis
              </p>

              <div
                onDrop={handleDrop}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                className={`mt-4 rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
                  isDragOver
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                {isUploading ? (
                  <div className="space-y-4">
                    <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
                    <div>
                      <p className="font-medium">Processing resumes...</p>
                      <p className="text-sm text-muted-foreground">
                        AI is analyzing {uploadedFiles.length} file(s)
                      </p>
                    </div>
                    <Progress value={uploadProgress} className="mx-auto max-w-xs" />
                    <div className="mx-auto max-w-md space-y-1">
                      {uploadedFiles.slice(-3).map((file, i) => (
                        <div
                          key={file}
                          className="flex items-center justify-center gap-2 text-sm"
                        >
                          {i === uploadedFiles.length - 1 ? (
                            <Loader2 className="h-3 w-3 animate-spin text-primary" />
                          ) : (
                            <CheckCircle className="h-3 w-3 text-accent" />
                          )}
                          <span className="truncate">{file}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div>
                    <Upload className="mx-auto h-10 w-10 text-muted-foreground" />
                    <p className="mt-4 font-medium">
                      Drag & drop resumes here, or{' '}
                      <label className="cursor-pointer text-primary underline-offset-4 hover:underline">
                        browse
                        <input
                          type="file"
                          multiple
                          accept=".pdf,.docx"
                          className="hidden"
                          onChange={handleFileInput}
                        />
                      </label>
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Supports PDF and DOCX (max 50 files)
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Right Column - Stats */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-xl border border-border bg-card p-6 shadow-soft"
            >
              <h2 className="font-heading text-lg font-semibold">Statistics</h2>

              <div className="mt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Total Resumes</span>
                  <span className="font-heading font-bold">{job.total_resumes}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Processed</span>
                  <span className="font-heading font-bold">{job.processed_resumes}</span>
                </div>
                {job.total_resumes > 0 && (
                  <div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">
                        {Math.round((job.processed_resumes / job.total_resumes) * 100)}%
                      </span>
                    </div>
                    <Progress
                      value={(job.processed_resumes / job.total_resumes) * 100}
                      className="mt-2"
                    />
                  </div>
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-xl border border-border bg-card p-6 shadow-soft"
            >
              <h2 className="font-heading text-lg font-semibold">Quick Actions</h2>
              <div className="mt-4 space-y-2">
                <Link to={`/jobs/${id}/candidates`}>
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Users className="h-4 w-4" />
                    View All Candidates
                  </Button>
                </Link>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <FileText className="h-4 w-4" />
                  Export Report
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
