import React, { useEffect } from 'react';
import { X, Tag, Check, Clock, Sparkles, AlertCircle, ShoppingBag } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useStore } from '../context/StoreContext';

interface VoucherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyVoucher?: (code: string) => void;
}

export const VoucherModal: React.FC<VoucherModalProps> = ({
  isOpen,
  onClose,
  onApplyVoucher
}) => {
  const { coupons, collectedVouchers, collectVoucher, setIsCartOpen } = useStore();

  // Prevent background page-level scrollbar behind modal
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const activeCoupons = coupons.filter(c => c.active);

  const handleCollect = (code: string) => {
    collectVoucher(code);
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-hidden bg-slate-950/80 backdrop-blur-xs flex items-start justify-center pt-3 sm:pt-6 md:pt-8 p-3 sm:p-6 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-xl bg-[#1E293B] border border-slate-700 rounded-3xl shadow-2xl overflow-hidden p-5 sm:p-6 text-white flex flex-col max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-3.5rem)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-700/80 pb-3.5 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#F59E0B] to-[#D97706] flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white font-['Outfit'] flex items-center gap-1.5">
                <span>Voucher Center</span>
                <span className="text-[10px] bg-amber-500/20 text-amber-400 font-extrabold px-2 py-0.5 rounded-full border border-amber-500/30">
                  {collectedVouchers.length} Collected
                </span>
              </h2>
              <p className="text-xs text-slate-400">Collect store discount vouchers and apply instantly at checkout!</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Voucher Cards List - Scrollable only when exceeding available height */}
        <div className="space-y-3.5 flex-1 min-h-0 overflow-y-auto pr-1 py-3">
          {activeCoupons.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No active vouchers right now. Check back soon for festive drops!
            </div>
          ) : (
            activeCoupons.map((coupon) => {
              const isCollected = collectedVouchers.includes(coupon.code.toUpperCase());
              const isExpired = coupon.expiryDate && new Date(coupon.expiryDate) < new Date();
              const remaining = Math.max(0, coupon.usageLimit - coupon.usedCount);

              return (
                <div
                  key={coupon.id}
                  className={`relative rounded-2xl border transition-all overflow-hidden flex flex-col sm:flex-row items-stretch ${
                    isCollected
                      ? 'bg-slate-900/90 border-[#10B981]/50 shadow-lg shadow-emerald-500/10'
                      : 'bg-slate-900/70 border-slate-700 hover:border-slate-500'
                  }`}
                >
                  {/* Left Ticket Stub */}
                  <div className="bg-gradient-to-br from-[#38BDF8] via-[#6366F1] to-[#0F172A] p-4 sm:w-36 flex flex-col justify-center items-center text-center text-white shrink-0 relative">
                    <span className="text-2xl font-black font-['Outfit']">
                      {coupon.discountType === 'percent' ? `${coupon.discountValue}%` : `৳${coupon.discountValue}`}
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-sky-200">
                      {coupon.discountType === 'percent' ? 'DISCOUNT' : 'FLAT OFF'}
                    </span>

                    {/* Perforated holes */}
                    <div className="hidden sm:block absolute -right-2 top-0 bottom-0 flex flex-col justify-around">
                      <div className="w-3 h-3 bg-[#1E293B] rounded-full" />
                      <div className="w-3 h-3 bg-[#1E293B] rounded-full" />
                      <div className="w-3 h-3 bg-[#1E293B] rounded-full" />
                    </div>
                  </div>

                  {/* Middle Ticket Info */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-extrabold text-sm text-[#38BDF8] bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                          {coupon.code}
                        </span>
                        {isCollected && (
                          <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                            <Check className="w-3 h-3" /> In Your Wallet
                          </span>
                        )}
                      </div>

                      <h4 className="text-xs font-bold text-white mt-1">
                        {coupon.title || (coupon.discountType === 'percent' ? `${coupon.discountValue}% Off Shopping Cart` : `৳${coupon.discountValue} Off Your Order`)}
                      </h4>

                      <p className="text-[11px] text-slate-400">
                        {coupon.description || (coupon.minOrderAmount ? `Min order: ৳${coupon.minOrderAmount}` : 'No minimum spend required.')}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {coupon.expiryDate ? `Expires: ${coupon.expiryDate}` : 'No Expiry'}
                      </span>
                      <span>{remaining} left</span>
                    </div>
                  </div>

                  {/* Right Action Button */}
                  <div className="p-3 sm:p-4 bg-slate-950/60 border-t sm:border-t-0 sm:border-l border-slate-800 flex items-center justify-center shrink-0">
                    {onApplyVoucher && isCollected ? (
                      <button
                        type="button"
                        onClick={() => {
                          onApplyVoucher(coupon.code);
                          onClose();
                        }}
                        className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#10B981] hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                      >
                        <span>Apply</span>
                      </button>
                    ) : isCollected ? (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          setIsCartOpen(true);
                        }}
                        className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-slate-800 text-[#10B981] font-bold text-xs hover:bg-slate-700 transition-colors flex items-center justify-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Use in Cart</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleCollect(coupon.code)}
                        className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-[#F59E0B] to-[#D97706] hover:scale-105 active:scale-95 text-white font-black text-xs shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-1"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>COLLECT</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-700/80 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <span className="text-[11px] sm:text-xs">Collected vouchers are automatically available in your cart!</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-colors cursor-pointer text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
