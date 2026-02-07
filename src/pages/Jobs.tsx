import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Briefcase,
  Plus,
  Search,
  Clock,
  Users,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

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

export default function Jobs() {
  const [searchQuery, setSearchQuery] = useState('');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobs.filter(
    (job) =>
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.required_skills.some((skill) =>
        skill.toLowerCase().includes(searchQuery.toLowerCase())
      )
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold">Job Openings</h1>
            <p className="mt-1 text-muted-foreground">
              Manage and track all your job openings
            </p>
          </div>
          <Link to="/jobs/create">
            <Button className="gap-2 gradient-primary text-primary-foreground hover:opacity-90">
              <Plus className="h-4 w-4" />
              Create Job
            </Button>
          </Link>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search jobs or skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Jobs List */}
        <div className="space-y-4">
          {filteredJobs.map((job, index) => (
            <JobCard key={job.id} job={job} index={index} />
          ))}

          {filteredJobs.length === 0 && (
            <div className="rounded-xl border border-dashed border-border bg-muted/30 py-12 text-center">
              <Briefcase className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 font-heading text-lg font-semibold">
                No jobs found
              </h3>
              <p className="mt-2 text-muted-foreground">
                Try adjusting your search or create a new job opening.
              </p>
              <Link to="/jobs/create">
                <Button className="mt-4 gap-2" variant="outline">
                  <Plus className="h-4 w-4" />
                  Create Job
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

function JobCard({ job, index }: { job: Job; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Link to={`/jobs/${job.id}`}>
        <div className="group rounded-xl border border-border bg-card p-6 shadow-soft transition-all hover:border-primary/20 hover:shadow-medium">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Briefcase className="h-7 w-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-heading text-lg font-semibold group-hover:text-primary">
                    {job.title}
                  </h3>
                  <Badge
                    variant={job.status === 'active' ? 'default' : 'secondary'}
                    className={
                      job.status === 'active'
                        ? 'bg-accent/10 text-accent hover:bg-accent/20'
                        : ''
                    }
                  >
                    {job.status}
                  </Badge>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {job.experience_min}-{job.experience_max} years exp
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {job.total_resumes} candidates
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="w-32">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Processed</span>
                  <span className="font-medium">
                    {Math.round((job.processed_resumes / job.total_resumes) * 100)}%
                  </span>
                </div>
                <Progress
                  value={(job.processed_resumes / job.total_resumes) * 100}
                  className="mt-2"
                />
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {job.required_skills.map((skill) => (
              <span
                key={skill}
                className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
              >
                {skill}
              </span>
            ))}
            {job.optional_skills.slice(0, 2).map((skill) => (
              <span
                key={skill}
                className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
