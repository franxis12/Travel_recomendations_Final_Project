import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { flattenDestinations, filterDestinations } from "../search.js";
const data = JSON.parse(
  readFileSync(new URL("../travel_recommendation_api.json", import.meta.url)),
);
const places = flattenDestinations(data);
test("all original destinations remain available with unique identities", () => {
  assert.equal(places.length, 10);
  assert.equal(new Set(places.map((p) => p.slug)).size, 10);
});
test("search recognizes city names, countries, capitalization, accents, and whitespace", () => {
  assert.equal(filterDestinations(places, "  JAPAN  ").length, 2);
  assert.equal(filterDestinations(places, "São Paulo")[0].slug, "sao-paulo");
  assert.equal(filterDestinations(places, "sao paulo")[0].slug, "sao-paulo");
  assert.equal(filterDestinations(places, "Tokyo")[0].slug, "tokyo");
  assert.equal(filterDestinations(places, "Australia").length, 2);
});
test("original keyword categories and singular/plural forms work", () => {
  for (const query of ["beach", "beaches", "playas"])
    assert.equal(filterDestinations(places, query).length, 2);
  for (const query of ["temple", "temples", "culture"])
    assert.equal(filterDestinations(places, query).length, 2);
  for (const query of ["city", "cities", "country", "countries"])
    assert.equal(filterDestinations(places, query).length, 6);
});
test("category filters, empty input, and missing results are handled", () => {
  assert.equal(filterDestinations(places, "", "beach").length, 2);
  assert.equal(filterDestinations(places, "").length, 10);
  assert.equal(filterDestinations(places, "Atlantis").length, 0);
  assert.equal(filterDestinations(places, "Japan", "beach").length, 0);
});
test("every destination image exists locally", () => {
  for (const place of places)
    assert.ok(
      readFileSync(new URL(`../${place.imageUrl}`, import.meta.url)).length >
        1000,
    );
});
