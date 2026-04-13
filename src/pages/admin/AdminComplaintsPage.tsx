import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Search, Filter, MessageSquare, CheckCircle2, Clock, AlertCircle, ChevronDown } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contactService, type Complaint } from '@/services/contactService';
import { TableSkeleton, ErrorMessage } from '@/components/ui/LoadingStates';
import { formatDate } from '@/utils/format';
import toast from 'react-hot-toast';

const STATUS_CFG: Record<Complaint['status'], { label: string; color: string; bg: string; border: string; icon: typeof Clock }> = {
  new:       { label: 'New',       color: 'text-red-400',    bg: 'bg-red-500/10',    border: 'border-red-500/30',    icon: AlertCircle  },
  in_review: { label: 'In Review', color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', icon: Clock        },
  resolved:  { label: 'Resolved',  color: 'text-brand-400',  bg: 'bg-brand-500/10',  border: 'border-brand-500/30',  icon: CheckCircle2 },
};

export default function AdminComplaintsPage() {
  const qc = useQueryClient();
  const { data: complaints, isLoading, error, refetch } = useQuery({
    queryKey: ['complaints'],
    queryFn:  contactService.getAllComplaints,
    refetchInterval: 30_000,
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status, note }: { id: string; status: Complaint['status']; note?: string }) =>
      contactService.updateComplaintStatus(id, status, note),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['complaints'] }); toast.success('Status updated.'); },
    onError:   (e: Error) => toast.error(e.message),
  });

  const [filter,   setFilter]   = useState<Complaint['status'] | 'all'>('all');
  const [search,   setSearch]   = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [noteMap,  setNoteMap]  = useState<Record<string, string>>({});

  const filtered = (complaints ?? []).filter(c => {
    if (filter !== 'all' && c.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) ||
             c.subject.toLowerCase().includes(q) || c.message.toLowerCase().includes(q);
    }
    return true;
  });

  const counts = {
    all:       (complaints ?? []).length,
    new:       (complaints ?? []).filter(c => c.status === 'new').length,
    in_review: (complaints ?? []).filter(c => c.status === 'in_review').length,
    resolved:  (complaints ?? []).filter(c => c.status === 'resolved').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-white mb-1">Complaints & Messages</h2>
          <p className="text-gray-400 text-sm">Review and respond to guest feedback.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
          <span className="text-sm text-gray-400">{counts.new} new unread</span>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {([
          { val: 'all' as const, label: `All (${counts.all})` },
          { val: 'new' as const, label: `New (${counts.new})` },
          { val: 'in_review' as const, label: `In Review (${counts.in_review})` },
          { val: 'resolved' as const, label: `Resolved (${counts.resolved})` },
        ]).map(({ val, label }) => (
          <button
            key={val}
            onClick={() => setFilter(val)}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filter === val ? 'bg-brand-500 text-white' : 'glass text-gray-400 hover:text-white'
            }`}
          >
            {label}
          </button>
        ))}
        <div className="relative ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            className="input pl-9 py-2 text-sm w-56"
            placeholder="Search complaints…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <TableSkeleton rows={5} />
      ) : error ? (
        <ErrorMessage error={error} retry={refetch} />
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <MessageSquare className="w-10 h-10 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500">No complaints found for this filter.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(c => {
            const cfg  = STATUS_CFG[c.status];
            const Icon = cfg.icon;
            const open = expanded === c.id;
            return (
              <motion.div key={c.id} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                <div
                  className="card cursor-pointer"
                  onClick={() => setExpanded(open ? null : c.id)}
                >
                  {/* Summary row */}
                  <div className="flex flex-wrap items-center gap-3 justify-between">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.color} ${cfg.bg} ${cfg.border}`}>
                        <Icon className="w-3 h-3" />
                        {cfg.label}
                      </span>
                      <span className="text-white font-semibold text-sm">{c.subject}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span>{c.name}</span>
                      <span>{formatDate(c.created_at)}</span>
                      <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
                    </div>
                  </div>

                  {/* Expanded */}
                  <AnimatePresence>
                    {open && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                        onClick={e => e.stopPropagation()}
                      >
                        <div className="mt-4 pt-4 border-t border-white/8 space-y-4">
                          {/* Details grid */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div><p className="text-gray-500 text-xs">Name</p><p className="text-white">{c.name}</p></div>
                            <div><p className="text-gray-500 text-xs">Email</p><p className="text-white">{c.email}</p></div>
                            <div><p className="text-gray-500 text-xs">Phone</p><p className="text-white">{c.phone || '–'}</p></div>
                            <div><p className="text-gray-500 text-xs">Submitted</p><p className="text-white">{formatDate(c.created_at)}</p></div>
                          </div>

                          {/* Message */}
                          <div className="p-4 rounded-xl bg-white/3 border border-white/8 text-sm text-gray-300 leading-relaxed">
                            {c.message}
                          </div>

                          {/* Admin note */}
                          <div>
                            <label className="block text-xs text-gray-400 mb-1.5 font-medium">Admin Note (optional)</label>
                            <textarea
                              rows={2}
                              placeholder="Add an internal note…"
                              value={noteMap[c.id] ?? c.admin_note ?? ''}
                              onChange={e => setNoteMap(m => ({ ...m, [c.id]: e.target.value }))}
                              className="input resize-none text-sm"
                            />
                          </div>

                          {/* Action buttons */}
                          <div className="flex flex-wrap gap-3">
                            {c.status !== 'in_review' && (
                              <button
                                onClick={() => updateStatus.mutate({ id: c.id, status: 'in_review', note: noteMap[c.id] })}
                                disabled={updateStatus.isPending}
                                className="btn-secondary text-sm px-4 py-2"
                              >
                                <Clock className="w-4 h-4" />
                                Mark In Review
                              </button>
                            )}
                            {c.status !== 'resolved' && (
                              <button
                                onClick={() => updateStatus.mutate({ id: c.id, status: 'resolved', note: noteMap[c.id] })}
                                disabled={updateStatus.isPending}
                                className="btn-primary text-sm px-4 py-2"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                                Mark Resolved
                              </button>
                            )}
                            {c.status !== 'new' && (
                              <button
                                onClick={() => updateStatus.mutate({ id: c.id, status: 'new', note: noteMap[c.id] })}
                                disabled={updateStatus.isPending}
                                className="btn-ghost text-sm"
                              >
                                Reset to New
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
