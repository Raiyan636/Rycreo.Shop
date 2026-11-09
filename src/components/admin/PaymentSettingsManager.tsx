import React, { useState } from 'react';
import { 
  CreditCard, 
  Plus, 
  Trash2, 
  Save, 
  CheckSquare, 
  Square, 
  Percent, 
  Smartphone, 
  DollarSign, 
  ShieldCheck,
  Check
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { PaymentGateway, ProductAdvanceRule } from '../../types/store';
import { useToast } from '../common/Toast';

export const PaymentSettingsManager: React.FC = () => {
  const { storeConfig, updateStoreConfig, products } = useStore();
  const { showToast } = useToast();

  // Mobile Banking Gateways (filter out COD to avoid duplicates)
  const [gateways, setGateways] = useState<PaymentGateway[]>(
    (storeConfig.paymentGateways || [
      {
        id: "bkash",
        name: "bKash",
        type: "bkash",
        accountNumber: "01700000000",
        accountType: "Personal",
        instructions: "Send Money or Cash Out to 01700000000 and enter your Transaction ID.",
        active: true
      },
      {
        id: "nagad",
        name: "Nagad",
        type: "nagad",
        accountNumber: "01700000000",
        accountType: "Personal",
        instructions: "Send Money or Cash Out to 01700000000 and enter your Transaction ID.",
        active: true
      },
      {
        id: "rocket",
        name: "Rocket",
        type: "rocket",
        accountNumber: "01700000000-7",
        accountType: "Personal",
        instructions: "Send Money to 01700000000-7 and enter your Transaction ID.",
        active: true
      }
    ]).filter(gw => gw.id !== 'cod' && gw.type !== 'cod')
  );

  // 1. COD Enabled State
  const [codEnabled, setCodEnabled] = useState<boolean>(
    storeConfig.isCodEnabled ?? true
  );

  // 2. Security / Partial Advance State
  const [securityAdvanceActive, setSecurityAdvanceActive] = useState<boolean>(
    storeConfig.securityAdvanceActive ?? true
  );
  const [securityAdvanceLabel, setSecurityAdvanceLabel] = useState<string>(
    storeConfig.securityAdvanceLabel ?? "Security Advance"
  );
  const [securityAdvanceType, setSecurityAdvanceType] = useState<'fixed' | 'percent'>(
    storeConfig.securityAdvanceType ?? 'fixed'
  );
  const [securityAdvanceValue, setSecurityAdvanceValue] = useState<number>(
    storeConfig.securityAdvanceValue ?? 100
  );
  const [securityAdvanceDiscount, setSecurityAdvanceDiscount] = useState<number>(
    storeConfig.securityAdvanceDiscountPercent ?? 0
  );
  const [securityAdvanceFreeDelivery, setSecurityAdvanceFreeDelivery] = useState<boolean>(
    storeConfig.securityAdvanceFreeDeliveryActive ?? false
  );

  // Minimum Order Threshold Rule for Advance Charge
  const [advanceThresholdActive, setAdvanceThresholdActive] = useState<boolean>(
    storeConfig.advanceMinOrderThresholdActive ?? false
  );
  const [advanceThresholdAmount, setAdvanceThresholdAmount] = useState<number>(
    storeConfig.advanceMinOrderThresholdAmount ?? 2000
  );
  const [advanceThresholdDisableCod, setAdvanceThresholdDisableCod] = useState<boolean>(
    storeConfig.advanceMinOrderDisableCod ?? false
  );
  const [advanceThresholdNotice, setAdvanceThresholdNotice] = useState<string>(
    storeConfig.advanceMinOrderNotice || "An advance payment of ৳100 is mandatory for orders above ৳2,000."
  );

  // 3. Full Payment State
  const [fullPaymentActive, setFullPaymentActive] = useState<boolean>(
    storeConfig.fullPaymentActive ?? true
  );
  const [fullPaymentDiscount, setFullPaymentDiscount] = useState<number>(
    storeConfig.fullPaymentDiscountPercent ?? 0
  );

  // 4. Product-wise Advance Rules
  const [productAdvanceRules, setProductAdvanceRules] = useState<ProductAdvanceRule[]>(
    storeConfig.productAdvanceRules || []
  );

  // Modal States for Product Rules
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [ruleName, setRuleName] = useState('Special Advance Rule');
  const [ruleAdvanceType, setRuleAdvanceType] = useState<'fixed' | 'percent'>('percent');
  const [ruleAdvanceValue, setRuleAdvanceValue] = useState<number>(20);
  const [ruleDiscountPercent, setRuleDiscountPercent] = useState<number>(0);
  const [ruleFreeDelivery, setRuleFreeDelivery] = useState<boolean>(false);
  const [ruleIncludedProductIds, setRuleIncludedProductIds] = useState<string[]>([]);

  // Gateway Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newNumber, setNewNumber] = useState('');
  const [newType, setNewType] = useState<PaymentGateway['type']>('custom');
  const [newAccType, setNewAccType] = useState('Personal');
  const [newInstructions, setNewInstructions] = useState('');

  const [saving, setSaving] = useState(false);

  const toggleGateway = (id: string) => {
    setGateways(prev => prev.map(gw => gw.id === id ? { ...gw, active: !gw.active } : gw));
  };

  const updateGatewayField = (id: string, field: keyof PaymentGateway, value: any) => {
    setGateways(prev => prev.map(gw => gw.id === id ? { ...gw, [field]: value } : gw));
  };

  const handleDeleteGateway = (id: string) => {
    setGateways(prev => prev.filter(gw => gw.id !== id));
    showToast('Payment gateway removed', 'success');
  };

  const handleAddGateway = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      showToast('Please enter a Payment Method Name!', 'error');
      return;
    }

    const newGateway: PaymentGateway = {
      id: `gw-${Date.now()}`,
      name: newName.trim(),
      type: newType,
      accountNumber: newNumber.trim() || 'N/A',
      accountType: newAccType.trim() || 'Personal',
      instructions: newInstructions.trim() || 'Send money to this account and provide your Transaction ID.',
      active: true
    };

    setGateways(prev => [...prev, newGateway]);
    setShowAddModal(false);
    setNewName('');
    setNewNumber('');
    setNewInstructions('');
    showToast(`Added ${newGateway.name} successfully!`, 'success');
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      await updateStoreConfig({
        paymentGateways: gateways,
        isCodEnabled: codEnabled,
        securityAdvanceActive: securityAdvanceActive,
        securityAdvanceLabel: securityAdvanceLabel,
        securityAdvanceType: securityAdvanceType,
        securityAdvanceValue: Number(securityAdvanceValue) || 0,
        securityAdvanceDiscountPercent: Number(securityAdvanceDiscount) || 0,
        securityAdvanceFreeDeliveryActive: securityAdvanceFreeDelivery,
        advanceMinOrderThresholdActive: advanceThresholdActive,
        advanceMinOrderThresholdAmount: Number(advanceThresholdAmount) || 2000,
        advanceMinOrderDisableCod: advanceThresholdDisableCod,
        advanceMinOrderNotice: advanceThresholdNotice.trim(),
        fullPaymentActive: fullPaymentActive,
        fullPaymentDiscountPercent: Number(fullPaymentDiscount) || 0,
        productAdvanceRules: productAdvanceRules
      });
      showToast('Payment settings saved successfully!', 'success');
    } catch (err) {
      showToast('Failed to save payment settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const openAddRuleModal = () => {
    setEditingRuleId(null);
    setRuleName('Custom Product Advance Rule');
    setRuleAdvanceType('percent');
    setRuleAdvanceValue(20);
    setRuleDiscountPercent(0);
    setRuleFreeDelivery(false);
    setRuleIncludedProductIds(products.map(p => p.id)); // Default include all
    setShowRuleModal(true);
  };

  const openEditRuleModal = (rule: ProductAdvanceRule) => {
    setEditingRuleId(rule.id);
    setRuleName(rule.ruleName || 'Custom Product Advance Rule');
    setRuleAdvanceType(rule.advanceType);
    setRuleAdvanceValue(rule.advanceValue);
    setRuleDiscountPercent(rule.discountPercent || 0);
    setRuleFreeDelivery(!!rule.freeDelivery);
    setRuleIncludedProductIds(rule.includedProductIds || (rule.productId ? [rule.productId] : []));
    setShowRuleModal(true);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
            <CreditCard className="w-5 h-5" />
            <span>Payment Methods & Advance Rules Control</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-800 mt-1">
            Configure Cash on Delivery, Advance Payments & Mobile Banking
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Enable or disable payment options, set high-value order advance rules, or assign advance rules to specific products.
          </p>
        </div>

        <button
          onClick={handleSaveAll}
          disabled={saving}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save Settings'}</span>
        </button>
      </div>

      {/* 3 Core Payment Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 1. Cash on Delivery (COD) Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
              <span>Cash on Delivery (COD)</span>
            </h3>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input 
                type="checkbox"
                checked={codEnabled}
                onChange={(e) => setCodEnabled(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
              />
              <span className="text-xs font-bold text-slate-800">{codEnabled ? "Enabled" : "Disabled"}</span>
            </label>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Customers pay 100% cash to the courier agent upon delivery.
          </p>
        </div>

        {/* 2. Security Advance / Partial Advance Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-slate-800 text-sm">Security Advance</h3>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={securityAdvanceActive}
                onChange={(e) => setSecurityAdvanceActive(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
              />
              <span className="text-xs font-bold text-slate-800">{securityAdvanceActive ? "Enabled" : "Disabled"}</span>
            </label>
          </div>

          <div className={`space-y-3 transition-all ${securityAdvanceActive ? '' : 'opacity-40 pointer-events-none'}`}>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Option Title:</label>
              <input 
                type="text"
                value={securityAdvanceLabel}
                onChange={(e) => setSecurityAdvanceLabel(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800"
                placeholder="Label (e.g. Security Advance / Pay 50%)"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Advance Type:</label>
                <select 
                  value={securityAdvanceType}
                  onChange={(e) => setSecurityAdvanceType(e.target.value as 'fixed' | 'percent')}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-bold text-slate-800"
                >
                  <option value="fixed">Fixed (৳)</option>
                  <option value="percent">Percentage (%)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  {securityAdvanceType === 'fixed' ? 'Amount (৳):' : 'Percentage (%):'}
                </label>
                <input 
                  type="number"
                  value={securityAdvanceValue}
                  onChange={(e) => setSecurityAdvanceValue(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Discount Offer (%): <span className="text-slate-400 font-normal">(0 = No discount badge shown)</span>
              </label>
              <input 
                type="number"
                min={0}
                max={100}
                value={securityAdvanceDiscount}
                onChange={(e) => setSecurityAdvanceDiscount(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800"
                placeholder="0"
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={securityAdvanceFreeDelivery}
                onChange={(e) => setSecurityAdvanceFreeDelivery(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded"
              />
              <span className="text-xs font-bold text-slate-700">Grant Free Delivery</span>
            </label>
          </div>
        </div>

        {/* 3. Full Payment Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-slate-800 text-sm">Full Payment (100% Advance)</h3>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={fullPaymentActive}
                onChange={(e) => setFullPaymentActive(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
              />
              <span className="text-xs font-bold text-slate-800">{fullPaymentActive ? "Enabled" : "Disabled"}</span>
            </label>
          </div>

          <div className={`space-y-3 transition-all ${fullPaymentActive ? '' : 'opacity-40 pointer-events-none'}`}>
            <p className="text-xs text-slate-500 leading-relaxed">
              Customers pay 100% total order bill via online mobile banking during checkout.
            </p>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Full Payment Discount (%): <span className="text-slate-400 font-normal">(0 = No discount badge shown)</span>
              </label>
              <input 
                type="number"
                min={0}
                max={100}
                value={fullPaymentDiscount}
                onChange={(e) => setFullPaymentDiscount(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800"
                placeholder="0"
              />
            </div>
          </div>
        </div>
      </div>

      {/* High-Value Order Threshold Rule Banner */}
      <div className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-sky-500/10 rounded-2xl p-5 border border-indigo-500/20 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-md">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 text-sm">
                High-Value Order Minimum Threshold Advance Rule
              </h3>
              <p className="text-xs text-slate-600">
                Enforce a mandatory advance payment (e.g. ৳100) when the total order bill exceeds a specific threshold (e.g. ৳2,000).
              </p>
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer shrink-0">
            <input 
              type="checkbox"
              checked={advanceThresholdActive}
              onChange={(e) => setAdvanceThresholdActive(e.target.checked)}
              className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
            />
            <span className="text-xs font-bold text-slate-800">
              {advanceThresholdActive ? "ON (Active)" : "OFF (Disabled)"}
            </span>
          </label>
        </div>

        {advanceThresholdActive && (
          <div className="space-y-3 pt-3 border-t border-indigo-500/20 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Minimum Order Threshold (৳):
                </label>
                <input 
                  type="number"
                  value={advanceThresholdAmount}
                  onChange={(e) => setAdvanceThresholdAmount(Number(e.target.value))}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="2000"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Applies when cart total is ৳{advanceThresholdAmount} or more.
                </span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Notice Text for Shoppers:
                </label>
                <input 
                  type="text"
                  value={advanceThresholdNotice}
                  onChange={(e) => setAdvanceThresholdNotice(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="An advance payment of ৳100 is mandatory for orders above ৳2,000."
                />
              </div>
            </div>

            <div className="p-3 bg-white/90 rounded-xl border border-indigo-200 flex items-center justify-between gap-3">
              <div>
                <span className="font-extrabold text-slate-800 block text-xs">
                  Disable Cash on Delivery (COD) for High-Value Orders
                </span>
                <span className="text-[10px] text-slate-500">
                  When checked, pure Cash on Delivery (0% advance) will be disabled for orders above ৳{advanceThresholdAmount}.
                </span>
              </div>

              <label className="flex items-center gap-2 cursor-pointer shrink-0">
                <input 
                  type="checkbox"
                  checked={advanceThresholdDisableCod}
                  onChange={(e) => setAdvanceThresholdDisableCod(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
                <span className="text-xs font-bold text-indigo-950">
                  {advanceThresholdDisableCod ? "Disable COD (Pay Now Only)" : "Allow COD with Advance"}
                </span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Product-wise Advance Payment Rules (Included / Excluded Products) */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-extrabold text-slate-800 text-base">Product-wise Advance Payment Rules</h3>
            <p className="text-xs text-slate-500">
              Select which specific products require an advance payment. Unselected products are excluded.
            </p>
          </div>
          <button
            type="button"
            onClick={openAddRuleModal}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-md shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product Rule</span>
          </button>
        </div>

        {productAdvanceRules.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 text-xs text-slate-400">
            No product-specific advance rules defined. All products currently use the global rules.
          </div>
        ) : (
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase border-b border-slate-200">
                <tr>
                  <th className="p-3">Rule Name</th>
                  <th className="p-3">Included Products</th>
                  <th className="p-3 text-center">Advance</th>
                  <th className="p-3 text-center">Discount %</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {productAdvanceRules.map((rule) => {
                  const incIds = rule.includedProductIds || (rule.productId ? [rule.productId] : []);
                  const incCount = incIds.length;
                  return (
                    <tr key={rule.id} className="hover:bg-slate-50/50">
                      <td className="p-3 font-extrabold text-slate-900">
                        {rule.ruleName || 'Product Advance Rule'}
                      </td>
                      <td className="p-3">
                        <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-bold text-[11px]">
                          {incCount === products.length ? 'All Products Included' : `${incCount} Product(s) Included`}
                        </span>
                      </td>
                      <td className="p-3 text-center font-bold text-indigo-600 font-mono">
                        {rule.advanceType === 'percent' ? `${rule.advanceValue}%` : `৳${rule.advanceValue}`}
                      </td>
                      <td className="p-3 text-center text-emerald-600 font-mono font-bold">
                        {rule.discountPercent && rule.discountPercent > 0 ? `${rule.discountPercent}% OFF` : 'None'}
                      </td>
                      <td className="p-3 text-right space-x-1.5">
                        <button
                          type="button"
                          onClick={() => openEditRuleModal(rule)}
                          className="px-2 py-1 text-[10px] font-bold bg-slate-100 text-slate-700 rounded hover:bg-slate-200 cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm("Delete this product advance rule?")) {
                              setProductAdvanceRules(prev => prev.filter(r => r.id !== rule.id));
                              showToast("Rule deleted", "success");
                            }
                          }}
                          className="px-2 py-1 text-[10px] font-bold bg-rose-50 text-rose-600 rounded hover:bg-rose-100 cursor-pointer"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Mobile Banking Gateways List */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-extrabold text-slate-800 text-base">Mobile Banking Gateways (bKash, Nagad, Rocket, Bank)</h3>
            <p className="text-xs text-slate-500">
              Configure phone numbers and instructions for mobile banking transfers.
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-md shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Gateway</span>
          </button>
        </div>

        <div className="space-y-3">
          {gateways.map((gw) => (
            <div 
              key={gw.id} 
              className={`p-4 rounded-xl border transition-all ${
                gw.active ? 'bg-white border-slate-200 shadow-2xs' : 'bg-slate-50 border-slate-200 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => toggleGateway(gw.id)}
                    className="text-indigo-600 cursor-pointer"
                  >
                    {gw.active ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5 text-slate-400" />}
                  </button>
                  <span className="font-extrabold text-slate-800 text-sm">{gw.name}</span>
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteGateway(gw.id)}
                  className="p-1 text-rose-500 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Account Number / Phone:</label>
                  <input
                    type="text"
                    value={gw.accountNumber}
                    onChange={(e) => updateGatewayField(gw.id, 'accountNumber', e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-600 mb-1">Account Type:</label>
                  <input
                    type="text"
                    value={gw.accountType || ''}
                    onChange={(e) => updateGatewayField(gw.id, 'accountType', e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                    placeholder="Personal / Merchant"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-600 mb-1">Instructions:</label>
                  <input
                    type="text"
                    value={gw.instructions || ''}
                    onChange={(e) => updateGatewayField(gw.id, 'instructions', e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Save Button Bar */}
      <div className="flex justify-end pt-4 border-t border-slate-200">
        <button
          type="button"
          onClick={handleSaveAll}
          disabled={saving}
          className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save Payment Settings'}</span>
        </button>
      </div>

      {/* Add Custom Gateway Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-extrabold text-slate-800">Add Payment Gateway</h3>
            
            <form onSubmit={handleAddGateway} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Method Name *</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="CellFin / Islami Bank / Upay"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Account Number / Phone</label>
                <input
                  type="text"
                  value={newNumber}
                  onChange={(e) => setNewNumber(e.target.value)}
                  placeholder="01700000000"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Account Type</label>
                <input
                  type="text"
                  value={newAccType}
                  onChange={(e) => setNewAccType(e.target.value)}
                  placeholder="Personal / Merchant / Bank"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Instructions</label>
                <textarea
                  rows={2}
                  value={newInstructions}
                  onChange={(e) => setNewInstructions(e.target.value)}
                  placeholder="Send money and provide Transaction ID."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700"
                >
                  Add Gateway
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Product Rule Modal with Included/Excluded Product Selection */}
      {showRuleModal && (
        <div className="fixed inset-0 z-[120] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-800">
                {editingRuleId ? 'Edit Product Advance Rule' : 'Add Product Advance Rule'}
              </h3>
              <button
                type="button"
                onClick={() => setShowRuleModal(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3.5 text-xs text-slate-700">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Rule Name</label>
                <input
                  type="text"
                  value={ruleName}
                  onChange={(e) => setRuleName(e.target.value)}
                  placeholder="Rule Name (e.g. Winter Jacket Advance)"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 outline-none font-bold text-slate-800"
                />
              </div>

              {/* Checkboxes for Included / Excluded Products */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block font-extrabold text-slate-800">
                    Which products require this advance payment?
                  </label>
                  <div className="flex items-center gap-2 text-[10px]">
                    <button
                      type="button"
                      onClick={() => setRuleIncludedProductIds(products.map(p => p.id))}
                      className="text-indigo-600 font-bold hover:underline cursor-pointer"
                    >
                      Select All
                    </button>
                    <span>|</span>
                    <button
                      type="button"
                      onClick={() => setRuleIncludedProductIds([])}
                      className="text-rose-600 font-bold hover:underline cursor-pointer"
                    >
                      Clear All
                    </button>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 mb-2">
                  Checked products = <strong className="text-emerald-700">INCLUDED</strong> (will require advance payment). Unchecked products = <strong className="text-rose-600">EXCLUDED</strong>.
                </p>

                <div className="max-h-48 overflow-y-auto border border-slate-300 rounded-xl p-2.5 space-y-1.5 bg-slate-50">
                  {products.length === 0 ? (
                    <p className="text-slate-400 text-center py-2">No products found in store.</p>
                  ) : (
                    products.map(p => {
                      const isChecked = ruleIncludedProductIds.includes(p.id);
                      return (
                        <label 
                          key={p.id} 
                          className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors border ${
                            isChecked ? 'bg-indigo-50/80 border-indigo-200' : 'bg-white border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setRuleIncludedProductIds(prev => [...prev, p.id]);
                                } else {
                                  setRuleIncludedProductIds(prev => prev.filter(id => id !== p.id));
                                }
                              }}
                              className="w-4 h-4 text-indigo-600 rounded cursor-pointer shrink-0"
                            />
                            <span className="font-bold text-slate-800 text-xs truncate">{p.title}</span>
                          </div>
                          <span className="text-[10px] font-mono font-bold text-slate-500 shrink-0">৳{p.salePrice || p.price}</span>
                        </label>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Advance Type</label>
                  <select
                    value={ruleAdvanceType}
                    onChange={(e) => setRuleAdvanceType(e.target.value as 'fixed' | 'percent')}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 outline-none font-bold text-slate-800 cursor-pointer"
                  >
                    <option value="percent">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (৳)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Advance Value *</label>
                  <input
                    type="number"
                    min={1}
                    value={ruleAdvanceValue}
                    onChange={(e) => setRuleAdvanceValue(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 outline-none font-bold text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Special Discount (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={ruleDiscountPercent}
                    onChange={(e) => setRuleDiscountPercent(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 outline-none font-bold text-slate-800"
                    placeholder="0"
                  />
                </div>

                <div className="flex flex-col justify-end pb-1">
                  <label className="flex items-center gap-2 cursor-pointer py-2">
                    <input
                      type="checkbox"
                      checked={ruleFreeDelivery}
                      onChange={(e) => setRuleFreeDelivery(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded"
                    />
                    <span className="text-xs font-bold text-slate-700">Grant Free Delivery</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowRuleModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (ruleIncludedProductIds.length === 0) {
                    alert("Please select at least one product to include in this advance rule.");
                    return;
                  }
                  
                  const rulePayload: ProductAdvanceRule = {
                    id: editingRuleId || `rule-${Date.now()}`,
                    ruleName: ruleName.trim() || 'Product Advance Rule',
                    includedProductIds: ruleIncludedProductIds,
                    advanceType: ruleAdvanceType,
                    advanceValue: Number(ruleAdvanceValue) || 0,
                    discountPercent: Number(ruleDiscountPercent) || 0,
                    freeDelivery: ruleFreeDelivery
                  };

                  if (editingRuleId) {
                    setProductAdvanceRules(prev => prev.map(r => r.id === editingRuleId ? rulePayload : r));
                    showToast("Product advance rule updated!", "success");
                  } else {
                    setProductAdvanceRules(prev => [...prev, rulePayload]);
                    showToast("Product advance rule added!", "success");
                  }
                  setShowRuleModal(false);
                }}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs cursor-pointer"
              >
                {editingRuleId ? 'Update Rule' : 'Add Rule'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
