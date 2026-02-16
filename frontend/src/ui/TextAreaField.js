import React from "react";

export default function TextAreaField({ label, error, ...props }) {
  return (
    <div className="space-y-2">
      <label className="block text-lg font-semibold">{label}</label>
      <textarea
        {...props}
        className={
          "senior-focus w-full rounded-2xl border-2 px-4 py-4 text-lg min-h-[140px] " +
          (error ? "border-red-600" : "border-gray-300")
        }
      />
      {error && <div className="text-base font-semibold text-red-700">❌ {error}</div>}
    </div>
  );
}
