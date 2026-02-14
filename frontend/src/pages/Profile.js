import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMe, updateMe, changePassword, logout } from "../api/api";

/** Petit helper pour message d'erreur */
function extractApiError(err) {
  const msg = err?.message;
  if (msg && msg !== "Erreur API") return msg;
  return "Une erreur est survenue.";
}

function Profile() {
  const navigate = useNavigate();

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
  async function loadProfile() {
    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProfile();
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
  }

  async function handleSave() {
    setError(null);
    setSuccess(null);

    // mini validation
    if (!formData.username?.trim()) {
      setError("Le nom d'utilisateur est obligatoire.");
      return;
    }
    if (!formData.first_name?.trim()) {
      setError("Le prénom est obligatoire.");
      return;
    }
    if (!formData.last_name?.trim()) {
      setError("Le nom est obligatoire.");
      return;
    }

    if (!isDirty) {
      setSuccess("Aucune modification à enregistrer.");
      return;
    }

    try {
      setIsSaving(true);
      await updateMe(formData);
      await loadProfile();
      setIsEditing(false);

      setSuccess("Profil mis à jour avec succès !");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error(err);
      setError(extractApiError(err) || "Erreur lors de la mise à jour.");
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
  const ruleStyle = (ok) => (ok ? "text-green-600" : "text-gray-400");

  function handlePasswordChange(e) {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    setPasswordMsg(null);
    setPasswordErr(null);
  }

  // -------------------------
  // CHANGE PASSWORD (Option A: logout + redirect)
  // -------------------------
  async function handlePasswordSave() {
    setPasswordMsg(null);
    setPasswordErr(null);

    if (!passwordData.current_password) {
      setPasswordErr("Mot de passe actuel obligatoire.");
      return;
    }
    if (!isPasswordValid) {
      setPasswordErr("Le nouveau mot de passe ne respecte pas les règles.");
      return;
    }

    try {
      setIsChangingPassword(true);

      await changePassword({
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
      });

      // ✅ Option A : forcer la déconnexion
      setPasswordMsg("Mot de passe changé ✅ Déconnexion...");
      logout();
      navigate("/login", { replace: true });
    } catch (err) {
      console.error(err);
      setPasswordErr(extractApiError(err) || "Mot de passe actuel incorrect.");
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
      <div className="p-10 text-gray-500 text-center">
        Chargement du profil...
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="p-10 text-red-600 text-center">
        {error}
      </div>
    );
  }

  // -------------------------
  // UI
  // -------------------------
  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">

        {/* HEADER */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-8 text-white">
          <div className="flex items-center justify-between">

            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-white text-blue-600 flex items-center justify-center text-4xl font-bold shadow-md">
                {getInitial()}
              </div>

              <div>
                {isEditing ? (
                  <div className="flex gap-2">
                    <input
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      className="p-2 rounded text-black w-40"
                      placeholder="Prénom"
                    />
                    <input
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      className="p-2 rounded text-black w-40"
                      placeholder="Nom"
                    />
                  </div>
                ) : (
                  <h2 className="text-2xl font-bold">
                    {user.first_name} {user.last_name}
                  </h2>
                )}

                {/* Location */}
                {isEditing ? (
                  <div className="flex gap-2 mt-2">
                    <input
                      name="ville"
                      value={formData.ville}
                      onChange={handleChange}
                      placeholder="Ville"
                      className="p-2 rounded text-black w-40"
                    />
                    <input
                      name="quartier"
                      value={formData.quartier}
                      onChange={handleChange}
                      placeholder="Quartier"
                      className="p-2 rounded text-black w-40"
                    />
                  </div>
                ) : (
                  <p className="mt-2 text-blue-100">
                    📍 {user.ville || "Ville non renseignée"}{" "}
                    {user.quartier && `- ${user.quartier}`}
                  </p>
                )}

                <div className="flex items-center gap-4 mt-3 text-sm">
                  <span>
                    ⭐ {user.score?.toFixed(1) || "0.0"} ({user.total_reviews || 0} avis)
                  </span>
                  <span className="bg-white text-blue-600 px-3 py-1 rounded-full font-medium">
                    {user.badge || "Nouveau"}
                  </span>
                  {user.is_verified && (
                    <span className="bg-green-500 px-3 py-1 rounded-full text-xs font-semibold">
                      Vérifié ✔
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Edit / Cancel */}
            {!isEditing ? (
              <button
                onClick={() => {
                  setIsEditing(true);
                  setSuccess(null);
                  setError(null);
                }}
                className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold"
              >
                Modifier
              </button>
            ) : (
              <button
                onClick={handleCancelEdit}
                className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold"
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
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              Informations du compte
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-500 text-sm mb-1">Email</label>
                <div className="p-3 bg-gray-100 rounded-lg">{user.email}</div>
              </div>

              <div>
                <label className="block text-gray-500 text-sm mb-1">
                  Nom d'utilisateur
                </label>

                {isEditing ? (
                  <input
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="p-3 bg-gray-100 rounded-lg w-full"
                    placeholder="Username"
                  />
                ) : (
                  <div className="p-3 bg-gray-100 rounded-lg">{user.username}</div>
                )}
              </div>

              <div>
                <label className="block text-gray-500 text-sm mb-1">
                  Description
                </label>

                {isEditing ? (
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    className="p-3 bg-gray-100 rounded-lg w-full"
                    placeholder="Présente-toi..."
                  />
                ) : (
                  <div className="p-3 bg-gray-100 rounded-lg min-h-[100px]">
                    {user.description || "Aucune description"}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-gray-500 text-sm mb-1">Rôle</label>
                <div className="p-3 bg-gray-100 rounded-lg capitalize">{user.role}</div>
              </div>
            </div>
          </div>

          {/* Trust */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              Réputation & Confiance
            </h3>

            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                <p className="text-sm text-gray-600">Score moyen</p>
                <p className="text-2xl font-bold text-blue-600">
                  {user.score?.toFixed(1) || "0.0"} ⭐
                </p>
                <p className="text-sm text-gray-500">
                  Basé sur {user.total_reviews || 0} avis
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl border">
                <p className="text-sm text-gray-600">Badge actuel</p>
                <p className="text-lg font-semibold text-gray-800">
                  {user.badge || "Nouveau"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* SAVE BUTTON */}
        {isEditing && (
          <div className="p-6 border-t flex items-center justify-between gap-4">
            <div className="text-sm text-gray-500">
              {isDirty ? "Modifications non enregistrées" : "Aucune modification"}
            </div>

            <button
              disabled={!isDirty || isSaving}
              onClick={handleSave}
              className={`px-6 py-3 rounded-lg font-semibold text-white transition
                ${(!isDirty || isSaving)
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
                }`}
            >
              {isSaving ? "Enregistrement..." : "Enregistrer les modifications"}
            </button>
          </div>
        )}

        {/* SUCCESS / ERROR */}
        {success && <div className="p-4 text-green-600 text-center">{success}</div>}
        {error && user && <div className="p-4 text-red-600 text-center">{error}</div>}

        {/* CHANGE PASSWORD */}
        <div className="p-8 border-t">
          <h3 className="text-lg font-semibold mb-4">Changer le mot de passe</h3>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Current */}
            <div>
              <label className="block text-gray-500 text-sm mb-1">
                Mot de passe actuel
              </label>
              <div className="flex gap-2">
                <input
                  type={showCurrent ? "text" : "password"}
                  name="current_password"
                  placeholder="Mot de passe actuel"
                  value={passwordData.current_password}
                  onChange={handlePasswordChange}
                  className="p-3 bg-gray-100 rounded-lg w-full"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent((v) => !v)}
                  className="px-3 py-2 rounded-lg bg-gray-200 text-gray-700"
                >
                  {showCurrent ? "🙈" : "👁"}
                </button>
              </div>
            </div>

            {/* New */}
            <div>
              <label className="block text-gray-500 text-sm mb-1">
                Nouveau mot de passe
              </label>
              <div className="flex gap-2">
                <input
                  type={showNew ? "text" : "password"}
                  name="new_password"
                  placeholder="Nouveau mot de passe"
                  value={passwordData.new_password}
                  onChange={handlePasswordChange}
                  className="p-3 bg-gray-100 rounded-lg w-full"
                />
                <button
                  type="button"
                  onClick={() => setShowNew((v) => !v)}
                  className="px-3 py-2 rounded-lg bg-gray-200 text-gray-700"
                >
                  {showNew ? "🙈" : "👁"}
                </button>
              </div>
            </div>

            {/* Confirm */}
            <div className="md:col-span-2">
              <label className="block text-gray-500 text-sm mb-1">
                Confirmer le nouveau mot de passe
              </label>
              <div className="flex gap-2">
                <input
                  type={showConfirm ? "text" : "password"}
                  name="confirm_password"
                  placeholder="Confirmer le nouveau mot de passe"
                  value={passwordData.confirm_password}
                  onChange={handlePasswordChange}
                  className="p-3 bg-gray-100 rounded-lg w-full"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="px-3 py-2 rounded-lg bg-gray-200 text-gray-700"
                >
                  {showConfirm ? "🙈" : "👁"}
                </button>
              </div>
            </div>
          </div>

          {/* Rules */}
          <div className="mt-4 text-sm space-y-1">
            <p className={ruleStyle(passwordRules.length)}>• 8 caractères minimum</p>
            <p className={ruleStyle(passwordRules.uppercase)}>• 1 majuscule</p>
            <p className={ruleStyle(passwordRules.lowercase)}>• 1 minuscule</p>
            <p className={ruleStyle(passwordRules.number)}>• 1 chiffre</p>
            <p className={ruleStyle(passwordRules.special)}>• 1 caractère spécial</p>
            <p className={ruleStyle(passwordRules.match)}>• Les mots de passe correspondent</p>
          </div>

          <div className="mt-5 flex items-center justify-between gap-4">
            <div className="text-sm">
              {passwordErr && <span className="text-red-600">{passwordErr}</span>}
              {!passwordErr && passwordMsg && <span className="text-green-600">{passwordMsg}</span>}
            </div>

            <button
              disabled={!isPasswordValid || isChangingPassword}
              onClick={handlePasswordSave}
              className={`px-6 py-3 rounded-lg font-semibold text-white transition
                ${(!isPasswordValid || isChangingPassword)
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
                }`}
            >
              {isChangingPassword ? "Mise à jour..." : "Mettre à jour le mot de passe"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Profile;
