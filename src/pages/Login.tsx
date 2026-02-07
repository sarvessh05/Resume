import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Mock authentication
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (email === 'admin@resumeiq.com' && password === 'admin123') {
      localStorage.setItem('isAuthenticated', 'true');
      toast.success('Welcome back!', {
        description: 'Successfully logged in to ResumeIQ',
      });
      navigate('/dashboard');
    } else {
      toast.error('Invalid credentials', {
        description: 'Please check your email and password',
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="flex min-h-screen">
      {/* Left side - Hero */}
      <div className="relative hidden w-1/2 lg:block">
        <div className="absolute inset-0 gradient-hero" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200')] bg-cover bg-center opacity-20 mix-blend-overlay" />
        <div className="relative flex h-full flex-col justify-between p-12 text-primary-foreground">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
              <Sparkles className="h-6 w-6" />
            </div>
            <span className="font-heading text-2xl font-bold">ResumeIQ</span>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-md"
          >
            <h1 className="font-heading text-5xl font-bold leading-tight">
              Hire Smarter,
              <br />
              Not Harder
            </h1>
            <p className="mt-6 text-lg opacity-90">
              AI-powered resume screening that helps you find the perfect
              candidates faster. Reduce hiring time by 70% while improving
              candidate quality.
            </p>

            <div className="mt-12 grid grid-cols-3 gap-6">
              {[
                { value: '10k+', label: 'Resumes Processed' },
                { value: '95%', label: 'Accuracy Rate' },
                { value: '70%', label: 'Time Saved' },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="font-heading text-3xl font-bold">{stat.value}</p>
                  <p className="mt-1 text-sm opacity-80">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <p className="text-sm opacity-60">
            © 2024 ResumeIQ. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex w-full items-center justify-center bg-background p-8 lg:w-1/2">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-primary">
              <Sparkles className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="font-heading text-2xl font-bold">ResumeIQ</span>
          </div>

          <div className="space-y-2">
            <h2 className="font-heading text-3xl font-bold">Welcome back</h2>
            <p className="text-muted-foreground">
              Sign in to your account to continue
            </p>
          </div>

          <form onSubmit={handleLogin} className="mt-8 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@resumeiq.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full gap-2 gradient-primary text-primary-foreground hover:opacity-90"
              disabled={isLoading}
            >
              {isLoading ? (
                'Signing in...'
              ) : (
                <>
                  Sign In
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-8 rounded-lg bg-muted/50 p-4">
            <p className="text-sm text-muted-foreground">
              <strong>Demo credentials:</strong>
              <br />
              Email: admin@resumeiq.com
              <br />
              Password: admin123
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
