import React from 'react';
import { ToastMessage } from '../types';
import { Info, CheckCircle2, AlertTriangle, AlertOctagon, X } from 'lucide-react';

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full px-4 pointer-events-none"
    >
      {toasts.map((toast) => {
        let bgClass = 'bg-amrit-navy text-white';
        let Icon = Info;
        let iconColor = 'text-amrit-cyan';

        if (toast.type === 'success') {
          bgClass = 'bg-white text-amrit-navy border border-amrit-safe/40 shadow-card';
          Icon = CheckCircle2;
          iconColor = 'text-amrit-safe';
        } else if (toast.type === 'warning') {
          bgClass = 'bg-white text-amrit-navy border border-amrit-consult/40 shadow-card';
          Icon = AlertTriangle;
          iconColor = 'text-amrit-consult';
        } else if (toast.type === 'alert') {
          bgClass = 'bg-white text-amrit-navy border border-amrit-emergency/40 shadow-card';
          Icon = AlertOctagon;
          iconColor = 'text-amrit-emergency';
        }

        return (
          <div
            key={toast.id}
            role="status"
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-card shadow-card-hover transition-all duration-300 transform translate-y-0 opacity-100 ${bgClass}`}
          >
            <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${iconColor}`} />
            <div className="flex-1 text-sm font-medium leading-snug">
              {toast.message}
            </div>
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              className="text-amrit-muted hover:text-amrit-navy p-1 rounded-md transition-colors"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
