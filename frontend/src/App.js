import { useState } from "react";
import Login from "./Login";

function App() {
  const [isAuth, setIsAuth] = useState(
    !!localStorage.getItem("access_token")
  );

  if (!isAuth) {
    return <Login onLogin={() => setIsAuth(true)} />;
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>EntreIci</h1>
      <p>Connecté 🎉</p>
    </div>
  );
}

export default App;
