export const CATEGORY_LABELS = {
  city: "City escape",
  beach: "Beach escape",
  culture: "Culture & landmarks",
};
export const CATEGORY_ICONS = {
  city: "city",
  beach: "waves",
  culture: "landmark",
};

export function normalizeQuery(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

export function flattenDestinations(data) {
  const cities = data.countries.flatMap((country) =>
    country.cities.map((city) => ({
      ...city,
      country: country.name,
      category: "city",
    })),
  );
  const others = ["beaches", "temples"].flatMap((key) =>
    data[key].map((place) => ({
      ...place,
      country: place.name.split(", ").slice(1).join(", "),
      category: key === "beaches" ? "beach" : "culture",
    })),
  );
  const order = [
    "bora-bora",
    "tokyo",
    "angkor-wat",
    "sydney",
    "kyoto",
    "rio",
    "melbourne",
    "sao-paulo",
    "taj-mahal",
    "copacabana",
  ];
  return [...cities, ...others].sort(
    (a, b) => order.indexOf(a.slug) - order.indexOf(b.slug),
  );
}

export function filterDestinations(destinations, query = "", category = "all") {
  const normalized = normalizeQuery(query);
  const aliases = {
    beach: "beach",
    beaches: "beach",
    playa: "beach",
    playas: "beach",
    temple: "culture",
    temples: "culture",
    culture: "culture",
    landmarks: "culture",
    templos: "culture",
    city: "city",
    cities: "city",
    country: "city",
    countries: "city",
    paises: "city",
  };
  return destinations.filter((place) => {
    if (category !== "all" && place.category !== category) return false;
    if (!normalized) return true;
    if (aliases[normalized]) return place.category === aliases[normalized];
    const text = normalizeQuery(
      `${place.name} ${place.country} ${place.description} ${CATEGORY_LABELS[place.category]}`,
    );
    return normalized.split(" ").every((word) => text.includes(word));
  });
}
