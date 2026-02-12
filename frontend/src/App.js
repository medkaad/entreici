import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import AppRoutes from "./routes/AppRoutes";

function App() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {isAuthenticated && (
        <nav className="bg-white shadow-md">
          <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-blue-600">
              EntreIci
            </h1>

            <div className="flex items-center space-x-6">
              <Link to="/" className="text-gray-600 hover:text-blue-600">
                Annonces
              </Link>

              <Link
                to="/conversations"
                className="text-gray-600 hover:text-blue-600"
              >
                Conversations
              </Link>

              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
              >
                Logout
              </button>
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
