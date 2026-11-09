import React, { useState } from 'react';
import { Package, Trash2, Phone, MapPin, CheckCircle, Clock, XCircle, RefreshCw, CreditCard, Check, ShieldAlert, Image as ImageIcon, Eye, FileText, Printer, Calendar, Copy, AlertTriangle, Search, X, Download } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Order } from '../../types/store';
import { ConfirmModal } from '../common/ConfirmModal';
import { useToast } from '../common/Toast';
import { formatBangladeshDateTime, getRelativeTimeAgo } from '../../utils/dateFormatter';
import { downloadOrderMemo } from '../../utils/memoGenerator';

export const OrderManager: React.FC = () => {
  const { orders, updateOrderStatus, deleteOrder, deleteOrders, deleteAllOrders, updateOrder, storeConfig, toggleOrderSeen } = useStore();
  const { showToast } = useToast();
  
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [paymentFilter, setPaymentFilter] = useState<'All' | 'Paid' | 'Unpaid'>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Bulk Selection State for Orders
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [isBulkDeleteConfirmOpen, setIsBulkDeleteConfirmOpen] = useState(false);
  
  // 2-Step Confirmation States for Single Order Deletion
  const [orderDeleteStep1, setOrderDeleteStep1] = useState<{ id: string; orderNumber: string } | null>(null);
  const [orderDeleteStep2, setOrderDeleteStep2] = useState<{ id: string; orderNumber: string } | null>(null);

  // 2-Step Confirmation States for Delete All Orders
  const [isDeleteAllStep1Open, setIsDeleteAllStep1Open] = useState(false);
  const [isDeleteAllStep2Open, setIsDeleteAllStep2Open] = useState(false);

  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState<Order | null>(null);
  const [zoomedReceipt, setZoomedReceipt] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, label: string) => {
    if (!text) return;
    let cleanText = text;
    if (label.toLowerCase().includes('phone') || label.toLowerCase().includes('number')) {
      const digitsOnly = text.replace(/\(.*?\)/g, '').replace(/[^\d+-]/g, '').trim();
      if (digitsOnly.length >= 8) {
        cleanText = digitsOnly;
      }
    }
    navigator.clipboard.writeText(cleanText);
    setCopiedKey(text);
    showToast(`${label} copied to clipboard!`, 'success');
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const getItemImage = (item: any) => {
    let img = item.product?.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=200';
    if (item.selectedColor && item.product?.colors) {
      const col = item.product.colors.find((c: any) => c.name === item.selectedColor);
      if (col && col.image) img = col.image;
    }
    if (item.selectedVariation?.image) {
      img = item.selectedVariation.image;
    }
    return img;
  };

  const getItemColorHex = (item: any) => {
    if (item.selectedColor && item.product?.colors) {
      const col = item.product.colors.find((c: any) => c.name === item.selectedColor);
      if (col && col.hex) return col.hex;
    }
    return '#38BDF8';
  };

  // Local paid status state override for immediate toggle responsiveness
  const [paidStatusMap, setPaidStatusMap] = useState<Record<string, boolean>>({});

  const isOrderPaid = (order: Order) => {
    if (paidStatusMap[order.id] !== undefined) {
      return paidStatusMap[order.id];
    }
    return order.isPaid ?? (order.paymentStatus === 'Paid' || order.paymentMethod?.toLowerCase().includes('bkash') || order.paymentMethod?.toLowerCase().includes('nagad') || order.paymentMethod?.toLowerCase().includes('rocket'));
  };

  const toggleOrderPaymentStatus = (order: Order) => {
    const current = isOrderPaid(order);
    const next = !current;
    setPaidStatusMap(prev => ({ ...prev, [order.id]: next }));
    showToast(`Order #${order.orderNumber} payment marked as ${next ? 'Paid (Completed)' : 'Unpaid (Pending)'}!`, 'success');
  };

  const unseenOrders = orders.filter(o => !o.isSeen);
  const unseenCount = unseenOrders.length;
  const newOrderLabel = unseenCount > 0 ? `${unseenCount} New Order${unseenCount > 1 ? 's' : ''}` : null;

  const filteredOrders = orders.filter(o => {
    let matchesStatus = true;
    if (statusFilter === 'Address Changed') {
      matchesStatus = !!o.isAddressChanged;
    } else if (statusFilter === 'Canceled') {
      matchesStatus = o.status === 'Canceled' || !!o.canceledByCustomer;
    } else if (statusFilter !== 'All') {
      matchesStatus = (o.status || '').toLowerCase() === statusFilter.toLowerCase();
    }

    const orderPaid = isOrderPaid(o);
    const matchesPayment = paymentFilter === 'All' || (paymentFilter === 'Paid' && orderPaid) || (paymentFilter === 'Unpaid' && !orderPaid);

    const q = searchQuery.trim().toLowerCase();
    const matchesSearch = !q || (
      (o.orderNumber && o.orderNumber.toLowerCase().includes(q)) ||
      (o.id && o.id.toLowerCase().includes(q)) ||
      (o.customerName && o.customerName.toLowerCase().includes(q)) ||
      (o.phone && o.phone.toLowerCase().includes(q)) ||
      (o.altPhone && o.altPhone.toLowerCase().includes(q)) ||
      (o.senderPhone && o.senderPhone.toLowerCase().includes(q)) ||
      (o.paymentTrxId && o.paymentTrxId.toLowerCase().includes(q)) ||
      (o.address && o.address.toLowerCase().includes(q)) ||
      (o.district && o.district.toLowerCase().includes(q)) ||
      (o.upazila && o.upazila.toLowerCase().includes(q))
    );

    return matchesStatus && matchesPayment && matchesSearch;
  }).sort((a, b) => {
    // Unseen orders first
    if (!a.isSeen && b.isSeen) return -1;
    if (a.isSeen && !b.isSeen) return 1;
    // Then newest timestamp first
    return (b.orderTimestamp || new Date(b.createdAt).getTime()) - (a.orderTimestamp || new Date(a.createdAt).getTime());
  });

  const handleStatusChange = (orderId: string, orderNumber: string, status: Order['status']) => {
    updateOrderStatus(orderId, status);
    showToast(`Order #${orderNumber} marked as ${status}!`, 'success');
  };

  const toggleOrderSelection = (id: string) => {
    setSelectedOrderIds(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  const isAllFilteredSelected = filteredOrders.length > 0 && filteredOrders.every(o => selectedOrderIds.includes(o.id));
  
  const toggleSelectAllOrders = () => {
    if (isAllFilteredSelected) {
      const filteredIds = new Set(filteredOrders.map(o => o.id));
      setSelectedOrderIds(prev => prev.filter(id => !filteredIds.has(id)));
    } else {
      const filteredIds = filteredOrders.map(o => o.id);
      setSelectedOrderIds(prev => Array.from(new Set([...prev, ...filteredIds])));
    }
  };

  const confirmBulkDelete = () => {
    if (selectedOrderIds.length === 0) return;
    const count = selectedOrderIds.length;
    const success = deleteOrders(selectedOrderIds);
    if (success) {
      showToast(`Successfully deleted ${count} selected order(s)!`, 'success');
      setSelectedOrderIds([]);
    }
    setIsBulkDeleteConfirmOpen(false);
  };

  const totalPaidCount = orders.filter(o => isOrderPaid(o)).length;
  const totalUnpaidCount = orders.length - totalPaidCount;
  const addressChangedCount = orders.filter(o => o.isAddressChanged).length;
  const canceledCount = orders.filter(o => o.status === 'Canceled' || o.canceledByCustomer).length;

  return (
    <div className="space-y-6">
      {/* Header with Counters and Segmented Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-800 p-5 rounded-2xl border border-slate-700 shadow-md">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-lg font-bold text-white font-['Outfit']">Real-Time Order & Geography Management</h3>
            <span className="px-3 py-1 rounded-full bg-[#38BDF8]/20 text-[#38BDF8] border border-[#38BDF8]/30 font-black text-xs">
              Total Orders: {orders.length}
            </span>
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold text-xs">
              Paid: {totalPaidCount}
            </span>
            <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 font-bold text-xs">
              Unpaid/COD: {totalUnpaidCount}
            </span>
            {newOrderLabel && (
              <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-black text-xs animate-pulse flex items-center gap-1.5">
                🔔 {newOrderLabel}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Filter orders by Delivery Status, Payment Status (Paid/Unpaid), and Bangladesh Geography.
          </p>
        </div>

        {/* Delete All Orders & Filter Tabs */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {filteredOrders.length > 0 && (
            <button
              type="button"
              onClick={toggleSelectAllOrders}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md shrink-0 active:scale-95 ${
                isAllFilteredSelected 
                  ? 'bg-sky-500 text-slate-950 hover:bg-sky-400' 
                  : 'bg-slate-700 hover:bg-slate-600 text-white'
              }`}
              title="Select / Deselect all visible orders"
            >
              <span>{isAllFilteredSelected ? '✓ Deselect All' : 'Select All (' + filteredOrders.length + ')'}</span>
            </button>
          )}

          {orders.length > 0 && (
            <button
              type="button"
              onClick={() => setIsDeleteAllStep1Open(true)}
              className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md shrink-0 active:scale-95"
              title="Delete All Orders"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete All Orders</span>
            </button>
          )}
          {/* Order Status Tabs */}
          <div className="flex flex-wrap items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-700 text-xs">
            {['All', 'Pending', 'Processing', 'Completed', 'Canceled', 'Address Changed'].map(st => {
              const count = st === 'Address Changed' 
                ? addressChangedCount 
                : st === 'Canceled' 
                  ? canceledCount 
                  : st === 'All' 
                    ? orders.length 
                    : orders.filter(o => (o.status || '').toLowerCase() === st.toLowerCase()).length;

              return (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    statusFilter === st ? 'bg-[#38BDF8] text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {st === 'Address Changed' ? `✏️ Address Changed (${count})` : st === 'Canceled' ? `❌ Cancel Requests (${count})` : `${st} (${count})`}
                </button>
              );
            })}
          </div>

          {/* Payment Status Segmented Tabs */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-700 text-xs shrink-0">
            <button
              onClick={() => setPaymentFilter('All')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                paymentFilter === 'All' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              All Payments
            </button>
            <button
              onClick={() => setPaymentFilter('Paid')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                paymentFilter === 'Paid' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-emerald-400'
              }`}
            >
              Paid ({totalPaidCount})
            </button>
            <button
              onClick={() => setPaymentFilter('Unpaid')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                paymentFilter === 'Unpaid' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-amber-400'
              }`}
            >
              Unpaid ({totalUnpaidCount})
            </button>
          </div>
        </div>
      </div>

      {/* Order Search Input Bar */}
      <div className="bg-slate-800 p-3.5 sm:p-4 rounded-2xl border border-slate-700 shadow-md">
        <div className="relative flex items-center">
          <Search className="w-5 h-5 text-sky-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search orders by customer name, phone number, or order ID (e.g. Rayan, 017..., 8X7K2M9N4P)..."
            className="w-full bg-slate-900 border-2 border-slate-700 focus:border-sky-500 rounded-xl pl-10 pr-10 py-2.5 text-xs sm:text-sm font-bold text-white placeholder:text-slate-400 outline-none transition-all shadow-inner"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        {searchQuery.trim() && (
          <div className="flex items-center justify-between mt-2 px-1 text-xs">
            <span className="text-sky-300 font-bold">
              🔍 Found {filteredOrders.length} order{filteredOrders.length === 1 ? '' : 's'} matching "{searchQuery}"
            </span>
            <button 
              onClick={() => setSearchQuery('')} 
              className="text-slate-400 hover:text-rose-400 underline text-[11px] font-medium cursor-pointer"
            >
              Clear search
            </button>
          </div>
        )}
      </div>

      {/* Dynamic Bulk Action Bar for Selected Orders */}
      {selectedOrderIds.length > 0 && (
        <div className="bg-gradient-to-r from-rose-950/90 to-slate-900 border-2 border-rose-500/60 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-xl backdrop-blur-md animate-fadeIn sticky top-4 z-20">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-rose-600 text-white flex items-center justify-center font-black text-sm shadow-md animate-pulse">
              {selectedOrderIds.length}
            </span>
            <div>
              <p className="text-sm font-extrabold text-white">
                {selectedOrderIds.length} {selectedOrderIds.length === 1 ? 'Order' : 'Orders'} Selected
              </p>
              <p className="text-[11px] text-slate-300">
                You can delete these orders in one click. Unrestricted permanent deletion.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedOrderIds([])}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all cursor-pointer border border-slate-700"
            >
              Clear Selection
            </button>
            <button
              type="button"
              onClick={() => setIsBulkDeleteConfirmOpen(true)}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black transition-all flex items-center gap-1.5 shadow-lg shadow-rose-900/40 cursor-pointer active:scale-95"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Selected ({selectedOrderIds.length})</span>
            </button>
          </div>
        </div>
      )}

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="bg-slate-800 rounded-2xl p-10 text-center text-slate-400 text-xs space-y-2">
            <Package className="w-8 h-8 text-slate-500 mx-auto" />
            <p className="font-bold text-white text-sm">No orders found matching your filters</p>
            <p className="text-slate-400">Order Status: <span className="text-[#38BDF8]">{statusFilter}</span> | Payment Filter: <span className="text-amber-400">{paymentFilter}</span></p>
          </div>
        ) : (
          filteredOrders.map(order => {
            const paid = isOrderPaid(order);
            const isSelected = selectedOrderIds.includes(order.id);

            return (
              <div 
                key={order.id} 
                className={`bg-slate-800 rounded-2xl p-5 border space-y-4 shadow-md transition-all ${
                  isSelected ? 'border-rose-500/80 bg-slate-800/90 ring-1 ring-rose-500/30' : 'border-slate-700'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-700 pb-3">
                  <div className="flex items-center gap-3">
                    {/* Checkbox for selecting this order */}
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleOrderSelection(order.id)}
                      className="w-5 h-5 rounded border-slate-600 bg-slate-900 text-[#38BDF8] focus:ring-cyan-400 cursor-pointer accent-[#38BDF8] shrink-0"
                      title="Select this order"
                    />

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-[#38BDF8] uppercase tracking-wider">
                          Order #{order.orderNumber}
                        </span>
                        
                        {/* Paid vs Unpaid Badge */}
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${
                          paid ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}>
                          {paid ? <Check className="w-3 h-3" /> : <CreditCard className="w-3 h-3" />}
                          {paid ? 'PAID (Completed)' : 'UNPAID / COD (Pending)'}
                        </span>

                      {/* Customer Address Changed Badge */}
                      {order.isAddressChanged && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                          ✏️ Address Changed
                        </span>
                      )}

                      {/* Customer Cancellation Request Badge */}
                      {order.canceledByCustomer && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/40">
                          ⚠️ Customer Cancel Request
                        </span>
                      )}
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-cyan-500/40 text-xs font-mono font-bold text-cyan-300 shadow-md">
                        <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="text-slate-400 font-sans text-[11px] font-semibold">Original Order Time:</span>
                        <span className="text-white font-black">{order.orderTimeFormatted || formatBangladeshDateTime(order.createdAt)}</span>
                      </div>
                      {getRelativeTimeAgo(order.createdAt) && (
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold flex items-center gap-1">
                          ⏱️ <span>{getRelativeTimeAgo(order.createdAt)}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                  {/* Actions & Status Toggle */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Seen / Unseen Toggle Button */}
                    <button
                      type="button"
                      onClick={() => toggleOrderSeen(order.id)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 cursor-pointer ${
                        order.isSeen 
                          ? 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white' 
                          : 'bg-amber-500/30 text-amber-300 border-amber-500/60 animate-pulse hover:bg-amber-500/40'
                      }`}
                      title="Click to mark as Seen / Unseen"
                    >
                      <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold text-[10px] ${order.isSeen ? 'bg-emerald-500 text-slate-950' : 'bg-amber-400 text-slate-950'}`}>
                        {order.isSeen ? '✓' : '!'}
                      </span>
                      <span>{order.isSeen ? 'Seen' : 'New / Unseen'}</span>
                    </button>

                    {/* View Cash Memo / Invoice Button */}
                    <button
                      type="button"
                      onClick={() => setSelectedOrderForInvoice(order)}
                      className="px-2.5 py-1 rounded-xl bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 hover:text-white border border-indigo-500/40 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-sm active:scale-95"
                      title="View and print Invoice / Cash Memo"
                    >
                      <FileText className="w-3.5 h-3.5 text-indigo-300" />
                      <span>Cash Memo</span>
                    </button>

                    {/* Direct Download Memo File Button */}
                    <button
                      type="button"
                      onClick={() => downloadOrderMemo(order, storeConfig)}
                      className="px-2.5 py-1 rounded-xl bg-sky-600/30 hover:bg-sky-600 text-sky-200 hover:text-white border border-sky-500/40 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-sm active:scale-95"
                      title="Download Memo file"
                    >
                      <Download className="w-3.5 h-3.5 text-sky-300" />
                      <span>Download File</span>
                    </button>

                    {/* Mark Paid / Unpaid Button */}
                    <button
                      type="button"
                      onClick={() => toggleOrderPaymentStatus(order)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                        paid 
                          ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500/50 hover:bg-rose-500/20 hover:text-rose-400 hover:border-rose-500' 
                          : 'bg-amber-500/30 text-amber-300 border-amber-500/50 hover:bg-emerald-500/20 hover:text-emerald-400'
                      }`}
                      title="Toggle Payment Status"
                    >
                      {paid ? 'Mark Unpaid' : 'Mark as Paid'}
                    </button>

                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, order.orderNumber, e.target.value as Order['status'])}
                      className={`px-3 py-1 rounded-xl text-xs font-extrabold outline-none border cursor-pointer ${
                        order.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' :
                        order.status === 'Processing' ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' :
                        order.status === 'Canceled' ? 'bg-rose-500/20 text-rose-400 border-rose-500/40' :
                        'bg-sky-500/20 text-sky-400 border-sky-500/40'
                      }`}
                    >
                      <option value="Pending" className="bg-slate-900 text-white">Pending</option>
                      <option value="Processing" className="bg-slate-900 text-white">Processing</option>
                      <option value="Completed" className="bg-slate-900 text-white">Completed</option>
                      <option value="Canceled" className="bg-slate-900 text-white">Canceled</option>
                    </select>

                    <button
                      onClick={() => setOrderDeleteStep1({ id: order.id, orderNumber: order.orderNumber })}
                      className="p-1.5 rounded-xl bg-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white transition-colors cursor-pointer"
                      title="Delete Order Record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Customer Info, Address & Geography Badges */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300">
                  <div className="space-y-2 bg-slate-900/60 p-3.5 rounded-xl border border-slate-700/60">
                    <p className="font-bold text-white text-sm">{order.customerName}</p>
                    <div className="flex flex-wrap items-center gap-2 text-slate-300">
                      <p className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-[#38BDF8]" />
                        <span className="font-mono font-bold">{order.phone}</span>
                        {order.altPhone && <span className="text-slate-500 font-mono">({order.altPhone})</span>}
                      </p>
                      <button
                        type="button"
                        onClick={() => handleCopy(order.phone, 'Phone Number')}
                        className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                        title="Copy"
                      >
                        {copiedKey === order.phone ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedKey === order.phone ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>

                    {/* Bangladesh Geography Pills */}
                    {(order.division || order.district || order.upazila) && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {order.division && (
                          <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 text-[10px] font-bold border border-indigo-500/30">
                            Division: {order.division}
                          </span>
                        )}
                        {order.district && (
                          <span className="px-2 py-0.5 rounded-md bg-sky-500/20 text-sky-300 text-[10px] font-bold border border-sky-500/30">
                            District: {order.district}
                          </span>
                        )}
                        {order.upazila && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                            Upazila: {order.upazila}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Region Highlights with Distinct Color Codes */}
                    <div className="pt-1">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase border tracking-wider inline-flex items-center gap-1 ${
                        order.cityRegion === 'Inside Dhaka' 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                          : order.cityRegion === 'Dhaka Suburbs'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            : 'bg-sky-500/10 text-sky-400 border-sky-500/30'
                      }`}>
                        📍 {
                          order.cityRegion === 'Inside Dhaka' ? 'Inside Dhaka City' :
                          order.cityRegion === 'Dhaka Suburbs' ? 'Dhaka Suburbs' :
                          'Outside Dhaka'
                        }
                      </span>
                    </div>

                    <p className="flex items-start gap-1.5 text-slate-300 pt-1">
                      <MapPin className="w-3.5 h-3.5 text-[#38BDF8] shrink-0 mt-0.5" />
                      <span>{order.address}</span>
                    </p>

                    {/* Order Note / Special Instructions */}
                    {order.notes && (
                      <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs mt-2">
                        <span className="font-bold text-amber-300">📝 Customer Special Note: </span>
                        <span>{order.notes}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 bg-slate-900/60 p-3.5 rounded-xl border border-slate-700/60 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between border-b border-slate-700/80 pb-1.5">
                        <span className="font-bold text-slate-400">Payment Details:</span>
                        {/* Instant Confirm Payment Action button */}
                        {!paid && (
                          <button
                            type="button"
                            onClick={() => {
                              updateOrder(order.id, { isPaid: true, paymentStatus: 'Paid' });
                              showToast(`Order #${order.orderNumber} marked as Paid!`, 'success');
                            }}
                            className="px-2 py-0.5 rounded bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer shadow-md active:scale-95"
                          >
                            ✓ Confirm Payment
                          </button>
                        )}
                      </div>
                      <p className="text-white font-extrabold text-sm">{order.paymentMethod}</p>
                      
                      {/* Sender Phone with 1-Click Copy */}
                      {order.senderPhone && (
                        <div className="flex items-center gap-2 text-slate-300 font-bold text-xs">
                          <span>Sender Phone:</span>
                          <span className="text-[#38BDF8] font-mono font-black">{order.senderPhone}</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(order.senderPhone!, 'Sender Phone')}
                            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                            title="Copy"
                          >
                            {copiedKey === order.senderPhone ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedKey === order.senderPhone ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                      )}
                      
                      {/* Transaction ID with 1-Click Copy Button */}
                      {order.paymentTrxId && (
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span className="text-slate-400 font-bold">Trx ID:</span>
                          <span className="text-[#38BDF8] font-mono font-black">{order.paymentTrxId}</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(order.paymentTrxId!, 'Transaction ID')}
                            className="px-2 py-0.5 rounded bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 hover:text-white text-[10px] font-extrabold flex items-center gap-1 transition-all cursor-pointer shadow-sm active:scale-95"
                            title="Copy Transaction ID"
                          >
                            {copiedKey === order.paymentTrxId ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span className="text-emerald-400">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3 text-cyan-300" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                      
                      {/* Financial breakdown pills: Advance vs Remaining */}
                      <div className="pt-1 flex flex-wrap items-center gap-1.5 text-[11px]">
                        <span className={`px-2 py-0.5 rounded font-black ${
                          paid ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}>
                          Advance: ৳{paid ? order.totalAmount : (order.prepaymentDiscount || 0)}
                        </span>
                        <span className={`px-2 py-0.5 rounded font-black ${
                          !paid ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-emerald-500/10 text-emerald-400'
                        }`}>
                          Due/COD: ৳{paid ? 0 : order.totalAmount}
                        </span>
                        {(order.discount > 0 || (order.prepaymentDiscount && order.prepaymentDiscount > 0)) && (
                          <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold">
                            Discount: ৳{(order.discount || 0) + (order.prepaymentDiscount || 0)}
                          </span>
                        )}
                      </div>
 
                      {/* Display receipt screenshot if available */}
                      {order.paymentReceiptImage && (
                        <div className="pt-2 border-t border-slate-800/80 mt-1">
                          <p className="text-[10px] text-slate-400 uppercase font-bold mb-1 flex items-center gap-1">
                            <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                            <span>Payment Receipt (Click to Zoom):</span>
                          </p>
                          <div 
                            onClick={() => setZoomedReceipt(order.paymentReceiptImage || null)}
                            className="relative group w-24 h-16 rounded-lg overflow-hidden border border-slate-700 cursor-pointer shadow-md"
                          >
                            <img src={order.paymentReceiptImage} alt="Receipt Thumbnail" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Eye className="w-4 h-4 text-white" />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
 
                    <div className="pt-2 border-t border-slate-700/80 flex items-center justify-between">
                      <span className="text-slate-400 font-bold">Total Bill Payable:</span>
                      <span className="text-lg font-black text-[#38BDF8]">৳{order.totalAmount}</span>
                    </div>
                  </div>
                </div>

                {/* Ordered Items Summary with Photos */}
                {order.items && order.items.length > 0 && (
                  <div className="bg-slate-900/40 rounded-xl p-3.5 border border-slate-700/40 text-xs space-y-2.5">
                    <p className="font-bold text-slate-400 text-[10px] uppercase tracking-wider">Ordered Products ({order.items.length}):</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {order.items.map((item, i) => (
                        <div key={i} className="flex items-center gap-3 bg-slate-900/90 p-2 rounded-xl border border-slate-800">
                          <img 
                            src={getItemImage(item)} 
                            alt={item.product?.title} 
                            className="w-12 h-12 rounded-lg object-cover border border-slate-700 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-white truncate text-xs">{item.product?.title}</p>
                            <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-slate-300 mt-1">
                              {item.selectedColor && (
                                <span className="bg-sky-950/90 text-sky-300 border border-sky-500/40 px-2 py-0.5 rounded-md font-bold flex items-center gap-1.5">
                                  <span className="w-2.5 h-2.5 rounded-full inline-block border border-white/40" style={{ backgroundColor: getItemColorHex(item) }} />
                                  Color: {item.selectedColor}
                                </span>
                              )}
                              {item.selectedSize && (
                                <span className="bg-slate-800 text-amber-300 border border-slate-700 px-2 py-0.5 rounded-md font-mono font-bold">
                                  Size: {item.selectedSize}
                                </span>
                              )}
                              <span className="bg-indigo-900/80 text-indigo-200 border border-indigo-500/30 px-2 py-0.5 rounded-md font-black font-mono">
                                {item.quantity} pcs
                              </span>
                            </div>
                          </div>
                          <span className="font-mono font-bold text-cyan-300 text-xs shrink-0">৳{item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* 2-Step Confirmation Modal for Single Order Deletion */}
      {/* Step 1: Initial Deletion Confirmation */}
      <ConfirmModal
        isOpen={!!orderDeleteStep1}
        title="Delete Order Record? (Step 1 of 2)"
        message={`Are you sure you want to delete order #${orderDeleteStep1?.orderNumber}?`}
        confirmLabel="Yes, Delete"
        cancelLabel="No, Cancel"
        isDestructive={true}
        onConfirm={() => {
          if (orderDeleteStep1) {
            setOrderDeleteStep2(orderDeleteStep1);
            setOrderDeleteStep1(null);
          }
        }}
        onCancel={() => setOrderDeleteStep1(null)}
      />

      {/* Step 2: Final Permanent Deletion Confirmation */}
      <ConfirmModal
        isOpen={!!orderDeleteStep2}
        title="Confirm Permanent Deletion (Step 2 of 2)"
        message={`Warning: Once deleted, order #${orderDeleteStep2?.orderNumber} cannot be recovered. Are you absolutely sure?`}
        confirmLabel="Yes, Permanently Delete"
        cancelLabel="Cancel"
        isDestructive={true}
        onConfirm={() => {
          if (orderDeleteStep2) {
            const success = deleteOrder(orderDeleteStep2.id);
            if (success) {
              showToast(`Order #${orderDeleteStep2.orderNumber} deleted permanently!`, 'success');
              setSelectedOrderIds(prev => prev.filter(id => id !== orderDeleteStep2.id));
            } else {
              showToast('Order could not be removed.', 'error');
            }
            setOrderDeleteStep2(null);
          }
        }}
        onCancel={() => setOrderDeleteStep2(null)}
      />

      {/* Confirmation Modal for Bulk Selected Orders Deletion */}
      <ConfirmModal
        isOpen={isBulkDeleteConfirmOpen}
        title={`Delete ${selectedOrderIds.length} Selected Orders?`}
        message={`Are you sure you want to permanently delete all ${selectedOrderIds.length} selected orders? This action cannot be undone.`}
        confirmLabel={`Yes, Delete ${selectedOrderIds.length} Orders`}
        cancelLabel="No, Keep Orders"
        isDestructive={true}
        onConfirm={confirmBulkDelete}
        onCancel={() => setIsBulkDeleteConfirmOpen(false)}
      />

      {/* 2-Step Confirmation Modal for Delete All Orders */}
      {/* Step 1: Initial Delete All Confirmation */}
      <ConfirmModal
        isOpen={isDeleteAllStep1Open}
        title="Delete All Orders? (Step 1 of 2)"
        message={`Are you sure you want to delete all (${orders.length}) orders from the dashboard?`}
        confirmLabel="Yes, Delete All"
        cancelLabel="No, Cancel"
        isDestructive={true}
        onConfirm={() => {
          setIsDeleteAllStep1Open(false);
          setIsDeleteAllStep2Open(true);
        }}
        onCancel={() => setIsDeleteAllStep1Open(false)}
      />

      {/* Step 2: Final Permanent Delete All Confirmation */}
      <ConfirmModal
        isOpen={isDeleteAllStep2Open}
        title="Confirm Clear Database (Step 2 of 2)"
        message="Final Warning: This will delete ALL order data, customer records, transaction histories, and cash memos permanently. This action is irreversible. Are you 100% sure?"
        confirmLabel="Yes, Delete All Data"
        cancelLabel="Cancel"
        isDestructive={true}
        onConfirm={() => {
          deleteAllOrders();
          setIsDeleteAllStep2Open(false);
          showToast("All order data deleted permanently!", "success");
        }}
        onCancel={() => setIsDeleteAllStep2Open(false)}
      />

      {/* Itemized Cash Memo / Digital Invoice Modal */}
      {selectedOrderForInvoice && (() => {
        const isPaid = isOrderPaid(selectedOrderForInvoice);
        const advancePaidAmount = selectedOrderForInvoice.advancePaymentAmount ?? (isPaid ? selectedOrderForInvoice.totalAmount : 0);
        const remainingDueAmount = selectedOrderForInvoice.dueAmount ?? Math.max(0, selectedOrderForInvoice.totalAmount - advancePaidAmount);
        const totalDiscountAmount = (selectedOrderForInvoice.discount || 0) + (selectedOrderForInvoice.prepaymentDiscount || 0);

        return (
          <div 
            className="fixed inset-0 z-[110] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fade-in"
            onClick={() => setSelectedOrderForInvoice(null)}
          >
            <div 
              className="w-full max-w-2xl bg-white text-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 my-auto"
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Header Bar with Actions */}
              <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-cyan-400" />
                  <h3 className="font-extrabold text-base sm:text-lg font-['Outfit']">Digital Cash Memo & Invoice</h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => downloadOrderMemo(selectedOrderForInvoice, storeConfig)}
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 text-slate-950 font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Memo</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Memo</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedOrderForInvoice(null)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-all cursor-pointer"
                  >
                    ✕ Close
                  </button>
                </div>
              </div>

              {/* Printable Invoice Body */}
              <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto text-xs sm:text-sm">
                {/* Store & Order Metadata Banner */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-slate-200 gap-3">
                  <div>
                    <h2 className="text-xl font-black text-slate-900 font-['Outfit'] tracking-tight">
                      {storeConfig?.storeName || 'RycreoShop'}
                    </h2>
                    <p className="text-xs text-slate-500 font-sans mt-0.5">
                      Hotline: {storeConfig?.contactPhone || '+880 1312-556660'} | Email: {storeConfig?.contactEmail || 'rycreoshop@gmail.com'}
                    </p>
                  </div>
                  <div className="text-left sm:text-right space-y-1">
                    <span className="px-3 py-1 rounded-full bg-cyan-100 text-cyan-800 font-mono font-black text-xs inline-block">
                      INVOICE #{selectedOrderForInvoice.orderNumber}
                    </span>
                    <p className="text-[11px] text-slate-600 font-mono font-bold">
                      <Clock className="w-3 h-3 inline mr-1 text-slate-500" />
                      {selectedOrderForInvoice.orderTimeFormatted || formatBangladeshDateTime(selectedOrderForInvoice.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Customer & Detailed Delivery Information */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div className="space-y-1">
                    <h4 className="text-[11px] font-black uppercase text-slate-400 tracking-wider mb-1">Customer Information</h4>
                    <p className="font-extrabold text-slate-900 text-sm">{selectedOrderForInvoice.customerName}</p>
                    <div className="flex items-center gap-2 pt-0.5">
                      <p className="text-slate-700 font-mono font-bold">
                        📞 {selectedOrderForInvoice.phone}
                        {selectedOrderForInvoice.altPhone && <span className="text-slate-400 ml-1">({selectedOrderForInvoice.altPhone})</span>}
                      </p>
                      <button
                        type="button"
                        onClick={() => handleCopy(selectedOrderForInvoice.phone, 'Phone Number')}
                        className="p-1 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 transition-colors cursor-pointer"
                        title="Copy"
                      >
                        {copiedKey === selectedOrderForInvoice.phone ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-[11px] font-black uppercase text-slate-400 tracking-wider mb-1">Full Delivery Address</h4>
                    <p className="text-slate-800 leading-snug font-medium">{selectedOrderForInvoice.address}</p>
                    {(selectedOrderForInvoice.upazila || selectedOrderForInvoice.district || selectedOrderForInvoice.division) && (
                      <p className="text-slate-600 font-bold text-xs">
                        📍 {[selectedOrderForInvoice.upazila, selectedOrderForInvoice.district, selectedOrderForInvoice.division].filter(Boolean).join(', ')}
                      </p>
                    )}
                    <span className="inline-block mt-1 px-2.5 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-black uppercase">
                      Zone: {selectedOrderForInvoice.cityRegion}
                    </span>
                  </div>
                </div>

                {/* Optional Customer Note */}
                {selectedOrderForInvoice.notes && (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                    <span className="font-black text-amber-800">📝 Customer Order Note: </span>
                    <span>{selectedOrderForInvoice.notes}</span>
                  </div>
                )}

                {/* Itemized Products Table with Photos */}
                <div>
                  <h4 className="text-xs font-black uppercase text-slate-500 tracking-wider mb-2 flex items-center justify-between">
                    <span>Ordered Products & Variations</span>
                    <span className="text-cyan-700 font-bold">{selectedOrderForInvoice.items.length} item(s)</span>
                  </h4>
                  <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-slate-100 text-slate-700 font-black text-[11px] uppercase tracking-wider">
                        <tr>
                          <th className="p-3">Product Details</th>
                          <th className="p-3 text-center">Size / Color</th>
                          <th className="p-3 text-center">Quantity</th>
                          <th className="p-3 text-right">Unit Price</th>
                          <th className="p-3 text-right">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs">
                        {selectedOrderForInvoice.items.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/80">
                            <td className="p-3">
                              <div className="flex items-center gap-3">
                                <img 
                                  src={item.product?.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=200'} 
                                  alt={item.product?.title} 
                                  className="w-12 h-12 object-cover rounded-xl border border-slate-200 shrink-0 shadow-sm"
                                />
                                <div>
                                  <p className="font-extrabold text-slate-900 text-xs sm:text-sm">{item.product?.title}</p>
                                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">{item.product?.category}</p>
                                </div>
                              </div>
                            </td>
                            <td className="p-3 text-center">
                              <div className="flex flex-col items-center gap-1 text-[11px]">
                                {item.selectedSize && (
                                  <span className="px-2 py-0.5 rounded bg-slate-100 font-bold text-slate-700 font-mono">
                                    Size: {item.selectedSize}
                                  </span>
                                )}
                                {item.selectedColor && (
                                  <span className="px-2 py-0.5 rounded bg-slate-100 font-bold text-slate-700 font-mono">
                                    Color: {item.selectedColor}
                                  </span>
                                )}
                                {!item.selectedSize && !item.selectedColor && (
                                  <span className="text-slate-400">Regular</span>
                                )}
                              </div>
                            </td>
                            <td className="p-3 text-center">
                              <span className="px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-900 font-black font-mono">
                                {item.quantity} pcs
                              </span>
                            </td>
                            <td className="p-3 text-right font-mono text-slate-600 font-medium">৳{item.price}</td>
                            <td className="p-3 text-right font-mono font-black text-slate-900 text-sm">৳{item.price * item.quantity}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 4 Key Highlight Financial Metrics: Advance vs Remaining vs Discount */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
                    <p className="text-[10px] font-black uppercase text-emerald-700 tracking-wider">Advance Paid</p>
                    <p className="text-base sm:text-lg font-black text-emerald-800 font-mono mt-1">৳{advancePaidAmount}</p>
                    <span className="text-[10px] font-bold text-emerald-600">{isPaid ? 'Completed' : 'N/A'}</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-center">
                    <p className="text-[10px] font-black uppercase text-amber-700 tracking-wider">Due on Delivery (COD)</p>
                    <p className="text-base sm:text-lg font-black text-amber-800 font-mono mt-1">৳{remainingDueAmount}</p>
                    <span className="text-[10px] font-bold text-amber-600">{remainingDueAmount > 0 ? 'Pay on Delivery' : 'Zero Due'}</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-purple-50 border border-purple-200 text-center">
                    <p className="text-[10px] font-black uppercase text-purple-700 tracking-wider">Total Discount</p>
                    <p className="text-base sm:text-lg font-black text-purple-800 font-mono mt-1">৳{totalDiscountAmount}</p>
                    <span className="text-[10px] font-bold text-purple-600">{totalDiscountAmount > 0 ? 'Discount Applied' : 'No Discount'}</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-cyan-50 border border-cyan-200 text-center">
                    <p className="text-[10px] font-black uppercase text-cyan-700 tracking-wider">Total Bill</p>
                    <p className="text-base sm:text-lg font-black text-cyan-800 font-mono mt-1">৳{selectedOrderForInvoice.totalAmount}</p>
                    <span className="text-[10px] font-bold text-cyan-600">All Inclusive</span>
                  </div>
                </div>

                {/* Cost Breakdown & Payment Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  {/* Payment Verification Info */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                    <h4 className="font-black text-slate-500 uppercase tracking-wider text-[10px]">Payment Verification</h4>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-900">{selectedOrderForInvoice.paymentMethod}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        isPaid ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {isPaid ? 'Payment Completed (PAID)' : 'Due on Delivery (UNPAID)'}
                      </span>
                    </div>

                    {selectedOrderForInvoice.senderPhone && (
                      <div className="flex items-center justify-between text-slate-700 pt-1">
                        <span>Sender Phone: <span className="font-mono font-bold text-slate-900">{selectedOrderForInvoice.senderPhone}</span></span>
                        <button
                          type="button"
                          onClick={() => handleCopy(selectedOrderForInvoice.senderPhone!, 'Sender Phone')}
                          className="px-2 py-0.5 rounded bg-slate-200 hover:bg-slate-300 text-slate-800 text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          {copiedKey === selectedOrderForInvoice.senderPhone ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          <span>Copy</span>
                        </button>
                      </div>
                    )}

                    {selectedOrderForInvoice.paymentTrxId && (
                      <div className="flex items-center justify-between text-slate-700 pt-1">
                        <span>Trx ID: <span className="font-mono font-black text-cyan-800">{selectedOrderForInvoice.paymentTrxId}</span></span>
                        <button
                          type="button"
                          onClick={() => handleCopy(selectedOrderForInvoice.paymentTrxId!, 'Transaction ID')}
                          className="px-2 py-0.5 rounded bg-cyan-100 hover:bg-cyan-200 text-cyan-900 text-[10px] font-black flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          {copiedKey === selectedOrderForInvoice.paymentTrxId ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span className="text-emerald-700">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 text-cyan-800" />
                              <span>Copy TrxID</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    {/* Receipt Screenshot Preview */}
                    {selectedOrderForInvoice.paymentReceiptImage && (
                      <div className="pt-2 border-t border-slate-200">
                        <p className="text-[10px] text-slate-500 font-bold mb-1">Payment Receipt (Click to Zoom):</p>
                        <img 
                          src={selectedOrderForInvoice.paymentReceiptImage} 
                          alt="Receipt" 
                          onClick={() => setZoomedReceipt(selectedOrderForInvoice.paymentReceiptImage || null)}
                          className="w-24 h-16 object-cover rounded-lg border border-slate-300 cursor-pointer shadow-sm hover:opacity-90"
                        />
                      </div>
                    )}
                  </div>

                  {/* Financial Totals Calculation */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span className="font-mono font-bold text-slate-900">৳{selectedOrderForInvoice.subtotal}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Delivery Fee ({selectedOrderForInvoice.cityRegion}):</span>
                      <span className="font-mono font-bold text-slate-900">৳{selectedOrderForInvoice.deliveryFee}</span>
                    </div>
                    {selectedOrderForInvoice.discount > 0 && (
                      <div className="flex justify-between text-emerald-600 font-bold">
                        <span>Coupon Discount ({selectedOrderForInvoice.couponCode || 'Voucher'}):</span>
                        <span className="font-mono">-৳{selectedOrderForInvoice.discount}</span>
                      </div>
                    )}
                    {selectedOrderForInvoice.prepaymentDiscount && selectedOrderForInvoice.prepaymentDiscount > 0 ? (
                      <div className="flex justify-between text-emerald-600 font-bold">
                        <span>Advance Discount:</span>
                        <span className="font-mono">-৳{selectedOrderForInvoice.prepaymentDiscount}</span>
                      </div>
                    ) : null}
                    <div className="flex justify-between border-t border-slate-300 pt-2 text-sm font-black text-slate-900">
                      <span>Total Bill:</span>
                      <span className="font-mono text-cyan-600 text-base">৳{selectedOrderForInvoice.totalAmount}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Note */}
                <div className="text-center pt-3 border-t border-slate-100 text-[11px] text-slate-400">
                  <p>Thank you for shopping with {storeConfig?.storeName || 'RycreoShop'}!</p>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Click to Zoom Receipt Modal overlay */}
      {zoomedReceipt && (
        <div 
          className="fixed inset-0 z-[120] bg-slate-950/90 flex items-center justify-center p-4 backdrop-blur-md animate-fade-in"
          onClick={() => setZoomedReceipt(null)}
        >
          <div className="relative max-w-3xl w-full flex flex-col items-center justify-center gap-3" onClick={e => e.stopPropagation()}>
            <div className="w-full flex justify-between items-center text-white bg-slate-900/80 px-4 py-2 rounded-xl border border-slate-700">
              <span className="text-xs font-bold font-sans">Payment Receipt Screenshot (Receipt Audit View)</span>
              <button
                onClick={() => setZoomedReceipt(null)}
                className="px-3 py-1 rounded bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs transition-colors cursor-pointer"
              >
                Close ✕
              </button>
            </div>
            <img src={zoomedReceipt} alt="Receipt Zoomed" className="max-h-[75vh] max-w-full rounded-2xl object-contain shadow-2xl border border-slate-700 bg-slate-950" />
          </div>
        </div>
      )}
    </div>
  );
};
