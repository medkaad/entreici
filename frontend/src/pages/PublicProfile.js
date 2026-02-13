import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getUserProfile } from "../api/api";

function PublicProfile() {
  const { id } = useParams();
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function load() {
      const data = await getUserProfile(id);
      setUser(data);
    }
    load();
  }, [id]);

  if (!user) return <div className="p-10">Chargement...</div>;

  return (
    <div className="max-w-3xl mx-auto p-8">
      <div className="bg-white rounded-3xl shadow-lg p-8">

        <h2 className="text-2xl font-bold">
          {user.first_name} {user.last_name}
        </h2>

        <p className="mt-2 text-gray-600">
          📍 {user.ville}
          {user.quartier && ` - ${user.quartier}`}
        </p>

        <div className="mt-3">
          ⭐ {user.score?.toFixed(1)} ({user.total_reviews} avis)
        </div>

        <div className="mt-2 inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
          {user.badge}
        </div>

        {user.description && (
          <p className="mt-6 text-gray-700">
            {user.description}
          </p>
        )}

      </div>
    </div>
  );
}

export default PublicProfile;
