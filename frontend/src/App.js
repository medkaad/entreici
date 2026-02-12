import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import AppRoutes from "./routes/AppRoutes";
import { useState, useRef, useEffect } from "react";

function App() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Fermer dropdown si click outside
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">

      {isAuthenticated && (
        <nav className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200 sticky top-0 z-50">
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
                  <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold hover:scale-105 transition">
                    M
                  </div>
                </button>

                {open && (
                  <div className="absolute right-0 mt-3 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 animate-fadeIn">
                    
                    <button
                      onClick={() => {
                        navigate("/profile");
                        setOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 transition"
                    >
                      Mon profil
                    </button>

                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-red-500 hover:bg-gray-100 transition"
                    >
                      Déconnexion
                    </button>

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
