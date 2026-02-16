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
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
    setError("");
  }

  function validate() {
    if (!form.first_name.trim()) return "Merci d’indiquer votre prénom.";
    if (!form.last_name.trim()) return "Merci d’indiquer votre nom.";
    if (!form.email.trim()) return "Merci d’indiquer votre email.";
    if (!form.password) return "Merci de choisir un mot de passe.";
    if (form.password.length < 8) return "Le mot de passe doit faire au moins 8 caractères.";
    if (!form.ville.trim()) return "Merci d’indiquer votre ville.";
    if (!form.quartier.trim()) return "Merci d’indiquer votre quartier.";
    if (!form.username.trim()) return "Merci d’indiquer un nom d’utilisateur.";
    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const err = validate();
    if (err) {
      setError(err);
      return;
    }

    try {
      setLoading(true);
      await registerUser({
        ...form,
        email: form.email.trim(),
        username: form.username.trim(),
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        ville: form.ville.trim(),
        quartier: form.quartier.trim(),
      });
      navigate("/login");
    } catch (err) {
      console.error(err);
      setError("Impossible de créer le compte. Vérifiez les informations.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100 px-4 py-10">
      <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl w-full max-w-xl border border-gray-100 senior-card">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center text-blue-700 mb-2">
          Créer un compte
        </h2>

        <p className="text-center text-gray-700 mb-8 text-lg font-semibold">
          Rejoignez votre communauté locale
        </p>

        {error && (
          <div className="bg-red-50 text-red-700 border-2 border-red-200 p-5 rounded-3xl mb-6 text-lg font-extrabold">
            ❌ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Prénom */}
          <div>
            <label className="block text-gray-900 font-extrabold mb-2 text-lg">
              Prénom
            </label>
            <input
              name="first_name"
              placeholder="Ex : Marie"
              value={form.first_name}
              onChange={handleChange}
              className="w-full border-2 border-gray-300 rounded-3xl px-5 py-4 text-lg focus:outline-none focus:ring-4 focus:ring-blue-200"
              autoComplete="given-name"
            />
          </div>

          {/* Nom */}
          <div>
            <label className="block text-gray-900 font-extrabold mb-2 text-lg">
              Nom
            </label>
            <input
              name="last_name"
              placeholder="Ex : Dupont"
              value={form.last_name}
              onChange={handleChange}
              className="w-full border-2 border-gray-300 rounded-3xl px-5 py-4 text-lg focus:outline-none focus:ring-4 focus:ring-blue-200"
              autoComplete="family-name"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-gray-900 font-extrabold mb-2 text-lg">
              Email
            </label>
            <input
              name="email"
              type="email"
              placeholder="exemple@email.com"
              value={form.email}
              onChange={handleChange}
              className="w-full border-2 border-gray-300 rounded-3xl px-5 py-4 text-lg focus:outline-none focus:ring-4 focus:ring-blue-200"
              autoComplete="email"
            />
          </div>

          {/* Username */}
          <div>
            <label className="block text-gray-900 font-extrabold mb-2 text-lg">
              Nom d’utilisateur
            </label>
            <input
              name="username"
              placeholder="Ex : marie75"
              value={form.username}
              onChange={handleChange}
              className="w-full border-2 border-gray-300 rounded-3xl px-5 py-4 text-lg focus:outline-none focus:ring-4 focus:ring-blue-200"
              autoComplete="username"
            />
            <p className="text-base text-gray-700 mt-3 font-semibold">
              Ce nom sera visible par les autres utilisateurs.
            </p>
          </div>

          {/* Password */}
          <div>
            <label className="block text-gray-900 font-extrabold mb-2 text-lg">
              Mot de passe
            </label>
            <div className="flex gap-3">
              <input
                name="password"
                type={showPwd ? "text" : "password"}
                placeholder="Choisissez un mot de passe"
                value={form.password}
                onChange={handleChange}
                className="w-full border-2 border-gray-300 rounded-3xl px-5 py-4 text-lg focus:outline-none focus:ring-4 focus:ring-blue-200"
                autoComplete="new-password"
              />

              <button
                type="button"
                onClick={() => setShowPwd((v) => !v)}
                className="shrink-0 px-6 py-4 rounded-3xl border-2 border-gray-300 bg-gray-50 hover:bg-gray-100 text-gray-900 font-extrabold text-base focus:outline-none focus:ring-4 focus:ring-blue-200"
                aria-label={showPwd ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                title={showPwd ? "Masquer" : "Afficher"}
              >
                {showPwd ? "Masquer 🙈" : "Afficher 👁"}
              </button>
            </div>

            <div className="mt-3 p-4 rounded-3xl bg-gray-50 border-2 border-gray-200">
              <p className="text-base font-semibold text-gray-900">
                Conseil : utilisez au moins <b>8 caractères</b>.
              </p>
            </div>
          </div>

          {/* Ville */}
          <div>
            <label className="block text-gray-900 font-extrabold mb-2 text-lg">
              Ville
            </label>
            <input
              name="ville"
              placeholder="Ex : Villemomble"
              value={form.ville}
              onChange={handleChange}
              className="w-full border-2 border-gray-300 rounded-3xl px-5 py-4 text-lg focus:outline-none focus:ring-4 focus:ring-blue-200"
            />
          </div>

          {/* Quartier */}
          <div>
            <label className="block text-gray-900 font-extrabold mb-2 text-lg">
              Quartier
            </label>
            <input
              name="quartier"
              placeholder="Ex : Centre-ville"
              value={form.quartier}
              onChange={handleChange}
              className="w-full border-2 border-gray-300 rounded-3xl px-5 py-4 text-lg focus:outline-none focus:ring-4 focus:ring-blue-200"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-5 rounded-3xl font-extrabold text-lg transition shadow-md focus:outline-none focus:ring-4 focus:ring-blue-200 ${
              loading
                ? "bg-gray-400 text-white cursor-not-allowed"
                : "bg-blue-700 text-white hover:bg-blue-800"
            }`}
          >
            {loading ? "Création du compte..." : "✅ Créer mon compte"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-900 text-lg font-semibold">Déjà inscrit ?</p>

          <Link
            to="/login"
            className="inline-flex mt-3 items-center justify-center w-full py-5 rounded-3xl border-2 border-blue-700 text-blue-700 font-extrabold text-lg hover:bg-blue-50 transition focus:outline-none focus:ring-4 focus:ring-blue-200"
          >
            ↩ Se connecter
          </Link>
        </div>

        <div className="mt-6 p-6 rounded-3xl bg-gray-50 border-2 border-gray-200">
          <p className="text-base md:text-lg text-gray-900 font-semibold">
            En créant un compte, vous pourrez publier des annonces et discuter via la messagerie.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
