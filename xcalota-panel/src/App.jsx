import { useEffect, useState } from "react";
import { getRestaurants, createRestaurant } from "./services/api";

function App() {
  const [restaurants, setRestaurants] = useState([]);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");

  async function load() {
    const data = await getRestaurants();
    setRestaurants(data);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    await createRestaurant({ name, slug });
    setName("");
    setSlug("");
    load();
  }

  return (
    <div style={{ padding: 30, fontFamily: "Arial" }}>
      <h1>🍕 Xcalota — Restaurantes</h1>

      <form onSubmit={handleSubmit}>
        <input
          placeholder="Nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <br /><br />
        <input
          placeholder="Slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          required
        />
        <br /><br />
        <button type="submit">Criar restaurante</button>
      </form>

      <hr />

      <ul>
        {restaurants.map((r) => (
          <li key={r.id}>
            <strong>{r.name}</strong> — {r.slug}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;

