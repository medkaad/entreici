import React from "react";

export default function SecondaryButton({ children, className = "", ...props }) {
  return (
    <button
      {...props}
      className={
        "senior-click senior-focus inline-flex w-full items-center justify-center gap-2 " +
        "rounded-2xl border-2 px-5 py-4 text-lg font-semibold " +
        "hover:bg-gray-50 active:scale-[0.99] disabled:opacity-50 " +
        className
      }
    >
      {children}
    </button>
  );
}
