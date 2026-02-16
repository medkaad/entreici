import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMe, updateMe, changePassword, logout } from "../api/api";
import { useToast } from "../ui/Toast";

/** Petit helper pour message d'erreur */
function extractApiError(err) {
  const msg = err?.message;
  if (msg && msg !== "Erreur API") return msg;
  return "Une erreur est survenue.";
}

function Profile() {
  const navigate = useNavigate();
  const toast = useToast();

  const [user, setUser] = useState(null);

  // Profil edit
  const [formData, setFormData] = useState({});
  const [initialData, setInitialData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Password
  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [passwordMsg, setPasswordMsg] = useState(null);
  const [passwordErr, setPasswordErr] = useState(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // -------------------------
  // LOAD PROFILE
  // -------------------------
  async function loadProfile({ silent = false } = {}) {
    try {
      if (!silent) {
        setLoading(true);
        setError(null);
        setSuccess(null);
      }

      const data = await getMe();
      setUser(data);

      const formatted = {
        first_name: data.first_name || "",
        last_name: data.last_name || "",
        username: data.username || "",
        ville: data.ville || "",
        quartier: data.quartier || "",
        description: data.description || "",
      };

      setFormData(formatted);
      setInitialData(formatted);
      setIsDirty(false);

      setError(null);
    } catch (err) {
      console.error(err);
      setError("Impossible de charger le profil.");
      toast.error("Erreur : profil non chargé.");
    } finally {
      if (!silent) setLoading(false);
    }
  }

  useEffect(() => {
    loadProfile({ silent: true }).finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // -------------------------
  // PROFILE HANDLERS
  // -------------------------
  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setIsDirty(true);
    setSuccess(null);
    setError(null);
  }

  function handleCancelEdit() {
    setFormData(initialData);
    setIsEditing(false);
    setIsDirty(false);
    setSuccess(null);
    setError(null);
    toast.info("Modifications annulées.");
  }

  async function handleSave() {
    setError(null);
    setSuccess(null);

    // mini validation
    if (!formData.username?.trim()) {
      const m = "Le nom d'utilisateur est obligatoire.";
      setError(m);
      toast.info(m);
      return;
    }
    if (!formData.first_name?.trim()) {
      const m = "Le prénom est obligatoire.";
      setError(m);
      toast.info(m);
      return;
    }
    if (!formData.last_name?.trim()) {
      const m = "Le nom est obligatoire.";
      setError(m);
      toast.info(m);
      return;
    }

    if (!isDirty) {
      setSuccess("Aucune modification à enregistrer.");
      toast.info("Aucune modification.");
      return;
    }

    try {
      setIsSaving(true);
      await updateMe(formData);
      await loadProfile({ silent: true });
      setIsEditing(false);

      setSuccess("Profil mis à jour avec succès ✅");
      toast.success("Profil mis à jour ✅");

      window.setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error(err);
      const m = extractApiError(err) || "Erreur lors de la mise à jour.";
      setError(m);
      toast.error(m);
    } finally {
      setIsSaving(false);
    }
  }

  // -------------------------
  // PASSWORD VALIDATION
  // -------------------------
  const passwordRules = useMemo(() => {
    const p = passwordData.new_password || "";
    return {
      length: p.length >= 8,
      number: /\d/.test(p),
      uppercase: /[A-Z]/.test(p),
      lowercase: /[a-z]/.test(p),
      special: /[^A-Za-z0-9]/.test(p),
      match: p.length > 0 && p === (passwordData.confirm_password || ""),
    };
  }, [passwordData.new_password, passwordData.confirm_password]);

  const isPasswordValid = Object.values(passwordRules).every(Boolean);

  const ruleRow = (ok, label) => (
    <div className="flex items-center gap-2 text-base font-semibold">
      <span className={`inline-flex w-7 h-7 items-center justify-center rounded-full border-2 ${ok ? "bg-green-50 border-green-300" : "bg-gray-50 border-gray-200"}`}>
        {ok ? "✓" : "•"}
      </span>
      <span className={ok ? "text-green-700" : "text-gray-600"}>{label}</span>
    </div>
  );

  function handlePasswordChange(e) {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    setPasswordMsg(null);
    setPasswordErr(null);
  }

  // -------------------------
  // CHANGE PASSWORD (logout + redirect)
  // -------------------------
  async function handlePasswordSave() {
    setPasswordMsg(null);
    setPasswordErr(null);

    if (!passwordData.current_password) {
      const m = "Mot de passe actuel obligatoire.";
      setPasswordErr(m);
      toast.info(m);
      return;
    }
    if (!isPasswordValid) {
      const m = "Le nouveau mot de passe ne respecte pas les règles.";
      setPasswordErr(m);
      toast.error(m);
      return;
    }

    try {
      setIsChangingPassword(true);

      await changePassword({
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
      });

      setPasswordMsg("Mot de passe changé ✅ Déconnexion...");
      toast.success("Mot de passe changé ✅");

      logout();
      navigate("/login", { replace: true });
    } catch (err) {
      console.error(err);
      const m = extractApiError(err) || "Mot de passe actuel incorrect.";
      setPasswordErr(m);
      toast.error(m);
    } finally {
      setIsChangingPassword(false);
    }
  }

  // -------------------------
  // HELPERS
  // -------------------------
  const getInitial = () => {
    if (!user?.first_name) return "?";
    return user.first_name.charAt(0).toUpperCase();
  };

  // -------------------------
  // STATES
  // -------------------------
  if (loading) {
    return (
      <div className="bg-white p-8 rounded-3xl shadow text-center text-gray-700 text-lg senior-card">
        ⏳ Chargement du profil...
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="bg-red-50 text-red-700 border border-red-200 p-6 rounded-3xl text-center text-lg senior-card">
        ❌ {error}
      </div>
    );
  }

  if (!user) return null;

  // -------------------------
  // UI
  // -------------------------
  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-8">
      <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden senior-card">

        {/* HEADER */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-8 text-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-white text-blue-700 flex items-center justify-center text-4xl font-extrabold shadow-md">
                {getInitial()}
              </div>

              <div className="min-w-0">
                {!isEditing ? (
                  <h2 className="text-3xl font-extrabold break-words">
                    {user.first_name} {user.last_name}
                  </h2>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      className="p-4 rounded-2xl text-gray-900 text-lg focus:outline-none focus:ring-4 focus:ring-blue-200"
                      placeholder="Prénom"
                    />
                    <input
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      className="p-4 rounded-2xl text-gray-900 text-lg focus:outline-none focus:ring-4 focus:ring-blue-200"
                      placeholder="Nom"
                    />
                  </div>
                )}

                {!isEditing ? (
                  <p className="mt-3 text-blue-100 text-lg font-semibold">
                    📍 {user.ville || "Ville non renseignée"}{" "}
                    {user.quartier && `- ${user.quartier}`}
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                    <input
                      name="ville"
                      value={formData.ville}
                      onChange={handleChange}
                      placeholder="Ville"
                      className="p-4 rounded-2xl text-gray-900 text-lg focus:outline-none focus:ring-4 focus:ring-blue-200"
                    />
                    <input
                      name="quartier"
                      value={formData.quartier}
                      onChange={handleChange}
                      placeholder="Quartier"
                      className="p-4 rounded-2xl text-gray-900 text-lg focus:outline-none focus:ring-4 focus:ring-blue-200"
                    />
                  </div>
                )}

                <div className="flex items-center gap-3 mt-4 flex-wrap text-base font-semibold">
                  <span className="bg-white/15 px-4 py-2 rounded-full">
                    ⭐ {user.score?.toFixed(1) || "0.0"} ({user.total_reviews || 0} avis)
                  </span>
                  <span className="bg-white text-blue-700 px-4 py-2 rounded-full font-extrabold">
                    {user.badge || "Nouveau"}
                  </span>
                  {user.is_verified && (
                    <span className="bg-green-500 px-4 py-2 rounded-full text-white font-extrabold">
                      Vérifié ✔
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            {!isEditing ? (
              <button
                onClick={() => {
                  setIsEditing(true);
                  setSuccess(null);
                  setError(null);
                  toast.info("Mode modification activé.");
                }}
                className="bg-white text-blue-700 px-6 py-4 rounded-3xl font-extrabold text-lg hover:bg-blue-50 transition focus:outline-none focus:ring-4 focus:ring-blue-200"
              >
                ✏ Modifier
              </button>
            ) : (
              <button
                onClick={handleCancelEdit}
                className="bg-white text-blue-700 px-6 py-4 rounded-3xl font-extrabold text-lg hover:bg-blue-50 transition focus:outline-none focus:ring-4 focus:ring-blue-200"
              >
                Annuler
              </button>
            )}
          </div>
        </div>

        {/* BODY */}
        <div className="p-8 grid md:grid-cols-2 gap-8">
          {/* Account Info */}
          <div>
            <h3 className="text-2xl font-extrabold mb-4 text-gray-900">
              Informations du compte
            </h3>

            <div className="space-y-5">
              <div>
                <label className="block text-base font-extrabold text-gray-900 mb-2">
                  Email
                </label>
                <div className="p-4 bg-gray-100 rounded-3xl text-lg font-semibold text-gray-900">
                  {user.email}
                </div>
              </div>

              <div>
                <label className="block text-base font-extrabold text-gray-900 mb-2">
                  Nom d'utilisateur
                </label>

                {isEditing ? (
                  <input
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="p-4 bg-gray-100 rounded-3xl w-full text-lg border-2 border-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-200"
                    placeholder="Username"
                  />
                ) : (
                  <div className="p-4 bg-gray-100 rounded-3xl text-lg font-semibold text-gray-900">
                    {user.username}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-base font-extrabold text-gray-900 mb-2">
                  Description
                </label>

                {isEditing ? (
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={5}
                    className="p-4 bg-gray-100 rounded-3xl w-full text-lg border-2 border-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-200"
                    placeholder="Présente-toi..."
                  />
                ) : (
                  <div className="p-4 bg-gray-100 rounded-3xl min-h-[120px] text-lg font-semibold text-gray-900">
                    {user.description || "Aucune description"}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-base font-extrabold text-gray-900 mb-2">
                  Rôle
                </label>
                <div className="p-4 bg-gray-100 rounded-3xl capitalize text-lg font-semibold text-gray-900">
                  {user.role}
                </div>
              </div>
            </div>
          </div>

          {/* Trust */}
          <div>
            <h3 className="text-2xl font-extrabold mb-4 text-gray-900">
              Réputation & Confiance
            </h3>

            <div className="space-y-5">
              <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100">
                <p className="text-base text-gray-700 font-semibold">Score moyen</p>
                <p className="text-4xl font-extrabold text-blue-700 mt-2">
                  {user.score?.toFixed(1) || "0.0"} ⭐
                </p>
                <p className="text-base text-gray-700 font-semibold mt-2">
                  Basé sur {user.total_reviews || 0} avis
                </p>
              </div>

              <div className="p-6 bg-gray-50 rounded-3xl border border-gray-200">
                <p className="text-base text-gray-700 font-semibold">Badge actuel</p>
                <p className="text-2xl font-extrabold text-gray-900 mt-2">
                  {user.badge || "Nouveau"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* SAVE BUTTON */}
        {isEditing && (
          <div className="p-6 border-t flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="text-base font-semibold text-gray-700">
              {isDirty ? "Modifications non enregistrées" : "Aucune modification"}
            </div>

            <button
              disabled={!isDirty || isSaving}
              onClick={handleSave}
              className={`px-7 py-4 rounded-3xl font-extrabold text-lg text-white transition focus:outline-none focus:ring-4 focus:ring-blue-200
                ${(!isDirty || isSaving)
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-700 hover:bg-blue-800"
                }`}
            >
              {isSaving ? "Enregistrement..." : "✅ Enregistrer"}
            </button>
          </div>
        )}

        {/* SUCCESS / ERROR */}
        {success && (
          <div className="p-5 text-green-700 text-center text-lg font-extrabold">
            ✅ {success}
          </div>
        )}
        {error && (
          <div className="p-5 text-red-700 text-center text-lg font-extrabold">
            ❌ {error}
          </div>
        )}

        {/* CHANGE PASSWORD */}
        <div className="p-8 border-t">
          <h3 className="text-2xl font-extrabold mb-4 text-gray-900">
            🔒 Changer le mot de passe
          </h3>

          <div className="grid md:grid-cols-2 gap-5">
            {/* Current */}
            <div>
              <label className="block text-base font-extrabold text-gray-900 mb-2">
                Mot de passe actuel
              </label>
              <div className="flex gap-2">
                <input
                  type={showCurrent ? "text" : "password"}
                  name="current_password"
                  placeholder="Mot de passe actuel"
                  value={passwordData.current_password}
                  onChange={handlePasswordChange}
                  className="p-4 bg-gray-100 rounded-3xl w-full text-lg border-2 border-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-200"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent((v) => !v)}
                  className="px-5 py-4 rounded-3xl bg-gray-200 text-gray-900 font-extrabold focus:outline-none focus:ring-4 focus:ring-blue-200"
                >
                  {showCurrent ? "🙈" : "👁"}
                </button>
              </div>
            </div>

            {/* New */}
            <div>
              <label className="block text-base font-extrabold text-gray-900 mb-2">
                Nouveau mot de passe
              </label>
              <div className="flex gap-2">
                <input
                  type={showNew ? "text" : "password"}
                  name="new_password"
                  placeholder="Nouveau mot de passe"
                  value={passwordData.new_password}
                  onChange={handlePasswordChange}
                  className="p-4 bg-gray-100 rounded-3xl w-full text-lg border-2 border-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-200"
                />
                <button
                  type="button"
                  onClick={() => setShowNew((v) => !v)}
                  className="px-5 py-4 rounded-3xl bg-gray-200 text-gray-900 font-extrabold focus:outline-none focus:ring-4 focus:ring-blue-200"
                >
                  {showNew ? "🙈" : "👁"}
                </button>
              </div>
            </div>

            {/* Confirm */}
            <div className="md:col-span-2">
              <label className="block text-base font-extrabold text-gray-900 mb-2">
                Confirmer le nouveau mot de passe
              </label>
              <div className="flex gap-2">
                <input
                  type={showConfirm ? "text" : "password"}
                  name="confirm_password"
                  placeholder="Confirmer le nouveau mot de passe"
                  value={passwordData.confirm_password}
                  onChange={handlePasswordChange}
                  className="p-4 bg-gray-100 rounded-3xl w-full text-lg border-2 border-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-200"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="px-5 py-4 rounded-3xl bg-gray-200 text-gray-900 font-extrabold focus:outline-none focus:ring-4 focus:ring-blue-200"
                >
                  {showConfirm ? "🙈" : "👁"}
                </button>
              </div>
            </div>
          </div>

          {/* Rules */}
          <div className="mt-5 space-y-2">
            {ruleRow(passwordRules.length, "8 caractères minimum")}
            {ruleRow(passwordRules.uppercase, "1 majuscule")}
            {ruleRow(passwordRules.lowercase, "1 minuscule")}
            {ruleRow(passwordRules.number, "1 chiffre")}
            {ruleRow(passwordRules.special, "1 caractère spécial")}
            {ruleRow(passwordRules.match, "Les mots de passe correspondent")}
          </div>

          <div className="mt-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="text-base font-semibold">
              {passwordErr && <span className="text-red-700">❌ {passwordErr}</span>}
              {!passwordErr && passwordMsg && <span className="text-green-700">✅ {passwordMsg}</span>}
            </div>

            <button
              disabled={!isPasswordValid || isChangingPassword}
              onClick={handlePasswordSave}
              className={`px-7 py-4 rounded-3xl font-extrabold text-lg text-white transition focus:outline-none focus:ring-4 focus:ring-blue-200
                ${(!isPasswordValid || isChangingPassword)
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-700 hover:bg-blue-800"
                }`}
            >
              {isChangingPassword ? "Mise à jour..." : "✅ Mettre à jour le mot de passe"}
            </button>
          </div>

          <div className="mt-6 p-5 rounded-3xl bg-gray-50 border border-gray-200">
            <p className="text-base text-gray-800 font-semibold">
              Après changement du mot de passe, vous serez déconnecté(e) pour votre sécurité.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Profile;
