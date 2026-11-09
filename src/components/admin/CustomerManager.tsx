import React, { useState } from 'react';
import { Users, Phone, MapPin, ShoppingBag, MessageSquare, Search } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const CustomerManager: React.FC = () => {
  const { customers, storeConfig } = useStore();
  const [search, setSearch] = useState('');

  const filteredCustomers = (customers || []).filter(c => 
    (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.phone || '').includes(search) ||
    (c.address || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleWhatsApp = (phone: string, name: string) => {
    const cleanPhone = (phone || '').replace(/[^0-9]/g, '');
    const message = encodeURIComponent(`Hi ${name || 'Customer'}, thank you for ordering with ${storeConfig.storeName}! How can we assist you today?`);
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-800 p-4 rounded-2xl border border-slate-700">
        <div>
          <h3 className="text-lg font-bold text-white font-['Outfit']">Customer Directory & Purchase History</h3>
          <p className="text-xs text-slate-400">View customer lifetime orders, total spend in ৳, and initiate direct WhatsApp support.</p>
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer name, phone, or address..."
            className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-xl pl-9 pr-3 py-2 outline-none focus:border-[#38BDF8]"
          />
        </div>
      </div>

      {/* Customer List */}
      <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900 text-slate-400 uppercase font-bold text-[10px]">
              <tr>
                <th className="p-3.5">Customer Name & Contacts</th>
                <th className="p-3.5">Delivery Address & Zone</th>
                <th className="p-3.5">Orders Count</th>
                <th className="p-3.5">Total Lifetime Spend</th>
                <th className="p-3.5">Last Order</th>
                <th className="p-3.5 text-right">Direct Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 text-xs">
                    No customer records found.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map(cust => (
                  <tr key={cust.id} className="hover:bg-slate-700/40 transition-colors">
                    <td className="p-3.5">
                      <p className="font-bold text-white text-sm">{cust.name}</p>
                      <p className="text-[11px] text-[#38BDF8] flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3" />
                        <span>{cust.phone}</span>
                        {cust.altPhone && <span className="text-slate-400">({cust.altPhone})</span>}
                      </p>
                    </td>

                    <td className="p-3.5">
                      <p className="text-slate-200 line-clamp-1">{cust.address}</p>
                      <span className="text-[10px] text-slate-400 font-semibold">{cust.cityRegion}</span>
                    </td>

                    <td className="p-3.5">
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-700 font-bold text-white text-xs">
                        {cust.totalOrders} {cust.totalOrders === 1 ? 'order' : 'orders'}
                      </span>
                    </td>

                    <td className="p-3.5 font-black text-[#38BDF8] text-sm">
                      ৳{cust.totalSpent}
                    </td>

                    <td className="p-3.5 text-slate-400 text-[11px]">
                      {new Date(cust.lastOrderDate).toLocaleDateString()}
                    </td>

                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => handleWhatsApp(cust.phone, cust.name)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-[#10B981] hover:bg-[#10B981] hover:text-white transition-colors text-xs font-bold inline-flex items-center gap-1.5 border border-emerald-500/40"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
