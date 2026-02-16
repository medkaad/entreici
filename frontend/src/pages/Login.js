import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Bonus seniors : prévenir si CapsLock activé
  const [capsLockOn, setCapsLockOn] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    function onKeyDown(e) {
      // Certains navigateurs: getModifierState
      if (typeof e.getModifierState === "function") {
        setCapsLockOn(e.getModifierState("CapsLock"));
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError("Merci de saisir votre email.");
      return;
    }
    if (!password) {
      setError("Merci de saisir votre mot de passe.");
      return;
    }

    try {
      setLoading(true);
      await login(email.trim(), password);
      navigate("/");
    } catch {
      setError("Email ou mot de passe incorrect.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100 px-4 py-10">
      <div className="bg-white shadow-xl rounded-3xl p-8 md:p-10 w-full max-w-xl border border-gray-100 senior-card">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center text-blue-700 mb-2">
          Connexion
        </h2>

        <p className="text-center text-gray-700 mb-8 text-lg font-semibold">
          Accédez à votre compte EntreIci
        </p>

        {error && (
          <div className="bg-red-50 text-red-700 border-2 border-red-200 p-5 rounded-3xl mb-6 text-lg font-extrabold">
            ❌ {error}
          </div>
        )}

        {capsLockOn && (
          <div className="bg-yellow-50 text-yellow-900 border-2 border-yellow-200 p-5 rounded-3xl mb-6 text-lg font-extrabold">
            ⚠ Attention : la touche <span className="underline">Caps Lock</span> est activée.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div>
            <label className="block text-gray-900 font-extrabold mb-2 text-lg">
              Email
            </label>
            <input
              type="email"
              placeholder="ex : nom@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full border-2 border-gray-300 rounded-3xl px-5 py-4 text-lg focus:outline-none focus:ring-4 focus:ring-blue-200"
            />
            <p className="text-base text-gray-700 mt-3 font-semibold">
              Astuce : vérifiez les majuscules/minuscules.
            </p>
          </div>

          {/* Password */}
          <div>
            <label className="block text-gray-900 font-extrabold mb-2 text-lg">
              Mot de passe
            </label>

            <div className="flex gap-3">
              <input
                type={showPwd ? "text" : "password"}
                placeholder="Votre mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full border-2 border-gray-300 rounded-3xl px-5 py-4 text-lg focus:outline-none focus:ring-4 focus:ring-blue-200"
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
            {loading ? "Connexion..." : "✅ Se connecter"}
          </button>
        </form>

        {/* Register link */}
        <div className="mt-8 text-center">
          <p className="text-gray-900 text-lg font-semibold">
            Pas encore de compte ?
          </p>

          <Link
            to="/register"
            className="inline-flex mt-3 items-center justify-center w-full py-5 rounded-3xl border-2 border-blue-700 text-blue-700 font-extrabold text-lg hover:bg-blue-50 transition focus:outline-none focus:ring-4 focus:ring-blue-200"
          >
            ➕ Créer un compte
          </Link>
        </div>

        {/* Help box */}
        <div className="mt-6 p-6 rounded-3xl bg-gray-50 border-2 border-gray-200">
          <p className="text-base md:text-lg text-gray-900 font-semibold">
            Besoin d’aide ? Si vous avez oublié votre mot de passe, contactez un administrateur (MVP).
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
