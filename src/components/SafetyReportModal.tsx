import React, { useState } from 'react';
import { ShieldAlert, X, AlertTriangle, CheckCircle2, PhoneCall } from 'lucide-react';

interface SafetyReportModalProps {
  sessionId?: string;
  providerName?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const SafetyReportModal: React.FC<SafetyReportModalProps> = ({
  sessionId,
  providerName = 'Listener',
  isOpen,
  onClose
}) => {
  // No preselected category: a report sent without choosing must not be filed as something it isn't.
  const [category, setCategory] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [blockUser, setBlockUser] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [blockApplied, setBlockApplied] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category) {
      setSubmitError('Please choose what happened.');
      return;
    }
    setSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch('/api/v1/safety/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          category,
          note,
          blockUser
        })
      });
      const json = await res.json().catch(() => null);
      if (res.ok && json?.success) {
        setBlockApplied(Boolean(json.data?.userBlocked));
        setSubmitted(true);
      } else if (res.status === 401) {
        setSubmitError('Please sign in to send a report. If anyone is in immediate danger, call 112 now.');
      } else {
        setSubmitError(json?.error?.message || 'Your report could not be sent. Please try again. If anyone is in immediate danger, call 112 now.');
      }
    } catch (err) {
      // Never pretend a safety report was received when it wasn't.
      setSubmitError('Your report could not be sent because of a connection problem. Please try again. If anyone is in immediate danger, call 112 now.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#17212B]/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#E3E2DE] relative space-y-5">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#F3F1EC] hover:bg-[#E3E2DE] text-[#59636B] flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {submitted ? (
          <div className="text-center space-y-4 py-4">
            <div className="w-14 h-14 rounded-full bg-[#123B5D]/10 text-[#123B5D] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="font-display text-xl font-bold text-[#17212B]">
              Report received
            </h3>
            <p className="text-xs text-[#59636B] leading-relaxed max-w-md mx-auto">
              Thank you for telling us. A member of our safeguarding team will review it.
              {blockApplied && ' You will not be matched with this person again.'}
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-[#123B5D] text-white rounded-xl font-bold text-xs"
            >
              Close Window
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmitReport} className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display text-xl font-bold text-[#17212B]">
                  Trust & Safety Incident Report
                </h3>
                <p className="text-xs text-[#59636B]">
                  Report misconduct or inappropriate behavior by {providerName}.
                </p>
              </div>
            </div>

            {/* Incident Category */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#17212B] uppercase tracking-wider block">
                Category
              </label>
              <select
                value={category}
                required
                onChange={(e) => { setCategory(e.target.value); setSubmitError(null); }}
                className="w-full px-3.5 py-2.5 bg-[#FAF9F6] border border-[#E3E2DE] rounded-xl text-xs text-[#17212B] font-semibold focus:ring-2 focus:ring-[#123B5D] outline-hidden"
              >
                <option value="" disabled>Choose what happened…</option>
                <option value="THREAT_OF_VIOLENCE">Threat of Violence or Verbal Abuse</option>
                <option value="SEXUAL_ASSAULT">Sexual Assault or Boundary Violation</option>
                <option value="DOMESTIC_VIOLENCE">Domestic Violence or Intimate Partner Risk</option>
                <option value="EXPLOITATION">Financial or Personal Exploitation</option>
                <option value="CHILD_ABUSE">Child Abuse or Minor Protection Concern</option>
                <option value="TRAFFICKING">Human Trafficking or Forced Labor</option>
                <option value="IMMEDIATE_DANGER">Immediate Physical Danger / Emergency</option>
                <option value="SELF_HARM">Self-Harm Concern</option>
                <option value="SUICIDE_RISK">Suicide Risk / Crisis Intervention Required</option>
                <option value="OTHER">Other Misconduct / Boundary Violation</option>
              </select>
            </div>

            {/* Note */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#17212B] uppercase tracking-wider block">
                Details
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Briefly describe what happened..."
                rows={3}
                required
                className="w-full p-3 bg-[#FAF9F6] border border-[#E3E2DE] rounded-xl text-xs text-[#17212B] focus:ring-2 focus:ring-[#123B5D] outline-none"
              />
            </div>

            {/* Block Checkbox */}
            <label className="flex items-start gap-3 p-3 bg-[#FAF9F6] border border-[#E3E2DE] rounded-xl cursor-pointer">
              <input
                type="checkbox"
                checked={blockUser}
                onChange={(e) => setBlockUser(e.target.checked)}
                className="mt-0.5 accent-[#123B5D]"
              />
              <div className="text-xs">
                <div className="font-bold text-[#17212B]">Block and never match with this listener again</div>
                <div className="text-[#59636B] text-[11px]">The Matching Engine will permanently exclude them from your pool.</div>
              </div>
            </label>

            {/* Urgent Distress Hotline Referral */}
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-amber-700 shrink-0" />
              <span>If someone is in immediate physical danger, call emergency services or Nigeria Suicide Prevention Initiative (+234 806 210 6497).</span>
            </div>

            {submitError && (
              <p role="alert" className="text-xs font-medium text-[#B3261E] bg-[#FDF2F2] border border-[#F9C9C7] rounded-xl p-3">{submitError}</p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
            >
              {submitting ? 'Sending…' : 'Submit Confidential Safety Flag'}
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
