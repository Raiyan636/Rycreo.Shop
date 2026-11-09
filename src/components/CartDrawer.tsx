import React, { useState } from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, Tag, MessageSquare, Check, MapPin, AlertCircle, Truck } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const CartDrawer: React.FC = () => {
  const { 
    isCartOpen, 
    setIsCartOpen, 
    cart, 
    removeFromCart, 
    updateCartQuantity, 
    storeConfig,
    validateCoupon,
    setIsCheckoutOpen,
    openOrderPolicyModal
  } = useStore();

  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discount: number; isFreeDelivery?: boolean } | null>(null);
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');

  // Lock body scroll when CartDrawer is open
  React.useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isCartOpen]);

  if (!isCartOpen) return null;

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discount = appliedPromo ? appliedPromo.discount : 0;
  const finalTotal = Math.max(0, subtotal - discount);

  const handleApplyPromo = () => {
    setPromoError('');
    setPromoSuccess('');

    const res = validateCoupon(promoInput, subtotal);
    if (res.valid) {
      setAppliedPromo({ code: promoInput.trim().toUpperCase(), discount: res.discount, isFreeDelivery: res.isFreeDelivery });
      setPromoSuccess(res.message);
    } else {
      setAppliedPromo(null);
      setPromoError(res.message);
    }
  };

  const handleWhatsAppCheckout = () => {
    if (cart.length === 0) return;

    const itemsSummary = cart.map(item => {
      const varInfo = [
        item.selectedColor ? `Color: ${item.selectedColor}` : null,
        item.selectedSize ? `Size: ${item.selectedSize}` : null
      ].filter(Boolean).join(', ');

      return `- ${item.product.title} ${varInfo ? `(${varInfo})` : ''} x${item.quantity} = ৳${item.price * item.quantity}`;
    }).join('\n');

    const message = encodeURIComponent(
      `Hi ${storeConfig.storeName}! I want to place an order:\n\n*Cart Items:*\n${itemsSummary}\n\n*Subtotal:* ৳${subtotal}\n${appliedPromo ? `*Coupon (${appliedPromo.code}):* -৳${discount}\n` : ''}*TOTAL:* ৳${finalTotal}\n\nPlease share your payment details!`
    );

    window.open(`https://wa.me/${storeConfig.whatsappNumber}?text=${message}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[150] overflow-hidden bg-slate-900/70 backdrop-blur-sm flex justify-end animate-fade-in">
      <div className="w-full max-w-md bg-white h-[100dvh] max-h-[100dvh] shadow-2xl flex flex-col border-l border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="shrink-0 p-3.5 sm:p-4 bg-[#1E293B] text-white flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#38BDF8]" />
            <h2 className="font-extrabold text-base tracking-tight font-['Outfit']">Your Shopping Cart</h2>
            <span className="bg-[#38BDF8] text-slate-900 text-[11px] font-black px-2 py-0.5 rounded-full">
              {cart.reduce((s, i) => s + i.quantity, 0)} items
            </span>
          </div>
          <button 
            onClick={() => setIsCartOpen(false)}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Delivery Threshold Progress Bar */}
        {storeConfig.freeDeliveryThresholdActive && cart.length > 0 && (() => {
          const threshold = storeConfig.freeDeliveryThresholdAmount || 1500;
          const isEligible = subtotal >= threshold;
          const percent = Math.min(100, Math.round((subtotal / threshold) * 100));
          return (
            <div className="shrink-0 bg-emerald-50 p-2.5 sm:p-3 border-b border-emerald-200">
              <div className="flex items-center justify-between text-xs font-bold text-emerald-900 mb-1.5">
                <div className="flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-emerald-600" />
                  <span>
                    {isEligible 
                      ? '🎉 আপনি ফ্রি ডেলিভারি পাওয়ার যোগ্য হয়েছেন!' 
                      : `আর মাত্র ৳${threshold - subtotal} অর্ডারে ফ্রি ডেলিভারি!`}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-emerald-700">{percent}%</span>
              </div>
              <div className="w-full bg-emerald-200 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-600 h-full transition-all duration-300 rounded-full" 
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          );
        })()}

        {/* Cart Item List */}
        <div className="flex-1 min-h-0 overflow-y-auto p-3.5 sm:p-4 space-y-3 divide-y divide-slate-100">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                <ShoppingBag className="w-10 h-10" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-base">Your cart is empty</h3>
                <p className="text-xs text-slate-500 mt-1">Discover trending gadgets, fashion, jewelry & essentials!</p>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#38BDF8] to-[#6366F1] text-white font-bold text-xs shadow-md"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            cart.map((item, idx) => {
              const varKey = item.selectedVariation?.id || `${item.productId}-${item.selectedSize}-${item.selectedColor}`;

              return (
                <div key={`${varKey}-${idx}`} className="pt-3 flex gap-3.5 items-center">
                  <img 
                    src={item.product.images[0]} 
                    alt={item.product.title} 
                    className="w-16 h-20 object-cover rounded-xl border border-slate-200 shrink-0"
                  />
                  
                  <div className="flex-1 min-w-0 space-y-1">
                    <h4 className="font-bold text-slate-800 text-xs truncate">{item.product.title}</h4>
                    
                    <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
                      {item.selectedSize && (
                        <span className="bg-slate-100 text-slate-700 font-bold px-1.5 py-0.5 rounded text-[10px]">
                          Size: {item.selectedSize}
                        </span>
                      )}
                      {item.selectedColor && (
                        <span className="bg-slate-100 text-slate-700 font-bold px-1.5 py-0.5 rounded text-[10px]">
                          Color: {item.selectedColor}
                        </span>
                      )}
                      <span className="font-bold text-[#1E293B]">৳{item.price}</span>
                    </div>

                    {/* Quantity adjustment */}
                    <div className="flex items-center gap-3 pt-1">
                      <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50">
                        <button 
                          onClick={() => updateCartQuantity(item.productId, item.quantity - 1, item.selectedSize, item.selectedColor, item.selectedVariation?.id)}
                          className="w-6 h-6 flex items-center justify-center text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-l-lg"
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-xs font-black text-slate-800">{item.quantity}</span>
                        <button 
                          onClick={() => updateCartQuantity(item.productId, item.quantity + 1, item.selectedSize, item.selectedColor, item.selectedVariation?.id)}
                          className="w-6 h-6 flex items-center justify-center text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-r-lg"
                        >
                          +
                        </button>
                      </div>

                      <span className="text-xs font-extrabold text-slate-900 ml-auto">
                        ৳{item.price * item.quantity}
                      </span>

                      <button 
                        onClick={() => removeFromCart(item.productId, item.selectedSize, item.selectedColor, item.selectedVariation?.id)}
                        className="text-slate-400 hover:text-rose-500 p-1"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Checkout Summary */}
        {cart.length > 0 && (
          <div className="shrink-0 sticky bottom-0 z-10 p-3.5 sm:p-4 bg-slate-50 border-t border-slate-200 space-y-2.5 shadow-lg">
            {/* Promo Code Coupon */}
            <div>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" 
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    placeholder="Coupon Code"
                    className="w-full bg-white border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs font-semibold outline-none focus:border-[#38BDF8] uppercase font-mono"
                  />
                </div>
                <button 
                  onClick={handleApplyPromo}
                  className="px-3 py-1.5 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-900 transition-colors cursor-pointer"
                >
                  Apply
                </button>
              </div>
              {promoSuccess && (
                <p className="text-[11px] text-emerald-600 font-bold mt-1 flex items-center gap-1">
                  <Check className="w-3 h-3" /> {promoSuccess}
                </p>
              )}
              {promoError && (
                <p className="text-[11px] text-rose-500 font-bold mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {promoError}
                </p>
              )}
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-1.5 text-xs pt-1 border-t border-slate-200 text-slate-600">
              <div className="flex justify-between">
                <span>Items Subtotal:</span>
                <span className="font-bold text-slate-800">৳{subtotal}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Coupon Discount ({appliedPromo?.code}):</span>
                  <span>-৳{discount}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-black text-slate-900 pt-1.5 border-t border-slate-200">
                <span>Total Payable:</span>
                <span className="text-[#38BDF8]">৳{finalTotal}</span>
              </div>
            </div>

            {/* Primary Actions */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setIsCartOpen(false);
                  setIsCheckoutOpen(true);
                }}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#38BDF8] to-[#6366F1] text-white font-extrabold text-xs shadow-lg shadow-sky-500/25 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>PROCEED TO CHECKOUT (৳{finalTotal})</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={handleWhatsAppCheckout}
                className="w-full py-2.5 rounded-2xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>ORDER VIA WHATSAPP DIRECT</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
