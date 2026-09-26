import React, { useEffect, useState } from 'react';
import { Session } from '../types';
import { MessageSquare, Clock, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';
import { Card } from './ui/Card';
import { LoadingState } from './ui/LoadingState';
import { EmptyState } from './ui/EmptyState';

interface SessionsViewProps {
  onStartNewSession: () => void;
  onOpenSessionDetails?: (sessionId: string) => void;
}

export const SessionsView: React.FC<SessionsViewProps> = ({
  onStartNewSession,
  onOpenSessionDetails
}) => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch('/api/v1/sessions/history')
      .then(res => res.json())
      .then(json => {
        if (json.success && json.data) {
          setSessions(json.data.sessions || []);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <LoadingState message="Retrieving your safe conversation history..." />;
  }

  if (sessions.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-12">
        <EmptyState
          title="No past conversations yet"
          description="Whenever you need someone to talk to, a verified listener is here for you 24/7."
          actionLabel="Start a conversation"
          onAction={onStartNewSession}
          icon={<MessageSquare className="w-6 h-6 text-[#123B5D]" />}
        />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#17212B]">Your Conversations</h1>
          <p className="text-xs text-[#59636B]">Private & confidential listening history</p>
        </div>
        <button
          onClick={onStartNewSession}
          className="px-4 py-2 bg-[#123B5D] hover:bg-[#0D2A42] text-[#FAF9F6] rounded-xl text-xs font-semibold shadow-xs"
        >
          New Session
        </button>
      </div>

      <div className="space-y-3">
        {sessions.map(s => (
          <Card key={s.id} variant="default" padding="md" className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={s.providerAvatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                  alt={s.providerDisplayName || 'Listener'}
                  className="w-10 h-10 rounded-full object-cover border border-[#123B5D]/10"
                />
                <div>
                  <div className="font-display font-bold text-sm text-[#17212B]">{s.providerDisplayName || 'Ada'}</div>
                  <div className="text-[11px] text-[#59636B] flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-[#123B5D]" />
                    <span>Verified Listener</span>
                  </div>
                </div>
              </div>

              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                s.status === 'COMPLETED' ? 'bg-[#F3F1EC] text-[#59636B]' :
                s.status === 'ACTIVE' ? 'bg-[#123B5D]/10 text-[#123B5D] animate-pulse' :
                'bg-amber-100 text-amber-800'
              }`}>
                {s.status}
              </span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#F3F1EC] text-xs text-[#59636B]">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#59636B]" />
                <span>{Math.max(1, Math.round((s.consumedSeconds || 0) / 60))} of {Math.round(s.allocatedSeconds / 60)} minutes ({s.packageName})</span>
              </div>
              <div>{s.startedAt ? new Date(s.startedAt).toLocaleDateString() : ''}</div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};