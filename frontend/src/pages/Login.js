import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api/api";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const data = await login(email, password);
      localStorage.setItem("access_token", data.access);
      navigate("/");
    } catch {
      setError("Email ou mot de passe incorrect");
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Connexion</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <br />

      <input
        type="password"
        placeholder="Mot de passe"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <br />

      <button type="submit">Se connecter</button>
    </form>
  );
}

export default Login;
