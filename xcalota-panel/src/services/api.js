const API_URL = "http://localhost:3000/api";

export async function getRestaurants() {
  const res = await fetch(`${API_URL}/restaurants`);
  return res.json();
}

export async function createRestaurant(data) {
  const res = await fetch(`${API_URL}/restaurants`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw error;
  }

  return res.json();
}
