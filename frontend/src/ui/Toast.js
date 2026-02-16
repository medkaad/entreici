import { createContext, useContext, useMemo, useState } from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);

  function push(type, message) {
    const id = crypto.randomUUID();
    setItems((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setItems((prev) => prev.filter((x) => x.id !== id));
    }, 3500);
  }

  const api = useMemo(
    () => ({
      success: (m) => push("success", m),
      error: (m) => push("error", m),
      info: (m) => push("info", m),
    }),
    []
  );

  return (
    <ToastContext.Provider value={api}>
      {children}

      <div className="fixed left-1/2 top-4 z-[9999] w-[min(560px,92vw)] -translate-x-1/2 space-y-2">
        {items.map((t) => (
          <div key={t.id} className="senior-card rounded-3xl border bg-white px-5 py-4 shadow-xl">
            <div className="flex items-center gap-2 text-lg font-extrabold">
              <span aria-hidden="true">
                {t.type === "success" ? "✅" : t.type === "error" ? "❌" : "ℹ️"}
              </span>
              <span className="text-gray-900">{t.message}</span>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
