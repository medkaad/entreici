import React from "react";

export default function InputField({ label, error, ...props }) {
  return (
    <div className="space-y-2">
      <label className="block text-lg font-semibold">{label}</label>
      <input
        {...props}
        className={
          "senior-click senior-focus w-full rounded-2xl border-2 px-4 py-4 text-lg " +
          (error ? "border-red-600" : "border-gray-300")
        }
      />
      {error && <div className="text-base font-semibold text-red-700">❌ {error}</div>}
    </div>
  );
}
