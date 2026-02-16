import React from "react";

export default function PrimaryButton({ children, className = "", ...props }) {
  return (
    <button
      {...props}
      className={
        "senior-click senior-focus inline-flex w-full items-center justify-center gap-2 " +
        "rounded-2xl px-5 py-4 text-lg font-semibold " +
        "bg-black text-white hover:opacity-90 active:scale-[0.99] disabled:opacity-50 " +
        className
      }
    >
      {children}
    </button>
  );
}
