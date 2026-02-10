import { useState, useEffect } from "react";
import Login from "./Login";
import Annonces from "./Annonces";
import { getAnnonces } from "./api";

function App() {
  const [isAuth, setIsAuth] = useState(
    !!localStorage.getItem("access_token")
  );
  const [error, setError] = useState(null);

  // Vérification du token au chargement
  useEffect(() => {
    const checkAuth = async () => {
      try {
        await getAnnonces(); // appel API protégée
      } catch (err) {
        localStorage.removeItem("access_token");
        setIsAuth(false);
      }
    };

    if (isAuth) {
      checkAuth();
    }
  }, [isAuth]);

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("access_token");
    setIsAuth(false);
  };

  // Si non connecté → login
  if (!isAuth) {
    return <Login onLogin={() => setIsAuth(true)} />;
  }

  // Si connecté → app
  return (
    <div style={{ padding: 40 }}>
      <h1>EntreIci</h1>
      <p>Connecté 🎉</p>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Annonces + création */}
      <Annonces />

      <br />

      <button onClick={handleLogout}>Se déconnecter</button>
    </div>
  );
}

export default App;
