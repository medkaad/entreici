import { useEffect, useState } from "react";
import { getMe, updateMe, changePassword } from "../api/api";

function Profile() {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
  });

  const [passwordMsg, setPasswordMsg] = useState(null);

  // -------------------------
  // LOAD PROFILE
  // -------------------------
  async function loadProfile() {
    try {
      setLoading(true);
      const data = await getMe();

      setUser(data);

      setFormData({
        first_name: data.first_name || "",
        last_name: data.last_name || "",
        username: data.username || "",
        ville: data.ville || "",
        quartier: data.quartier || "",
        description: data.description || "",
      });

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
  // FORM HANDLERS
  // -------------------------
  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  function handlePasswordChange(e) {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  }

  // -------------------------
  // SAVE PROFILE
  // -------------------------
  async function handleSave() {
    setError(null);
    setSuccess(null);

    try {
      await updateMe(formData);

      await loadProfile(); // 🔥 recharge propre (évite bug email)
      setIsEditing(false);

      setSuccess("Profil mis à jour avec succès !");
    } catch (err) {
      console.error(err);
      setError("Erreur lors de la mise à jour.");
    }
  }

  // -------------------------
  // CHANGE PASSWORD
  // -------------------------
  async function handlePasswordSave() {
    setPasswordMsg(null);

    try {
      await changePassword(passwordData);

      setPasswordMsg("Mot de passe changé avec succès !");
      setPasswordData({ current_password: "", new_password: "" });
    } catch (err) {
      console.error(err);
      setPasswordMsg("Mot de passe actuel incorrect.");
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
                    <input name="first_name" value={formData.first_name} onChange={handleChange} className="p-2 rounded text-black"/>
                    <input name="last_name" value={formData.last_name} onChange={handleChange} className="p-2 rounded text-black"/>
                  </div>
                ) : (
                  <h2 className="text-2xl font-bold">
                    {user.first_name} {user.last_name}
                  </h2>
                )}

                <p className="mt-2 text-blue-100">
                  📍 {user.ville || "Ville non renseignée"} {user.quartier && `- ${user.quartier}`}
                </p>

                <div className="flex items-center gap-4 mt-3 text-sm">
                  <span>⭐ {user.score?.toFixed(1) || "0.0"} ({user.total_reviews || 0} avis)</span>
                  <span className="bg-white text-blue-600 px-3 py-1 rounded-full font-medium">
                    {user.badge || "Nouveau"}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsEditing(!isEditing)}
              className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold"
            >
              {isEditing ? "Annuler" : "Modifier"}
            </button>
          </div>
        </div>

        {/* BODY */}
        <div className="p-8 grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Informations du compte</h3>

            <label className="text-sm text-gray-500">Email</label>
            <div className="p-3 bg-gray-100 rounded-lg mb-4">
              {user.email}
            </div>

            <label className="text-sm text-gray-500">Nom d'utilisateur</label>
            {isEditing ? (
              <input
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="p-3 bg-gray-100 rounded-lg w-full"
              />
            ) : (
              <div className="p-3 bg-gray-100 rounded-lg">
                {user.username}
              </div>
            )}
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Réputation</h3>
            <div className="p-4 bg-blue-50 rounded-xl">
              <p className="text-2xl font-bold text-blue-600">
                {user.score?.toFixed(1) || "0.0"} ⭐
              </p>
              <p className="text-sm text-gray-500">
                Basé sur {user.total_reviews || 0} avis
              </p>
            </div>
          </div>
        </div>

        {isEditing && (
          <div className="p-6 border-t flex justify-end">
            <button
              onClick={handleSave}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700"
            >
              Enregistrer les modifications
            </button>
          </div>
        )}

        {success && <div className="p-4 text-green-600 text-center">{success}</div>}
        {error && user && <div className="p-4 text-red-600 text-center">{error}</div>}

        {/* CHANGE PASSWORD */}
        <div className="p-8 border-t">
          <h3 className="text-lg font-semibold mb-4">Changer le mot de passe</h3>

          <input
            type="password"
            name="current_password"
            placeholder="Mot de passe actuel"
            value={passwordData.current_password}
            onChange={handlePasswordChange}
            className="p-3 bg-gray-100 rounded-lg w-full mb-3"
          />

          <input
            type="password"
            name="new_password"
            placeholder="Nouveau mot de passe"
            value={passwordData.new_password}
            onChange={handlePasswordChange}
            className="p-3 bg-gray-100 rounded-lg w-full mb-3"
          />

          <button
            onClick={handlePasswordSave}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700"
          >
            Mettre à jour le mot de passe
          </button>

          {passwordMsg && (
            <p className="text-sm text-gray-600 mt-2">{passwordMsg}</p>
          )}
        </div>

      </div>
    </div>
  );
}

export default Profile;
