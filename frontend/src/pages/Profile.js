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
      <div className="p-10 text-red-600 text-center">
        {error}
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-10 text-gray-500 text-center">
        Chargement du profil...
      </div>
    );
  }

  const getInitial = () => {
    if (!user?.first_name) return "?";
    return user.first_name.charAt(0).toUpperCase();
  };

  return (
    <div className="max-w-4xl mx-auto p-8">

      <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">

        {/* HEADER */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-8 text-white">

          <div className="flex items-center gap-6">

            {/* Avatar */}
            <div className="w-24 h-24 rounded-full bg-white text-blue-600 flex items-center justify-center text-4xl font-bold shadow-md">
              {getInitial()}
            </div>

            {/* Basic Info */}
            <div>
              <h2 className="text-2xl font-bold">
                {user.first_name} {user.last_name}
              </h2>

              <p className="mt-2 text-blue-100">
                📍 {user.ville || "Ville non renseignée"}
                {user.quartier && ` - ${user.quartier}`}
              </p>

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
                <label className="block text-gray-500 text-sm mb-1">
                  Email
                </label>
                <div className="p-3 bg-gray-100 rounded-lg">
                  {user.email}
                </div>
              </div>

              <div>
                <label className="block text-gray-500 text-sm mb-1">
                  Nom d'utilisateur
                </label>
                <div className="p-3 bg-gray-100 rounded-lg">
                  {user.username}
                </div>
              </div>

              <div>
                <label className="block text-gray-500 text-sm mb-1">
                  Rôle
                </label>
                <div className="p-3 bg-gray-100 rounded-lg capitalize">
                  {user.role}
                </div>
              </div>

            </div>
          </div>

          {/* Trust & Stats */}
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
      </div>

    </div>
  );
}

export default Profile;
