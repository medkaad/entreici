import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const SeniorModeContext = createContext(null);

export function SeniorModeProvider({ children }) {
  const [seniorMode, setSeniorMode] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("seniorMode");
    if (saved === "true") setSeniorMode(true);
  }, []);

  useEffect(() => {
    localStorage.setItem("seniorMode", String(seniorMode));
  }, [seniorMode]);

  useEffect(() => {
    // Ajoute une classe globale sur <html> pour adapter l’UI partout
    const root = document.documentElement;
    if (seniorMode) root.classList.add("senior");
    else root.classList.remove("senior");
  }, [seniorMode]);

  const value = useMemo(() => ({ seniorMode, setSeniorMode }), [seniorMode]);
  return <SeniorModeContext.Provider value={value}>{children}</SeniorModeContext.Provider>;
}

export function useSeniorMode() {
  const ctx = useContext(SeniorModeContext);
  if (!ctx) throw new Error("useSeniorMode must be used within SeniorModeProvider");
  return ctx;
}
