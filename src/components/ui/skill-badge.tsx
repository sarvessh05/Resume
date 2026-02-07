import { cn } from '@/lib/utils';

interface SkillBadgeProps {
  skill: string;
  variant?: 'default' | 'required' | 'optional' | 'matched';
  size?: 'sm' | 'md';
}

export function SkillBadge({ skill, variant = 'default', size = 'md' }: SkillBadgeProps) {
  const variantClasses = {
    default: 'bg-secondary text-secondary-foreground',
    required: 'bg-primary/10 text-primary border border-primary/20',
    optional: 'bg-muted text-muted-foreground',
    matched: 'bg-accent/10 text-accent border border-accent/20',
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        variantClasses[variant],
        sizeClasses[size]
      )}
    >
      {skill}
    </span>
  );
}
