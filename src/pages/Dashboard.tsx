import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import {
  Briefcase,
  FileText,
  TrendingUp,
  UserCheck,
  ArrowRight,
  Clock,
  Users,
  Loader2,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/ui/stat-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface Job {
  id: string;
  title: string;
  experience_min: number;
  experience_max: number;
  required_skills: string[];
  status: 'active' | 'closed' | 'draft';
  total_resumes: number;
  processed_resumes: number;
}

export default function Dashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [stats, setStats] = useState({
    active_jobs: 0,
    total_resumes: 0,
    avg_match_score: 0,
    shortlisted: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch jobs
      const { data: jobsData, error: jobsError } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3);

      if (jobsError) throw jobsError;
      setJobs(jobsData || []);

      // Calculate stats
      const { data: allJobs } = await supabase
        .from('jobs')
        .select('total_resumes, status');

      const { data: candidates } = await supabase
        .from('candidates')
        .select('match_score, recommendation');

      const activeJobs = allJobs?.filter((j) => j.status === 'active').length || 0;
      const totalResumes = allJobs?.reduce((sum, j) => sum + j.total_resumes, 0) || 0;
      const avgScore = candidates?.length
        ? Math.round(
            candidates.reduce((sum, c) => sum + c.match_score, 0) / candidates.length
          )
        : 0;
      const shortlisted =
        candidates?.filter((c) => c.recommendation === 'Shortlist').length || 0;

      setStats({
        active_jobs: activeJobs,
        total_resumes: totalResumes,
        avg_match_score: avgScore,
        shortlisted,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
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

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h1 className="font-heading text-3xl font-bold">Dashboard</h1>
            <p className="mt-1 text-muted-foreground">
              Welcome back! Here's your recruitment overview.
            </p>
          </div>
          <Link to="/jobs/create">
            <Button className="gap-2 gradient-primary text-primary-foreground hover:opacity-90">
              <Briefcase className="h-4 w-4" />
              Create New Job
            </Button>
          </Link>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Active Jobs"
            value={stats.active_jobs}
            icon={<Briefcase className="h-6 w-6" />}
            variant="primary"
            delay={0}
          />
          <StatCard
            title="Resumes Processed"
            value={stats.total_resumes}
            icon={<FileText className="h-6 w-6" />}
            delay={0.1}
          />
          <StatCard
            title="Avg Match Score"
            value={`${stats.avg_match_score}%`}
            icon={<TrendingUp className="h-6 w-6" />}
            variant="accent"
            delay={0.2}
          />
          <StatCard
            title="Shortlisted"
            value={stats.shortlisted}
            icon={<UserCheck className="h-6 w-6" />}
            delay={0.3}
          />
        </div>

        {/* Recent Jobs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-heading text-xl font-semibold">Recent Job Openings</h2>
            <Link to="/jobs">
              <Button variant="ghost" className="gap-1 text-primary">
                View all
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {jobs.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-muted/30 py-12 text-center">
              <Briefcase className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 font-heading text-lg font-semibold">
                No jobs yet
              </h3>
              <p className="mt-2 text-muted-foreground">
                Create your first job opening to get started.
              </p>
              <Link to="/jobs/create">
                <Button className="mt-4">Create Job</Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {jobs.map((job, index) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  <Link to={`/jobs/${job.id}`}>
                    <div className="group rounded-xl border border-border bg-card p-6 shadow-soft transition-all hover:border-primary/20 hover:shadow-medium">
                      <div className="flex items-start justify-between">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <Briefcase className="h-6 w-6" />
                        </div>
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

                      <h3 className="mt-4 font-heading text-lg font-semibold group-hover:text-primary">
                        {job.title}
                      </h3>

                      <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {job.experience_min}-{job.experience_max} years
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {job.total_resumes} resumes
                        </span>
                      </div>

                      {job.total_resumes > 0 && (
                        <div className="mt-4">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Processing</span>
                            <span className="font-medium">
                              {job.processed_resumes}/{job.total_resumes}
                            </span>
                          </div>
                          <Progress
                            value={(job.processed_resumes / job.total_resumes) * 100}
                            className="mt-2"
                          />
                        </div>
                      )}

                      <div className="mt-4 flex flex-wrap gap-2">
                        {job.required_skills.slice(0, 3).map((skill) => (
                          <span
                            key={skill}
                            className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground"
                          >
                            {skill}
                          </span>
                        ))}
                        {job.required_skills.length > 3 && (
                          <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
                            +{job.required_skills.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
