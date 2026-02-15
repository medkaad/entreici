import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import AppRoutes from "./routes/AppRoutes";
import { useState, useRef, useEffect } from "react";
import { getMe } from "./api/api";

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
      ? "text-blue-600 font-semibold border-b-2 border-blue-600 pb-1"
      : "text-gray-600 hover:text-blue-600 transition";

  const getInitial = () => {
    if (!user?.first_name) return "?";
    return user.first_name.charAt(0).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">

      {isAuthenticated && (
        <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
            
            {/* LOGO */}
            <h1
              onClick={() => navigate("/")}
              className="text-2xl font-extrabold text-blue-600 cursor-pointer tracking-tight hover:opacity-80 transition"
            >
              EntreIci
            </h1>

            {/* NAV LINKS */}
            <div className="flex items-center gap-8 text-sm md:text-base">
              
              <NavLink to="/" className={navLinkClass}>
                Annonces
              </NavLink>

              <NavLink to="/conversations" className={navLinkClass}>
                Conversations
              </NavLink>

              <NavLink to="/mes-annonces" className={navLinkClass}>
                Mes annonces
              </NavLink>

              {/* PROFILE DROPDOWN */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setOpen(!open)}
                  className="flex items-center gap-2 focus:outline-none"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg hover:scale-105 transition">
                    {getInitial()}
                  </div>
                </button>

                {open && (
                  <div className="absolute right-0 mt-3 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 py-4">

                    {/* USER INFO */}
                    <div className="px-5 pb-4 border-b border-gray-100">
                      <p className="font-semibold text-gray-900 text-base">
                        {user?.first_name} {user?.last_name}
                      </p>

                      <p className="text-sm text-gray-500 mt-1">
                        📍 {user?.ville || "Ville non renseignée"}
                      </p>

                      <p className="text-sm text-gray-500 mt-1">
                        ⭐ {user?.score?.toFixed(1) || "0.0"} ({user?.total_reviews || 0} avis)
                      </p>

                      <p className="text-xs mt-3 inline-block bg-blue-100 text-blue-600 px-3 py-1 rounded-full font-medium">
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
                        className="block w-full text-left px-5 py-2 text-gray-700 hover:bg-gray-50 transition"
                      >
                        Mon profil
                      </button>

                      <button
                        onClick={() => {
                          navigate("/mes-annonces");
                          setOpen(false);
                        }}
                        className="block w-full text-left px-5 py-2 text-gray-700 hover:bg-gray-50 transition"
                      >
                        Mes annonces
                      </button>

                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-5 py-2 text-red-500 hover:bg-gray-50 transition"
                      >
                        Déconnexion
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
    </div>
  );
}

export default App;
