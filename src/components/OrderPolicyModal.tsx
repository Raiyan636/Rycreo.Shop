import React, { useState, useEffect, useMemo } from 'react';
import { X, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface OrderPolicyModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  onConfirm?: () => void;
}

export const OrderPolicyModal: React.FC<OrderPolicyModalProps> = ({ 
  isOpen: propsIsOpen, 
  onClose: propsOnClose, 
  onConfirm: propsOnConfirm 
}) => {
  const { 
    storeConfig, 
    modificationWindowHours, 
    isOrderPolicyOpen, 
    closeOrderPolicyModal, 
    confirmOrderPolicyModal 
  } = useStore();

  const isOpen = propsIsOpen !== undefined ? propsIsOpen : isOrderPolicyOpen;
  const handleClose = propsOnClose || closeOrderPolicyModal;
  const handleConfirm = propsOnConfirm || confirmOrderPolicyModal;

  const [checked1, setChecked1] = useState(false);
  const [checked2, setChecked2] = useState(false);

  // Reset checkboxes whenever modal is opened
  useEffect(() => {
    if (isOpen) {
      setChecked1(false);
      setChecked2(false);
    }
  }, [isOpen]);

  const lockHours = modificationWindowHours || Number(storeConfig?.orderLockDurationHours) || 24;

  // Memoize heavy dynamic policy text computations so UI remains 100% smooth and lag-free
  const policyText = useMemo(() => {
    const defaultText = `⚡ **${lockHours}-HOUR ORDER MODIFICATION & CANCELLATION POLICY**:

1. **Order Modification Window (${lockHours} Hours)**: After placing an order, customers have up to **${lockHours} hours** to update their delivery address, contact phone number, add additional items with variant selectors, or cancel the order.
2. **Automated Order Locking**: Once ${lockHours} hours have elapsed from the time of order placement, the system automatically locks and disables all edits, cancellations, and product additions to prepare the parcel for courier dispatch.
3. **Consolidated Delivery**: Adding products within the ${lockHours}-hour window merges them into your existing order with a single consolidated delivery charge (no duplicate shipping fees).
4. **Inspection & Verification**: All parcels undergo quality assurance and verification before handover to our courier partners (Pathao, Steadfast, RedX).`;

    if (!storeConfig?.orderPolicyText) return defaultText;

    return storeConfig.orderPolicyText
      .replace(/\b(\d+)[- ]?(?:hour|hours|Hour|Hours)\b/g, `${lockHours} hours`)
      .replace(/\b(\d+)[- ]?(?:ঘণ্টা|ঘন্টা)\b/g, `${lockHours} hours`);
  }, [storeConfig?.orderPolicyText, lockHours]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[250] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in" 
      onClick={handleClose}
    >
      <div 
        className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 relative max-h-[90vh] overflow-y-auto flex flex-col space-y-5" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0 shadow-xs">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-950 font-['Outfit']">Must Read Order Policy</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 font-mono font-black text-[10px] sm:text-[11px]">
                  {lockHours}-Hour Window
                </span>
              </div>
              <p className="text-[11px] text-slate-500">Please review our {lockHours}-hour modification and cancellation terms.</p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={handleClose} 
            className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        {/* Policy Content */}
        <div className="space-y-3 text-xs sm:text-sm text-slate-800 bg-amber-50/70 p-4 sm:p-5 rounded-2xl border border-amber-200/90 whitespace-pre-wrap leading-relaxed font-medium shadow-inner">
          {policyText}
        </div>

        {/* Agreement Checkboxes */}
        <div className="space-y-3 pt-1 border-t border-slate-100">
          <p className="text-xs font-black text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>I Understand & Agree (শর্তসমূহে সম্মতি প্রদান করুন):</span>
          </p>

          <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer text-xs font-semibold text-slate-800">
            <input
              type="checkbox"
              checked={checked1}
              onChange={(e) => setChecked1(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer shrink-0"
            />
            <span>I agree to the {lockHours}-hour order modification & cancellation policy terms.</span>
          </label>

          <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer text-xs font-semibold text-slate-800">
            <input
              type="checkbox"
              checked={checked2}
              onChange={(e) => setChecked2(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer shrink-0"
            />
            <span>I confirm that my delivery address, phone number, and order details are 100% accurate.</span>
          </label>
        </div>

        {/* Action Button */}
        <div className="space-y-2 pt-2">
          <button
            type="button"
            disabled={!checked1 || !checked2}
            onClick={() => {
              if (!checked1 || !checked2) return;
              handleConfirm();
              handleClose();
            }}
            className={`w-full py-3.5 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 ${
              checked1 && checked2
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 active:scale-95 cursor-pointer shadow-emerald-600/30'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>I Understand - Confirm & Place Order</span>
          </button>
          {!checked1 || !checked2 ? (
            <p className="text-[11px] text-rose-600 text-center font-bold">
              Please check both boxes above to confirm and place your order.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
};
