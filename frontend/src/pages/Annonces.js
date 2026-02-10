import { useEffect, useState } from "react";
import { getAnnonces } from "../api/api";
import CreateAnnonce from "../components/CreateAnnonce";
import Filtres from "../components/Filtres";

function Annonces() {
  const [annonces, setAnnonces] = useState([]);

  const loadAnnonces = (filters = {}) => {
    getAnnonces(filters)
      .then(setAnnonces)
      .catch(console.error);
  };

  useEffect(() => {
    loadAnnonces();
  }, []);

  return (
    <div>
      <CreateAnnonce onCreated={() => loadAnnonces()} />
      <Filtres onFilter={loadAnnonces} />

      <h2>Annonces</h2>

      {annonces.length === 0 && <p>Aucune annonce</p>}

      {annonces.map((a) => (
        <div key={a.id} style={{ border: "1px solid #ccc", margin: 10, padding: 10 }}>
          <h3>{a.title}</h3>
          <p>{a.description}</p>
          <p>Type : {a.type}</p>
          <p>Ville : {a.city}</p>
          <p>Prix : {a.price ?? "Non précisé"} €</p>
        </div>
      ))}
    </div>
  );
}

export default Annonces;
