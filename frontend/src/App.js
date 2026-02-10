import { useEffect, useState } from "react";

function App() {
  const [status, setStatus] = useState("loading...");

  useEffect(() => {
    fetch("http://localhost:8000/api/health/")
      .then((res) => res.json())
      .then((data) => setStatus(data.status))
      .catch(() => setStatus("error"));
  }, []);

  return (
    <div style={{ padding: 40 }}>
      <h1>EntreIci</h1>
      <p>Backend status: {status}</p>
    </div>
  );
}

export default App;
