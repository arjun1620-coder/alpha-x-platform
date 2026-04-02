"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: () => void;
}

export default function Toast({ message, type = "info", duration = 4000, onClose }: ToastProps) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onClose, 300);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const styles = {
    success: "bg-green-500/15 border-green-500/30 text-green-300",
    error: "bg-red-500/15 border-red-500/30 text-red-300",
    info: "bg-indigo-500/15 border-indigo-500/30 text-indigo-300",
    warning: "bg-yellow-500/15 border-yellow-500/30 text-yellow-300",
  };

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 flex-shrink-0" />,
    error: <XCircle className="w-5 h-5 flex-shrink-0" />,
    info: <Info className="w-5 h-5 flex-shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 flex-shrink-0" />,
  };

  return (
    <div
      className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl border shadow-2xl backdrop-blur-xl transition-all duration-300 ${styles[type]} ${
        isExiting ? "opacity-0 translate-x-8" : "opacity-100 translate-x-0"
      }`}
      style={{ animation: "toast-in 0.4s cubic-bezier(0.16, 1, 0.3, 1)" }}
    >
      {icons[type]}
      <span className="text-sm font-medium flex-1">{message}</span>
      <button onClick={() => { setIsExiting(true); setTimeout(onClose, 300); }} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// Toast container to manage multiple toasts
export function useToast() {
  const [toasts, setToasts] = useState<{ id: number; message: string; type: ToastType }[]>([]);
  let nextId = 0;

  const addToast = (message: string, type: ToastType = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const ToastContainer = () => (
    <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-3 max-w-sm">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );

  return { addToast, ToastContainer };
}
