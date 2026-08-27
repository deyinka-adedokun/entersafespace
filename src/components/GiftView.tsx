import React, { useState } from 'react';
import { Gift, GiftDeliveryChannel } from '../types';
import { CANONICAL_PACKAGES } from '../data/mockData';
import { 
  Gift as GiftIcon, 
  Heart, 
  Send, 
  CheckCircle2, 
  Copy, 
  Lock, 
  Mail, 
  Phone, 
  Link2, 
  AlertCircle, 
  Eye, 
  Sparkles,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';

interface GiftViewProps {
  onGiftSent?: () => void;
}

const MESSAGE_PRESETS = [
  "You don't have to carry everything alone. I'm here for you.",
  "Taking time for yourself is a strength. Enjoy this session whenever you're ready.",
  "Sending you a safe, quiet space to talk and be heard without judgment.",
  "I care about your peace of mind. Here is a private listener whenever you need to process."
];

export const GiftView: React.FC<GiftViewProps> = ({ onGiftSent }) => {
  const [activeTab, setActiveTab] = useState<'create' | 'redeem'>('create');

  // Creation State
  const [selectedPkgId, setSelectedPkgId] = useState<string>('package-open');
  const [deliveryChannel, setDeliveryChannel] = useState<GiftDeliveryChannel>('EMAIL');
  const [recipientEmail, setRecipientEmail] = useState<string>('');
  const [recipientPhone, setRecipientPhone] = useState<string>('');
  const [recipientMessage, setRecipientMessage] = useState<string>(MESSAGE_PRESETS[0]);
  const [simulatePaymentFailure, setSimulatePaymentFailure] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [creationError, setCreationError] = useState<string | null>(null);
  const [createdGift, setCreatedGift] = useState<Gift | null>(null);

  // Claim State
  const [claimCodeInput, setClaimCodeInput] = useState<string>('SAFE-GIFT-8821');
  const [lookupResult, setLookupResult] = useState<any | null>(null);
  const [isLookingUp, setIsLookingUp] = useState<boolean>(false);
  const [isRedeeming, setIsRedeeming] = useState<boolean>(false);
  const [claimStatus, setClaimStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const paidPackages = CANONICAL_PACKAGES.filter(p => p.priceNGN > 0);
  const selectedPkg = CANONICAL_PACKAGES.find(p => p.id === selectedPkgId) || paidPackages[0];

  const handleSendGift = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setCreationError(null);

    try {
      const res = await fetch('/api/v1/gifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageId: selectedPkg.id,
          recipientPhone,
          recipientEmail,
          recipientMessage,
          deliveryChannel,
          simulatePaymentFailure
        })
      });

      const json = await res.json();
      if (json.success && json.data?.gift) {
        setCreatedGift(json.data.gift);
        if (onGiftSent) onGiftSent();
      } else {
        setCreationError(json.error?.message || 'Failed to create gift.');
      }
    } catch (err) {
      setCreationError('Error connecting to server to process gift.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLookupGift = async () => {
    if (!claimCodeInput.trim()) return;
    setIsLookingUp(true);
    setClaimStatus(null);
    setLookupResult(null);

    try {
      const res = await fetch(`/api/v1/gifts/lookup/${encodeURIComponent(claimCodeInput.trim())}`);
      const json = await res.json();
      if (json.success && json.data) {
        setLookupResult(json.data);
      } else {
        setClaimStatus({ type: 'error', text: json.error?.message || 'Gift code not found.' });
      }
    } catch (err) {
      setClaimStatus({ type: 'error', text: 'Error looking up gift voucher.' });
    } finally {
      setIsLookingUp(false);
    }
  };

  const handleClaimGift = async () => {
    if (!claimCodeInput.trim()) return;
    setIsRedeeming(true);
    setClaimStatus(null);

    try {
      const res = await fetch('/api/v1/gifts/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ giftCode: claimCodeInput.trim() })
      });
      const json = await res.json();
      if (json.success) {
        setClaimStatus({
          type: 'success',
          text: `Gift redeemed successfully! You have received a ${json.data.gift.packageName} (${json.data.gift.durationMinutes} mins) conversation credit.`
        });
        if (lookupResult) {
          setLookupResult({ ...lookupResult, status: 'CLAIMED' });
        }
      } else {
        setClaimStatus({
          type: 'error',
          text: json.error?.message || 'Invalid gift code or already claimed.'
        });
      }
    } catch (err) {
      setClaimStatus({ type: 'error', text: 'Failed to redeem gift code.' });
    } finally {
      setIsRedeeming(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6 animate-in fade-in duration-300">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-br from-emerald-900 via-emerald-950 to-stone-900 text-amber-50 rounded-3xl p-6 sm:p-8 shadow-lg relative overflow-hidden">
        <div className="relative z-10 space-y-2 text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-800/90 text-amber-200 text-xs font-semibold border border-emerald-700/50">
            <GiftIcon className="w-3.5 h-3.5 text-amber-300" />
            <span>Safespace Care & Support</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight">
            Gift a Conversation
          </h1>
          <p className="text-xs sm:text-sm text-emerald-200 max-w-lg leading-relaxed">
            Send a pre-paid, confidential listening session to someone you care about with warm, respectful messages.
          </p>
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <div className="flex bg-stone-100 p-1.5 rounded-2xl border border-stone-200 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('create')}
          className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
            activeTab === 'create' ? 'bg-white text-emerald-950 font-bold shadow-xs' : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <GiftIcon className="w-4 h-4 text-emerald-800" />
          <span>Send a Gift</span>
        </button>
        <button
          onClick={() => setActiveTab('redeem')}
          className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
            activeTab === 'redeem' ? 'bg-white text-emerald-950 font-bold shadow-xs' : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <Sparkles className="w-4 h-4 text-emerald-800" />
          <span>Redeem & Recipient View</span>
        </button>
      </div>

      {activeTab === 'create' && (
        <>
          {createdGift ? (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-md text-center space-y-5 animate-in zoom-in-95 duration-200">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h2 className="font-serif text-2xl font-bold text-stone-900">
                  Gift Created & Delivered!
                </h2>
                <p className="text-xs text-stone-500">
                  You have gifted a <strong>{createdGift.packageName}</strong> ({createdGift.durationMinutes} minutes).
                </p>
              </div>

              <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 max-w-md mx-auto space-y-3 text-left">
                <div>
                  <div className="text-[10px] uppercase font-bold text-stone-400">Gift Voucher Code</div>
                  <div className="font-mono text-lg font-bold text-emerald-950 flex items-center justify-between bg-white p-2.5 rounded-xl border border-stone-200 mt-1">
                    <span>{createdGift.giftCode}</span>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(createdGift.giftCode);
                        alert('Gift code copied!');
                      }}
                      className="p-1.5 text-stone-500 hover:text-emerald-900"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <div className="text-[10px] uppercase font-bold text-stone-400">Secure Shareable Gift Link</div>
                  <div className="text-xs font-mono text-stone-700 bg-white p-2 rounded-xl border border-stone-200 mt-1 truncate">
                    {window.location.origin}/gift/{createdGift.giftCode}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] uppercase font-bold text-stone-400">Personal Message Delivered</div>
                  <p className="text-xs text-stone-700 italic mt-0.5 bg-white p-2.5 rounded-xl border border-stone-200">
                    "{createdGift.recipientMessage}"
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
                <button
                  onClick={() => {
                    setClaimCodeInput(createdGift.giftCode);
                    setActiveTab('redeem');
                  }}
                  className="px-5 py-2.5 bg-emerald-900 text-amber-50 rounded-xl text-xs font-semibold hover:bg-emerald-950"
                >
                  Test Recipient Redemption View
                </button>
                <button
                  onClick={() => setCreatedGift(null)}
                  className="px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-semibold"
                >
                  Send Another Gift
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSendGift} className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-6 text-left">
              
              {/* Step 1: Package Selection */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-stone-800 uppercase tracking-wider block">
                  1. Choose Conversation Package
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {paidPackages.map(pkg => (
                    <div
                      key={pkg.id}
                      onClick={() => setSelectedPkgId(pkg.id)}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                        selectedPkgId === pkg.id
                          ? 'bg-emerald-50 border-emerald-800 ring-2 ring-emerald-800/20 shadow-xs'
                          : 'bg-stone-50/50 hover:bg-stone-100 border-stone-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-serif font-bold text-stone-900 text-sm">{pkg.name}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900">
                          {pkg.durationMinutes} min
                        </span>
                      </div>
                      <div className="font-bold text-emerald-950 text-sm mt-1">₦{pkg.priceNGN.toLocaleString()}</div>
                      <p className="text-[11px] text-stone-500 mt-0.5 line-clamp-1">{pkg.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Step 2: Delivery Channel */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-stone-800 uppercase tracking-wider block">
                  2. Select Delivery Channel
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setDeliveryChannel('EMAIL')}
                    className={`p-3 rounded-xl border text-center text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                      deliveryChannel === 'EMAIL' ? 'border-emerald-800 bg-emerald-50 text-emerald-950 font-bold' : 'border-stone-200 text-stone-600 bg-stone-50'
                    }`}
                  >
                    <Mail className="w-4 h-4 text-emerald-700" />
                    <span>Email</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeliveryChannel('PHONE')}
                    className={`p-3 rounded-xl border text-center text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                      deliveryChannel === 'PHONE' ? 'border-emerald-800 bg-emerald-50 text-emerald-950 font-bold' : 'border-stone-200 text-stone-600 bg-stone-50'
                    }`}
                  >
                    <Phone className="w-4 h-4 text-emerald-700" />
                    <span>SMS / Phone</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeliveryChannel('SECURE_LINK')}
                    className={`p-3 rounded-xl border text-center text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                      deliveryChannel === 'SECURE_LINK' ? 'border-emerald-800 bg-emerald-50 text-emerald-950 font-bold' : 'border-stone-200 text-stone-600 bg-stone-50'
                    }`}
                  >
                    <Link2 className="w-4 h-4 text-emerald-700" />
                    <span>Secure Link</span>
                  </button>
                </div>

                {deliveryChannel === 'EMAIL' && (
                  <div>
                    <label className="text-[11px] font-medium text-stone-600 mb-1 block">Recipient Email Address</label>
                    <input
                      type="email"
                      required
                      value={recipientEmail}
                      onChange={(e) => setRecipientEmail(e.target.value)}
                      placeholder="friend@example.com"
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:ring-2 focus:ring-emerald-800 outline-hidden"
                    />
                  </div>
                )}

                {deliveryChannel === 'PHONE' && (
                  <div>
                    <label className="text-[11px] font-medium text-stone-600 mb-1 block">Recipient Phone Number</label>
                    <input
                      type="tel"
                      required
                      value={recipientPhone}
                      onChange={(e) => setRecipientPhone(e.target.value)}
                      placeholder="+1 555 000 0000"
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:ring-2 focus:ring-emerald-800 outline-hidden"
                    />
                  </div>
                )}

                {deliveryChannel === 'SECURE_LINK' && (
                  <p className="text-xs text-stone-500 bg-stone-50 p-3 rounded-xl border border-stone-200">
                    A private shareable gift link will be generated after payment. You can send it directly over WhatsApp, Telegram, or message.
                  </p>
                )}
              </div>

              {/* Step 3: Warm Emotional Copy Presets */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-800 uppercase tracking-wider block">
                  3. Personal Message
                </label>
                
                <div className="space-y-1.5">
                  <div className="text-[11px] text-stone-500">Choose a thoughtful message template or write your own:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {MESSAGE_PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setRecipientMessage(preset)}
                        className={`text-[10px] text-left px-2.5 py-1.5 rounded-lg border transition-all ${
                          recipientMessage === preset ? 'bg-emerald-100 border-emerald-300 font-medium text-emerald-950' : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                        }`}
                      >
                        "{preset.slice(0, 36)}..."
                      </button>
                    ))}
                  </div>
                </div>

                <textarea
                  value={recipientMessage}
                  onChange={(e) => setRecipientMessage(e.target.value)}
                  rows={3}
                  className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:ring-2 focus:ring-emerald-800 outline-hidden leading-relaxed"
                />
              </div>

              {/* Testing Controls */}
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1 text-xs">
                <div className="font-bold text-stone-500 text-[10px] uppercase">Testing Options</div>
                <label className="flex items-center gap-2 cursor-pointer text-stone-700">
                  <input
                    type="checkbox"
                    checked={simulatePaymentFailure}
                    onChange={(e) => setSimulatePaymentFailure(e.target.checked)}
                    className="rounded text-rose-800 focus:ring-rose-800"
                  />
                  <span>Simulate Payment Failure during gift creation</span>
                </label>
              </div>

              {creationError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-900 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-700 shrink-0" />
                  <span>{creationError}</span>
                </div>
              )}

              {/* Pay & Create Gift */}
              <div className="pt-2 space-y-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-emerald-900 hover:bg-emerald-950 text-amber-50 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-amber-200" />
                      <span>Authorizing Payment...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 text-amber-200" />
                      <span>Pay & Create Gift (₦{selectedPkg.priceNGN.toLocaleString()})</span>
                    </>
                  )}
                </button>

                <div className="p-2.5 bg-amber-50/80 rounded-xl border border-amber-200/80 text-[11px] text-amber-950 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-800 shrink-0" />
                  <span>
                    <strong>Privacy Guarantee:</strong> Purchaser financial information, receipt details, and card numbers are strictly hidden from the gift recipient.
                  </span>
                </div>
              </div>

            </form>
          )}
        </>
      )}

      {activeTab === 'redeem' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-6 text-left">
          <div className="space-y-1">
            <h2 className="font-serif text-xl font-bold text-stone-900">
              Redeem a Gift & Recipient Privacy Check
            </h2>
            <p className="text-xs text-stone-500">
              Enter a gift voucher code to inspect the recipient-facing view or claim your pre-paid session.
            </p>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={claimCodeInput}
              onChange={(e) => setClaimCodeInput(e.target.value)}
              placeholder="e.g. SAFE-GIFT-8821"
              className="flex-1 px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 font-mono font-bold tracking-wider uppercase focus:ring-2 focus:ring-emerald-800 outline-hidden"
            />
            <button
              onClick={handleLookupGift}
              disabled={isLookingUp}
              className="px-4 py-3 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 shrink-0"
            >
              <Eye className="w-4 h-4 text-stone-600" />
              <span>Inspect</span>
            </button>
            <button
              onClick={handleClaimGift}
              disabled={isRedeeming}
              className="px-5 py-3 bg-emerald-900 hover:bg-emerald-950 text-amber-50 rounded-xl text-xs font-bold transition-colors shrink-0"
            >
              Redeem
            </button>
          </div>

          {claimStatus && (
            <div className={`p-3.5 rounded-xl text-xs font-medium flex items-center gap-2 ${
              claimStatus.type === 'success' ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' : 'bg-rose-50 text-rose-900 border border-rose-200'
            }`}>
              {claimStatus.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-700 shrink-0" />}
              <span>{claimStatus.text}</span>
            </div>
          )}

          {/* Recipient Privacy Card Preview */}
          {lookupResult && (
            <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200 space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                <span className="text-[11px] font-bold uppercase text-stone-400">Recipient View (Privacy Shield Active)</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  lookupResult.status === 'CLAIMED' ? 'bg-stone-200 text-stone-700' : 'bg-emerald-100 text-emerald-900'
                }`}>
                  {lookupResult.status}
                </span>
              </div>

              <div className="space-y-2">
                <div className="text-xs text-stone-600">
                  You have been gifted an <strong>{lookupResult.packageName}</strong> ({lookupResult.durationMinutes} mins) session by <strong>{lookupResult.purchaserName}</strong>.
                </div>

                <div className="p-3 bg-white rounded-xl border border-stone-200 text-xs italic text-stone-800">
                  "{lookupResult.recipientMessage}"
                </div>

                <div className="p-2.5 bg-emerald-50/70 border border-emerald-200 rounded-xl text-[11px] text-emerald-950 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-800 shrink-0" />
                  <span>
                    <strong>Privacy Verified:</strong> No purchaser financial info, payment card, or payment receipts are exposed to the recipient.
                  </span>
                </div>
              </div>

              {lookupResult.status !== 'CLAIMED' && (
                <button
                  onClick={handleClaimGift}
                  disabled={isRedeeming}
                  className="w-full py-3 bg-emerald-900 hover:bg-emerald-950 text-amber-50 rounded-xl text-xs font-bold transition-all shadow-xs"
                >
                  Redeem This Gift Voucher
                </button>
              )}
            </div>
          )}

        </div>
      )}

    </div>
  );
};
