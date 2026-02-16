import { useEffect, useState } from "react";

function SeniorToggle() {
  const [seniorMode, setSeniorMode] = useState(
    localStorage.getItem("senior_mode") === "1"
  );

  // applique la classe sur <body>
  useEffect(() => {
    document.body.classList.toggle("senior", seniorMode);
    localStorage.setItem("senior_mode", seniorMode ? "1" : "0");
  }, [seniorMode]);

  return (
    <button
      onClick={() => setSeniorMode((v) => !v)}
      className={`
        fixed bottom-6 right-6 z-[9999]
        px-6 py-4 rounded-full
        shadow-2xl border-2
        font-extrabold text-lg
        transition focus:outline-none focus:ring-4 focus:ring-blue-300
        ${seniorMode
          ? "bg-blue-700 text-white border-blue-800 hover:bg-blue-800"
          : "bg-white text-gray-900 border-gray-300 hover:bg-gray-50"}
      `}
      aria-label="Activer ou désactiver le mode senior"
      title="Mode senior"
    >
      {seniorMode ? "👵 Mode senior : ON" : "👵 Mode senior : OFF"}
    </button>
  );
}

export default SeniorToggle;
