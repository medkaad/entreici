import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../api/api";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    username: "",
    first_name: "",
    last_name: "",
    password: "",
    ville: "",
    quartier: "",
  });

  const [error, setError] = useState("");

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    try {
      await registerUser(form);
      navigate("/login");
    } catch (err) {
      console.error(err);
      setError("Erreur lors de l'inscription. Vérifiez les champs.");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100">
      
      <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-lg">

        <h2 className="text-3xl font-bold text-center mb-2 text-blue-600">
          Créer un compte
        </h2>

        <p className="text-center text-gray-500 mb-6 text-sm">
          Rejoignez la communauté locale
        </p>

        {error && (
          <div className="bg-red-100 text-red-600 p-3 rounded mb-4 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Prénom */}
          <input
            name="first_name"
            type="text"
            placeholder="Prénom"
            required
            value={form.first_name}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
          />

          {/* Nom */}
          <input
            name="last_name"
            type="text"
            placeholder="Nom"
            required
            value={form.last_name}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
          />

          {/* Email */}
          <input
            name="email"
            type="email"
            placeholder="Email"
            required
            value={form.email}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
          />

          {/* Username */}
          <input
            name="username"
            type="text"
            placeholder="Nom d'utilisateur"
            required
            value={form.username}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
          />

          {/* Password */}
          <input
            name="password"
            type="password"
            placeholder="Mot de passe"
            required
            value={form.password}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
          />

          {/* Ville */}
          <input
            name="ville"
            type="text"
            placeholder="Ville (ex: Villemomble)"
            required
            value={form.ville}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
          />

          {/* Quartier */}
          <input
            name="quartier"
            type="text"
            placeholder="Quartier"
            required
            value={form.quartier}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
          />

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
          >
            S'inscrire
          </button>

        </form>

        <p className="mt-6 text-center text-sm">
          Déjà un compte ?{" "}
          <Link
            to="/login"
            className="text-blue-600 font-semibold hover:underline"
          >
            Se connecter
          </Link>
        </p>

      </div>
    </div>
  );
}

export default Register;
