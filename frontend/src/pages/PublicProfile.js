import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getUserProfile, createConversation } from "../api/api";

function PublicProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startingChat, setStartingChat] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await getUserProfile(id);
        setProfile(data);
      } catch (e) {
        console.error(e);
        setError("Impossible de charger ce profil.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const getInitial = () => {
    if (!profile?.first_name) return "?";
    return profile.first_name.charAt(0).toUpperCase();
  };

  // UI helpers
  const score = Number(profile?.score || 0).toFixed(1);
  const reviews = profile?.total_reviews || 0;

  const trustLabel = () => {
    const s = Number(profile?.score || 0);
    if (reviews >= 5 && s >= 4.5) return { text: "Très fiable", cls: "bg-green-100 text-green-700 border-green-200" };
    if (s >= 3) return { text: "Fiable", cls: "bg-blue-100 text-blue-700 border-blue-200" };
    return { text: "Nouveau", cls: "bg-gray-100 text-gray-700 border-gray-200" };
  };

  async function handleStartChat() {
    // Option “pro”: si tu as déjà un système de conversation par annonce uniquement,
    // tu peux masquer ce bouton. Sinon, ajoute un endpoint dédié "conversation avec user".
    // Ici je garde createConversation(annonceId) => donc on ne peut pas sans annonce.
    // Je te laisse le bouton désactivé + explication UX.
    return;
  }

  if (loading) {
    return (
      <div className="p-10 text-gray-500 text-center">
        Chargement du profil...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-10 text-red-600 text-center">
        {error}
      </div>
    );
  }

  if (!profile) return null;

  const trust = trustLabel();

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">

        {/* HEADER */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-8 text-white">
          <div className="flex items-start justify-between gap-6">

            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-white text-blue-600 flex items-center justify-center text-4xl font-bold shadow-md">
                {getInitial()}
              </div>

              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="text-2xl font-bold">
                    {profile.first_name} {profile.last_name}
                  </h2>

                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${trust.cls}`}>
                    {trust.text}
                  </span>

                  {profile.is_verified && (
                    <span className="bg-green-500 px-3 py-1 rounded-full text-xs font-semibold">
                      Vérifié ✔
                    </span>
                  )}
                </div>

                <p className="mt-2 text-blue-100">
                  📍 {profile.ville || "Ville non renseignée"}
                  {profile.quartier && ` - ${profile.quartier}`}
                </p>

                <div className="mt-3 flex items-center gap-4 text-sm">
                  <span className="bg-white/15 px-3 py-1 rounded-full">
                    ⭐ {score} ({reviews} avis)
                  </span>
                  <span className="bg-white text-blue-600 px-3 py-1 rounded-full font-medium">
                    {profile.badge || "Nouveau"}
                  </span>
                  <span className="bg-white/15 px-3 py-1 rounded-full">
                    @{profile.username}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 items-end">
              <Link
                to="/"
                className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold"
              >
                Retour
              </Link>

              {/* Si tu veux vraiment “contacter”, il faut une conversation sans annonce (voir note plus bas) */}
              <button
                disabled
                onClick={handleStartChat}
                className="bg-white/30 px-4 py-2 rounded-lg font-semibold cursor-not-allowed"
                title="Pour démarrer une conversation, passe par une annonce (MVP)."
              >
                Contacter
              </button>
            </div>

          </div>
        </div>

        {/* BODY */}
        <div className="p-8 grid md:grid-cols-2 gap-8">

          {/* About */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              À propos
            </h3>

            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-xl border">
                <p className="text-sm text-gray-600 mb-1">Description</p>
                <p className="text-gray-800 leading-relaxed">
                  {profile.description || "Aucune description pour le moment."}
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl border">
                <p className="text-sm text-gray-600 mb-1">Zone</p>
                <p className="text-gray-800">
                  {profile.ville || "Non renseignée"}
                  {profile.quartier ? ` • ${profile.quartier}` : ""}
                </p>
              </div>
            </div>
          </div>

          {/* Trust / Reputation */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              Confiance & réputation
            </h3>

            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                <p className="text-sm text-gray-600">Score moyen</p>
                <p className="text-3xl font-bold text-blue-600">
                  {score} ⭐
                </p>
                <p className="text-sm text-gray-500">
                  Basé sur {reviews} avis
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl border">
                <p className="text-sm text-gray-600">Badge</p>
                <p className="text-lg font-semibold text-gray-800">
                  {profile.badge || "Nouveau"}
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl border">
                <p className="text-sm text-gray-600">Conseil sécurité</p>
                <p className="text-sm text-gray-700">
                  Pour une première interaction, privilégie une annonce et discute via le chat intégré.
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

export default PublicProfile;
