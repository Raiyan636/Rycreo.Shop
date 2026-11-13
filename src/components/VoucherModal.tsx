import React, { useState, useEffect } from 'react';
import { X, Tag, Check, Clock, Sparkles, AlertCircle, ShoppingBag, Flame, Gift } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useStore } from '../context/StoreContext';
import { Coupon } from '../types/store';

interface VoucherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyVoucher?: (code: string) => void;
}

const VoucherCountdownTimer: React.FC<{ expiryDate: string }> = ({ expiryDate }) => {
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number; isExpired: boolean }>({
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false
  });

  useEffect(() => {
    const update = () => {
      const diff = new Date(expiryDate).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, isExpired: true });
      } else {
        const hrs = Math.floor(diff / 3600000);
        const mins = Math.floor((diff % 3600000) / 60000);
        const secs = Math.floor((diff % 60000) / 1000);
        setTimeLeft({ hours: hrs, minutes: mins, seconds: secs, isExpired: false });
      }
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [expiryDate]);

  if (timeLeft.isExpired) {
    return <span className="text-rose-400 font-bold text-[10px]">Expired</span>;
  }

  return (
    <div className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded-md border border-amber-500/30 font-mono text-[10px] font-black">
      <Clock className="w-3 h-3 text-amber-400" />
      <span>
        {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
      </span>
    </div>
  );
};

export const VoucherModal: React.FC<VoucherModalProps> = ({
  isOpen,
  onClose,
  onApplyVoucher
}) => {
  const { coupons, collectedVouchers, collectVoucher, setIsCartOpen } = useStore();

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

  const activeCoupons = coupons.filter(c => {
    if (!c.active) return false;
    if (c.expiryDate && new Date(c.expiryDate).getTime() < Date.now()) return false;
    return true;
  });

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

  const getOfferTypeBadge = (coupon: Coupon) => {
    const type = coupon.offerType;
    if (type === 'bogo') {
      return (
        <span className="px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/40 text-[9.5px] font-black flex items-center gap-1">
          <Gift className="w-3 h-3 text-pink-400" />
          Buy 1 Get 1
        </span>
      );
    }
    if (type === 'buy2_get1') {
      return (
        <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[9.5px] font-black flex items-center gap-1">
          <Gift className="w-3 h-3 text-rose-400" />
          Buy 2 Get 1
        </span>
      );
    }
    if (type === 'buy_more_get_more') {
      return (
        <span className="px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/40 text-[9.5px] font-black flex items-center gap-1">
          <Flame className="w-3 h-3 text-orange-400" />
          Buy More Get More
        </span>
      );
    }
    if (coupon.isLimitedTime || type === 'limited_time') {
      return (
        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9.5px] font-black flex items-center gap-1">
          <Clock className="w-3 h-3 text-amber-400" />
          Limited Time
        </span>
      );
    }
    return null;
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
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 via-orange-500 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white font-['Outfit'] flex items-center gap-1.5">
                <span>Available Vouchers</span>
                <span className="text-[10px] bg-blue-500/20 text-blue-300 font-extrabold px-2 py-0.5 rounded-full border border-blue-500/30">
                  {collectedVouchers.length} Collected
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Collect vouchers and apply them instantly at checkout!
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Voucher Cards List */}
        <div className="space-y-3.5 flex-1 min-h-0 overflow-y-auto pr-1 py-3">
          {activeCoupons.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No active vouchers right now. Check back soon for exclusive drops!
            </div>
          ) : (
            activeCoupons.map((coupon) => {
              const isCollected = collectedVouchers.includes(coupon.code.toUpperCase());
              const remaining = Math.max(0, coupon.usageLimit - coupon.usedCount);
              const offerBadge = getOfferTypeBadge(coupon);
              const title = coupon.title;
              const desc = coupon.description;

              return (
                <div
                  key={coupon.id}
                  className={`relative rounded-2xl border transition-all overflow-hidden flex flex-col sm:flex-row items-stretch ${
                    isCollected
                      ? 'bg-slate-900/90 border-[#10B981]/50 shadow-lg shadow-emerald-500/10'
                      : 'bg-slate-900/70 border-slate-700 hover:border-slate-500'
                  }`}
                >
                  {/* Left Ticket Stub with Soft Pink & Light Orange Gradient and Royal Blue Accents */}
                  <div className="bg-gradient-to-br from-pink-500 via-rose-500 to-amber-500 p-4 sm:w-36 flex flex-col justify-center items-center text-center text-white shrink-0 relative">
                    <span className="text-2xl font-black font-['Outfit'] drop-shadow-sm">
                      {coupon.discountType === 'percent' ? `${coupon.discountValue}%` : `৳${coupon.discountValue}`}
                    </span>
                    <span className="text-[10px] uppercase font-black tracking-widest text-amber-100">
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
                      <div className="flex items-center flex-wrap gap-2">
                        <span className="font-mono font-extrabold text-sm text-[#38BDF8] bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                          {coupon.code}
                        </span>
                        {offerBadge}
                        {isCollected && (
                          <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                            <Check className="w-3 h-3" /> Collected
                          </span>
                        )}
                      </div>

                      <h4 className="text-xs font-bold text-white mt-1.5">
                        {title || (coupon.discountType === 'percent' ? `${coupon.discountValue}% Off Shopping Cart` : `৳${coupon.discountValue} Off Your Order`)}
                      </h4>

                      <p className="text-[11px] text-slate-400">
                        {desc || (coupon.minOrderAmount ? `Min. Spend: ৳${coupon.minOrderAmount}` : 'No minimum spend required.')}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1.5 border-t border-slate-800">
                      {coupon.expiryDate ? (
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-400">Ends soon</span>
                          <VoucherCountdownTimer expiryDate={coupon.expiryDate} />
                        </div>
                      ) : (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span>No Expiry</span>
                        </span>
                      )}
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
                        className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#10B981] hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
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
                        className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-slate-800 text-[#10B981] font-bold text-xs hover:bg-slate-700 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Use in Cart</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleCollect(coupon.code)}
                        className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 hover:scale-105 active:scale-95 text-white font-black text-xs shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Collect</span>
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
          <span className="text-[11px] sm:text-xs">
            Collected vouchers are automatically available in your cart!
          </span>
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
