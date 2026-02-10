import { useEffect, useState } from "react";
import { getAnnonces } from "./api";
import CreateAnnonce from "./CreateAnnonce";
import Filtres from "./Filtres";

function Annonces() {
  const [annonces, setAnnonces] = useState([]);
  const [filters, setFilters] = useState({});

  const loadAnnonces = (newFilters = filters) => {
    getAnnonces(newFilters)
      .then(setAnnonces)
      .catch(console.error);
  };

  useEffect(() => {
    loadAnnonces();
  }, []);

  const handleFilter = (newFilters) => {
    setFilters(newFilters);
    loadAnnonces(newFilters);
  };

  return (
    <div>
      <CreateAnnonce onCreated={() => loadAnnonces()} />

      <Filtres onFilter={handleFilter} />

      <h2>Annonces</h2>

      {annonces.length === 0 && <p>Aucune annonce trouvée</p>}

      {annonces.map((a) => (
        <div
          key={a.id}
          style={{ border: "1px solid #ccc", margin: 10, padding: 10 }}
        >
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
