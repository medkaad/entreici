import { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { getUserProfile } from "../api/api";

function PublicProfile() {
  const { id } = useParams();

  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);

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

  const score = useMemo(() => Number(profile?.score || 0).toFixed(1), [profile]);
  const reviews = profile?.total_reviews || 0;

  const trustLabel = () => {
    const s = Number(profile?.score || 0);
    if (reviews >= 5 && s >= 4.5)
      return { text: "Très fiable", cls: "bg-green-50 text-green-800 border-green-200" };
    if (s >= 3)
      return { text: "Fiable", cls: "bg-blue-50 text-blue-800 border-blue-200" };
    return { text: "Nouveau", cls: "bg-gray-50 text-gray-800 border-gray-200" };
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8">
        <div className="bg-white p-8 rounded-3xl shadow text-center text-gray-700 text-lg senior-card">
          ⏳ Chargement du profil...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8">
        <div className="bg-red-50 text-red-700 border border-red-200 p-6 rounded-3xl text-center text-lg senior-card">
          ❌ {error}
        </div>

        <div className="mt-4 flex justify-center">
          <Link
            to="/"
            className="px-6 py-4 rounded-3xl bg-gray-900 text-white font-extrabold hover:bg-black transition focus:outline-none focus:ring-4 focus:ring-gray-200"
          >
            ↩ Retour aux annonces
          </Link>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const trust = trustLabel();

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-8">
      <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden senior-card">
        {/* HEADER */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-8 text-white">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div className="flex items-center gap-6 min-w-0">
              <div className="w-24 h-24 rounded-full bg-white text-blue-700 flex items-center justify-center text-4xl font-extrabold shadow-md">
                {getInitial()}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="text-3xl font-extrabold break-words">
                    {profile.first_name} {profile.last_name}
                  </h2>

                  <span className={`px-4 py-2 rounded-full text-base font-extrabold border ${trust.cls}`}>
                    {trust.text}
                  </span>

                  {profile.is_verified && (
                    <span className="bg-green-500 px-4 py-2 rounded-full text-base font-extrabold text-white">
                      Vérifié ✔
                    </span>
                  )}
                </div>

                <p className="mt-3 text-blue-100 text-lg font-semibold">
                  📍 {profile.ville || "Ville non renseignée"}
                  {profile.quartier ? ` - ${profile.quartier}` : ""}
                </p>

                <div className="mt-4 flex items-center gap-3 flex-wrap text-base font-semibold">
                  <span className="bg-white/15 px-4 py-2 rounded-full">
                    ⭐ {score} ({reviews} avis)
                  </span>
                  <span className="bg-white text-blue-700 px-4 py-2 rounded-full font-extrabold">
                    {profile.badge || "Nouveau"}
                  </span>
                  {profile.username && (
                    <span className="bg-white/15 px-4 py-2 rounded-full">
                      @{profile.username}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 md:items-end">
              <Link
                to="/"
                className="px-6 py-4 rounded-3xl bg-white text-blue-700 font-extrabold hover:bg-blue-50 transition focus:outline-none focus:ring-4 focus:ring-blue-200"
              >
                ↩ Retour
              </Link>

              {/* MVP: conversation seulement via annonce */}
              <button
                type="button"
                disabled
                className="px-6 py-4 rounded-3xl bg-white/25 text-white font-extrabold cursor-not-allowed"
                title="Pour démarrer une conversation, passe par une annonce (MVP)."
                aria-label="Contacter (désactivé)"
              >
                💬 Contacter (via annonce)
              </button>
            </div>
          </div>

          <div className="mt-5 bg-white/10 rounded-3xl p-5">
            <p className="text-base md:text-lg font-semibold text-blue-50">
              ℹ️ Pour contacter cette personne : ouvrez une de ses annonces puis cliquez sur <b>“Contacter”</b>.
            </p>
          </div>
        </div>

        {/* BODY */}
        <div className="p-8 grid md:grid-cols-2 gap-8">
          {/* About */}
          <div>
            <h3 className="text-2xl font-extrabold mb-4 text-gray-900">À propos</h3>

            <div className="space-y-5">
              <div className="p-6 bg-gray-50 rounded-3xl border border-gray-200">
                <p className="text-base text-gray-700 font-semibold mb-2">Description</p>
                <p className="text-lg text-gray-900 leading-relaxed">
                  {profile.description || "Aucune description pour le moment."}
                </p>
              </div>

              <div className="p-6 bg-gray-50 rounded-3xl border border-gray-200">
                <p className="text-base text-gray-700 font-semibold mb-2">Zone</p>
                <p className="text-lg text-gray-900 font-semibold">
                  {profile.ville || "Non renseignée"}
                  {profile.quartier ? ` • ${profile.quartier}` : ""}
                </p>
              </div>
            </div>
          </div>

          {/* Trust / Reputation */}
          <div>
            <h3 className="text-2xl font-extrabold mb-4 text-gray-900">
              Confiance & réputation
            </h3>

            <div className="space-y-5">
              <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100">
                <p className="text-base text-gray-700 font-semibold">Score moyen</p>
                <p className="text-5xl font-extrabold text-blue-700 mt-2">
                  {score} ⭐
                </p>
                <p className="text-base text-gray-700 font-semibold mt-2">
                  Basé sur {reviews} avis
                </p>
              </div>

              <div className="p-6 bg-gray-50 rounded-3xl border border-gray-200">
                <p className="text-base text-gray-700 font-semibold">Badge</p>
                <p className="text-2xl font-extrabold text-gray-900 mt-2">
                  {profile.badge || "Nouveau"}
                </p>
              </div>

              <div className="p-6 bg-gray-50 rounded-3xl border border-gray-200">
                <p className="text-base text-gray-700 font-semibold mb-2">Conseil sécurité</p>
                <p className="text-lg text-gray-900 leading-relaxed">
                  Pour une première interaction, privilégiez une annonce et discutez via le chat intégré.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-8 border-t bg-gray-50">
          <Link
            to="/"
            className="inline-flex w-full md:w-auto items-center justify-center px-7 py-4 rounded-3xl bg-gray-900 text-white font-extrabold text-lg hover:bg-black transition focus:outline-none focus:ring-4 focus:ring-gray-200"
          >
            ↩ Retour aux annonces
          </Link>
        </div>
      </div>
    </div>
  );
}

export default PublicProfile;
