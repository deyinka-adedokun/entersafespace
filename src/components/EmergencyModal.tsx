import React from 'react';
import { X, ShieldAlert, Phone } from 'lucide-react';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#17212B]/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-xl shadow-xl border border-[#E3E2DE] p-6 relative overflow-hidden">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#E3E2DE] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#FDF2F2] text-[#8C1D18] flex items-center justify-center shrink-0 border border-[#F9C9C7]">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#17212B]">
                Crisis & Emergency Support
              </h3>
              <p className="text-xs text-[#59636B]">
                Immediate Nigerian and regional helplines for urgent care.
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#59636B] hover:text-[#17212B] hover:bg-[#F3F1EC] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notice */}
        <div className="my-4 p-3.5 bg-[#FDF2F2] border border-[#F9C9C7] rounded-lg text-xs text-[#8C1D18] leading-relaxed">
          <strong className="font-semibold block mb-0.5">Safespace provides peer emotional listening, not emergency clinical intervention.</strong>
          If you or someone you know is in immediate physical danger, experiencing severe harm, or in acute crisis, please reach out to dedicated emergency responders immediately.
          <span className="block mt-1.5 text-[10px] text-[#8C1D18]/80 italic">
            * Emergency contacts are configurable operational resources requiring formal legal and safeguarding verification before production deployment.
          </span>
        </div>

        {/* Helplines List */}
        <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
          
          <div className="p-3 bg-[#F3F1EC] rounded-lg border border-[#E3E2DE] flex items-center justify-between">
            <div>
              <div className="font-semibold text-xs text-[#17212B]">National Emergency Toll-Free</div>
              <div className="text-[11px] text-[#59636B]">Nigeria Toll-Free Response</div>
            </div>
            <a 
              href="tel:112" 
              className="px-3 py-1.5 bg-[#123B5D] hover:bg-[#0D2A42] text-white rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call 112</span>
            </a>
          </div>

          <div className="p-3 bg-[#F3F1EC] rounded-lg border border-[#E3E2DE] flex items-center justify-between">
            <div>
              <div className="font-semibold text-xs text-[#17212B]">SURPIN (Suicide Prevention Initiative)</div>
              <div className="text-[11px] text-[#59636B]">24/7 Crisis Helpline Support</div>
            </div>
            <a 
              href="tel:08001236443" 
              className="px-3 py-1.5 bg-[#123B5D] hover:bg-[#0D2A42] text-white rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call Helpline</span>
            </a>
          </div>

          <div className="p-3 bg-[#F3F1EC] rounded-lg border border-[#E3E2DE] flex items-center justify-between">
            <div>
              <div className="font-semibold text-xs text-[#17212B]">Mentally Aware Nigeria (MANI)</div>
              <div className="text-[11px] text-[#59636B]">Mental Health Crisis Support</div>
            </div>
            <a 
              href="tel:08060101100" 
              className="px-3 py-1.5 bg-[#123B5D] hover:bg-[#0D2A42] text-white rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call Crisis Line</span>
            </a>
          </div>

          <div className="p-3 bg-[#F3F1EC] rounded-lg border border-[#E3E2DE] flex items-center justify-between">
            <div>
              <div className="font-semibold text-xs text-[#17212B]">National Gender-Based Violence Helpline</div>
              <div className="text-[11px] text-[#59636B]">Federal Ministry of Women Affairs</div>
            </div>
            <a 
              href="tel:08001112222" 
              className="px-3 py-1.5 bg-[#123B5D] hover:bg-[#0D2A42] text-white rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call GBV Line</span>
            </a>
          </div>

        </div>

        {/* Close */}
        <div className="mt-4 pt-3 border-t border-[#E3E2DE] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#F3F1EC] hover:bg-[#EAE7E0] text-[#17212B] rounded-md text-xs font-semibold transition-colors"
          >
            Close Emergency Panel
          </button>
        </div>

      </div>
    </div>
  );
};
