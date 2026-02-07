import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Search,
  Filter,
  Users,
  CheckCircle,
  Clock,
  XCircle,
  Loader2,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScoreBadge } from '@/components/ui/score-badge';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface Candidate {
  id: string;
  job_id: string;
  resume_filename: string;
  parsed_data: {
    name: string;
    email: string;
    phone?: string;
    skills: string[];
    experience_years: number;
    education: string[];
    roles: string[];
  };
  match_score: number;
  skill_match_score: number;
  experience_match_score: number;
  recommendation: 'Shortlist' | 'Review' | 'Reject';
}

interface Job {
  id: string;
  title: string;
}

export default function CandidatesList() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [minScore, setMinScore] = useState(0);

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const fetchData = async () => {
    try {
      const { data: jobData, error: jobError } = await supabase
        .from('jobs')
        .select('id, title')
        .eq('id', id)
        .single();

      if (jobError) throw jobError;
      setJob(jobData);

      const { data: candidatesData, error: candidatesError } = await supabase
        .from('candidates')
        .select('*')
        .eq('job_id', id)
        .order('match_score', { ascending: false });

      if (candidatesError) throw candidatesError;
      setCandidates(candidatesData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load candidates');
    } finally {
      setLoading(false);
    }
  };

  const filteredCandidates = candidates.filter(
    (c) =>
      c.parsed_data.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      c.match_score >= minScore
  );

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
      <div className="space-y-6">
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
            Back to Job
          </Button>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="font-heading text-2xl font-bold">
                Candidates for {job.title}
              </h1>
              <p className="mt-1 text-muted-foreground">
                {candidates.length} candidates ranked by match score
              </p>
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col gap-4 sm:flex-row sm:items-center"
        >
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search candidates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Min Score:</span>
            <select
              value={minScore}
              onChange={(e) => setMinScore(Number(e.target.value))}
              className="rounded-md border border-input bg-background px-3 py-1.5 text-sm"
            >
              <option value={0}>All</option>
              <option value={50}>50+</option>
              <option value={70}>70+</option>
              <option value={80}>80+</option>
              <option value={90}>90+</option>
            </select>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="grid gap-4 sm:grid-cols-3"
        >
          <div className="flex items-center gap-3 rounded-xl bg-accent/10 p-4">
            <CheckCircle className="h-5 w-5 text-accent" />
            <div>
              <p className="text-sm text-muted-foreground">Shortlisted</p>
              <p className="font-heading text-xl font-bold">
                {candidates.filter((c) => c.recommendation === 'Shortlist').length}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-score-medium/10 p-4">
            <Clock className="h-5 w-5 text-score-medium" />
            <div>
              <p className="text-sm text-muted-foreground">Under Review</p>
              <p className="font-heading text-xl font-bold">
                {candidates.filter((c) => c.recommendation === 'Review').length}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-destructive/10 p-4">
            <XCircle className="h-5 w-5 text-destructive" />
            <div>
              <p className="text-sm text-muted-foreground">Not a Match</p>
              <p className="font-heading text-xl font-bold">
                {candidates.filter((c) => c.recommendation === 'Reject').length}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Candidates List */}
        <div className="space-y-4">
          {filteredCandidates.map((candidate, index) => (
            <CandidateCard
              key={candidate.id}
              candidate={candidate}
              index={index}
              jobId={id!}
            />
          ))}

          {filteredCandidates.length === 0 && (
            <div className="rounded-xl border border-dashed border-border bg-muted/30 py-12 text-center">
              <Users className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 font-heading text-lg font-semibold">
                No candidates found
              </h3>
              <p className="mt-2 text-muted-foreground">
                Try adjusting your filters or upload more resumes.
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

function CandidateCard({
  candidate,
  index,
  jobId,
}: {
  candidate: Candidate;
  index: number;
  jobId: string;
}) {
  const getRecommendationStyles = (rec: string) => {
    switch (rec) {
      case 'Shortlist':
        return 'bg-accent/10 text-accent border-accent/20';
      case 'Review':
        return 'bg-score-medium/10 text-score-medium border-score-medium/20';
      case 'Reject':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      default:
        return '';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link to={`/jobs/${jobId}/candidates/${candidate.id}`}>
        <div className="group rounded-xl border border-border bg-card p-6 shadow-soft transition-all hover:border-primary/20 hover:shadow-medium">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            {/* Rank & Score */}
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted font-heading font-bold text-muted-foreground">
                #{index + 1}
              </div>
              <ScoreBadge score={candidate.match_score} showLabel={false} />
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h3 className="font-heading text-lg font-semibold group-hover:text-primary">
                  {candidate.parsed_data.name}
                </h3>
                <span
                  className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${getRecommendationStyles(
                    candidate.recommendation
                  )}`}
                >
                  {candidate.recommendation}
                </span>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span>{candidate.parsed_data.email}</span>
                <span>•</span>
                <span>{candidate.parsed_data.experience_years} years exp</span>
              </div>
            </div>

            {/* Score Breakdown */}
            <div className="flex gap-6 text-center">
              <div>
                <p className="text-xs text-muted-foreground">Skills</p>
                <p className="font-heading font-bold text-primary">
                  {Math.round(candidate.skill_match_score)}%
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Experience</p>
                <p className="font-heading font-bold text-primary">
                  {Math.round(candidate.experience_match_score)}%
                </p>
              </div>
            </div>
          </div>

          {/* Skills preview */}
          <div className="mt-4 flex flex-wrap gap-2">
            {candidate.parsed_data.skills.slice(0, 5).map((skill) => (
              <span
                key={skill}
                className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground"
              >
                {skill}
              </span>
            ))}
            {candidate.parsed_data.skills.length > 5 && (
              <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
                +{candidate.parsed_data.skills.length - 5} more
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
