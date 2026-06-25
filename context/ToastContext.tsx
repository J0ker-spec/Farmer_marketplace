import React, { createContext, ReactNode, useCallback, useContext, useState } from 'react';

type Toast = { id: number; message: string } | null;

const ToastContext = createContext<{
  showToast: (message: string) => void;
  current: Toast;
}>({ showToast: () => {}, current: null });

export function ToastProvider({ children }: { children: ReactNode }) {
  const [current, setCurrent] = useState<Toast>(null);
  const showToast = useCallback((message: string) => {
    const id = Date.now();
    setCurrent({ id, message });
    setTimeout(() => setCurrent(null), 2500);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, current }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

export default ToastContext;
