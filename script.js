const loader = document.getElementById("loader");
const loaderProgress = document.getElementById("loaderProgress");
const introGate = document.getElementById("introGate");
const passInput = document.getElementById("passInput");
const enterBtn = document.getElementById("enterBtn");
const introError = document.getElementById("introError");
const siteShell = document.getElementById("siteShell");

const sparkField = document.getElementById("sparkField");

const startBtn = document.getElementById("startBtn");
const startBtnTwo = document.getElementById("startBtnTwo");
const heroReveal = document.getElementById("heroReveal");

const song = document.getElementById("song");
const playBtn = document.getElementById("playBtn");
const pauseBtn = document.getElementById("pauseBtn");
const restartBtn = document.getElementById("restartBtn");
const progressFill = document.getElementById("progressFill");
const lyricMain = document.getElementById("lyricMain");
const lyricSub = document.getElementById("lyricSub");
const trackLabel = document.getElementById("trackLabel");

const prevSlide = document.getElementById("prevSlide");
const nextSlide = document.getElementById("nextSlide");
const carouselTrack = document.getElementById("carouselTrack");
const carouselDots = document.getElementById("carouselDots");
const carouselWrap = document.getElementById("carouselWrap");
const slides = Array.from(document.querySelectorAll(".slide"));

const reasonBtn = document.getElementById("reasonBtn");
const reasonBox = document.getElementById("reasonBox");

const manOneSelect = document.getElementById("manOneSelect");
const manTwoSelect = document.getElementById("manTwoSelect");
const dateMatchBtn = document.getElementById("dateMatchBtn");
const dateResetBtn = document.getElementById("dateResetBtn");
const dateStage = document.getElementById("dateStage");
const dateStageEmoji = document.getElementById("dateStageEmoji");
const dateStageTitle = document.getElementById("dateStageTitle");
const dateStageResult = document.getElementById("dateStageResult");
const gameScore = document.getElementById("gameScore");

const openLetterTop = document.getElementById("openLetterTop");
const openLetterBtn = document.getElementById("openLetterBtn");
const openLetterBottom = document.getElementById("openLetterBottom");
const letterModal = document.getElementById("letterModal");
const closeModal = document.getElementById("closeModal");
const modalOverlay = document.getElementById("modalOverlay");

const SECRET_PASSWORD = "osma jasmine";

let currentSlide = 0;
let autoSlideInterval = null;
let touchStartX = 0;
let revealState = 0;
let matchBusy = false;

/* ─── SPIN SFX POOL (5 instances for overlap) ─ */
const SFX_POOL_SIZE = 5;
const sfxPool = [];
let sfxPoolIndex = 0;

function buildSfxPool() {
  for (let i = 0; i < SFX_POOL_SIZE; i++) {
    const a = document.createElement("audio");
    a.src = "music/spin-sfx.mp3";
    a.preload = "auto";
    document.body.appendChild(a);
    sfxPool.push(a);
  }
}

function playClickSfx() {
  const a = sfxPool[sfxPoolIndex % SFX_POOL_SIZE];
  sfxPoolIndex++;
  a.currentTime = 0;
  a.play().catch(() => {});
}

/* ─── EMOJI SETS PER BUTTON TYPE ──────────── */
const genericEmojis  = ["✦", "✧", "⊹", "🌿", "🍃", "🌱", "✨", "🫶", "🌾"];
const musicEmojis    = ["🎵", "🎶", "🎧", "🎼", "✨", "🌿", "🎤"];
const carouselEmojis = ["📸", "🖼️", "✨", "🌿", "💚"];
const letterEmojis   = ["💌", "📝", "✦", "🌿", "💚", "🫶"];
const gameEmojis     = ["🌹", "💥", "🎉", "💌", "✨", "🫦", "💅"];
const reasonEmojis   = ["💚", "🌿", "🫶", "✦", "🌱", "🤍"];

function getEmojiSet(btn) {
  const id = btn.id || "";
  if (["playBtn","pauseBtn","restartBtn","openLetterBtn"].includes(id)) return musicEmojis;
  if (["prevSlide","nextSlide"].includes(id)) return carouselEmojis;
  if (["openLetterTop","openLetterBottom","closeModal"].includes(id)) return letterEmojis;
  if (["dateMatchBtn","dateResetBtn"].includes(id)) return gameEmojis;
  if (id === "reasonBtn") return reasonEmojis;
  return genericEmojis;
}

/* ─── CUSTOM CURSOR (desktop only) ────────── */
let cursorEl = null;
let trailThrottle = 0;

function setupCursor() {
  if (window.innerWidth <= 760) return;

  cursorEl = document.createElement("div");
  cursorEl.className = "custom-cursor";
  cursorEl.textContent = "✦";
  document.body.appendChild(cursorEl);

  document.addEventListener("mousemove", (e) => {
    cursorEl.style.left = e.clientX + "px";
    cursorEl.style.top  = e.clientY + "px";

    // throttle trail to every 60ms
    const now = Date.now();
    if (now - trailThrottle > 60) {
      trailThrottle = now;
      spawnCursorTrail(e.clientX, e.clientY);
    }
  });

  document.addEventListener("mousedown", () => {
    cursorEl && cursorEl.classList.add("pressed");
  });

  document.addEventListener("mouseup", () => {
    cursorEl && cursorEl.classList.remove("pressed");
  });
}

function spawnCursorTrail(x, y) {
  const icons = ["✦", "✧", "⊹", "·"];
  const el = document.createElement("div");
  el.className = "cursor-trail";
  el.textContent = icons[Math.floor(Math.random() * icons.length)];
  el.style.left = x + "px";
  el.style.top  = y + "px";
  el.style.fontSize = `${randomBetween(8, 14)}px`;
  el.style.color = `rgba(245, 242, 232, ${randomBetween(0.4, 0.8)})`;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 700);
}

/* ─── EMOJI BURST ──────────────────────────── */
function spawnEmoji(x, y, emoji) {
  const el = document.createElement("div");
  el.className = "emoji-burst";
  el.textContent = emoji;
  el.style.left = x + "px";
  el.style.top  = y + "px";
  el.style.fontSize = `${randomBetween(14, 22)}px`;
  el.style.animationDuration = `${randomBetween(0.65, 1.0)}s`;
  el.style.animationDelay    = `${randomBetween(0, 0.12)}s`;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1100);
}

function triggerButtonAnim(btn, x, y) {
  // play sfx
  playClickSfx();

  // motion blur + glow
  btn.classList.remove("btn-click-anim");
  void btn.offsetWidth;
  btn.classList.add("btn-click-anim");
  btn.addEventListener("animationend", () => {
    btn.classList.remove("btn-click-anim");
  }, { once: true });

  // emoji burst
  const set = getEmojiSet(btn);
  const count = Math.floor(randomBetween(4, 8));
  const cx = x ?? (btn.getBoundingClientRect().left + btn.offsetWidth  / 2);
  const cy = y ?? (btn.getBoundingClientRect().top  + btn.offsetHeight / 2);

  for (let i = 0; i < count; i++) {
    spawnEmoji(
      cx + randomBetween(-36, 36),
      cy,
      set[Math.floor(Math.random() * set.length)]
    );
  }
}

/* attach animations to all interactive buttons */
function attachButtonAnimations() {
  const targets = document.querySelectorAll(
    ".pill-btn, .soft-btn, .game-start, .carousel-nav, .modal-close, .ghost-chip, .dot"
  );
  targets.forEach((btn) => {
    btn.addEventListener("pointerup", (e) => {
      triggerButtonAnim(btn, e.clientX, e.clientY);
    });
  });
}

/* ─── DATA ─────────────────────────────────── */
const revealMessages = [
  { title: "welcome",     text: "this is your birthday website. plss act surprised hahah" },
  { title: "important",   text: "i made this with serious effort so please rate it generously thx" },
  { title: "disclaimer",  text: "this will contain respect, nonsense, and accurate observations lmaoo" }
];

const lyricMoments = [
  { time: 0, main: "issatwaimz ur childhood lawll",          sub: "sorry idk what other song to put so might as well help u live the good old n gone days" },
  { time: 4, main: "ur twink stanning prob started w this hahah", sub: "i rmb kaypohing and watching twaimz videos w u" },
  { time: 8, main: "vine eraaaaa",                           sub: "i rmb watching all those try not to laugh bs w u" }
];

const siblingFacts = [
  "you set a standard that made me want to do better.",
  "i copied your taste because i trusted your judgment before i even knew that was what i was doing.",
  "you always felt more independent than everyone else around you.",
  "you made me take my studies more seriously when i needed it most.",
  "i think i will always want to look up to you and u set a great example.",
  "you have always been someone i wanted to make proud in my own way.",
  "your taste in food and travel has been influencing me for years actually.",
  "you are one of the reasons i stopped taking everything like a joke.",
  "i always noticed how self sufficient you are.",
  "you somehow manage to be stressed and still more composed than most people.",
  "you love differently and still show up in your own way.",
  "even when i was annoying, you would always forgive and treat me well hahah."
];

const worstCombos = [
  ["ashwin", "navin"],
  ["kesaven", "ashwin"],
  ["ashwin", "kuna"]
];

const ultimateRomanceCombos = [
  ["patrick", "balaji"],
  ["gary", "darian"],
  ["shahil", "suresh"]
];

const goodResults = [
  "this pairing is giving soft launch, shared playlists, suspicious eye contact, and one of them saying 'bro' before doing something fruity 😭✨ slayyy",
  "wait this kinda ate... they would absolutely enable each other, dress up for no reason, and act like the date was lowkey casual when it was actually very much not 😌💅",
  "oh they have chemistry unfortunately... this is very much lip bite emoji, accidental hand touch, then both acting nonchalant after 💋🫦",
  "this duo would be serving eye contact, unserious flirting, and one dramatic crashout before dessert. purrr but make it unstable 💀✨",
  "they would either end up in love or in matching instagram stories with suspicious captions. either way, very zesty, very slay, very yes 😭🌹",
  "this match has elite fruit levels ngl. giving two divas, one table, zero straight explanations 💅🕯️✨",
  "oh this is not bad at all... they would kiki, gossip, judge people together, then become weirdly codependent by week 2 😭🤭"
];

const badResults = [
  "absolutely not. this date would combust before the appetisers arrive. nasty vibes. evacuation required 💥😭",
  "this pairing is giving mutual irritation, bad body language, and one of them leaving to 'use the toilet' and never returning 💀",
  "girl no. this is cursed, chaotic, and spiritually unpleasant. somebody call building management immediately 💥",
  "the chemistry here is not romance. it is active warfare with lip balm. deeply unserious and tragically doomed 😭",
  "this combo would produce tension, confusion, and at least one loud sigh. disaster mama. full explosion outcome 💣"
];

const roseResults = [
  "oh this is cinema. roses everywhere. shared eye contact. soft smiles. somebody zoom in. this is giving ultimate romance fr 🌹💋✨",
  "this pairing just unlocked soulmate allegations. very elegant. very fruity. very 'wait... why do they actually work?' 🌹😭",
  "HELLO??? this is the premium route. the aura, the chemistry, the dramatic silence, the yearning... top tier romance mode activated 🌹🫦💫"
];

/* ─── UTILS ────────────────────────────────── */
function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/* ─── LOADER ───────────────────────────────── */
function runLoader() {
  let progress = 0;
  const interval = setInterval(() => {
    progress += randomBetween(8, 18);
    if (progress >= 100) {
      progress = 100;
      clearInterval(interval);
      setTimeout(() => loader.classList.add("hidden-loader"), 250);
    }
    loaderProgress.style.width = `${progress}%`;
  }, 180);
}

/* ─── PASSWORD ─────────────────────────────── */
function unlockSite() {
  introGate.classList.add("hidden");
  siteShell.classList.remove("hidden-site");
}

function tryPassword() {
  const value = passInput.value.trim().toLowerCase();
  if (value === SECRET_PASSWORD.toLowerCase()) {
    unlockSite();
  } else {
    introError.classList.remove("hidden");
    passInput.value = "";
  }
}

/* ─── AMBIENT SPARKS ───────────────────────── */
function createAmbientSparks() {
  for (let i = 0; i < 34; i++) {
    const spark = document.createElement("div");
    spark.className = "spark";
    spark.style.left = `${randomBetween(0, 100)}vw`;
    spark.style.top  = `${randomBetween(0, 100)}vh`;
    spark.style.animationDuration = `${randomBetween(1.6, 3.2)}s`;
    spark.style.animationDelay   = `${randomBetween(0, 2)}s`;
    sparkField.appendChild(spark);
  }
}

/* ─── HERO REVEAL ──────────────────────────── */
function cycleReveal() {
  const item = revealMessages[revealState % revealMessages.length];
  heroReveal.classList.remove("hidden");
  heroReveal.innerHTML = `
    <p class="reveal-title">${item.title}</p>
    <p class="reveal-copy">${item.text}</p>
  `;
  revealState += 1;
}

/* ─── LYRICS SYNC ──────────────────────────── */
function updateLyrics() {
  const current = song.currentTime;
  for (let i = lyricMoments.length - 1; i >= 0; i--) {
    if (current >= lyricMoments[i].time) {
      lyricMain.textContent = lyricMoments[i].main;
      lyricSub.textContent  = lyricMoments[i].sub;
      break;
    }
  }
  if (song.duration) {
    progressFill.style.width = `${(song.currentTime / song.duration) * 100}%`;
  }
}

/* ─── CAROUSEL ─────────────────────────────── */
function updateCarousel() {
  carouselTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
  document.querySelectorAll(".dot").forEach((dot, index) => {
    dot.classList.toggle("active", index === currentSlide);
  });
}

function goToSlide(index) {
  currentSlide = (index + slides.length) % slides.length;
  updateCarousel();
}

function buildDots() {
  slides.forEach((_, index) => {
    const dot = document.createElement("button");
    dot.className = "dot";
    dot.setAttribute("aria-label", `go to slide ${index + 1}`);
    dot.addEventListener("click", (e) => {
      triggerButtonAnim(dot, e.clientX, e.clientY);
      goToSlide(index);
      restartAutoSlide();
    });
    carouselDots.appendChild(dot);
  });
  updateCarousel();
}

function startAutoSlide() {
  autoSlideInterval = setInterval(() => goToSlide(currentSlide + 1), 3600);
}

function restartAutoSlide() {
  clearInterval(autoSlideInterval);
  startAutoSlide();
}

/* ─── SIBLING FACTS ────────────────────────── */
function randomSiblingFact() {
  reasonBox.textContent = siblingFacts[Math.floor(Math.random() * siblingFacts.length)];
}

/* ─── DATE GAME HELPERS ────────────────────── */
function isSamePair(a, b, x, y) {
  return (a === x && b === y) || (a === y && b === x);
}

function isWorstCombo(a, b) {
  return worstCombos.some(([x, y]) => isSamePair(a, b, x, y));
}

function isUltimateRomanceCombo(a, b) {
  return ultimateRomanceCombos.some(([x, y]) => isSamePair(a, b, x, y));
}

function spawnConfetti() {
  const colors = ["#ffffff", "#dfe7cf", "#9cab8f", "#f5f2e8", "#b6c4a5"];
  for (let i = 0; i < 32; i++) {
    const piece = document.createElement("div");
    piece.className = "fx-piece fx-confetti";
    piece.style.left = `${randomBetween(0, 100)}%`;
    piece.style.top  = `-10px`;
    piece.style.background = randomItem(colors);
    piece.style.transform  = `rotate(${randomBetween(0, 360)}deg)`;
    dateStage.appendChild(piece);
    setTimeout(() => piece.remove(), 2600);
  }
}

function spawnRoses() {
  for (let i = 0; i < 18; i++) {
    const rose = document.createElement("div");
    rose.className = "fx-piece fx-rose";
    rose.textContent = "🌹";
    rose.style.left   = `${randomBetween(0, 100)}%`;
    rose.style.bottom = `0px`;
    dateStage.appendChild(rose);
    setTimeout(() => rose.remove(), 2800);
  }
}

function spawnExplosions() {
  const booms = ["💥", "💣", "☠️", "🚨"];
  for (let i = 0; i < 12; i++) {
    const boom = document.createElement("div");
    boom.className = "fx-piece fx-boom";
    boom.textContent = randomItem(booms);
    boom.style.left = `${randomBetween(8, 92)}%`;
    boom.style.top  = `${randomBetween(10, 80)}%`;
    dateStage.appendChild(boom);
    setTimeout(() => boom.remove(), 1000);
  }
}

/* ─── DATE GAME ────────────────────────────── */
function startGame() {
  if (matchBusy) return;

  const manOne = manOneSelect.value;
  const manTwo = manTwoSelect.value;

  if (!manOne || !manTwo) {
    gameScore.textContent = "status: incomplete";
    dateStageEmoji.textContent = "🤨";
    dateStageTitle.textContent = "pick two men first";
    dateStageResult.textContent = "u need two actual victims before i can generate nonsense.";
    return;
  }

  if (manOne === manTwo) {
    gameScore.textContent = "status: self love";
    dateStageEmoji.textContent = "🪞";
    dateStageTitle.textContent = "you set him up with himself";
    dateStageResult.textContent = `${manOne} x ${manTwo} is giving self reflection, inner healing, and a long walk with no eye contact. bold choice honestly 😭`;
    return;
  }

  matchBusy = true;
  dateMatchBtn.textContent = "cooking...";
  gameScore.textContent = "status: analysing fruit levels";

  setTimeout(() => {
    if (isWorstCombo(manOne, manTwo)) {
      dateStageEmoji.textContent = "💥";
      dateStageTitle.textContent = `${manOne} x ${manTwo} = catastrophic flop`;
      dateStageResult.textContent = randomItem(badResults);
      gameScore.textContent = "status: explosion";
      spawnExplosions();
    } else if (isUltimateRomanceCombo(manOne, manTwo)) {
      dateStageEmoji.textContent = "🌹";
      dateStageTitle.textContent = `${manOne} x ${manTwo} = elite romance`;
      dateStageResult.textContent = randomItem(roseResults);
      gameScore.textContent = "status: ultimate romance";
      spawnRoses();
    } else {
      dateStageEmoji.textContent = "🎉";
      dateStageTitle.textContent = `${manOne} x ${manTwo} = suspiciously valid`;
      dateStageResult.textContent = randomItem(goodResults);
      gameScore.textContent = "status: slay";
      spawnConfetti();
    }

    dateMatchBtn.textContent = "set them up again";
    matchBusy = false;
  }, 700);
}

function resetDateGame() {
  manOneSelect.value = "";
  manTwoSelect.value = "";
  gameScore.textContent = "status: matchmaking in progress";
  dateStageEmoji.textContent = "💌";
  dateStageTitle.textContent = "waiting for the allegations...";
  dateStageResult.textContent = "choose two men and let the website decide whether this is romance, disaster, or cinematic nonsense.";
}

/* ─── MODAL ────────────────────────────────── */
function openModal() {
  letterModal.classList.remove("hidden");
  letterModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeLetterModal() {
  letterModal.classList.add("hidden");
  letterModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

/* ─── TOUCH SWIPE ──────────────────────────── */
function handleTouchStart(event) {
  touchStartX = event.changedTouches[0].clientX;
}

function handleTouchEnd(event) {
  const endX = event.changedTouches[0].clientX;
  const diff = touchStartX - endX;
  if (Math.abs(diff) > 40) {
    if (diff > 0) goToSlide(currentSlide + 1);
    else          goToSlide(currentSlide - 1);
    restartAutoSlide();
  }
}

/* ─── EVENT LISTENERS ──────────────────────── */
enterBtn.addEventListener("click", (e) => {
  triggerButtonAnim(enterBtn, e.clientX, e.clientY);
  tryPassword();
});

passInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") tryPassword();
});

startBtn.addEventListener("click", (e) => {
  triggerButtonAnim(startBtn, e.clientX, e.clientY);
  cycleReveal();
});

startBtnTwo.addEventListener("click", (e) => {
  triggerButtonAnim(startBtnTwo, e.clientX, e.clientY);
  cycleReveal();
});

playBtn.addEventListener("click", (e) => {
  triggerButtonAnim(playBtn, e.clientX, e.clientY);
  trackLabel.textContent = "now playing: joyce's pick";
  song.play().catch(() => {});
});

pauseBtn.addEventListener("click", (e) => {
  triggerButtonAnim(pauseBtn, e.clientX, e.clientY);
  song.pause();
});

restartBtn.addEventListener("click", (e) => {
  triggerButtonAnim(restartBtn, e.clientX, e.clientY);
  song.currentTime = 0;
  song.play().catch(() => {});
});

song.addEventListener("timeupdate", updateLyrics);

prevSlide.addEventListener("click", (e) => {
  triggerButtonAnim(prevSlide, e.clientX, e.clientY);
  goToSlide(currentSlide - 1);
  restartAutoSlide();
});

nextSlide.addEventListener("click", (e) => {
  triggerButtonAnim(nextSlide, e.clientX, e.clientY);
  goToSlide(currentSlide + 1);
  restartAutoSlide();
});

carouselWrap.addEventListener("touchstart", handleTouchStart, { passive: true });
carouselWrap.addEventListener("touchend",   handleTouchEnd,   { passive: true });

reasonBtn.addEventListener("click", (e) => {
  triggerButtonAnim(reasonBtn, e.clientX, e.clientY);
  randomSiblingFact();
});

dateMatchBtn.addEventListener("click", (e) => {
  triggerButtonAnim(dateMatchBtn, e.clientX, e.clientY);
  startGame();
});

dateResetBtn.addEventListener("click", (e) => {
  triggerButtonAnim(dateResetBtn, e.clientX, e.clientY);
  resetDateGame();
});

openLetterTop.addEventListener("click", (e) => {
  triggerButtonAnim(openLetterTop, e.clientX, e.clientY);
  openModal();
});

openLetterBtn.addEventListener("click", (e) => {
  triggerButtonAnim(openLetterBtn, e.clientX, e.clientY);
  openModal();
});

openLetterBottom.addEventListener("click", (e) => {
  triggerButtonAnim(openLetterBottom, e.clientX, e.clientY);
  openModal();
});

closeModal.addEventListener("click", (e) => {
  triggerButtonAnim(closeModal, e.clientX, e.clientY);
  closeLetterModal();
});

modalOverlay.addEventListener("click", closeLetterModal);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeLetterModal();
});

/* ─── INIT ─────────────────────────────────── */
window.addEventListener("load", () => {
  runLoader();
});

buildSfxPool();
createAmbientSparks();
buildDots();
startAutoSlide();
randomSiblingFact();
attachButtonAnimations();
setupCursor();
