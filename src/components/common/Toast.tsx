import React, { createContext, useContext, useState, useCallback } from 'react';
import { useStore } from '../../context/StoreContext';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface ToastContextType {
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const { isAdminLoggedIn, isAdminViewingStore } = useStore();

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    // Strictly restrict all toast notifications to the Admin Dashboard only.
    // Public visitors viewing the storefront must NEVER see administrative upload/update toasts.
    if (!isAdminLoggedIn || isAdminViewingStore) return;

    setToasts((prev) => {
      // Prevent duplicate/repeated notifications with the exact same message and type
      if (prev.some((t) => t.message === message && t.type === type)) {
        return prev;
      }
      const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      setTimeout(() => {
        setToasts((current) => current.filter((t) => t.id !== id));
      }, 3500);
      return [...prev, { id, type, message }];
    });
  }, [isAdminLoggedIn, isAdminViewingStore]);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-5 left-5 z-[110] flex flex-col gap-2 max-w-sm pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-2xl text-xs font-bold text-white transition-all transform animate-fade-in ${
              toast.type === 'success'
                ? 'bg-emerald-600 border border-emerald-500 shadow-emerald-500/20'
                : toast.type === 'error'
                ? 'bg-rose-600 border border-rose-500 shadow-rose-500/20'
                : 'bg-slate-800 border border-slate-700 shadow-sky-500/20'
            }`}
          >
            {toast.type === 'success' && <CheckCircle className="w-4 h-4 shrink-0" />}
            {toast.type === 'error' && <AlertCircle className="w-4 h-4 shrink-0" />}
            {toast.type === 'info' && <Info className="w-4 h-4 shrink-0 text-[#38BDF8]" />}
            <span className="flex-1">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-white/80 hover:text-white p-0.5 ml-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      showToast: (msg: string) => console.log(msg),
    };
  }
  return context;
};
