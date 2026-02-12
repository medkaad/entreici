import { useEffect, useState } from "react";
import { getMe } from "../api/api";

function Profile() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  async function loadProfile() {
    try {
      const data = await getMe();
      setUser(data);
    } catch (err) {
      setError("Impossible de charger le profil.");
      console.error(err);
    }
  }

  useEffect(() => {
    loadProfile();
  }, []);

  if (error) {
    return (
      <div className="p-10 text-red-600">
        {error}
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-10 text-gray-500">
        Chargement du profil...
      </div>
    );
  }

  const getRoleStyle = (role) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-700 border-red-300";
      case "moderator":
        return "bg-yellow-100 text-yellow-700 border-yellow-300";
      default:
        return "bg-blue-100 text-blue-700 border-blue-300";
    }
  };

  return (
    <div className="p-10 max-w-3xl mx-auto">
      <h2 className="text-3xl font-bold mb-8">Mon Profil</h2>

      <div className="bg-white p-8 rounded-2xl shadow-md border">

        {/* Email */}
        <div className="mb-6">
          <label className="block text-gray-500 text-sm mb-1">
            Email
          </label>
          <div className="p-3 bg-gray-100 rounded-lg">
            {user.email}
          </div>
        </div>

        {/* Username */}
        <div className="mb-6">
          <label className="block text-gray-500 text-sm mb-1">
            Nom d'utilisateur
          </label>
          <div className="p-3 bg-gray-100 rounded-lg">
            {user.username}
          </div>
        </div>

        {/* Role */}
        <div className="mb-6">
          <label className="block text-gray-500 text-sm mb-1">
            Rôle
          </label>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium border ${getRoleStyle(
              user.role
            )}`}
          >
            {user.role}
          </span>
        </div>

        {/* Vérification */}
        <div className="mb-6">
          <label className="block text-gray-500 text-sm mb-1">
            Statut du compte
          </label>

          {user.is_verified ? (
            <span className="px-3 py-1 rounded-full text-sm font-medium border bg-green-100 text-green-700 border-green-300">
              Compte vérifié ✔
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full text-sm font-medium border bg-gray-200 text-gray-700 border-gray-300">
              Non vérifié
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;
