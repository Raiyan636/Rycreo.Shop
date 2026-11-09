import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { ShieldAlert, Eye, EyeOff, Check } from 'lucide-react';
import { useToast } from '../common/Toast';

export const SecurityManager: React.FC = () => {
  const { adminEmail, adminPassword, adminSecretCode, updateAdminCredentials } = useStore();
  const { showToast } = useToast();

  const [email, setEmail] = useState(adminEmail);
  const [password, setPassword] = useState(adminPassword);
  const [secretCode, setSecretCode] = useState(adminSecretCode);

  const [showEmail, setShowEmail] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showSecret, setShowSecret] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim() || !secretCode.trim()) {
      showToast("All security fields are required!", "error");
      return;
    }

    updateAdminCredentials(email.trim(), password.trim(), secretCode.trim());
    showToast("Credentials updated successfully! These are active immediately.", "success");
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 max-w-2xl mx-auto">
      <div className="flex items-start gap-4 bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl">
        <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-bold text-amber-300 font-heading">Security Notice</h4>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Changing these values will instantly update your owner access authentication credentials. Make sure you remember them, otherwise you will not be able to log back into the Admin Dashboard!
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {/* Email Field with Mask/Toggle */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300 block">Admin Email</label>
          <div className="relative">
            <input
              type={showEmail ? 'email' : 'password'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-[#38BDF8] rounded-xl px-4 py-3 text-xs text-white outline-none transition-all"
              required
            />
            <button
              type="button"
              onClick={() => setShowEmail(!showEmail)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
            >
              {showEmail ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Password Field with Mask/Toggle */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300 block">Admin Password</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-[#38BDF8] rounded-xl px-4 py-3 text-xs text-white outline-none transition-all"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Secret Passcode with Mask/Toggle */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300 block">Secret Security Passcode</label>
          <div className="relative">
            <input
              type={showSecret ? 'text' : 'password'}
              value={secretCode}
              onChange={(e) => setSecretCode(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-[#38BDF8] rounded-xl px-4 py-3 text-xs text-white outline-none transition-all"
              required
            />
            <button
              type="button"
              onClick={() => setShowSecret(!showSecret)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
            >
              {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#38BDF8] to-[#6366F1] text-white font-extrabold text-xs flex items-center justify-center gap-2 hover:opacity-95 active:scale-[0.99] transition-all cursor-pointer shadow-lg shadow-sky-500/10"
        >
          <Check className="w-4 h-4" />
          <span>UPDATE OWNER AUTHENTICATION</span>
        </button>
      </form>
    </div>
  );
};
