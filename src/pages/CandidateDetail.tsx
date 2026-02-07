import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Mail,
  Phone,
  Briefcase,
  GraduationCap,
  Code2,
  Folder,
  Sparkles,
  CheckCircle,
  AlertCircle,
  FileText,
  Download,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { ScoreBadge } from '@/components/ui/score-badge';
import { SkillBadge } from '@/components/ui/skill-badge';
import { Progress } from '@/components/ui/progress';
import { mockJobs, mockCandidates } from '@/lib/mockData';

export default function CandidateDetail() {
  const { id, candidateId } = useParams<{ id: string; candidateId: string }>();
  const navigate = useNavigate();

  const job = mockJobs.find((j) => j.id === id);
  const candidate = mockCandidates.find((c) => c.id === candidateId);

  if (!job || !candidate) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold">Candidate not found</h1>
          <Link to="/jobs">
            <Button className="mt-4">Back to Jobs</Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const getRecommendationStyles = (rec: string) => {
    switch (rec) {
      case 'Shortlist':
        return {
          bg: 'bg-accent/10',
          text: 'text-accent',
          border: 'border-accent/20',
          icon: CheckCircle,
        };
      case 'Review':
        return {
          bg: 'bg-score-medium/10',
          text: 'text-score-medium',
          border: 'border-score-medium/20',
          icon: AlertCircle,
        };
      case 'Reject':
        return {
          bg: 'bg-destructive/10',
          text: 'text-destructive',
          border: 'border-destructive/20',
          icon: AlertCircle,
        };
      default:
        return {
          bg: 'bg-muted',
          text: 'text-muted-foreground',
          border: 'border-border',
          icon: AlertCircle,
        };
    }
  };

  const recStyles = getRecommendationStyles(candidate.recommendation);
  const RecIcon = recStyles.icon;

  const matchedSkills = candidate.parsed_data.skills.filter((skill) =>
    job.required_skills
      .map((s) => s.toLowerCase())
      .includes(skill.toLowerCase())
  );

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
            Back to Candidates
          </Button>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary text-2xl font-bold text-primary-foreground">
                {candidate.parsed_data.name.charAt(0)}
              </div>
              <div>
                <h1 className="font-heading text-2xl font-bold">
                  {candidate.parsed_data.name}
                </h1>
                <div className="mt-1 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    {candidate.parsed_data.email}
                  </span>
                  {candidate.parsed_data.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      {candidate.parsed_data.phone}
                    </span>
                  )}
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Applied for: <span className="font-medium text-foreground">{job.title}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Download Resume
              </Button>
              <Button variant="outline" className="gap-2">
                <Mail className="h-4 w-4" />
                Contact
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Scores & AI Analysis */}
          <div className="space-y-6">
            {/* Match Score */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-xl border border-border bg-card p-6 shadow-soft"
            >
              <h2 className="font-heading text-lg font-semibold">Match Score</h2>
              <div className="mt-4 flex items-center justify-center">
                <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-accent/20">
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-card">
                    <span className="font-heading text-4xl font-bold text-primary">
                      {Math.round(candidate.match_score)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Skills Match</span>
                    <span className="font-medium">{Math.round(candidate.skill_match_score)}%</span>
                  </div>
                  <Progress value={candidate.skill_match_score} className="mt-2" />
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Experience Match</span>
                    <span className="font-medium">
                      {Math.round(candidate.experience_match_score)}%
                    </span>
                  </div>
                  <Progress value={candidate.experience_match_score} className="mt-2" />
                </div>
              </div>
            </motion.div>

            {/* Recommendation */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className={`rounded-xl border p-6 ${recStyles.bg} ${recStyles.border}`}
            >
              <div className="flex items-center gap-2">
                <RecIcon className={`h-5 w-5 ${recStyles.text}`} />
                <h2 className={`font-heading text-lg font-semibold ${recStyles.text}`}>
                  {candidate.recommendation}
                </h2>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {candidate.recommendation === 'Shortlist' &&
                  'Strong candidate for this position'}
                {candidate.recommendation === 'Review' &&
                  'Consider for further evaluation'}
                {candidate.recommendation === 'Reject' &&
                  'Does not meet minimum requirements'}
              </p>
            </motion.div>
          </div>

          {/* Middle Column - Details */}
          <div className="space-y-6">
            {/* Skills */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="rounded-xl border border-border bg-card p-6 shadow-soft"
            >
              <div className="flex items-center gap-2">
                <Code2 className="h-5 w-5 text-primary" />
                <h2 className="font-heading text-lg font-semibold">Skills</h2>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {candidate.parsed_data.skills.map((skill) => {
                  const isMatched = matchedSkills.includes(skill);
                  return (
                    <SkillBadge
                      key={skill}
                      skill={skill}
                      variant={isMatched ? 'matched' : 'default'}
                    />
                  );
                })}
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                <span className="font-medium text-accent">{matchedSkills.length}</span> of{' '}
                {job.required_skills.length} required skills matched
              </p>
            </motion.div>

            {/* Experience */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-xl border border-border bg-card p-6 shadow-soft"
            >
              <div className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" />
                <h2 className="font-heading text-lg font-semibold">Experience</h2>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {candidate.parsed_data.experience_years} years of experience
              </p>
              <div className="mt-4 space-y-3">
                {candidate.parsed_data.roles.map((role, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 rounded-lg bg-muted/50 p-3"
                  >
                    <div className="mt-0.5 h-2 w-2 rounded-full bg-primary" />
                    <span className="text-sm">{role}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Education */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="rounded-xl border border-border bg-card p-6 shadow-soft"
            >
              <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary" />
                <h2 className="font-heading text-lg font-semibold">Education</h2>
              </div>
              <div className="mt-4 space-y-2">
                {candidate.parsed_data.education.map((edu, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 rounded-lg bg-muted/50 p-3"
                  >
                    <div className="mt-0.5 h-2 w-2 rounded-full bg-accent" />
                    <span className="text-sm">{edu}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Column - AI Analysis */}
          <div className="space-y-6">
            {/* AI Explanation */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 p-6"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <h2 className="font-heading text-lg font-semibold">AI Analysis</h2>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                {candidate.explanation}
              </p>
            </motion.div>

            {/* Strengths */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-xl border border-border bg-card p-6 shadow-soft"
            >
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-accent" />
                <h2 className="font-heading text-lg font-semibold">Strengths</h2>
              </div>
              <ul className="mt-4 space-y-2">
                {candidate.strengths.map((strength, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent" />
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Gaps */}
            {candidate.gaps.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="rounded-xl border border-border bg-card p-6 shadow-soft"
              >
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-score-medium" />
                  <h2 className="font-heading text-lg font-semibold">Potential Gaps</h2>
                </div>
                <ul className="mt-4 space-y-2">
                  {candidate.gaps.map((gap, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-score-medium" />
                      <span>{gap}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
