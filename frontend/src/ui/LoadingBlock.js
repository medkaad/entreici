import React from "react";

export default function LoadingBlock({ label = "Chargement…" }) {
  return (
    <div className="senior-card rounded-2xl border bg-white p-4">
      <div className="text-lg font-semibold">⏳ {label}</div>
      <div className="mt-2 text-base text-gray-600">Merci de patienter.</div>
    </div>
  );
}
