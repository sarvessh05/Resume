import { cn } from '@/lib/utils';

interface ScoreBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function ScoreBadge({ score, size = 'md', showLabel = true }: ScoreBadgeProps) {
  const getScoreLevel = (score: number) => {
    if (score >= 75) return 'high';
    if (score >= 50) return 'medium';
    return 'low';
  };

  const level = getScoreLevel(score);

  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-12 w-12 text-sm',
    lg: 'h-16 w-16 text-lg',
  };

  const colorClasses = {
    high: 'bg-accent text-accent-foreground',
    medium: 'bg-score-medium text-white',
    low: 'bg-destructive text-destructive-foreground',
  };

  return (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          'flex items-center justify-center rounded-full font-heading font-bold',
          sizeClasses[size],
          colorClasses[level]
        )}
      >
        {Math.round(score)}
      </div>
      {showLabel && (
        <span className="text-sm text-muted-foreground">
          {level === 'high' && 'Strong Match'}
          {level === 'medium' && 'Moderate Match'}
          {level === 'low' && 'Low Match'}
        </span>
      )}
    </div>
  );
}
