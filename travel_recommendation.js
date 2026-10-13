import {
  CATEGORY_LABELS,
  CATEGORY_ICONS,
  flattenDestinations,
  filterDestinations,
} from "./search.js";

const $ = (id) => document.getElementById(id);
const menuButton = document.querySelector(".menu-toggle");
const navigation = $("main-navigation");
function closeMenu() {
  navigation.classList.remove("is-open");
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-label", "Open navigation");
}
menuButton.addEventListener("click", () => {
  const open = navigation.classList.toggle("is-open");
  menuButton.setAttribute("aria-expanded", String(open));
  menuButton.setAttribute(
    "aria-label",
    open ? "Close navigation" : "Open navigation",
  );
});
navigation.addEventListener("click", (event) => {
  if (event.target.closest("a")) closeMenu();
});
document.addEventListener("keydown", (event) => {
  if (
    event.key === "Escape" &&
    menuButton.getAttribute("aria-expanded") === "true"
  ) {
    closeMenu();
    menuButton.focus();
  }
});

function icon(name) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.classList.add("icon");
  svg.setAttribute("aria-hidden", "true");
  const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
  use.setAttribute("href", `./assets/icons.svg#${name}`);
  svg.append(use);
  return svg;
}
function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}
let cachedData;
async function loadData() {
  if (!cachedData) {
    const response = await fetch("./travel_recommendation_api.json");
    if (!response.ok) throw new Error("Destination collection unavailable.");
    cachedData = flattenDestinations(await response.json());
  }
  return cachedData;
}

if ($("searchForm")) {
  const input = $("searchInput");
  const results = $("results");
  const dialog = $("destinationDialog");
  let places = [];
  let query = "";
  let category = "all";
  let limit = 6;
  let loading = true;
  let lastTrigger;

  function openDestination(place, trigger) {
    lastTrigger = trigger;
    $("dialogTitle").textContent = place.name;
    $("dialogCategory").textContent = CATEGORY_LABELS[place.category];
    $("dialogDescription").textContent = place.description;
    $("dialogImage").src = place.imageUrl;
    $("dialogImage").alt = place.name;
    $("dialogMap").href =
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name)}`;
    $("dialogCredit").textContent = place.imageCredit
      ? `Photo: ${place.imageCredit}`
      : "Original photo source ↗";
    $("dialogCredit").href = place.imageSourceUrl;
    dialog.showModal();
  }
  document
    .querySelector(".dialog-close")
    .addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => {
    const rect = dialog.getBoundingClientRect();
    if (
      event.target === dialog &&
      (event.clientX < rect.left ||
        event.clientX > rect.right ||
        event.clientY < rect.top ||
        event.clientY > rect.bottom)
    )
      dialog.close();
  });
  dialog.addEventListener("close", () => lastTrigger?.focus());

  function createCard(place) {
    const card = element("article", "destination-card");
    const media = element("div", "card-image-wrap");
    const image = element("img");
    image.src = place.imageUrl;
    image.alt = place.name;
    image.loading = "lazy";
    image.width = 640;
    image.height = 420;
    const tag = element("span", "card-category");
    tag.append(
      icon(CATEGORY_ICONS[place.category]),
      document.createTextNode(CATEGORY_LABELS[place.category]),
    );
    media.append(image, tag);
    const body = element("div", "card-body");
    const heading = element("div", "card-heading");
    const more = element("button");
    more.type = "button";
    more.setAttribute("aria-label", `Explore ${place.name}`);
    more.append(icon("arrow-up"));
    more.addEventListener("click", () => openDestination(place, more));
    heading.append(element("h3", "", place.name.split(", ")[0]), more);
    body.append(
      element("p", "card-country", place.country),
      heading,
      element("p", "card-description", place.description),
    );
    card.append(media, body);
    return card;
  }

  function render() {
    // Preserve the retry state until the collection has loaded successfully.
    if (loading || !places.length) return;
    const matches = filterDestinations(places, query, category);
    const shown = matches.slice(0, limit);
    results.replaceChildren(...shown.map(createCard));
    results.setAttribute("aria-busy", "false");
    $("resultCount").textContent = matches.length
      ? `${shown.length} of ${matches.length} destination${matches.length === 1 ? "" : "s"}`
      : "No destinations found";
    $("clearBtn").hidden = !query && category === "all" && !input.value;
    $("loadMore").hidden = matches.length <= limit;
    document
      .querySelectorAll("[data-category]")
      .forEach((button) =>
        button.setAttribute(
          "aria-pressed",
          String(button.dataset.category === category),
        ),
      );
    if (!matches.length) {
      const empty = element("div", "empty-state");
      const reset = element(
        "button",
        "button button-outline",
        "Explore all destinations",
      );
      reset.type = "button";
      reset.addEventListener("click", clear);
      empty.append(
        element("h3", "", "A different direction?"),
        element(
          "p",
          "",
          "We couldn’t find a match in this collection. Try a city, a country, beaches, or temples.",
        ),
        reset,
      );
      results.append(empty);
    }
  }
  function clear() {
    query = "";
    category = "all";
    input.value = "";
    limit = 6;
    render();
    input.focus();
  }
  function search(value) {
    input.value = value;
    query = value.trim();
    category = "all";
    limit = 6;
    render();
  }
  $("searchForm").addEventListener("submit", (event) => {
    event.preventDefault();
    search(input.value);
    if (!loading)
      results.scrollIntoView({
        behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
        block: "start",
      });
  });
  input.addEventListener("input", () => {
    $("clearBtn").hidden = !input.value && !query && category === "all";
  });
  $("clearBtn").addEventListener("click", clear);
  document
    .querySelectorAll("[data-query]")
    .forEach((button) =>
      button.addEventListener("click", () => search(button.dataset.query)),
    );
  document.querySelectorAll("[data-category]").forEach((button) =>
    button.addEventListener("click", () => {
      category = button.dataset.category;
      query = "";
      input.value = "";
      limit = 6;
      render();
    }),
  );
  $("loadMore").addEventListener("click", () => {
    const previousCount = results.children.length;
    limit += 6;
    render();
    results.children[previousCount]
      ?.querySelector("button")
      ?.focus({ preventScroll: true });
  });
  async function initialize() {
    loading = true;
    results.setAttribute("aria-busy", "true");
    $("resultCount").textContent = "Finding your next adventure…";
    try {
      places = await loadData();
      loading = false;
      render();
    } catch {
      loading = false;
      results.setAttribute("aria-busy", "false");
      $("resultCount").textContent = "Collection unavailable";
      const error = element("div", "empty-state");
      const retry = element("button", "button", "Try again");
      retry.type = "button";
      retry.addEventListener("click", initialize);
      error.append(
        element("h3", "", "A small detour."),
        element(
          "p",
          "",
          "The destination collection couldn’t load. Please try again.",
        ),
        retry,
      );
      results.replaceChildren(error);
    }
  }
  initialize();
}

if ($("photoCredits")) {
  loadData()
    .then((places) => {
      places
        .filter((place) => place.slug !== "melbourne")
        .forEach((place) => {
          const item = element("li");
          const link = element(
            "a",
            "",
            `${place.name} — original photo source`,
          );
          link.href = place.imageSourceUrl;
          link.target = "_blank";
          link.rel = "noopener noreferrer";
          item.append(link);
          $("photoCredits").append(item);
        });
    })
    .catch(() => {
      $("photoCredits").append(
        element(
          "li",
          "",
          "Additional photo sources are included in the project’s destination data.",
        ),
      );
    });
}

if ($("formContact")) {
  const form = $("formContact");
  let draft = "";
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = $("name").value.trim();
    const message = $("message").value.trim();
    if (!name || !message) {
      $("contactStatus").textContent =
        "Please enter your name and a message, not just spaces.";
      return;
    }
    draft = `Name: ${name}\nEmail: ${$("email").value.trim()}\n\n${message}`;
    $("messageDraft").textContent = draft;
    $("messagePreview").hidden = false;
    form.hidden = true;
    $("contactStatus").textContent =
      "Preview ready. Your message has not been sent.";
    $("copyMessage").focus();
  });
  $("editMessage").addEventListener("click", () => {
    form.hidden = false;
    $("messagePreview").hidden = true;
    $("contactStatus").textContent = "";
    $("message").focus();
  });
  $("copyMessage").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(draft);
      $("contactStatus").textContent =
        "Message copied. You can paste it wherever you’d like to share it.";
    } catch {
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents($("messageDraft"));
      selection.removeAllRanges();
      selection.addRange(range);
      $("messageDraft").focus();
      $("contactStatus").textContent =
        "Clipboard unavailable. Your message is selected; copy it manually.";
    }
  });
}
