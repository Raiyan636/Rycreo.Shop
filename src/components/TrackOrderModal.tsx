import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  Search, 
  Package, 
  Clock, 
  Truck, 
  CheckCircle2, 
  AlertCircle, 
  MapPin, 
  Edit3, 
  XCircle, 
  Save, 
  MessageSquare, 
  ChevronDown, 
  Download,
  Phone,
  Plus,
  Minus,
  Trash2,
  ShoppingCart
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Order, CartItem } from '../types/store';
import { useToast } from './common/Toast';
import { BangladeshGeoData } from '../data/bangladeshGeo';
import { formatBangladeshDateTime } from '../utils/dateFormatter';
import { downloadOrderMemo } from '../utils/memoGenerator';
import { PhoneInput88, isValidBdPhone } from './common/PhoneInput88';

interface TrackOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface OrderCountdownTimerProps {
  orderTime: number;
  lockHours: number;
  isLocked: boolean;
  onExpire?: () => void;
}

const OrderCountdownTimer: React.FC<OrderCountdownTimerProps> = ({ orderTime, lockHours, isLocked, onExpire }) => {
  const [timeRemaining, setTimeRemaining] = useState<{ hours: number; minutes: number; seconds: number; isExpired: boolean }>({
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false
  });

  useEffect(() => {
    const calculateTime = () => {
      const totalAllowedMs = lockHours * 3600000;
      const elapsedMs = Date.now() - orderTime;
      const remainingMs = totalAllowedMs - elapsedMs;

      if (remainingMs <= 0) {
        setTimeRemaining({ hours: 0, minutes: 0, seconds: 0, isExpired: true });
        if (onExpire) {
          onExpire();
        }
      } else {
        const hrs = Math.floor(remainingMs / 3600000);
        const mins = Math.floor((remainingMs % 3600000) / 60000);
        const secs = Math.floor((remainingMs % 60000) / 1000);
        setTimeRemaining({ hours: hrs, minutes: mins, seconds: secs, isExpired: false });
      }
    };
    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [orderTime, lockHours]);

  if (timeRemaining.isExpired || isLocked) {
    return (
      <div className="p-3.5 bg-amber-50 border-2 border-amber-200 rounded-2xl text-xs font-bold text-amber-950 space-y-1.5 shadow-sm">
        <div className="flex items-center gap-2 text-amber-800 font-extrabold">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Order Modification Window Expired</span>
        </div>
        <p className="text-xs sm:text-sm font-black text-amber-950 leading-relaxed">
          This order is locked and can no longer be edited or canceled. The designated modification time window ({lockHours} hours) has passed.
        </p>
        <p className="text-[11px] text-amber-800 font-medium font-mono">
          (Lock Time Limit: {lockHours} Hours elapsed)
        </p>
      </div>
    );
  }

  return (
    <div className="p-3.5 bg-sky-50 border-2 border-sky-200 rounded-2xl text-xs font-bold text-sky-950 space-y-2 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sky-800 font-extrabold">
          <Clock className="w-4 h-4 text-sky-600 shrink-0 animate-spin" />
          <span>Order Modification Window Remaining:</span>
        </div>
        <div className="bg-sky-600 text-white px-2.5 py-1 rounded-lg font-mono font-black text-xs shadow-inner">
          {String(timeRemaining.hours).padStart(2, '0')}:{String(timeRemaining.minutes).padStart(2, '0')}:{String(timeRemaining.seconds).padStart(2, '0')}
        </div>
      </div>
      <p className="text-xs sm:text-sm font-black text-sky-950 leading-relaxed">
        You can update your delivery address, cancel this order, or add additional items within the designated {lockHours}-hour window.
      </p>
    </div>
  );
};

export const TrackOrderModal: React.FC<TrackOrderModalProps> = ({ isOpen, onClose }) => {
  const { 
    orders, 
    updateOrder, 
    storeConfig, 
    products, 
    modificationWindowHours,
    modifyPreOrder,
    cancelPreOrder
  } = useStore();
  const { showToast } = useToast();
  const modalLockHours = modificationWindowHours || Number(storeConfig?.orderLockDurationHours) || 24;

  const [phoneInput, setPhoneInput] = useState('');
  const [orderIdInput, setOrderIdInput] = useState('');
  const [searched, setSearched] = useState(false);
  const [matchedOrders, setMatchedOrders] = useState<Order[]>([]);

  // Pre-Order Modification State
  const [modifyingPreOrderId, setModifyingPreOrderId] = useState<string | null>(null);
  const [preOrderDraftItems, setPreOrderDraftItems] = useState<CartItem[]>([]);
  const [swappingItemIndex, setSwappingItemIndex] = useState<number | null>(null);

  // Order Selected for editing address
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [newAddress, setNewAddress] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('Dhaka');
  const [selectedDistrict, setSelectedDistrict] = useState('Dhaka');
  const [selectedUpazila, setSelectedUpazila] = useState('Mirpur');

  // Order Selected for adding products
  const [addingProductOrderId, setAddingProductOrderId] = useState<string | null>(null);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState('Default');
  const [selectedQuantity, setSelectedQuantity] = useState(1);

  // Two-step cancellation state
  const [cancelingOrder, setCancelingOrder] = useState<Order | null>(null);
  const [cancelStep, setCancelStep] = useState<any>(1);

  if (!isOpen) return null;

  const handleSearchOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phoneInput.trim();
    if (!isValidBdPhone(cleanPhone)) {
      showToast("ফোন নম্বরটি অবশ্যই ১১ ডিজিটের হতে হবে এবং 0 দিয়ে শুরু হতে হবে (e.g. 017XXXXXXXX).", "error");
      return;
    }

    const found = orders.filter(o => {
      const matchPhone = (o.phone || '').replace(/\D/g, '').includes(cleanPhone) || (o.altPhone ? o.altPhone.replace(/\D/g, '').includes(cleanPhone) : false);
      const matchId = orderIdInput.trim() 
        ? ((o.id || '').toLowerCase().includes(orderIdInput.trim().toLowerCase()) || (o.orderNumber || '').toLowerCase().includes(orderIdInput.trim().toLowerCase()))
        : true;
      return matchPhone && matchId;
    });

    setMatchedOrders(found);
    setSearched(true);
    if (found.length === 0) {
      showToast("No orders found matching this mobile number.", "info");
    }
  };

  const handleStartEditAddress = (order: Order) => {
    setEditingOrderId(order.id);
    setNewAddress(order.address || '');
    setNewPhone(order.phone || '');
    setSelectedDivision(order.division || 'Dhaka');
    setSelectedDistrict(order.district || 'Dhaka');
    setSelectedUpazila(order.upazila || 'Mirpur');
  };

  const handleDivisionChange = (divName: string) => {
    setSelectedDivision(divName);
    const foundDiv = BangladeshGeoData.divisions.find(d => d.name === divName);
    if (foundDiv && foundDiv.districts.length > 0) {
      const firstDist = foundDiv.districts[0];
      setSelectedDistrict(firstDist.name);
      if (firstDist.upazilas.length > 0) {
        setSelectedUpazila(firstDist.upazilas[0]);
      }
    }
  };

  const handleDistrictChange = (distName: string) => {
    setSelectedDistrict(distName);
    const foundDiv = BangladeshGeoData.divisions.find(d => d.name === selectedDivision);
    const foundDist = foundDiv?.districts.find(d => d.name === distName);
    if (foundDist && foundDist.upazilas.length > 0) {
      setSelectedUpazila(foundDist.upazilas[0]);
    }
  };

  const handleSaveAddress = (e: React.FormEvent, order: Order) => {
    e.preventDefault();
    const cleanNum = newPhone.replace(/\D/g, '');
    if (!isValidBdPhone(cleanNum)) {
      showToast("Contact phone number must be 11 digits starting with 0 (e.g. 017XXXXXXXX).", "error");
      return;
    }

    const updates = {
      address: newAddress.trim(),
      phone: cleanNum,
      division: selectedDivision,
      district: selectedDistrict,
      upazila: selectedUpazila,
      isAddressChanged: true
    };

    updateOrder(order.id, updates);
    showToast("Delivery address and phone number updated successfully!", "success");
    setEditingOrderId(null);
    setMatchedOrders(prev => prev.map(o => o.id === order.id ? { ...o, ...updates } : o));
  };

  const handleStartCancel = (order: Order) => {
    setCancelingOrder(order);
    setCancelStep(1);
  };

  const confirmCancelOrder = () => {
    if (!cancelingOrder) return;
    updateOrder(cancelingOrder.id, { status: 'Canceled' });
    showToast(`Order #${cancelingOrder.orderNumber || cancelingOrder.id} has been canceled.`, "success");
    setMatchedOrders(prev => prev.map(o => o.id === cancelingOrder.id ? { ...o, status: 'Canceled' } : o));
    setCancelingOrder(null);
  };

  const handleStartModifyPreOrder = (order: Order) => {
    setModifyingPreOrderId(order.id);
    setPreOrderDraftItems((order.items || []).map(it => ({ ...it })));
    setSwappingItemIndex(null);
  };

  const handleDraftQtyChange = (idx: number, delta: number) => {
    setPreOrderDraftItems(prev => {
      const copy = [...prev];
      const newQty = copy[idx].quantity + delta;
      if (newQty <= 0) {
        return copy.filter((_, i) => i !== idx);
      }
      copy[idx] = { ...copy[idx], quantity: newQty };
      return copy;
    });
  };

  const handleSwapItem = (itemIdx: number, targetProdId: string) => {
    const prod = products.find(p => p.id === targetProdId);
    if (!prod) return;
    const price = prod.salePrice > 0 ? prod.salePrice : prod.price;
    setPreOrderDraftItems(prev => {
      const copy = [...prev];
      copy[itemIdx] = {
        productId: prod.id,
        product: prod,
        quantity: copy[itemIdx]?.quantity || 1,
        selectedSize: prod.sizes?.[0]?.size || (typeof prod.sizes?.[0] === 'string' ? prod.sizes[0] : undefined),
        selectedColor: prod.colors?.[0]?.name,
        price,
        isPreOrder: true,
        preOrderDays: prod.preOrderDays || 20
      };
      return copy;
    });
    setSwappingItemIndex(null);
    showToast(`Swapped to ${prod.title}`, 'info');
  };

  const handleSavePreOrderModification = async (order: Order) => {
    if (preOrderDraftItems.length === 0) {
      showToast("Order must contain at least one item. To cancel, click Cancel Pre-Order.", "error");
      return;
    }
    const res = await modifyPreOrder(order.id, order.phone, preOrderDraftItems);
    if (res.success) {
      showToast("Pre-order items updated successfully!", "success");
      setModifyingPreOrderId(null);
      const newSub = preOrderDraftItems.reduce((acc, it) => acc + it.price * it.quantity, 0);
      const newTot = Math.max(0, newSub + (Number(order.deliveryFee) || 0) - (Number(order.discount) || 0));
      setMatchedOrders(prev => prev.map(o => o.id === order.id ? {
        ...o,
        items: preOrderDraftItems,
        subtotal: newSub,
        totalAmount: newTot,
        isModified: true
      } : o));
    } else {
      showToast(res.message, "error");
    }
  };

  const handleCancelPreOrderAction = async (order: Order) => {
    const res = await cancelPreOrder(order.id, order.phone, 'Customer cancelled pre-order via tracking');
    if (res.success) {
      showToast("Pre-order cancelled successfully!", "success");
      setMatchedOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: 'Canceled' } : o));
      setModifyingPreOrderId(null);
    } else {
      showToast(res.message, "error");
    }
  };

  const handleWhatsAppContact = () => {
    const num = storeConfig.whatsappNumber || "8801312556660";
    const msg = encodeURIComponent("Hello RycreoShop Support, I need assistance regarding my order tracking and modifications.");
    window.open(`https://wa.me/${num}?text=${msg}`, '_blank');
  };

  const handleAddProductToOrder = (e: React.FormEvent, order: Order) => {
    e.preventDefault();
    if (!selectedProductId) {
      showToast("Please select a product to add.", "error");
      return;
    }
    const product = products.find(p => p.id === selectedProductId);
    if (!product) {
      showToast("Selected product not found.", "error");
      return;
    }

    const price = product.salePrice > 0 ? product.salePrice : product.price;
    const newItem: CartItem = {
      productId: product.id,
      product,
      quantity: selectedQuantity,
      selectedSize: selectedSize || (typeof product.sizes?.[0] === 'string' ? product.sizes[0] : product.sizes?.[0]?.size) || 'M',
      selectedColor: selectedColor || 'Default',
      price
    };

    const updatedItems = [...order.items, newItem];
    const newSubtotal = updatedItems.reduce((acc, i) => acc + (i.price * i.quantity), 0);
    // Single consolidated delivery charge (do not double charge)
    const newTotalAmount = newSubtotal + (order.deliveryFee || 0) - (order.discount || 0);

    const updates = {
      items: updatedItems,
      subtotal: newSubtotal,
      totalAmount: newTotalAmount > 0 ? newTotalAmount : newSubtotal
    };

    updateOrder(order.id, updates);
    showToast(`Successfully added ${product.title} to Order #${order.orderNumber}!`, "success");
    setAddingProductOrderId(null);
    setSelectedProductId('');
    setSelectedQuantity(1);
    setMatchedOrders(prev => prev.map(o => o.id === order.id ? { ...o, ...updates } : o));
  };

  const lockHours = storeConfig.orderLockDurationHours || 24;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-slate-200 relative p-6 sm:p-8 my-auto space-y-6 max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
          <div className="space-y-1">
            <h2 className="text-xl font-extrabold text-slate-900 font-['Outfit'] flex items-center gap-2">
              <Truck className="w-5 h-5 text-[#38BDF8]" />
              <span>Track My Order</span>
            </h2>
            <p className="text-xs text-slate-500">
              Enter your 11-digit mobile number and Order ID to track status, edit address or cancel.
            </p>
          </div>

          <button 
            onClick={() => {
              setSearched(false);
              setPhoneInput('');
              setOrderIdInput('');
              onClose();
            }}
            className="p-2 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Form */}
        <div className="overflow-y-auto pr-1 space-y-5 flex-1">
          <form id="track-form" onSubmit={handleSearchOrder} className="space-y-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1">
                11-Digit Registered Mobile Number <span className="text-rose-500">*</span>
              </label>
              <PhoneInput88
                id="track-phone-input"
                name="trackPhone"
                required
                value={phoneInput}
                onChange={setPhoneInput}
                placeholder="017XXXXXXXX"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1">
                Order ID (Optional / Recommended)
              </label>
              <input 
                type="text"
                value={orderIdInput}
                onChange={(e) => setOrderIdInput(e.target.value)}
                placeholder="e.g. 8X7K2M9N4P"
                className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-900 font-bold outline-none focus:border-[#38BDF8] transition-all uppercase font-mono"
              />
            </div>
          </form>

          {/* Results List */}
          {searched && (
            <div className="space-y-4 animate-fade-in">
              {matchedOrders.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                      Orders Found ({matchedOrders.length})
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Phone: <strong className="font-mono text-slate-900">{phoneInput}</strong>
                    </span>
                  </div>

                  {matchedOrders.map((order) => {
                    const orderTime = new Date(order.createdAt).getTime();
                    const isLocked = (Date.now() - orderTime) > (modalLockHours * 60 * 60 * 1000);
                    const isPreOrderOrder = order.hasPreOrderItems || (order.items && order.items.some(i => i.isPreOrder || i.product?.availability === 'preorder' || i.product?.isPreOrder));
                    const canModifyPreOrder = isPreOrderOrder && (order.status === 'Pending' || order.status === 'Processing');

                    return (
                      <div key={order.id} className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-4 text-xs shadow-xs">
                        {/* Order Header & Instruction Note */}
                        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold uppercase text-slate-400">Order ID:</span>
                              <span className="font-mono font-black text-base text-[#0284C7] bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                                #{order.orderNumber || order.id}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 font-medium font-mono mt-1">
                              {formatBangladeshDateTime(order.createdAt)}
                            </p>
                          </div>
                          {order.status === 'Canceled' && (
                            <span className="px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-600 border border-rose-200 text-xs font-bold flex items-center gap-1">
                              <XCircle className="w-3.5 h-3.5" /> Order Canceled
                            </span>
                          )}
                        </div>

                        {/* Live Countdown Timer & Instruction / Lock Notice */}
                        <OrderCountdownTimer orderTime={orderTime} lockHours={lockHours} isLocked={isLocked} />

                        {/* Delivery Details */}
                        <div className="space-y-1 bg-white p-3 rounded-xl border border-slate-200">
                          <p className="font-bold text-slate-900 text-xs">Customer Delivery Information:</p>
                          <p className="text-slate-700"><span className="font-semibold text-slate-900">Name:</span> {order.customerName}</p>
                          <p className="text-slate-700"><span className="font-semibold text-slate-900">Phone:</span> {order.phone}</p>
                          <p className="text-slate-700">
                            <span className="font-semibold text-slate-900">Address:</span> {order.address} {order.upazila ? `, ${order.upazila}` : ''} {order.district ? `, ${order.district}` : ''} {order.division ? `, ${order.division}` : ''}
                          </p>
                          {order.isAddressChanged && (
                            <span className="inline-block px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 text-[10px] font-bold mt-1">
                              ✓ Delivery details updated
                            </span>
                          )}
                        </div>

                        {/* Ordered Items */}
                        <div className="space-y-2">
                          <p className="font-bold text-slate-900">Ordered Items ({order.items.length}):</p>
                          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200">
                                <div className="flex items-center gap-2 min-w-0">
                                  {item.product.images?.[0] && (
                                    <img src={item.product.images[0]} alt="" className="w-8 h-8 object-cover rounded bg-slate-100 shrink-0" />
                                  )}
                                  <div className="min-w-0">
                                    <p className="font-bold text-slate-800 text-[11px] truncate">{item.product.title}</p>
                                    <p className="text-[10px] text-slate-500">Qty: {item.quantity} {item.selectedSize ? `• ${item.selectedSize}` : ''} {item.selectedColor ? `• ${item.selectedColor}` : ''}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-slate-900 text-[11px] shrink-0 font-mono">৳{item.price * item.quantity}</span>
                                  {!isLocked && order.status !== 'Canceled' && (
                                    <button
                                      onClick={() => {
                                        setAddingProductOrderId(order.id);
                                        setSelectedProductId(item.product.id);
                                        setSelectedSize(item.selectedSize || 'M');
                                        setSelectedColor(item.selectedColor || 'Default');
                                        setSelectedQuantity(1);
                                      }}
                                      className="p-1.5 rounded-full bg-sky-100 text-sky-700 hover:bg-sky-200 transition-all cursor-pointer"
                                    >
                                      <Plus className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Add Product Section */}
                        {addingProductOrderId === order.id && (
                          <div className="p-4 bg-sky-50 rounded-2xl border border-sky-200 space-y-4 animate-fade-in shadow-inner">
                            <div className="flex items-center gap-2 text-sky-900 font-extrabold text-xs">
                              <ShoppingCart className="w-4 h-4" />
                              <span>Add more of this item:</span>
                            </div>
                            
                            <div className="space-y-3">
                                {/* Variant Selection UI (simplified) */}
                                <div className="flex gap-2">
                                  {/* Size Selection */}
                                  <div className="flex-1">
                                    <label className="text-[10px] font-bold text-slate-500">Size</label>
                                    <select 
                                      value={selectedSize}
                                      onChange={(e) => setSelectedSize(e.target.value)}
                                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-[11px] font-bold"
                                    >
                                      {products.find(p => p.id === selectedProductId)?.sizes?.map((sz: any) => (
                                        <option key={typeof sz === 'string' ? sz : sz.size} value={typeof sz === 'string' ? sz : sz.size}>
                                          {typeof sz === 'string' ? sz : sz.size}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                  {/* Color Selection */}
                                  <div className="flex-1">
                                     <label className="text-[10px] font-bold text-slate-500">Color</label>
                                     <select
                                       value={selectedColor}
                                       onChange={(e) => setSelectedColor(e.target.value)}
                                       className="w-full bg-white border border-slate-200 rounded-lg p-2 text-[11px] font-bold"
                                     >
                                       {products.find(p => p.id === selectedProductId)?.colors?.map((col: any) => {
                                         const colName = typeof col === 'string' ? col : col.name;
                                         return (
                                           <option key={colName} value={colName}>{colName}</option>
                                         );
                                       })}
                                     </select>
                                  </div>
                                </div>
                                <div className="flex justify-end gap-2">
                                    <button onClick={() => setAddingProductOrderId(null)} className="px-3 py-1.5 text-xs font-bold bg-slate-100 rounded-lg">Cancel</button>
                                    <button onClick={(e) => handleAddProductToOrder(e, order)} className="px-3 py-1.5 text-xs font-black text-white bg-sky-600 rounded-lg">Add to Order</button>
                                </div>
                            </div>
                          </div>
                        )}

                        {/* Pre-Order Specific Management Card */}
                        {isPreOrderOrder && (
                          <div className="p-3.5 bg-gradient-to-r from-blue-50 via-sky-50 to-indigo-50 rounded-2xl border border-blue-200/90 space-y-2.5">
                            <div className="flex items-center justify-between">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider">
                                <Clock className="w-3 h-3" />
                                PRE-ORDER ORDER
                              </span>
                              <span className="text-[10px] font-extrabold text-blue-900 bg-white px-2 py-0.5 rounded border border-blue-200">
                                {order.status}
                              </span>
                            </div>

                            {canModifyPreOrder ? (
                              <div className="space-y-2">
                                <p className="text-xs text-blue-900 font-bold">
                                  You can modify or cancel your pre-order items before shipment processing.
                                </p>
                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleStartModifyPreOrder(order)}
                                    className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                    <span>Modify Pre-Order</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleCancelPreOrderAction(order)}
                                    className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                                  >
                                    <XCircle className="w-3.5 h-3.5" />
                                    <span>Cancel Pre-Order</span>
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <p className="text-xs text-slate-600 font-medium bg-white p-2.5 rounded-xl border border-slate-200">
                                Pre-order modifications are closed for this order status.
                              </p>
                            )}
                          </div>
                        )}

                        {/* Interactive Pre-Order Modification Editor Panel */}
                        {modifyingPreOrderId === order.id && (
                          <div className="p-4 bg-white rounded-2xl border-2 border-blue-400 space-y-4 shadow-lg animate-scale-up">
                            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                              <h4 className="text-xs sm:text-sm font-black text-blue-900 flex items-center gap-2">
                                <Edit3 className="w-4 h-4 text-blue-600" />
                                <span>Modify Pre-Order Products &amp; Quantity</span>
                              </h4>
                              <button
                                onClick={() => setModifyingPreOrderId(null)}
                                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>

                            {/* Draft Items List */}
                            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                              {preOrderDraftItems.map((item, itIdx) => (
                                <div key={itIdx} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    {item.product?.images?.[0] && (
                                      <img src={item.product.images[0]} alt="" className="w-10 h-10 object-cover rounded-lg bg-white border border-slate-200 shrink-0" />
                                    )}
                                    <div className="min-w-0">
                                      <p className="font-extrabold text-slate-900 text-xs truncate max-w-[200px]">
                                        {item.product?.title}
                                      </p>
                                      <p className="text-[10px] text-blue-700 font-bold">
                                        ৳{item.price} • Est. delivery ~{item.preOrderDays || 20} days
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2 self-end sm:self-center">
                                    {/* Qty Adjuster */}
                                    <div className="inline-flex items-center bg-white border border-slate-300 rounded-lg p-0.5">
                                      <button
                                        type="button"
                                        onClick={() => handleDraftQtyChange(itIdx, -1)}
                                        className="w-6 h-6 flex items-center justify-center rounded hover:bg-rose-50 text-slate-700 cursor-pointer"
                                      >
                                        <Minus className="w-3 h-3" />
                                      </button>
                                      <span className="w-7 text-center font-black text-xs font-mono">
                                        {item.quantity}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => handleDraftQtyChange(itIdx, 1)}
                                        className="w-6 h-6 flex items-center justify-center rounded hover:bg-blue-50 text-slate-700 cursor-pointer"
                                      >
                                        <Plus className="w-3 h-3" />
                                      </button>
                                    </div>

                                    {/* Swap Button */}
                                    <button
                                      type="button"
                                      onClick={() => setSwappingItemIndex(swappingItemIndex === itIdx ? null : itIdx)}
                                      className="px-2 py-1 rounded-lg bg-sky-100 hover:bg-sky-200 text-sky-800 text-[10px] font-black cursor-pointer"
                                    >
                                      Change
                                    </button>

                                    {/* Remove item */}
                                    <button
                                      type="button"
                                      onClick={() => handleDraftQtyChange(itIdx, -item.quantity)}
                                      className="p-1 rounded-lg hover:bg-rose-100 text-rose-600 cursor-pointer"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>

                                  {/* Swapping Dropdown / List */}
                                  {swappingItemIndex === itIdx && (
                                    <div className="w-full mt-2 pt-2 border-t border-slate-200">
                                      <p className="text-[10px] font-bold text-slate-600 mb-1">
                                        Select an alternative pre-order product:
                                      </p>
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-40 overflow-y-auto">
                                        {products
                                          .filter(p => (p.availability === 'preorder' || p.isPreOrder) && p.id !== item.productId)
                                          .map(p => (
                                            <button
                                              key={p.id}
                                              type="button"
                                              onClick={() => handleSwapItem(itIdx, p.id)}
                                              className="p-1.5 text-left bg-white hover:bg-blue-50 border border-slate-200 rounded-lg text-xs font-bold flex items-center justify-between cursor-pointer"
                                            >
                                              <span className="truncate max-w-[150px]">{p.title}</span>
                                              <span className="font-mono text-blue-700 shrink-0">৳{p.salePrice > 0 ? p.salePrice : p.price}</span>
                                            </button>
                                          ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>

                            {/* Live Preview Calculation */}
                            <div className="p-3 bg-blue-50/80 rounded-xl border border-blue-200 flex items-center justify-between text-xs font-bold">
                              <div>
                                <span className="text-slate-600 block text-[10px] uppercase">Updated Estimated Total</span>
                                <span className="font-mono text-base font-black text-blue-900">
                                  ৳{Math.max(0, preOrderDraftItems.reduce((acc, it) => acc + it.price * it.quantity, 0) + (Number(order.deliveryFee) || 0) - (Number(order.discount) || 0))}
                                </span>
                              </div>
                              <div className="text-right">
                                <span className="text-slate-500 block text-[10px]">Delivery Fee</span>
                                <span className="font-mono text-slate-800">৳{order.deliveryFee || 0}</span>
                              </div>
                            </div>

                            {/* Save Actions */}
                            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                              <button
                                type="button"
                                onClick={() => setModifyingPreOrderId(null)}
                                className="px-3.5 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 cursor-pointer"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSavePreOrderModification(order)}
                                className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs flex items-center gap-1.5 shadow-md cursor-pointer active:scale-95"
                              >
                                <Save className="w-3.5 h-3.5" />
                                <span>Save Changes</span>
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Total Amount */}
                        <div className="pt-2 border-t border-slate-200 flex items-center justify-between font-bold text-slate-900 text-sm">
                          <span>Total Payable ({order.paymentMethod || 'Cash on Delivery'}):</span>
                          <span className="text-[#0284C7] font-black font-mono">৳{order.totalAmount}</span>
                        </div>

                        {/* Action Buttons within lock hours */}
                        <div className="pt-3 border-t border-slate-200 space-y-2.5">
                          <button
                            type="button"
                            onClick={() => downloadOrderMemo(order, storeConfig)}
                            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md active:scale-95">
                              <Download className="w-4 h-4" />
                              <span>Download Cash Memo</span>
                            </button>
                          {!isLocked && order.status !== 'Canceled' && (
                            <div className="space-y-2">
                              <div className="grid grid-cols-2 gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (editingOrderId === order.id) {
                                      setEditingOrderId(null);
                                    } else {
                                      handleStartEditAddress(order);
                                    }
                                  }}
                                  className="py-2.5 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold text-xs border border-indigo-200 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                                >
                                  <Edit3 className="w-4 h-4" />
                                  <span>{editingOrderId === order.id ? 'Cancel Edit' : 'Change Address / Phone'}</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleStartCancel(order)}
                                  className="py-2.5 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-extrabold text-xs border border-rose-200 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                                >
                                  <XCircle className="w-4 h-4" />
                                  <span>Cancel Order</span>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Inline Change Address Form */}
                        {editingOrderId === order.id && (
                          <form onSubmit={(e) => handleSaveAddress(e, order)} className="p-4 bg-white rounded-2xl border border-indigo-200 space-y-4 animate-fade-in shadow-inner">
                            <div className="flex items-center gap-2 text-indigo-900 font-extrabold text-xs">
                              <MapPin className="w-4 h-4" />
                              <span>Update Delivery Information:</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase">Division</label>
                                <div className="relative">
                                  <select
                                    value={selectedDivision}
                                    onChange={(e) => handleDivisionChange(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-[11px] font-bold outline-none focus:border-indigo-500 appearance-none pr-6"
                                  >
                                    {BangladeshGeoData.divisions.map(d => (
                                      <option key={d.name} value={d.name}>{d.name}</option>
                                    ))}
                                  </select>
                                  <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                </div>
                              </div>

                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase">District</label>
                                <div className="relative">
                                  <select
                                    value={selectedDistrict}
                                    onChange={(e) => handleDistrictChange(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-[11px] font-bold outline-none focus:border-indigo-500 appearance-none pr-6"
                                  >
                                    {BangladeshGeoData.divisions.find(d => d.name === selectedDivision)?.districts.map(d => (
                                      <option key={d.name} value={d.name}>{d.name}</option>
                                    ))}
                                  </select>
                                  <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                </div>
                              </div>

                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase">Upazila</label>
                                <div className="relative">
                                  <select
                                    value={selectedUpazila}
                                    onChange={(e) => setSelectedUpazila(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-[11px] font-bold outline-none focus:border-indigo-500 appearance-none pr-6"
                                  >
                                    {BangladeshGeoData.divisions.find(d => d.name === selectedDivision)?.districts.find(d => d.name === selectedDistrict)?.upazilas.map((u, idx) => (
                                      <option key={`${u}-${idx}`} value={u}>{u}</option>
                                    ))}
                                  </select>
                                  <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase">Contact Phone Number</label>
                                <PhoneInput88
                                  id="track-edit-phone"
                                  name="editPhone"
                                  required
                                  value={newPhone}
                                  onChange={setNewPhone}
                                  placeholder="017XXXXXXXX"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase">Full Delivery Address</label>
                                <input
                                  required
                                  value={newAddress}
                                  onChange={(e) => setNewAddress(e.target.value)}
                                  placeholder="House, Road, Area details"
                                  className="w-full p-2 border border-slate-200 bg-slate-50 rounded-lg text-[11px] font-bold outline-none focus:border-indigo-500"
                                />
                              </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                              <button
                                type="button"
                                onClick={() => setEditingOrderId(null)}
                                className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold text-xs hover:bg-slate-200 transition-colors cursor-pointer"
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-black text-xs flex items-center gap-1.5 shadow-md hover:bg-indigo-700 transition-all cursor-pointer"
                              >
                                <Save className="w-4 h-4" />
                                <span>Save Changes</span>
                              </button>
                            </div>
                          </form>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-6 text-center text-xs text-rose-600 font-bold bg-rose-50 rounded-2xl border border-rose-200 space-y-2">
                  <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
                  <p>No orders found matching this mobile number {orderIdInput ? 'and Order ID' : ''}.</p>
                  <p className="text-[10px] text-slate-600 font-normal">
                    Please make sure you entered the correct 11-digit mobile number used when ordering.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Persistent Action Footer (Always Visible) */}
        <div className="pt-4 border-t border-slate-100 shrink-0 space-y-3 z-20 bg-white">
          <button
            type="submit"
            form="track-form"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#38BDF8] to-[#6366F1] text-white font-extrabold text-xs shadow-md hover:shadow-sky-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Search className="w-4 h-4" />
            <span>Track My Parcel</span>
          </button>
          
          <button
            type="button"
            onClick={() => handleWhatsAppContact()}
            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
          >
            <MessageSquare className="w-4 h-4 text-white" />
            <span>Chat on WhatsApp</span>
          </button>
        </div>

        {/* Two-Step Cancellation Modal */}
        {cancelingOrder && (
          <div className="fixed inset-0 z-[60] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl border border-slate-200">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
                <XCircle className="w-7 h-7" />
              </div>

              {cancelStep === 1 ? (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <h3 className="text-sm font-black text-slate-900 leading-snug">
                      Cancel Order #{cancelingOrder.orderNumber}?
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Are you sure you want to request cancellation for this order?
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setCancelStep(2)}
                      className="w-full py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-black text-xs transition-all cursor-pointer shadow-md"
                    >
                      I want to cancel my order
                    </button>
                    <button
                      type="button"
                      onClick={() => setCancelingOrder(null)}
                      className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs transition-all cursor-pointer"
                    >
                      Keep my order (Go back)
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <h3 className="text-sm font-black text-rose-600 leading-snug">
                      Final Confirmation
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      This action is permanent and cannot be reversed. Are you 100% sure you want to cancel Order #{cancelingOrder.orderNumber}?
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 pt-2">
                    <button
                      type="button"
                      onClick={confirmCancelOrder}
                      className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-md shadow-rose-500/25 transition-all cursor-pointer"
                    >
                      Yes, I am 100% sure I want to cancel my order
                    </button>
                    <button
                      type="button"
                      onClick={() => setCancelingOrder(null)}
                      className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs transition-all cursor-pointer"
                    >
                      No, keep my order
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
