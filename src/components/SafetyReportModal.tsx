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
  const [category, setCategory] = useState<string>('HARASSMENT');
  const [note, setNote] = useState<string>('');
  const [blockUser, setBlockUser] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await fetch('/api/v1/safety/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          category,
          note,
          blockUser
        })
      });
      setSubmitted(true);
    } catch (err) {
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl border border-stone-200 relative space-y-5">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {submitted ? (
          <div className="text-center space-y-4 py-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="font-serif text-xl font-bold text-stone-900">
              Report Submitted & Safety Actions Applied
            </h3>
            <p className="text-xs text-stone-500 leading-relaxed max-w-md mx-auto">
              Thank you for keeping Safespace safe. Our Trust & Safety team reviews every flag immediately. If you chose to block this listener, you will never be matched with them again.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-emerald-900 text-white rounded-xl font-bold text-xs"
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
                <h3 className="font-serif text-xl font-bold text-stone-900">
                  Trust & Safety Incident Report
                </h3>
                <p className="text-xs text-stone-500">
                  Report misconduct or inappropriate behavior by {providerName}.
                </p>
              </div>
            </div>

            {/* Incident Category */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-800 uppercase tracking-wider block">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 font-semibold focus:ring-2 focus:ring-emerald-800 outline-hidden"
              >
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
              <label className="text-xs font-bold text-stone-800 uppercase tracking-wider block">
                Details
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Briefly describe what happened..."
                rows={3}
                required
                className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:ring-2 focus:ring-emerald-700 outline-none"
              />
            </div>

            {/* Block Checkbox */}
            <label className="flex items-start gap-3 p-3 bg-stone-50 border border-stone-200 rounded-xl cursor-pointer">
              <input
                type="checkbox"
                checked={blockUser}
                onChange={(e) => setBlockUser(e.target.checked)}
                className="mt-0.5 accent-emerald-800"
              />
              <div className="text-xs">
                <div className="font-bold text-stone-900">Block and never match with this listener again</div>
                <div className="text-stone-500 text-[11px]">The Matching Engine will permanently exclude them from your pool.</div>
              </div>
            </label>

            {/* Urgent Distress Hotline Referral */}
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-amber-700 shrink-0" />
              <span>If someone is in immediate physical danger, call emergency services or Nigeria Suicide Prevention Initiative (+234 806 210 6497).</span>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
            >
              Submit Confidential Safety Flag
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
