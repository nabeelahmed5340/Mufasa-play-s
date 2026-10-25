/*
  MUFASA PLAY'S — VIDEO CONFIGURATION
  1) Change CHANNEL_URL to your YouTube channel URL.
  2) Add your video links using the form on the website.
  3) Videos are saved in this browser using localStorage.
*/
const CHANNEL_URL = "https://www.youtube.com/@YourChannel";
const STORAGE_KEY = "mufasaPlaysVideosV1";

const starterVideos = [
  // Example starter cards. Replace these URLs with your own videos.
  {
    id: "example-1",
    title: "Add Your First Free Fire Video",
    url: "https://www.youtube.com/watch?v=aqz-KE-bpKQ",
    category: "gameplay"
  },
  {
    id: "example-2",
    title: "Your Best Headshot Highlights",
    url: "https://www.youtube.com/watch?v=ScMzIvxBSi4",
    category: "highlights"
  },
  {
    id: "example-3",
    title: "Free Fire Tips & Tricks",
    url: "https://www.youtube.com/watch?v=jfKfPfyJRdk",
    category: "tips"
  }
];

const videoGrid = document.getElementById("videoGrid");
const emptyState = document.getElementById("emptyState");
const searchInput = document.getElementById("searchInput");
const form = document.getElementById("addVideoForm");
const urlInput = document.getElementById("videoUrl");
const titleInput = document.getElementById("videoTitle");
const categoryInput = document.getElementById("videoCategory");
const formMessage = document.getElementById("formMessage");
const playerModal = document.getElementById("playerModal");
const playerFrame = document.getElementById("playerFrame");
const playerTitle = document.getElementById("playerTitle");
let activeFilter = "all";
let videos = loadVideos();

document.getElementById("year").textContent = new Date().getFullYear();
document.getElementById("channelButton").href = CHANNEL_URL;

function loadVideos() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : starterVideos.map(video => ({...video}));
  } catch (error) {
    return starterVideos.map(video => ({...video}));
  }
}

function saveVideos() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(videos));
    return true;
  } catch (error) {
    showMessage("Could not save videos in this browser. Check browser storage settings.", true);
    return false;
  }
}

function getYouTubeId(input) {
  try {
    const url = new URL(input.trim());
    const host = url.hostname.toLowerCase().replace(/^www\./, "").replace(/^m\./, "");
    if (host === "youtu.be") {
      return url.pathname.split("/").filter(Boolean)[0] || null;
    }
    if (host === "youtube.com" || host === "music.youtube.com" || host === "youtube-nocookie.com") {
      if (url.pathname === "/watch") return url.searchParams.get("v");
      const parts = url.pathname.split("/").filter(Boolean);
      if (["shorts", "embed", "live", "v"].includes(parts[0])) return parts[1] || null;
    }
  } catch (error) {
    return null;
  }
  return null;
}

function getCategoryName(category) {
  return ({
    gameplay: "Gameplay",
    highlights: "Highlights",
    tips: "Tips & Tricks",
    shorts: "Shorts"
  })[category] || "Gameplay";
}

function showMessage(message, isError = false) {
  formMessage.textContent = message;
  formMessage.style.color = isError ? "#ff766c" : "#a7e8bd";
}

function openPlayer(video) {
  const id = getYouTubeId(video.url);
  if (!id) return;
  playerTitle.textContent = video.title;
  playerFrame.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1&rel=0`;
  playerModal.hidden = false;
  document.body.style.overflow = "hidden";
  document.getElementById("modalClose").focus();
}

function closePlayer() {
  playerModal.hidden = true;
  playerFrame.src = "";
  document.body.style.overflow = "";
}

function renderVideos() {
  const query = searchInput.value.trim().toLowerCase();
  const filtered = videos.filter(video => {
    const matchesCategory = activeFilter === "all" || video.category === activeFilter;
    const matchesQuery = `${video.title} ${getCategoryName(video.category)}`.toLowerCase().includes(query);
    return matchesCategory && matchesQuery;
  });

  videoGrid.innerHTML = "";
  emptyState.hidden = filtered.length !== 0;

  filtered.forEach(video => {
    const id = getYouTubeId(video.url);
    if (!id) return;

    const card = document.createElement("article");
    card.className = "video-card";

    const thumb = document.createElement("button");
    thumb.className = "video-thumb";
    thumb.type = "button";
    thumb.setAttribute("aria-label", `Play ${video.title}`);

    const img = document.createElement("img");
    img.src = `https://i.ytimg.com/vi/${encodeURIComponent(id)}/hqdefault.jpg`;
    img.alt = `${video.title} thumbnail`;
    img.loading = "lazy";
    img.onerror = () => {
      img.remove();
      const placeholder = document.createElement("span");
      placeholder.className = "thumb-placeholder";
      placeholder.textContent = "MUFASA PLAY'S";
      thumb.prepend(placeholder);
    };
    thumb.appendChild(img);

    const play = document.createElement("span");
    play.className = "play-button";
    play.textContent = "▶";
    thumb.appendChild(play);

    const duration = document.createElement("span");
    duration.className = "video-duration";
    duration.textContent = video.category === "shorts" ? "SHORTS" : "▶ WATCH";
    thumb.appendChild(duration);
    thumb.addEventListener("click", () => openPlayer(video));

    const meta = document.createElement("div");
    meta.className = "video-meta";
    const category = document.createElement("div");
    category.className = "video-category";
    category.textContent = getCategoryName(video.category);

    const title = document.createElement("h3");
    title.textContent = video.title;

    const bottom = document.createElement("div");
    bottom.className = "card-bottom";
    const watch = document.createElement("button");
    watch.className = "watch-link";
    watch.type = "button";
    watch.textContent = "PLAY VIDEO ↗";
    watch.addEventListener("click", () => openPlayer(video));

    const remove = document.createElement("button");
    remove.className = "delete-video";
    remove.type = "button";
    remove.textContent = "Remove";
    remove.setAttribute("aria-label", `Remove ${video.title}`);
    remove.addEventListener("click", () => {
      if (!window.confirm(`Remove "${video.title}" from this browser?`)) return;
      videos = videos.filter(item => item.id !== video.id);
      saveVideos();
      renderVideos();
    });

    bottom.append(watch, remove);
    meta.append(category, title, bottom);
    card.append(thumb, meta);
    videoGrid.appendChild(card);
  });
}

form.addEventListener("submit", event => {
  event.preventDefault();
  const url = urlInput.value.trim();
  const id = getYouTubeId(url);

  if (!id || !/^[\w-]{6,}$/.test(id)) {
    showMessage("Please enter a valid YouTube video or Shorts link.", true);
    return;
  }
  if (videos.some(video => getYouTubeId(video.url) === id)) {
    showMessage("This video is already in your library.", true);
    return;
  }

  const title = titleInput.value.trim() || `YouTube ${categoryInput.value === "shorts" ? "Short" : "Video"} — ${id}`;
  videos.unshift({
    id: `video-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title,
    url,
    category: categoryInput.value
  });

  saveVideos();
  searchInput.value = "";
  activeFilter = "all";
  document.querySelectorAll(".filter").forEach(button => {
    button.classList.toggle("active", button.dataset.filter === "all");
  });
  renderVideos();
  form.reset();
  showMessage("Video added successfully!");
});

document.querySelectorAll(".filter").forEach(button => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    document.querySelectorAll(".filter").forEach(item => item.classList.toggle("active", item === button));
    renderVideos();
  });
});
searchInput.addEventListener("input", renderVideos);

document.getElementById("modalClose").addEventListener("click", closePlayer);
document.getElementById("modalBackdrop").addEventListener("click", closePlayer);
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && !playerModal.hidden) closePlayer();
});

const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");
menuToggle.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.textContent = isOpen ? "✕" : "☰";
});
navLinks.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.textContent = "☰";
  });
});

renderVideos();
