import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import AppRoutes from "./routes/AppRoutes";
import { useState, useRef, useEffect } from "react";
import { getMe } from "./api/api";
import HelpWidget from "./help/HelpWidget";
import { ToastProvider } from "./ui/Toast";
import SeniorToggle from "./senior/SeniorToggle";

function App() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const dropdownRef = useRef();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  /* =========================
     LOAD USER
  ========================= */
  useEffect(() => {
    async function loadUser() {
      try {
        const data = await getMe();
        setUser(data);
      } catch (error) {
        console.error("Erreur récupération utilisateur:", error);
      }
    }

    if (isAuthenticated) {
      loadUser();
    } else {
      setUser(null);
    }
  }, [isAuthenticated]);

  /* =========================
     CLOSE DROPDOWN ON OUTSIDE CLICK
  ========================= */
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navLinkClass = ({ isActive }) =>
    isActive
      ? "text-blue-700 font-extrabold border-b-4 border-blue-600 pb-1"
      : "text-gray-900 hover:text-blue-700 transition font-extrabold";

  const getInitial = () => {
    if (!user?.first_name) return "?";
    return user.first_name.charAt(0).toUpperCase();
  };

  return (
    <ToastProvider>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {isAuthenticated && (
          <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center gap-4">
              
              {/* LOGO */}
              <h1
                onClick={() => navigate("/")}
                className="text-2xl font-extrabold text-blue-700 cursor-pointer tracking-tight hover:opacity-80 transition"
              >
                🏡 EntreIci
              </h1>

              {/* NAV LINKS */}
              <div className="flex items-center gap-4 md:gap-8 flex-wrap justify-end">
                <NavLink to="/" className={navLinkClass}>
                  🧾 Annonces
                </NavLink>

                <NavLink to="/conversations" className={navLinkClass}>
                  💬 Conversations
                </NavLink>

                <NavLink to="/mes-annonces" className={navLinkClass}>
                  📌 Mes annonces
                </NavLink>

                {/* PROFILE DROPDOWN */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setOpen(!open)}
                    className="flex items-center gap-2 focus:outline-none focus:ring-4 focus:ring-blue-300 rounded-full"
                    aria-label="Ouvrir le menu profil"
                  >
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-extrabold text-xl hover:scale-105 transition">
                      {getInitial()}
                    </div>
                  </button>

                  {open && (
                    <div className="absolute right-0 mt-3 w-80 bg-white rounded-3xl shadow-xl border-2 border-gray-100 py-4">
                      
                      {/* USER INFO */}
                      <div className="px-5 pb-4 border-b border-gray-100">
                        <p className="font-extrabold text-gray-900 text-lg">
                          {user?.first_name} {user?.last_name}
                        </p>

                        <p className="text-gray-800 mt-2 font-semibold">
                          📍 {user?.ville || "Ville non renseignée"}
                        </p>

                        <p className="text-gray-800 mt-2 font-semibold">
                          ⭐ {user?.score?.toFixed(1) || "0.0"} ({user?.total_reviews || 0} avis)
                        </p>

                        <p className="mt-3 inline-block bg-blue-100 text-blue-700 px-4 py-2 rounded-full font-extrabold">
                          {user?.badge || "Nouveau"}
                        </p>
                      </div>

                      {/* MENU */}
                      <div className="pt-2">
                        <button
                          onClick={() => {
                            navigate("/profile");
                            setOpen(false);
                          }}
                          className="block w-full text-left px-5 py-4 text-gray-900 hover:bg-gray-50 transition font-extrabold focus:outline-none focus:ring-4 focus:ring-blue-300"
                        >
                          👤 Mon profil
                        </button>

                        <button
                          onClick={() => {
                            navigate("/mes-annonces");
                            setOpen(false);
                          }}
                          className="block w-full text-left px-5 py-4 text-gray-900 hover:bg-gray-50 transition font-extrabold focus:outline-none focus:ring-4 focus:ring-blue-300"
                        >
                          📌 Mes annonces
                        </button>

                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-5 py-4 text-red-700 hover:bg-gray-50 transition font-extrabold focus:outline-none focus:ring-4 focus:ring-red-200"
                        >
                          🚪 Déconnexion
                        </button>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </div>
          </nav>
        )}

        <main className="max-w-6xl mx-auto p-6">
          <AppRoutes />
        </main>

        {/* 🔵 Bouton global mode senior */}
        {isAuthenticated && <SeniorToggle />}

        {/* ❓ Aide toujours visible */}
        <HelpWidget />
      </div>
    </ToastProvider>
  );
}

export default App;
