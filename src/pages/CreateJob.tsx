import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Briefcase, Plus, X, ArrowLeft, Sparkles } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export default function CreateJob() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    experienceMin: '',
    experienceMax: '',
  });

  const [requiredSkills, setRequiredSkills] = useState<string[]>([]);
  const [optionalSkills, setOptionalSkills] = useState<string[]>([]);
  const [newRequiredSkill, setNewRequiredSkill] = useState('');
  const [newOptionalSkill, setNewOptionalSkill] = useState('');

  const addSkill = (type: 'required' | 'optional') => {
    if (type === 'required' && newRequiredSkill.trim()) {
      if (!requiredSkills.includes(newRequiredSkill.trim())) {
        setRequiredSkills([...requiredSkills, newRequiredSkill.trim()]);
      }
      setNewRequiredSkill('');
    } else if (type === 'optional' && newOptionalSkill.trim()) {
      if (!optionalSkills.includes(newOptionalSkill.trim())) {
        setOptionalSkills([...optionalSkills, newOptionalSkill.trim()]);
      }
      setNewOptionalSkill('');
    }
  };

  const removeSkill = (skill: string, type: 'required' | 'optional') => {
    if (type === 'required') {
      setRequiredSkills(requiredSkills.filter((s) => s !== skill));
    } else {
      setOptionalSkills(optionalSkills.filter((s) => s !== skill));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (requiredSkills.length === 0) {
      toast.error('Please add at least one required skill');
      return;
    }
    
    setIsSubmitting(true);

    try {
      const { supabase } = await import('@/lib/supabase');
      
      const { data, error } = await supabase
        .from('jobs')
        .insert({
          title: formData.title,
          description: formData.description,
          experience_min: parseInt(formData.experienceMin),
          experience_max: parseInt(formData.experienceMax),
          required_skills: requiredSkills,
          optional_skills: optionalSkills,
          status: 'active',
          total_resumes: 0,
          processed_resumes: 0,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Job created successfully!', {
        description: 'You can now start uploading resumes.',
      });

      navigate('/jobs');
    } catch (error) {
      console.error('Error creating job:', error);
      toast.error('Failed to create job', {
        description: 'Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent,
    type: 'required' | 'optional'
  ) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill(type);
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl">
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

          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl gradient-primary">
              <Briefcase className="h-7 w-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-heading text-3xl font-bold">Create Job Opening</h1>
              <p className="mt-1 text-muted-foreground">
                Define the role requirements for AI-powered candidate matching
              </p>
            </div>
          </div>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSubmit}
          className="mt-8 space-y-8"
        >
          {/* Basic Information */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-soft">
            <h2 className="font-heading text-lg font-semibold">Basic Information</h2>
            <div className="mt-4 space-y-4">
              <div>
                <Label htmlFor="title">Job Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Senior Frontend Engineer"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="description">Job Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the role, responsibilities, and ideal candidate profile..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  required
                  className="mt-1.5 min-h-[150px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="experienceMin">Min Experience (years)</Label>
                  <Input
                    id="experienceMin"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={formData.experienceMin}
                    onChange={(e) =>
                      setFormData({ ...formData, experienceMin: e.target.value })
                    }
                    required
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="experienceMax">Max Experience (years)</Label>
                  <Input
                    id="experienceMax"
                    type="number"
                    min="0"
                    placeholder="10"
                    value={formData.experienceMax}
                    onChange={(e) =>
                      setFormData({ ...formData, experienceMax: e.target.value })
                    }
                    required
                    className="mt-1.5"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Required Skills */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-soft">
            <h2 className="font-heading text-lg font-semibold">Required Skills</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Skills that candidates must have
            </p>

            <div className="mt-4 flex gap-2">
              <Input
                placeholder="Add a required skill..."
                value={newRequiredSkill}
                onChange={(e) => setNewRequiredSkill(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, 'required')}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => addSkill('required')}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {requiredSkills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill, 'required')}
                    className="ml-1 rounded-full p-0.5 hover:bg-primary/20"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              {requiredSkills.length === 0 && (
                <span className="text-sm text-muted-foreground">
                  No required skills added yet
                </span>
              )}
            </div>
          </div>

          {/* Optional Skills */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-soft">
            <h2 className="font-heading text-lg font-semibold">Nice-to-Have Skills</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Skills that would be a bonus
            </p>

            <div className="mt-4 flex gap-2">
              <Input
                placeholder="Add an optional skill..."
                value={newOptionalSkill}
                onChange={(e) => setNewOptionalSkill(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, 'optional')}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => addSkill('optional')}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {optionalSkills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-sm font-medium text-secondary-foreground"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill, 'optional')}
                    className="ml-1 rounded-full p-0.5 hover:bg-muted"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              {optionalSkills.length === 0 && (
                <span className="text-sm text-muted-foreground">
                  No optional skills added yet
                </span>
              )}
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/jobs')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="gap-2 gradient-primary text-primary-foreground hover:opacity-90"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                'Creating...'
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Create Job Opening
                </>
              )}
            </Button>
          </div>
        </motion.form>
      </div>
    </DashboardLayout>
  );
}
