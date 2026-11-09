import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { useToast } from '../common/Toast';
import { ShieldCheck, Clock, FileText, Save, Sparkles, AlertTriangle } from 'lucide-react';

export const OrderPolicySettingsManager: React.FC = () => {
  const { storeConfig, updateStoreConfig, modificationWindowHours } = useStore();
  const { showToast } = useToast();

  const currentWindow = modificationWindowHours || Number(storeConfig?.orderLockDurationHours) || 24;
  const [lockHours, setLockHours] = useState<number>(currentWindow);
  const [policyText, setPolicyText] = useState<string>(
    storeConfig?.orderPolicyText ||
    `⚡ **${currentWindow}-HOUR ORDER MODIFICATION & CANCELLATION POLICY**:\n\n1. **Modification Window (${currentWindow} Hours)**: After placing an order, customers have up to **${currentWindow} hours** to edit delivery address/phone, cancel the order, or add more products with variant selectors.\n2. **Auto-Locking**: Once ${currentWindow} hours have elapsed, the system automatically locks and disables all edits, cancellations, and product additions.\n3. **Consolidated Delivery**: Adding products within ${currentWindow} hours merges them into your existing order with a single consolidated delivery charge (no double-charging).`
  );

  React.useEffect(() => {
    if (storeConfig?.orderLockDurationHours) {
      setLockHours(Number(storeConfig.orderLockDurationHours) || 24);
    }
  }, [storeConfig?.orderLockDurationHours]);

  React.useEffect(() => {
    if (storeConfig?.orderPolicyText) {
      setPolicyText(storeConfig.orderPolicyText);
    }
  }, [storeConfig?.orderPolicyText]);

  const [isSaving, setIsSaving] = useState(false);

  const generateTemplateForHours = (hrs: number) => {
    return `⚡ **${hrs}-HOUR ORDER MODIFICATION & CANCELLATION POLICY**:\n\n1. **Modification Window (${hrs} Hours)**: After placing an order, customers have up to **${hrs} hours** to edit delivery address/phone, cancel the order, or add more products with variant selectors.\n2. **Auto-Locking**: Once ${hrs} hours have elapsed, the system automatically locks and disables all edits, cancellations, and product additions.\n3. **Consolidated Delivery**: Adding products within ${hrs} hours merges them into your existing order with a single consolidated delivery charge (no double-charging).`;
  };

  const handleSelectHours = (hrs: number) => {
    setLockHours(hrs);
    // Automatically update the hours inside the policy text template
    setPolicyText(prev => {
      if (!prev || prev.includes("HOUR ORDER MODIFICATION")) {
        return generateTemplateForHours(hrs);
      }
      return prev.replace(/\b(\d+)[- ]?(?:hour|hours|Hour|Hours)\b/g, `${hrs} hours`);
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const finalHours = Number(lockHours) || 24;
      await updateStoreConfig({
        orderLockDurationHours: finalHours,
        orderPolicyText: policyText
      });
      showToast(`Order Policy (${finalHours} Hours Window) saved and updated across entire website!`, "success");
    } catch (err) {
      showToast("Failed to update order policy settings.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const insertFormatting = (wrapper: string, defaultText: string) => {
    setPolicyText(prev => prev + `\n\n${wrapper}${defaultText}${wrapper}`);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
            <ShieldCheck className="w-4 h-4" />
            <span>Admin Control Panel (rycreoshop@gmail.com)</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">Order Policy & Modification Window</h1>
          <p className="text-emerald-200/80 text-xs max-w-xl">
            Configure the customer order modification time window (e.g., 6 hours, 8 hours, 12 hours) and customize the mandatory Checkout "Must Read Order Policy" terms and highlighted rules.
          </p>
        </div>
        <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 flex items-center gap-3">
          <Clock className="w-8 h-8 text-emerald-400" />
          <div>
            <div className="text-[10px] text-emerald-300 uppercase font-bold">Current Active Window</div>
            <div className="text-xl font-mono font-black">{lockHours} Hours</div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Module 1: Modification Hours Setting */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">Order Modification Time Limit</h2>
              <p className="text-xs text-slate-500">Set the exact number of hours after order placement during which customers can modify address, cancel, or add products.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            {[6, 12, 24, 48].map((hrs) => (
              <button
                key={hrs}
                type="button"
                onClick={() => handleSelectHours(hrs)}
                className={`py-3 px-4 rounded-2xl border font-black text-xs flex flex-col items-center gap-1 transition-all cursor-pointer ${
                  lockHours === hrs
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-md ring-2 ring-emerald-300'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <span className="text-lg font-mono">{hrs} Hours</span>
                <span className="text-[10px] opacity-80">{hrs === 24 ? 'Standard (24h)' : (hrs === 48 ? 'Extended (48h)' : `${hrs}h Window`)}</span>
              </button>
            ))}
          </div>

          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase">Custom Hour Duration</label>
              <button
                type="button"
                onClick={() => setPolicyText(generateTemplateForHours(lockHours))}
                className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 underline cursor-pointer"
              >
                🔄 Reset Policy Text to {lockHours}h Template
              </button>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={1}
                max={168}
                value={lockHours}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setLockHours(val);
                }}
                className="w-full sm:w-64 p-3 bg-slate-50 border border-slate-300 rounded-xl font-mono text-sm font-bold text-slate-900 outline-none focus:border-emerald-600"
              />
              <span className="text-xs font-bold text-slate-500">Hours</span>
            </div>
          </div>
        </div>

        {/* Module 2: Order Policy Rich Text & Highlights */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900">Checkout "Must Read Order Policy" Text</h2>
                <p className="text-xs text-slate-500">Edit the policy text displayed in the mandatory popup before checkout confirmation.</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => insertFormatting('**', 'Bold Highlight Text')}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                title="Bold Text"
              >
                <b>B</b> Bold
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('*', 'Italic Text')}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                title="Italic Text"
              >
                <i>I</i> Italic
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <textarea
              rows={10}
              value={policyText}
              onChange={(e) => setPolicyText(e.target.value)}
              placeholder="Enter order policy terms, modification rules, cancellation conditions..."
              className="w-full p-4 bg-slate-50 border border-slate-300 rounded-2xl font-mono text-xs text-slate-900 outline-none focus:border-emerald-600 leading-relaxed shadow-inner"
            ></textarea>
            <p className="text-[11px] text-slate-500 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Use Markdown formatting like **bold text** or numbered lists to highlight rules for customers.</span>
            </p>
          </div>

          {/* Live Preview Box */}
          <div className="space-y-2 pt-4">
            <label className="text-xs font-bold text-slate-700 uppercase flex items-center gap-1.5">
              <span>Live Checkout Modal Preview</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px]">Real-time</span>
            </label>
            <div className="p-5 bg-slate-900 text-slate-100 rounded-2xl border border-slate-800 space-y-3 font-sans text-xs">
              <div className="flex items-center gap-2 text-emerald-400 font-black border-b border-slate-800 pb-2">
                <AlertTriangle className="w-4 h-4" />
                <span>Must Read Order Policy ({lockHours} Hours Window)</span>
              </div>
              <div className="whitespace-pre-wrap text-slate-300 text-[11px] leading-relaxed font-mono">
                {policyText}
              </div>
              <div className="pt-3 border-t border-slate-800 space-y-2 text-[11px]">
                <div className="flex items-center gap-2 text-slate-400">
                  <div className="w-4 h-4 rounded border border-slate-600 flex items-center justify-center bg-slate-800">✓</div>
                  <span>I have read and understood the order policies and terms.</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <div className="w-4 h-4 rounded border border-slate-600 flex items-center justify-center bg-slate-800">✓</div>
                  <span>I agree to the delivery, payment, and cancellation conditions.</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isSaving}
            className="px-8 py-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-700 text-white rounded-2xl font-black text-sm flex items-center gap-2 shadow-xl hover:shadow-2xl transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            <span>{isSaving ? 'Saving Changes...' : 'Save Policy & Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
