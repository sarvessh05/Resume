import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: {
    value: number;
    label: string;
  };
  variant?: 'default' | 'primary' | 'accent';
  delay?: number;
}

export function StatCard({
  title,
  value,
  icon,
  trend,
  variant = 'default',
  delay = 0,
}: StatCardProps) {
  const variantClasses = {
    default: 'bg-card border-border',
    primary: 'gradient-primary text-primary-foreground border-transparent',
    accent: 'gradient-success text-accent-foreground border-transparent',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={cn(
        'relative overflow-hidden rounded-xl border p-6 shadow-soft',
        variantClasses[variant]
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p
            className={cn(
              'text-sm font-medium',
              variant === 'default' ? 'text-muted-foreground' : 'opacity-80'
            )}
          >
            {title}
          </p>
          <p className="mt-2 font-heading text-3xl font-bold">{value}</p>
          {trend && (
            <p
              className={cn(
                'mt-2 text-sm',
                variant === 'default' ? 'text-muted-foreground' : 'opacity-80'
              )}
            >
              <span
                className={cn(
                  'font-medium',
                  trend.value >= 0 ? 'text-accent' : 'text-destructive'
                )}
              >
                {trend.value >= 0 ? '+' : ''}
                {trend.value}%
              </span>{' '}
              {trend.label}
            </p>
          )}
        </div>
        <div
          className={cn(
            'flex h-12 w-12 items-center justify-center rounded-lg',
            variant === 'default' ? 'bg-primary/10 text-primary' : 'bg-white/20'
          )}
        >
          {icon}
        </div>
      </div>
    </motion.div>
  );
}
