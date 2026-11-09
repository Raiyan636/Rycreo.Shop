import React, { useState } from 'react';
import { Plus, Trash2, Edit, Tag, Check, X, Calendar, Percent, DollarSign, Users, Eye, EyeOff } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Coupon } from '../../types/store';
import { ConfirmModal } from '../common/ConfirmModal';
import { useToast } from '../common/Toast';

export const CouponManager: React.FC = () => {
  const { coupons, addCoupon, updateCoupon, deleteCoupon } = useStore();
  const { showToast } = useToast();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [couponToDelete, setCouponToDelete] = useState<{ id: string; code: string } | null>(null);

  // Form State
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percent' | 'fixed'>('percent');
  const [discountValue, setDiscountValue] = useState(10);
  const [minOrderAmount, setMinOrderAmount] = useState<number | undefined>(1000);
  const [maxDiscountAmount, setMaxDiscountAmount] = useState<number | undefined>(500);
  const [isFreeDelivery, setIsFreeDelivery] = useState(false);
  const [usageLimit, setUsageLimit] = useState(100);
  const [expiryDate, setExpiryDate] = useState('');
  const [active, setActive] = useState(true);

  const resetForm = () => {
    setCode('');
    setDiscountType('percent');
    setDiscountValue(10);
    setMinOrderAmount(1000);
    setMaxDiscountAmount(500);
    setIsFreeDelivery(false);
    setUsageLimit(100);
    setExpiryDate('');
    setActive(true);
    setEditingCoupon(null);
    setIsFormOpen(false);
  };

  const handleStartEdit = (coup: Coupon) => {
    setEditingCoupon(coup);
    setCode(coup.code);
    setDiscountType(coup.discountType);
    setDiscountValue(coup.discountValue);
    setMinOrderAmount(coup.minOrderAmount);
    setMaxDiscountAmount(coup.maxDiscountAmount);
    setIsFreeDelivery(!!coup.isFreeDelivery);
    setUsageLimit(coup.usageLimit);
    setExpiryDate(coup.expiryDate || '');
    setActive(coup.active);
    setIsFormOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || (!isFreeDelivery && discountValue <= 0)) {
      showToast("Please enter a valid coupon code and discount value!", "error");
      return;
    }

    const cleanCode = code.trim().toUpperCase();

    if (editingCoupon) {
      updateCoupon({
        ...editingCoupon,
        code: cleanCode,
        discountType,
        discountValue,
        minOrderAmount: minOrderAmount ? Number(minOrderAmount) : undefined,
        maxDiscountAmount: discountType === 'percent' && maxDiscountAmount ? Number(maxDiscountAmount) : undefined,
        isFreeDelivery,
        usageLimit: Number(usageLimit) || 0,
        expiryDate: expiryDate.trim() || undefined,
        active
      });
      showToast(`Updated coupon "${cleanCode}" successfully!`, 'success');
    } else {
      addCoupon({
        code: cleanCode,
        discountType,
        discountValue,
        minOrderAmount: minOrderAmount ? Number(minOrderAmount) : undefined,
        maxDiscountAmount: discountType === 'percent' && maxDiscountAmount ? Number(maxDiscountAmount) : undefined,
        isFreeDelivery,
        usageLimit: Number(usageLimit) || 0,
        expiryDate: expiryDate.trim() || undefined,
        active
      });
      showToast(`Created new promo coupon "${cleanCode}"!`, 'success');
    }

    resetForm();
  };

  const confirmDeleteCoupon = () => {
    if (couponToDelete) {
      deleteCoupon(couponToDelete.id);
      showToast(`Deleted coupon code "${couponToDelete.code}"!`, 'success');
      setCouponToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-800 p-4 rounded-2xl border border-slate-700">
        <div>
          <h3 className="text-lg font-bold text-white font-['Outfit']">WooCommerce-Grade Coupon Management</h3>
          <p className="text-xs text-slate-400">Create promotional discount codes, usage limits, minimum order thresholds, and expiry dates.</p>
        </div>

        {!isFormOpen && (
          <button
            onClick={() => {
              resetForm();
              setIsFormOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-[#38BDF8] text-slate-900 font-extrabold text-xs flex items-center gap-2 hover:bg-sky-400 transition-colors shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Coupon</span>
          </button>
        )}
      </div>

      {/* Form */}
      {isFormOpen && (
        <form onSubmit={handleSave} className="bg-slate-800/95 border border-slate-700 p-5 rounded-2xl space-y-4 animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-700 pb-3">
            <h4 className="text-sm font-bold text-[#38BDF8] uppercase tracking-wider">
              {editingCoupon ? 'Edit Promo Coupon' : 'Create New Coupon'}
            </h4>
            <button
              type="button"
              onClick={resetForm}
              className="p-1 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Coupon Code *</label>
              <input 
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="SAVE10, PUJA20"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none focus:border-[#38BDF8] font-mono font-bold"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Discount Type</label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as 'percent' | 'fixed')}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none"
              >
                <option value="percent">Percentage Discount (%)</option>
                <option value="fixed">Fixed Amount Discount (৳)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Discount Value ({discountType === 'percent' ? '%' : '৳'}) *
              </label>
              <input 
                type="number"
                min={1}
                value={discountValue}
                onChange={(e) => setDiscountValue(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none focus:border-[#38BDF8]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Minimum Order Amount (৳)</label>
              <input 
                type="number"
                min={0}
                value={minOrderAmount ?? ''}
                onChange={(e) => setMinOrderAmount(e.target.value ? Number(e.target.value) : undefined)}
                placeholder="1000"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none focus:border-[#38BDF8]"
              />
            </div>

            {discountType === 'percent' && (
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Max Discount Cap (৳)</label>
                <input 
                  type="number"
                  min={0}
                  value={maxDiscountAmount ?? ''}
                  onChange={(e) => setMaxDiscountAmount(e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="500"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none focus:border-[#38BDF8]"
                />
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Total Usage Limit</label>
              <input 
                type="number"
                min={0}
                value={usageLimit}
                onChange={(e) => setUsageLimit(Number(e.target.value))}
                placeholder="100"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none focus:border-[#38BDF8]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Expiry Date (Optional)</label>
              <input 
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none focus:border-[#38BDF8]"
              />
            </div>

            <div className="flex flex-col gap-2 pt-4">
              <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg bg-emerald-950/40 border border-emerald-500/30">
                <input 
                  type="checkbox"
                  checked={isFreeDelivery}
                  onChange={(e) => setIsFreeDelivery(e.target.checked)}
                  className="w-4 h-4 rounded accent-emerald-500"
                />
                <div>
                  <span className="text-xs font-bold text-emerald-300 block">🚚 ফ্রি ডেলিভারি কুপন (Free Delivery Included)</span>
                  <span className="text-[10px] text-slate-400">এই কুপন ব্যবহার করলে ডেলিভারি চার্জ ৳০ হবে</span>
                </div>
              </label>

              <label className="flex items-center gap-2 cursor-pointer mt-1">
                <input 
                  type="checkbox"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="w-4 h-4 rounded accent-[#38BDF8]"
                />
                <span className="text-xs font-bold text-slate-300">Active Coupon</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 rounded-xl bg-slate-700 text-slate-300 text-xs font-bold hover:bg-slate-600 cursor-pointer"
            >
              Cancel / বাতিল করুন
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#38BDF8] to-[#6366F1] text-white text-xs font-bold shadow-md cursor-pointer hover:opacity-90"
            >
              {editingCoupon ? 'Update Coupon' : 'Save Coupon'}
            </button>
          </div>
        </form>
      )}

      {/* Coupons Table */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-bold">
                <th className="p-3.5">Code</th>
                <th className="p-3.5">Discount</th>
                <th className="p-3.5">Min Order</th>
                <th className="p-3.5">Usage</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {coupons.map(c => {
                return (
                  <tr key={c.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="p-3.5">
                      <span className="font-mono font-bold text-[#38BDF8] bg-sky-500/10 px-2 py-1 rounded-lg border border-sky-500/20">
                        {c.code}
                      </span>
                      {c.isFreeDelivery && (
                        <span className="ml-1.5 inline-block text-[9px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/30">
                          Free Shipping
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 font-bold text-white">
                      {c.discountType === 'percent' ? `${c.discountValue}%` : `৳${c.discountValue}`}
                      {c.maxDiscountAmount && (
                        <span className="text-[10px] text-slate-400 block font-normal">
                          Max ৳{c.maxDiscountAmount}
                        </span>
                      )}
                    </td>
                    <td className="p-3.5">
                      {c.minOrderAmount ? `৳${c.minOrderAmount}` : 'None'}
                    </td>
                    <td className="p-3.5">
                      {c.usedCount} / {c.usageLimit > 0 ? c.usageLimit : '∞'}
                    </td>
                    <td className="p-3.5">
                      <button
                        onClick={() => updateCoupon({ ...c, active: !c.active })}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                          c.active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'
                        }`}
                      >
                        {c.active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        <span>{c.active ? 'Active' : 'Inactive'}</span>
                      </button>
                    </td>
                    <td className="p-3.5 text-right space-x-1.5">
                      <button
                        onClick={() => handleStartEdit(c)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                        title="Edit Coupon"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setCouponToDelete({ id: c.id, code: c.code })}
                        className="p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500 text-rose-400 hover:text-white transition-colors cursor-pointer"
                        title="Delete Coupon"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!couponToDelete}
        title="Delete Coupon Code?"
        message={`Are you sure you want to permanently delete the coupon "${couponToDelete?.code}"? Customers will no longer be able to apply or collect this voucher.`}
        confirmLabel="Yes, Delete Coupon"
        onConfirm={confirmDeleteCoupon}
        onCancel={() => setCouponToDelete(null)}
      />
    </div>
  );
};
