import React, { useState } from 'react';
import { Palette, CheckCircle2, Moon, Sun, Copy, Check, Eye, ShieldCheck, Sparkles } from 'lucide-react';
import { SAFESPACE_COLOR_SYSTEM, COLOR_TOKENS } from '../../theme/colors';

interface ColourSystemViewerProps {
  className?: string;
  isCompact?: boolean;
}

export const ColourSystemViewer: React.FC<ColourSystemViewerProps> = ({
  className = '',
  isCompact = false
}) => {
  const [copiedVar, setCopiedVar] = useState<string | null>(null);
  const [previewTheme, setPreviewTheme] = useState<'light' | 'dark'>('light');

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedVar(text);
    setTimeout(() => setCopiedVar(null), 2000);
  };

  const coreTokens = [
    {
      key: 'primary',
      name: 'Primary',
      hex: previewTheme === 'light' ? '#2C1A14' : '#F5EBE1',
      bgClass: 'bg-primary text-primary-foreground',
      variable: '--color-primary',
      role: 'Restrained, grounded deep umber / timber for key CTAs and authority.',
      contrast: '15.8:1 (WCAG AAA)'
    },
    {
      key: 'secondary',
      name: 'Secondary',
      hex: previewTheme === 'light' ? '#EFE8E1' : '#332A24',
      bgClass: 'bg-secondary text-secondary-foreground border border-surface-border',
      variable: '--color-secondary',
      role: 'Warm sandstone parchment for secondary controls and chips.',
      contrast: '11.2:1 (WCAG AAA)'
    },
    {
      key: 'accent',
      name: 'Accent',
      hex: previewTheme === 'light' ? '#C86228' : '#E07A38',
      bgClass: 'bg-accent text-accent-foreground',
      variable: '--color-accent',
      role: 'Terracotta amber for emotional connection and active focal points.',
      contrast: '4.9:1 (WCAG AA)'
    },
    {
      key: 'background',
      name: 'Background',
      hex: previewTheme === 'light' ? '#FAF7F2' : '#181412',
      bgClass: 'bg-background text-text border border-surface-border',
      variable: '--color-background',
      role: 'Tactile warm linen paper evoking a quiet physical sanctuary.',
      contrast: 'Base Canvas'
    },
    {
      key: 'surface',
      name: 'Surface',
      hex: previewTheme === 'light' ? '#FCFAF7' : '#221C19',
      bgClass: 'bg-surface text-text border border-surface-border',
      variable: '--color-surface',
      role: 'Alabaster cards and elevated container surfaces.',
      contrast: '16.2:1 (WCAG AAA)'
    },
    {
      key: 'text',
      name: 'Text',
      hex: previewTheme === 'light' ? '#1F1815' : '#FAF7F2',
      bgClass: 'bg-surface text-text border border-surface-border',
      variable: '--color-text',
      role: 'Deep umber primary typography with zero glare and max legibility.',
      contrast: '17.4:1 (WCAG AAA)'
    },
    {
      key: 'muted text',
      name: 'Muted Text',
      hex: previewTheme === 'light' ? '#6E635C' : '#B8ACA3',
      bgClass: 'bg-surface text-text-muted border border-surface-border',
      variable: '--color-text-muted',
      role: 'Warm taupe slate for timestamps, captions, and secondary metadata.',
      contrast: '5.2:1 (WCAG AA)'
    },
    {
      key: 'success',
      name: 'Success',
      hex: previewTheme === 'light' ? '#2D5A43' : '#60A381',
      bgClass: 'bg-status-success-bg text-status-success border border-status-success-border',
      variable: '--color-status-success',
      role: 'Grounded eucalyptus sage for verified peer listeners and session active states.',
      contrast: '6.8:1 (WCAG AA)'
    },
    {
      key: 'warning',
      name: 'Warning',
      hex: previewTheme === 'light' ? '#B4691B' : '#E5983B',
      bgClass: 'bg-status-warning-bg text-status-warning border border-status-warning-border',
      variable: '--color-status-warning',
      role: 'Honey ochre amber for non-punitive reminders and time warnings.',
      contrast: '4.8:1 (WCAG AA)'
    },
    {
      key: 'error',
      name: 'Error',
      hex: previewTheme === 'light' ? '#9E3A2B' : '#E06A58',
      bgClass: 'bg-status-error-bg text-status-error border border-status-error-border',
      variable: '--color-status-error',
      role: 'Earthy terracotta red for safety alerts, emergency triggers, and errors.',
      contrast: '5.9:1 (WCAG AA)'
    },
    {
      key: 'focus',
      name: 'Focus Ring',
      hex: previewTheme === 'light' ? '#C86228' : '#E07A38',
      bgClass: 'bg-surface text-text ring-2 ring-focus ring-offset-2 ring-offset-background border border-surface-border',
      variable: '--color-focus',
      role: 'Warm terracotta 2px outline ring for keyboard focus accessibility.',
      contrast: '2px Offset (WCAG AA)'
    }
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-surface border border-surface-border shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-accent/15 text-accent">
              <Palette className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif text-xl font-bold text-text">Safespace Colour System</h3>
              <p className="text-xs text-text-muted">
                Warm, calm, human, reassuring, sophisticated, and timeless.
              </p>
            </div>
          </div>

          {/* Theme Context Switcher */}
          <div className="flex items-center gap-1.5 p-1 bg-secondary rounded-2xl border border-surface-border text-xs font-medium self-start sm:self-auto">
            <button
              onClick={() => setPreviewTheme('light')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                previewTheme === 'light'
                  ? 'bg-surface text-text shadow-2xs font-semibold'
                  : 'text-text-muted hover:text-text'
              }`}
            >
              <Sun className="w-3.5 h-3.5 text-amber-600" />
              <span>Light (Warm Paper)</span>
            </button>
            <button
              onClick={() => setPreviewTheme('dark')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                previewTheme === 'dark'
                  ? 'bg-surface text-text shadow-2xs font-semibold'
                  : 'text-text-muted hover:text-text'
              }`}
            >
              <Moon className="w-3.5 h-3.5 text-amber-400" />
              <span>Dark (Timber Sanctuary)</span>
            </button>
          </div>
        </div>

        {/* System Attributes Badges */}
        <div className="flex flex-wrap gap-2 pt-1 border-t border-surface-border/60 text-xs">
          {['Warm Paper Base', 'Grounded Eucalyptus', 'Terracotta Amber Accent', 'Zero Clinical Blues', 'WCAG AA/AAA Compliant'].map((tag, idx) => (
            <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary/80 text-text text-[11px] font-medium border border-surface-border">
              <CheckCircle2 className="w-3 h-3 text-status-success" />
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Grid of 11 Established Core Tokens */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {coreTokens.map((token) => (
          <div
            key={token.key}
            className={`p-4 rounded-2xl border transition-all duration-200 hover:shadow-xs space-y-3 ${
              previewTheme === 'dark' ? 'dark' : ''
            }`}
            style={{
              backgroundColor: previewTheme === 'dark' ? '#221C19' : '#FCFAF7',
              borderColor: previewTheme === 'dark' ? '#3B312A' : '#E8E2D9'
            }}
          >
            {/* Color Swatch */}
            <div className={`h-16 w-full rounded-xl p-3 flex items-end justify-between transition-colors ${token.bgClass}`}>
              <span className="font-serif font-bold text-sm tracking-wide">{token.name}</span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-black/20 text-white backdrop-blur-xs">
                {token.hex}
              </span>
            </div>

            {/* Token Info */}
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-text-muted">
                <span className="font-mono text-[11px]">{token.variable}</span>
                <button
                  onClick={() => handleCopy(token.variable)}
                  className="p-1 text-text-muted hover:text-accent transition-colors"
                  title="Copy CSS variable"
                >
                  {copiedVar === token.variable ? (
                    <Check className="w-3.5 h-3.5 text-status-success" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              <p className="text-text-muted text-[11px] leading-relaxed">
                {token.role}
              </p>

              <div className="pt-1.5 flex items-center justify-between text-[10px] text-text-subtle border-t border-surface-border/50">
                <span>WCAG Ratio</span>
                <span className="font-medium text-status-success">{token.contrast}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Sample Interface Preview */}
      <div className="p-6 rounded-3xl bg-surface border border-surface-border shadow-2xs space-y-4">
        <div className="flex items-center gap-2 text-text font-serif font-bold text-base">
          <Eye className="w-4 h-4 text-accent" />
          <span>Live Sanctuary Surface Context</span>
        </div>

        <div
          className={`p-6 rounded-2xl border space-y-4 transition-colors ${
            previewTheme === 'dark' ? 'bg-[#181412] text-[#FAF7F2] border-[#3B312A]' : 'bg-[#FAF7F2] text-[#1F1815] border-[#E8E2D9]'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm ${
                previewTheme === 'dark' ? 'bg-[#332A24] text-[#E07A38]' : 'bg-[#EFE8E1] text-[#C86228]'
              }`}>
                SS
              </div>
              <div>
                <h4 className="font-serif font-semibold text-sm">Quiet Evening Reflection</h4>
                <p className={`text-xs ${previewTheme === 'dark' ? 'text-[#B8ACA3]' : 'text-[#6E635C]'}`}>
                  Connected with Sarah • Verified Listener
                </p>
              </div>
            </div>

            <span className={`text-xs px-2.5 py-1 rounded-full border ${
              previewTheme === 'dark'
                ? 'bg-[#1C2A22] text-[#60A381] border-[#2D4738]'
                : 'bg-[#EFF5F1] text-[#2D5A43] border-[#C8E0D2]'
            }`}>
              Active Session
            </span>
          </div>

          <p className={`text-xs leading-relaxed ${previewTheme === 'dark' ? 'text-[#B8ACA3]' : 'text-[#6E635C]'}`}>
            "You don't have to carry everything alone. Take a soft breath. Your conversation is safe, encrypted, and anchored in empathy."
          </p>

          <div className="flex items-center gap-3 pt-2">
            <button
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                previewTheme === 'dark'
                  ? 'bg-[#F5EBE1] text-[#2C1A14] hover:bg-white'
                  : 'bg-[#2C1A14] text-[#FAF7F2] hover:bg-[#1E110D]'
              }`}
            >
              Primary Action
            </button>
            <button
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                previewTheme === 'dark'
                  ? 'bg-[#332A24] text-[#FAF7F2] border border-[#3B312A]'
                  : 'bg-[#EFE8E1] text-[#2C1A14] border border-[#E8E2D9]'
              }`}
            >
              Secondary Option
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
