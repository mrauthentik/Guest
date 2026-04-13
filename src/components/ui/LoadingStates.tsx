import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sz = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' }[size];
  return (
    <Loader2 className={`${sz} text-brand-400 animate-spin`} />
  );
}

export function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-gold-400 flex items-center justify-center animate-glow">
            <Loader2 className="w-8 h-8 text-dark-900 animate-spin" />
          </div>
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-brand-500 to-gold-400 blur-xl opacity-30 animate-pulse" />
        </div>
        <p className="text-gray-400 text-sm animate-pulse">Loading…</p>
      </div>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="card animate-pulse">
      <div className="h-48 w-full bg-white/5 rounded-xl mb-4 shimmer" />
      <div className="h-4 w-3/4 bg-white/5 rounded mb-2 shimmer" />
      <div className="h-4 w-1/2 bg-white/5 rounded shimmer" />
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-16 w-full bg-white/3 rounded-xl shimmer" />
      ))}
    </div>
  );
}

interface EmptyStateProps {
  title:       string;
  description: string;
  icon?:       React.ReactNode;
  action?:     React.ReactNode;
}

export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-20 px-4 text-center"
    >
      {icon && (
        <div className="w-20 h-20 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mb-6 text-brand-400">
          {icon}
        </div>
      )}
      <h3 className="text-xl font-display font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-400 text-sm max-w-sm mb-6">{description}</p>
      {action}
    </motion.div>
  );
}

interface ErrorMessageProps {
  error: Error | unknown;
  retry?: () => void;
}

export function ErrorMessage({ error, retry }: ErrorMessageProps) {
  const message = error instanceof Error ? error.message : 'An unexpected error occurred';
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center gap-4 py-12"
    >
      <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-center max-w-md">
        <p className="text-red-400 text-sm font-medium">{message}</p>
      </div>
      {retry && (
        <button onClick={retry} className="btn-secondary text-sm">
          Try Again
        </button>
      )}
    </motion.div>
  );
}
