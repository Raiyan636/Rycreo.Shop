import React, { useState } from 'react';
import { useStore, AdminTabType } from '../../context/StoreContext';
import { Users, Plus, Trash2, Key, ShieldCheck, Mail, CheckSquare, Square } from 'lucide-react';
import { useToast } from '../common/Toast';

const AVAILABLE_ADMIN_TABS: { id: AdminTabType; label: string }[] = [
  { id: 'overview', label: 'Dashboard Overview' },
  { id: 'products', label: 'Products Directory' },
  { id: 'categories', label: 'Categories Management' },
  { id: 'static_pages', label: 'Static Policy Pages' },
  { id: 'order_policy', label: 'Order Policy & Settings' },
  { id: 'quick_categories', label: 'Quick Category Channels' },
  { id: 'attributes', label: 'Attributes & Swatches' },
  { id: 'orders', label: 'Orders Fulfillment' },
  { id: 'customers', label: 'Customers Database' },
  { id: 'hero', label: 'Banner Sliders' },
  { id: 'coupons', label: 'Promo Coupons' },
  { id: 'reviews', label: 'Reviews Approval' },
  { id: 'inventory', label: 'Inventory Control' },
  { id: 'settings', label: 'General Shop Settings' },
  { id: 'seo', label: 'SEO Engine' },
  { id: 'security', label: 'Super-Admin Security' },
  { id: 'search_analytics', label: 'Search Analytics' }
];

export const AccessControlManager: React.FC = () => {
  const { adminsList, addAdmin, deleteAdmin, adminEmail, adminSecretCode } = useStore();
  const { showToast } = useToast();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [code, setCode] = useState('');
  const [allowedTabs, setAllowedTabs] = useState<AdminTabType[]>(['overview']);

  const handleToggleTab = (tabId: AdminTabType) => {
    if (allowedTabs.includes(tabId)) {
      setAllowedTabs(allowedTabs.filter(t => t !== tabId));
    } else {
      setAllowedTabs([...allowedTabs, tabId]);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !pass.trim() || !code.trim()) {
      showToast("All fields are required!", "error");
      return;
    }

    if (email.trim().toLowerCase() === adminEmail.toLowerCase()) {
      showToast("Cannot use super admin email as auxiliary admin!", "error");
      return;
    }

    addAdmin(email.trim().toLowerCase(), pass.trim(), code.trim(), allowedTabs);
    showToast(`Auxiliary admin account for "${email.trim()}" created/updated successfully!`, "success");

    // Reset Form
    setEmail('');
    setPass('');
    setCode('');
    setAllowedTabs(['overview']);
    setIsFormOpen(false);
  };

  const handleDelete = (targetEmail: string) => {
    deleteAdmin(targetEmail);
    showToast(`Deleted admin account: ${targetEmail}`, "success");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-800 p-5 rounded-2xl border border-slate-700">
        <div>
          <h3 className="text-lg font-bold text-white font-['Outfit']">Multi-Admin Access Settings</h3>
          <p className="text-xs text-slate-400">Configure separate credentials and strict tab permissions for sub-managers or content editors.</p>
        </div>

        {!isFormOpen && (
          <button
            onClick={() => setIsFormOpen(true)}
            className="px-4 py-2 rounded-xl bg-[#38BDF8] text-slate-900 font-extrabold text-xs flex items-center gap-2 hover:bg-sky-400 transition-colors shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Auxiliary Admin</span>
          </button>
        )}
      </div>

      {isFormOpen && (
        <form onSubmit={handleSave} className="bg-slate-800 p-6 rounded-2xl border border-slate-700 space-y-4 animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-700 pb-3">
            <h4 className="text-sm font-bold text-[#38BDF8] uppercase tracking-wider">Create Auxiliary Credentials</h4>
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">Auxiliary Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Auxiliary Email"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white outline-none focus:border-[#38BDF8]"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">Password</label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={pass}
                  onChange={(e) => setPass(e.target.value)}
                  placeholder="Secure Password"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white outline-none focus:border-[#38BDF8]"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">Secret Security Passcode</label>
              <div className="relative">
                <ShieldCheck className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="4-Digit Code"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white outline-none focus:border-[#38BDF8]"
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-2.5 bg-slate-950 p-4 rounded-xl border border-slate-800">
            <p className="text-xs font-bold text-[#38BDF8] uppercase tracking-wider">Select Permissible Sections / Tab Controls:</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {AVAILABLE_ADMIN_TABS.map(tab => {
                const isSelected = allowedTabs.includes(tab.id);
                return (
                  <div
                    key={tab.id}
                    onClick={() => handleToggleTab(tab.id)}
                    className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-[#38BDF8]/40 bg-[#38BDF8]/5 text-white font-bold' 
                        : 'border-slate-800 hover:border-slate-700 text-slate-400'
                    }`}
                  >
                    {isSelected ? (
                      <CheckSquare className="w-4 h-4 text-[#38BDF8]" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-600" />
                    )}
                    <span className="text-[11px] truncate">{tab.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#38BDF8] to-[#6366F1] text-white text-xs font-extrabold shadow-md"
          >
            CREATE AUXILIARY ACCOUNT
          </button>
        </form>
      )}

      {/* Admins Table */}
      <div className="bg-slate-800 rounded-2xl border border-slate-700 w-full overflow-x-auto min-w-[300px]">
        <div className="p-4 bg-slate-900 border-b border-slate-700 font-extrabold text-xs text-white whitespace-nowrap">
          Active Administrative Accounts ({adminsList.length + 1})
        </div>
        <table className="w-full text-left text-xs text-slate-300 min-w-[800px]">
          <thead className="bg-slate-900/60 text-slate-400 uppercase font-bold text-[10px]">
            <tr>
              <th className="p-4">Email</th>
              <th className="p-4">Pass / Code</th>
              <th className="p-4">Authorization Role</th>
              <th className="p-4">Last Active</th>
              <th className="p-4">Tab Scope Permissions</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/60">
            {/* Super Admin Row */}
            <tr className="bg-slate-900/10">
              <td className="p-4 font-bold text-white">{adminEmail} (You)</td>
              <td className="p-4 font-mono text-slate-400">******** / {adminSecretCode ?? 'N/A'}</td>
              <td className="p-4">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-black border border-emerald-500/25">
                  Super Admin
                </span>
              </td>
              <td className="p-4 text-slate-500 italic">Online Now</td>
              <td className="p-4 text-slate-400">Full Access</td>
              <td className="p-4 text-right text-slate-500 font-bold text-[10px] uppercase">Master System</td>
            </tr>

            {/* Auxiliary Admin Rows */}
            {adminsList.map(adm => (
              <tr key={adm.email} className="hover:bg-slate-700/30 transition-colors">
                <td className="p-4 font-bold text-slate-200">{adm.email}</td>
                <td className="p-4 font-mono text-slate-400">{adm.pass} / {adm.code}</td>
                <td className="p-4">
                  <span className="px-2.5 py-0.5 rounded-full bg-sky-500/15 text-sky-400 text-[10px] font-bold border border-sky-500/25">
                    Auxiliary Manager
                  </span>
                </td>
                <td className="p-4 text-slate-500 text-[10px]">Unknown</td>
                <td className="p-4 flex flex-wrap gap-1 max-w-xs">
                  {adm.allowedTabs.map(t => (
                    <span key={t} className="px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 text-[9px] uppercase font-semibold">
                      {t}
                    </span>
                  ))}
                </td>
                <td className="p-4 text-right">
                  <button
                    onClick={() => handleDelete(adm.email)}
                    className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/20 hover:text-white transition-colors cursor-pointer"
                    title="Delete Account"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
