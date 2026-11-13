import React, { useState } from 'react';
import { MessageSquare, X, Send, Sparkles } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const WhatsAppWidget: React.FC = () => {
  const { storeConfig, setIsAdminModalOpen } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');

  const handleSend = (customMsg?: string) => {
    const textToSend = customMsg || message || `Hi ${storeConfig.storeName || 'RycreoShop'}! I have an inquiry about your collection.`;
    const encoded = encodeURIComponent(textToSend);
    window.open(`https://wa.me/${storeConfig.whatsappNumber}?text=${encoded}`, '_blank');
    setIsOpen(false);
    setMessage('');
  };

  const quickPrompts = [
    "✨ Inquire about products & deals",
    "📦 Check my order status",
    "🚚 Delivery duration & shipping details",
    "💳 Payment & Cash on Delivery inquiry"
  ];

  return (
    <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-40 flex flex-col items-end">
      {/* Expanded Quick Chat Box */}
      {isOpen && (
        <div className="mb-3 w-80 bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-fade-in text-slate-800">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#10B981] to-[#059669] p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-lg">
                  {(storeConfig.storeName || 'R').charAt(0).toUpperCase()}
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-emerald-600 animate-pulse" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm font-['Outfit']">{storeConfig.storeName} Support</h4>
                <p className="text-[10px] text-emerald-100">Online • Typically replies in 5 minutes</p>
              </div>
            </div>

            <button 
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chat Body */}
          <div className="p-4 bg-slate-50 space-y-3 max-h-80 overflow-y-auto">
            <div className="bg-white p-3 rounded-2xl border border-slate-200 text-xs shadow-sm space-y-1">
              <p className="font-bold text-slate-900">👋 Welcome to {storeConfig.storeName}!</p>
              <p className="text-slate-600 text-[11px]">How can our luxury style advisors assist you today?</p>
            </div>

            {/* Quick Prompt Chips */}
            <div className="space-y-1.5 pt-1">
              <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Quick Inquiries:</p>
              {quickPrompts.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(prompt)}
                  className="w-full text-left p-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 font-medium hover:border-[#10B981] hover:text-[#10B981] transition-colors shadow-2xs"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Input Footer */}
          <div className="p-3 bg-white border-t border-slate-200 flex gap-2">
            <input 
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type your message..."
              className="flex-1 bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#10B981]"
            />
            <button
              onClick={() => handleSend()}
              className="p-2 rounded-xl bg-[#10B981] text-white hover:bg-emerald-600 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Custom Shopping Basket Launcher Button with WhatsApp Badge */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative group cursor-pointer flex items-center justify-center p-3 sm:p-3.5 rounded-2xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 text-white shadow-2xl shadow-emerald-500/40 hover:scale-110 active:scale-95 transition-all duration-300 ring-4 ring-emerald-400/20"
        title="WhatsApp Customer Support & Orders"
        aria-label="WhatsApp Support"
      >
        {/* Shopping Basket Container */}
        <div className="relative flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9">
          {/* Shopping Basket SVG */}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full text-white drop-shadow-md">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
            <path d="M3 6h18" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>

          {/* Embedded WhatsApp Emblem Badge inside Basket */}
          <div className="absolute -bottom-1 -right-1.5 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center shadow-md animate-bounce">
            <MessageSquare className="w-3 h-3 sm:w-3.5 h-3.5 fill-white text-emerald-600" />
          </div>
        </div>

        {/* Hover Tooltip Label */}
        <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs group-hover:ml-2.5 transition-all duration-300 ease-in-out font-black text-xs text-white tracking-wide">
          WhatsApp Support
        </span>
      </button>
    </div>
  );
};
