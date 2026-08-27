import React, { useState } from 'react';
import { Compass, Sparkles, CheckCircle2, ShieldCheck, HeartHandshake, Eye, Layers, Users, Zap, Award } from 'lucide-react';
import { SAFESPACE_DESIGN_INTELLIGENCE, DesignPrinciple } from '../../theme/designIntelligence';

interface DesignIntelligenceViewerProps {
  className?: string;
}

export const DesignIntelligenceViewer: React.FC<DesignIntelligenceViewerProps> = ({
  className = ''
}) => {
  const [selectedPrinciple, setSelectedPrinciple] = useState<number | null>(null);

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'Aman': return Layers;
      case 'Airbnb': return HeartHandshake;
      case 'Uber': return Zap;
      case 'Apple': return Eye;
      case 'WhatsApp': return Users;
      default: return Sparkles;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-surface border border-surface-border shadow-2xs space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-accent/15 text-accent shrink-0">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif text-xl font-bold text-text">Safespace Design Intelligence</h3>
              <p className="text-xs text-text-muted mt-0.5">
                10 Permanent Core Constraints derived from world-class human-centered design.
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-accent/10 text-accent border border-accent/20 shrink-0">
            Prompt 02.5 Active
          </span>
        </div>

        <p className="text-xs text-text-muted leading-relaxed">
          Safespace borrows core principles rather than copying visual identities. Every interface element must serve human connection first, letting technology recede into the background.
        </p>

        {/* Primary Test Banner */}
        <div className="p-4 rounded-2xl bg-secondary/70 border border-surface-border space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-primary">
            <ShieldCheck className="w-4 h-4 text-accent" />
            <span>The Single Fundamental Test (Principle 10)</span>
          </div>
          <p className="font-serif text-sm italic text-text font-medium leading-relaxed">
            "Does this help the user feel closer to another human being, or is it merely showing them software?"
          </p>
        </div>
      </div>

      {/* Grid of 10 Permanent Principles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SAFESPACE_DESIGN_INTELLIGENCE.map((principle: DesignPrinciple) => {
          const IconComp = getSourceIcon(principle.source);
          const isSelected = selectedPrinciple === principle.id;

          return (
            <div
              key={principle.id}
              onClick={() => setSelectedPrinciple(isSelected ? null : principle.id)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-3 ${
                isSelected
                  ? 'bg-surface border-accent ring-1 ring-accent shadow-xs'
                  : 'bg-surface border-surface-border hover:border-accent/40 hover:bg-background-subtle/40'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-accent/15 text-accent text-xs font-mono font-bold flex items-center justify-center shrink-0">
                    0{principle.id}
                  </span>
                  <div>
                    <h4 className="font-serif font-bold text-base text-text leading-tight">
                      {principle.title}
                    </h4>
                    <span className="text-[10px] font-semibold tracking-wide text-text-muted uppercase">
                      Origin: {principle.source}
                    </span>
                  </div>
                </div>

                <div className="p-1.5 rounded-xl bg-secondary text-text-muted">
                  <IconComp className="w-3.5 h-3.5" />
                </div>
              </div>

              <p className="text-xs font-semibold text-accent leading-snug">
                "{principle.coreRule}"
              </p>

              <p className="text-xs text-text-muted leading-relaxed">
                {principle.expandedRule}
              </p>

              <div className="pt-2 border-t border-surface-border/60 text-[11px] text-text-subtle flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-status-success shrink-0 mt-0.5" />
                <span><strong className="text-text">Safespace Application:</strong> {principle.safespaceManifestation}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
