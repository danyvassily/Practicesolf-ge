import {
  NAMES,
  ROOTS,
  SCALES,
  diatonicNote,
  scaleNotes,
  notePool,
  staffSVG,
  musicXML,
} from "./music.js";
import { playNote, playSequence, stopAudio } from "./audio.js";

const $ = (s) => document.querySelector(s),
  main = $("#main"),
  KEY = "atelier-piano-v1";
const blank = () => ({
  version: 1,
  attempts: 0,
  correct: 0,
  sessions: [],
  days: {},
  mistakes: {},
});
let progress = blank(),
  storageAvailable = true;
try {
  const saved = JSON.parse(localStorage.getItem(KEY) || "null");
  if (saved) {
    validateProgress(saved);
    progress = saved;
  }
} catch {
  storageAvailable = false;
}
let route = "",
  quiz = null,
  scaleRoot = 0,
  scaleType = "major",
  genre = "Tous",
  bpm = 80,
  sheetType = "steps",
  sheetClef = "treble",
  sheetLevel = "beginner",
  sheetNotes = [],
  quizClef = "treble",
  quizLevel = "beginner",
  toastTimer;
const titles = {
  accueil: "Mon atelier",
  lecture: "Lecture de notes",
  oreille: "L’oreille musicale",
  gammes: "Gammes & couleurs",
  partitions: "Mes partitions",
  cours: "Les essentiels",
  progres: "Ma progression",
  sources: "Sources & ressources",
};
const today = () => {
  const d = new Date();
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
  ].join("-");
};
const dateKey = (d) =>
  [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
  ].join("-");
function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(progress));
  } catch {
    storageAvailable = false;
    toast(
      "La sauvegarde locale est indisponible. Votre séance reste utilisable.",
    );
  }
}
function toast(message) {
  $("#toast").textContent = message;
  $("#toast").classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $("#toast").classList.remove("visible"), 4000);
}
function head(eyebrow, title, description, extra = "") {
  return (
    '<div class="page-head"><div><p class="eyebrow">' +
    eyebrow +
    "</p><h1>" +
    title +
    "</h1><p>" +
    description +
    "</p></div>" +
    extra +
    "</div>"
  );
}
function select(id, label, options, value) {
  return (
    '<label class="field" for="' +
    id +
    '">' +
    label +
    '<select id="' +
    id +
    '">' +
    options
      .map(
        ([v, t]) =>
          '<option value="' +
          v +
          '"' +
          (String(value) === String(v) ? " selected" : "") +
          ">" +
          t +
          "</option>",
      )
      .join("") +
    "</select></label>"
  );
}
function stat(icon, value, label) {
  return (
    '<div class="stat"><span class="stat-icon">' +
    icon +
    "</span><div><strong>" +
    value +
    "</strong><small>" +
    label +
    "</small></div></div>"
  );
}
function accuracy() {
  return progress.attempts
    ? Math.round((100 * progress.correct) / progress.attempts)
    : 0;
}
function streak() {
  let n = 0,
    d = new Date();
  if (!progress.days[dateKey(d)]) d.setDate(d.getDate() - 1);
  while (progress.days[dateKey(d)]) {
    n++;
    d.setDate(d.getDate() - 1);
  }
  return n;
}
function pianoArt() {
  return (
    '<div class="hero-art" aria-hidden="true"><div class="hero-disc"></div><span class="hero-note">♪</span><span class="hero-note two">♫</span><div class="piano-illustration"><div class="illustration-keys">' +
    Array.from(
      { length: 10 },
      (_, i) =>
        '<span class="illustration-key ' +
        ([0, 1, 3, 4, 5].includes(i % 7) ? "black-after" : "") +
        '"></span>',
    ).join("") +
    '</div></div><span class="art-caption">À vous de jouer.</span></div>'
  );
}
function dashboard() {
  const daily = progress.days[today()] || 0,
    percent = Math.min(100, daily * 10),
    week = [];
  const day = new Date();
  day.setDate(day.getDate() - ((day.getDay() + 6) % 7));
  for (let i = 0; i < 7; i++) {
    const d = new Date(day);
    d.setDate(d.getDate() + i);
    week.push(
      '<div class="day ' +
        (progress.days[dateKey(d)] ? "done" : "") +
        '"><span>' +
        (progress.days[dateKey(d)] ? "✓" : d.getDate()) +
        "</span>" +
        ["L", "M", "M", "J", "V", "S", "D"][i] +
        "</div>",
    );
  }
  main.innerHTML =
    head(
      "UN PEU DE MUSIQUE, CHAQUE JOUR",
      "Bienvenue dans votre atelier.",
      "Le solfège à portée de main. Et le plaisir de jouer, tout simplement.",
      '<span class="date-tag">' +
        new Intl.DateTimeFormat("fr-FR", {
          day: "numeric",
          month: "long",
        }).format(new Date()) +
        "</span>",
    ) +
    '<section class="hero"><div><p class="eyebrow">VOTRE PROCHAINE PETITE VICTOIRE</p><h2>Les notes deviennent<br><em>une seconde nature.</em></h2><p>Un regard sur la portée, une note au bout des doigts.<br>Entraînez-vous à votre rythme, une note après l’autre.</p><a href="#lecture" class="btn">Commencer ma séance <span>↗</span></a></div>' +
    pianoArt() +
    "</section>" +
    '<div class="stats-row">' +
    stat("♩", progress.attempts, "notes travaillées") +
    stat(
      "◎",
      progress.attempts ? accuracy() + " %" : "—",
      "de bonnes réponses",
    ) +
    stat(
      "☀",
      streak(),
      streak() > 1
        ? "jours de pratique consécutifs"
        : "jour de pratique consécutif",
    ) +
    "</div>" +
    '<div class="section-heading"><h2>À vous de jouer</h2><span class="subtle">Trois façons de progresser</span></div><div class="practice-grid">' +
    '<a class="practice-card" href="#lecture"><span class="card-icon">𝄞</span><span class="chip">LES FONDATIONS</span><h3>Lire les notes</h3><p>Faites connaissance avec les portées,<br>en clef de sol et en clef de fa.</p><div class="card-bottom"><span>10 notes · à votre rythme</span><span>↗</span></div></a>' +
    '<a class="practice-card" href="#oreille"><span class="card-icon">♫</span><span class="chip" style="background:#f8eee7;color:#b7866e">ÉCOUTER & RECONNAÎTRE</span><h3>Tendre l’oreille</h3><p>Écoutez, comparez et retrouvez la note.<br>Votre oreille aussi peut s’entraîner.</p><div class="card-bottom"><span>10 notes · son activé</span><span>↗</span></div></a>' +
    '<a class="practice-card" href="#gammes"><span class="card-icon">▥</span><span class="chip" style="background:#f4f0e4;color:#a18c63">EXPLORER LES COULEURS</span><h3>Voyager dans les gammes</h3><p>Du classique au blues, jusqu’au jazz.<br>Découvrez ce qui fait leur couleur.</p><div class="card-bottom"><span>8 gammes · 12 tonalités</span><span>↗</span></div></a></div>' +
    '<div class="bottom-grid"><section class="panel daily"><p class="eyebrow">LA PETITE LEÇON DU JOUR</p><h2>Tout commence par cinq lignes.</h2><p>Les lignes et les interlignes ont chacun leur note.<br>Repérez le sol : c’est votre premier point d’ancrage.</p>' +
    staffSVG([diatonicNote(32)], {
      highlight: 0,
      title: "Le sol sur la deuxième ligne de la clef de sol",
    }) +
    '<a class="text-link" href="#cours">Découvrir les essentiels <span>→</span></a></section>' +
    '<section class="panel"><p class="eyebrow">VOTRE RENDEZ-VOUS QUOTIDIEN</p><h2>Un petit pas, chaque jour.</h2><div class="goal-top"><span>Objectif : 10 notes aujourd’hui</span><strong>' +
    Math.min(daily, 10) +
    ' / 10</strong></div><div class="progress-bar"><span style="width:' +
    percent +
    '%"></span></div><p class="subtle">' +
    (daily >= 10
      ? "Objectif atteint. Bravo pour votre régularité !"
      : "Quelques notes suffisent pour faire la différence.") +
    '</p><div class="goal-days">' +
    week.join("") +
    "</div></section></div>";
  if (!storageAvailable)
    main.insertAdjacentHTML(
      "beforeend",
      '<p class="muted">La sauvegarde sur cet appareil est indisponible dans ce navigateur.</p>',
    );
}
function randomNote(clef, level, previous) {
  const pool = notePool(clef, level);
  const weighted = pool.flatMap((n) =>
    Array(
      1 + Math.min(4, progress.mistakes[clef + ":" + n.diatonic] || 0),
    ).fill(n),
  );
  let candidates = weighted.filter((n) => n.diatonic !== previous);
  if (!candidates.length) candidates = weighted;
  return candidates[Math.floor(Math.random() * candidates.length)];
}
function newQuiz(mode) {
  stopAudio();
  quiz = {
    mode,
    index: 0,
    correct: 0,
    answered: false,
    finished: false,
    clef:
      quizClef === "mixed"
        ? Math.random() < 0.5
          ? "treble"
          : "bass"
        : quizClef,
    note: null,
    answers: [],
  };
  quiz.note = randomNote(quiz.clef, quizLevel);
  renderQuiz();
}
function quizPage(mode) {
  quiz = null;
  newQuiz(mode);
}
function renderQuiz() {
  const ear = quiz.mode === "oreille";
  main.innerHTML =
    head(
      ear ? "ÉCOUTER & RECONNAÎTRE" : "LES FONDATIONS",
      ear
        ? "Faites confiance à votre oreille."
        : "Une note. Un nouveau repère.",
      ear
        ? "Un exercice de reconnaissance avec référence : écoutez le do, puis comparez la note mystère."
        : "Nommez la note sur la portée. Prenez votre temps, la vitesse viendra ensuite.",
    ) +
    '<div class="exercise"><div class="toolbar">' +
    select(
      "quiz-clef",
      "Clef",
      [
        ["treble", "Clef de sol"],
        ["bass", "Clef de fa"],
        ["mixed", "Les deux clefs"],
      ],
      quizClef,
    ) +
    select(
      "quiz-level",
      "Difficulté",
      [
        ["beginner", "1 · Sur la portée"],
        ["intermediate", "2 · Premières lignes supplémentaires"],
        ["advanced", "3 · Étendue élargie"],
      ],
      quizLevel,
    ) +
    '<button class="btn ghost" id="restart">Nouvelle séance</button></div>' +
    '<div class="quiz-meta"><span>Note ' +
    (quiz.index + 1) +
    " sur 10 · " +
    (quiz.clef === "treble" ? "Clef de sol" : "Clef de fa") +
    "</span><span>" +
    quiz.correct +
    " bonne" +
    (quiz.correct > 1 ? "s" : "") +
    " réponse" +
    (quiz.correct > 1 ? "s" : "") +
    '</span></div><div class="progress-bar"><span style="width:' +
    quiz.index * 10 +
    '%"></span></div>' +
    '<section class="panel quiz-panel"><p class="eyebrow">' +
    (ear ? "ÉCOUTEZ PUIS CHOISISSEZ" : "OBSERVEZ LA PORTÉE") +
    "</p><h2>Quelle est cette note ?</h2>" +
    (ear
      ? '<div class="ear-symbol" aria-hidden="true">♫</div>'
      : staffSVG([quiz.note], {
          title:
            "Note mystère à identifier, " +
            (quiz.clef === "treble" ? "clef de sol" : "clef de fa"),
        })) +
    '<div class="quiz-actions">' +
    (ear
      ? '<button class="btn secondary" id="reference">♩ Do de référence</button>'
      : "") +
    '<button class="btn ' +
    (ear ? "" : "secondary") +
    '" id="listen">♫ ' +
    (ear ? "Écouter la note mystère" : "Écouter la note") +
    "</button></div>" +
    '<div class="answer-row">' +
    NAMES.map(
      (n, i) =>
        '<button class="answer" data-answer="' +
        i +
        '">' +
        n +
        "<small>" +
        (i + 1) +
        "</small></button>",
    ).join("") +
    '</div><p class="subtle">Répondez avec les boutons ou les touches 1 à 7. Les octaves ne sont pas évaluées.</p>' +
    '<div id="feedback" class="feedback" aria-live="polite">' +
    (ear
      ? "Astuce : rejouez le do de référence avant la note mystère. Toutes les notes de cet exercice sont naturelles."
      : "Les lignes se comptent de bas en haut. Trouvez un repère et avancez note par note.") +
    '</div><div class="quiz-actions"><button id="next" class="btn" disabled>Note suivante →</button></div></section></div>';
  $("#quiz-clef").onchange = (e) => {
    quizClef = e.target.value;
    newQuiz(quiz.mode);
  };
  $("#quiz-level").onchange = (e) => {
    quizLevel = e.target.value;
    newQuiz(quiz.mode);
  };
  $("#restart").onclick = () => newQuiz(quiz.mode);
  $("#listen").onclick = () => sound(() => playNote(quiz.note.midi));
  if (ear)
    $("#reference").onclick = () =>
      sound(() => playNote(quiz.clef === "bass" ? 48 : 60));
  document
    .querySelectorAll("[data-answer]")
    .forEach((b) => (b.onclick = () => answer(Number(b.dataset.answer))));
  $("#next").onclick = nextQuestion;
}
function sound(action) {
  Promise.resolve()
    .then(action)
    .catch((e) => toast(e.message || "Impossible de démarrer le son."));
}
function answer(letter) {
  if (!quiz || quiz.answered || quiz.finished) return;
  quiz.answered = true;
  const ok = letter === quiz.note.letter;
  if (ok) quiz.correct++;
  const key = quiz.clef + ":" + quiz.note.diatonic;
  progress.attempts++;
  progress.correct += Number(ok);
  progress.days[today()] = (progress.days[today()] || 0) + 1;
  progress.mistakes[key] = Math.max(
    0,
    (progress.mistakes[key] || 0) + (ok ? -1 : 1),
  );
  quiz.answers.push({
    note: quiz.note.name,
    octave: quiz.note.octave,
    clef: quiz.clef,
    ok,
  });
  save();
  document.querySelectorAll("[data-answer]").forEach((b) => {
    const n = Number(b.dataset.answer);
    b.disabled = true;
    if (n === quiz.note.letter) b.classList.add("correct");
    else if (n === letter) b.classList.add("wrong");
  });
  const d = quiz.note.diatonic - (quiz.clef === "bass" ? 18 : 30);
  const position =
    d >= 0 && d <= 8
      ? d % 2 === 0
        ? "sur la " + (d / 2 + 1) + "ᵉ ligne"
        : "dans le " + (d + 1) / 2 + "ᵉ interligne"
      : "sur une ligne ou un interligne supplémentaire";
  $("#feedback").className = "feedback " + (ok ? "good" : "bad");
  $("#feedback").textContent =
    (ok ? "Bien joué ! " : "À retenir : ") +
    quiz.note.name +
    " " +
    quiz.note.octave +
    ", " +
    position +
    ". " +
    (quiz.clef === "treble"
      ? "En clef de sol, la deuxième ligne est un sol."
      : "En clef de fa, la quatrième ligne est un fa.");
  if (quiz.mode === "oreille")
    $(".ear-symbol").outerHTML = staffSVG([quiz.note], {
      labels: true,
      title: "Correction : " + quiz.note.name + " " + quiz.note.octave,
    });
  $("#next").disabled = false;
  $("#next").textContent =
    quiz.index === 9 ? "Voir mon bilan →" : "Note suivante →";
  $("#next").focus();
}
function nextQuestion() {
  if (!quiz?.answered) return;
  if (quiz.index === 9) {
    quiz.finished = true;
    progress.sessions.push({
      date: new Date().toISOString(),
      mode: quiz.mode,
      correct: quiz.correct,
      total: 10,
      level: quizLevel,
    });
    progress.sessions = progress.sessions.slice(-200);
    save();
    renderResults();
    return;
  }
  const previous = quiz.note.diatonic;
  quiz.index++;
  quiz.answered = false;
  quiz.clef =
    quizClef === "mixed" ? (Math.random() < 0.5 ? "treble" : "bass") : quizClef;
  quiz.note = randomNote(quiz.clef, quizLevel, previous);
  renderQuiz();
}
function renderResults() {
  main.innerHTML =
    head(
      "UNE SÉANCE DE PLUS",
      "Chaque note compte.",
      "Prenez un instant pour observer vos progrès.",
    ) +
    '<section class="panel quiz-panel exercise"><p class="eyebrow">SÉANCE TERMINÉE</p><div class="results-number">' +
    quiz.correct +
    "<small> / 10</small></div><h2>" +
    (quiz.correct >= 8
      ? "Vos repères prennent forme."
      : "Vous construisez vos repères.") +
    '</h2><p class="muted">Les notes qui vous posent difficulté reviendront plus souvent.</p><div class="table-wrap"><table><thead><tr><th>Note</th><th>Clef</th><th>Résultat</th></tr></thead><tbody>' +
    quiz.answers
      .map(
        (a) =>
          "<tr><td>" +
          a.note +
          " " +
          a.octave +
          "</td><td>" +
          (a.clef === "treble" ? "Sol" : "Fa") +
          "</td><td>" +
          (a.ok ? "✓ Reconnue" : "À revoir") +
          "</td></tr>",
      )
      .join("") +
    '</tbody></table></div><div class="action-row"><button class="btn" id="again">Recommencer →</button><a class="btn secondary" href="#progres">Ma progression</a></div></section>';
  $("#again").onclick = () => newQuiz(quiz.mode);
}
function keyboard(notes = []) {
  const midiSet = new Set(notes.map((n) => n.midi));
  const whites = Array.from({ length: 15 }, (_, i) => diatonicNote(28 + i));
  let html = whites
    .map(
      (n) =>
        '<button class="white-key ' +
        (midiSet.has(n.midi) ? "is-active" : "") +
        '" data-midi="' +
        n.midi +
        '" aria-label="Jouer ' +
        n.name +
        " " +
        n.octave +
        '">' +
        n.name +
        (n.letter === 0 ? " " + n.octave : "") +
        "</button>",
    )
    .join("");
  whites.forEach((n, i) => {
    if ([0, 1, 3, 4, 5].includes(n.letter) && i < 14) {
      const midi = n.midi + 1;
      html +=
        '<button class="black-key ' +
        (midiSet.has(midi) ? "is-active" : "") +
        '" style="left:' +
        (((i + 1) * 100) / 15 - 2.25) +
        '%" data-midi="' +
        midi +
        '" aria-label="Jouer ' +
        n.name +
        " dièse " +
        n.octave +
        '">' +
        n.name +
        "♯</button>";
    }
  });
  return (
    '<div class="keyboard" aria-label="Piano virtuel de do 4 à do 6">' +
    html +
    '</div><p class="keyboard-caption">Touchez les touches pour les écouter · Son de piano synthétisé</p>'
  );
}
function bindKeys() {
  document
    .querySelectorAll("[data-midi]")
    .forEach(
      (b) => (b.onclick = () => sound(() => playNote(Number(b.dataset.midi)))),
    );
}
function scalesPage() {
  const def = SCALES[scaleType],
    notes = scaleNotes(scaleRoot, scaleType);
  main.innerHTML =
    head(
      "EXPLORER LES COULEURS",
      "Une gamme, mille possibilités.",
      "Écoutez les intervalles, observez les notes et découvrez leur couleur au clavier.",
    ) +
    '<div class="segmented" role="group" aria-label="Filtrer les gammes par style">' +
    ["Tous", "Classique", "Blues", "Jazz"]
      .map(
        (g) =>
          '<button class="segment ' +
          (g === genre ? "active" : "") +
          '" aria-pressed="' +
          (g === genre) +
          '" data-genre="' +
          g +
          '">' +
          g +
          "</button>",
      )
      .join("") +
    "</div>" +
    '<div class="toolbar">' +
    select(
      "scale-root",
      "Tonique",
      ROOTS.map((r, i) => [i, r[0]]),
      scaleRoot,
    ) +
    select(
      "scale-type",
      "Gamme ou mode",
      Object.entries(SCALES)
        .filter(([, v]) => genre === "Tous" || v.genre === genre)
        .map(([k, v]) => [k, v.name]),
      scaleType,
    ) +
    '<label class="field" for="tempo">Tempo : <span id="tempo-label">' +
    bpm +
    ' BPM</span><input id="tempo" type="range" min="40" max="160" step="5" value="' +
    bpm +
    '"></label></div>' +
    '<div class="scale-layout"><section class="panel"><p class="eyebrow">' +
    def.genre +
    " · " +
    (notes.length - 1) +
    " SONS</p><h2>" +
    ROOTS[scaleRoot][0] +
    " — " +
    def.name +
    '</h2><div id="scale-staff">' +
    staffSVG(notes, {
      labels: true,
      title: "Gamme de " + ROOTS[scaleRoot][0] + " " + def.name,
    }) +
    '</div><div class="quiz-actions"><button class="btn" id="play-scale">♫ Écouter la gamme</button><button class="btn secondary" id="stop-scale">■ Arrêter</button></div>' +
    keyboard(notes) +
    '</section><aside class="panel"><p class="eyebrow">LA RECETTE MUSICALE</p><h2>Entendre la différence.</h2><p class="formula">' +
    def.formula +
    '</p><p class="subtle">Degrés par rapport à la gamme majeure de même tonique.</p><div class="scale-notes">' +
    notes
      .slice(0, -1)
      .map(
        (n, i) =>
          '<span class="note-pill">' +
          n.name +
          "<small>" +
          (i + 1) +
          "</small></span>",
      )
      .join("") +
    '</div><p class="tip">' +
    def.tip +
    '</p><p class="subtle">Les styles sont des portes d’entrée : une même gamme peut servir dans plusieurs genres.</p><button class="btn ghost" id="scale-export">↓ Export MusicXML</button></aside></div>';
  document.querySelectorAll("[data-genre]").forEach(
    (b) =>
      (b.onclick = () => {
        genre = b.dataset.genre;
        if (genre !== "Tous" && SCALES[scaleType].genre !== genre)
          scaleType = Object.keys(SCALES).find(
            (k) => SCALES[k].genre === genre,
          );
        stopAudio();
        scalesPage();
      }),
  );
  $("#scale-root").onchange = (e) => {
    scaleRoot = Number(e.target.value);
    stopAudio();
    scalesPage();
  };
  $("#scale-type").onchange = (e) => {
    scaleType = e.target.value;
    stopAudio();
    scalesPage();
  };
  $("#tempo").oninput = (e) => {
    bpm = Number(e.target.value);
    $("#tempo-label").textContent = bpm + " BPM";
  };
  $("#play-scale").onclick = () =>
    sound(() =>
      playSequence([...notes, ...notes.slice(0, -1).reverse()], bpm, (i) => {
        const j = i < notes.length ? i : notes.length - 2 - (i - notes.length);
        if (route === "gammes" && $("#scale-staff"))
          $("#scale-staff").innerHTML = staffSVG(notes, {
            labels: true,
            highlight: i === -1 ? -1 : j,
            title: "Gamme de " + ROOTS[scaleRoot][0] + " " + def.name,
          });
      }),
    );
  $("#stop-scale").onclick = () => {
    stopAudio();
    $("#scale-staff").innerHTML = staffSVG(notes, {
      labels: true,
      title: "Gamme de " + ROOTS[scaleRoot][0] + " " + def.name,
    });
  };
  $("#scale-export").onclick = () =>
    download(
      "gamme.musicxml",
      musicXML(notes, "treble", "Gamme Atelier Piano"),
      "application/vnd.recordare.musicxml+xml",
    );
  bindKeys();
}
function generateSheet() {
  const base = sheetClef === "bass" ? 21 : 28;
  if (sheetType === "steps") {
    const pattern = [0, 1, 2, 3, 4, 3, 2, 1, 0, 2, 4, 2, 1, 3, 2, 0];
    sheetNotes = pattern.map((i) => diatonicNote(base + i));
  } else if (sheetType === "thirds") {
    sheetNotes = [0, 2, 1, 3, 2, 4, 3, 5, 4, 6, 5, 7, 6, 4, 2, 0].map((i) =>
      diatonicNote(base + i),
    );
  } else if (sheetType === "scale") {
    sheetNotes = [
      ...scaleNotes(scaleRoot, scaleType),
      ...scaleNotes(scaleRoot, scaleType).slice(0, -1).reverse(),
    ];
    if (sheetClef === "bass")
      sheetNotes = sheetNotes.map((n) =>
        diatonicNote(n.diatonic - 14, n.alter),
      );
  } else {
    const pool = notePool(sheetClef, sheetLevel);
    sheetNotes = Array.from(
      { length: 16 },
      () => pool[Math.floor(Math.random() * pool.length)],
    );
  }
}
function sheetName() {
  return {
    steps: "Premiers pas en position de do",
    thirds: "Les tierces, pas à pas",
    random: "Lecture à vue — notes naturelles",
    scale: ROOTS[scaleRoot][0] + " — " + SCALES[scaleType].name,
  }[sheetType];
}
function sheetsPage(regenerate = true) {
  stopAudio();
  if (regenerate || !sheetNotes.length) generateSheet();
  main.innerHTML =
    head(
      "LE PAPIER AUSSI FAIT PROGRESSER",
      "Votre pupitre vous attend.",
      "Des exercices originaux à écouter, imprimer ou ouvrir dans votre logiciel de partition.",
    ) +
    '<div class="toolbar no-print">' +
    select(
      "sheet-type",
      "Exercice",
      [
        ["steps", "1 · Notes conjointes"],
        ["thirds", "2 · Intervalles de tierces"],
        ["random", "3 · Lecture à vue"],
        ["scale", "4 · Gamme sélectionnée"],
      ],
      sheetType,
    ) +
    select(
      "sheet-clef",
      "Clef",
      [
        ["treble", "Clef de sol"],
        ["bass", "Clef de fa"],
      ],
      sheetClef,
    ) +
    select(
      "sheet-level",
      "Étendue (lecture à vue)",
      [
        ["beginner", "Sur la portée"],
        ["intermediate", "Premières lignes supplémentaires"],
        ["advanced", "Étendue élargie"],
      ],
      sheetLevel,
    ) +
    '<button id="regenerate" class="btn ghost">↻ Nouvel exercice</button></div>' +
    '<section class="panel"><div class="sheet-preview"><p class="eyebrow">ATELIER PIANO · EXERCICE ORIGINAL</p><h3>' +
    sheetName() +
    '</h3><p class="sheet-caption">Clef de ' +
    (sheetClef === "bass" ? "fa" : "sol") +
    ' · Noires régulières · ♩ = 60 · Jouer lentement, puis nommer chaque note</p><p class="print-only print-title">Nom : _________________________ &nbsp; Date : ______________</p>' +
    Array.from({ length: Math.ceil(sheetNotes.length / 4) }, (_, i) =>
      staffSVG(sheetNotes.slice(i * 4, i * 4 + 4), {
        clef: sheetClef,
        title: "Exercice, mesure " + (i + 1),
      }),
    ).join("") +
    '<p class="sheet-caption">Chaque ligne représente une mesure de 4 temps. ' +
    (sheetNotes.length % 4
      ? "Terminez la dernière mesure par " +
        (4 - (sheetNotes.length % 4)) +
        " temps de silence. "
      : "") +
    'Respirez et gardez un tempo régulier.</p><p class="print-only">Conseil : lisez les notes sans piano, puis jouez-les. Répétez trois fois sans erreur avant d’accélérer.</p></div><div class="action-row no-print"><button class="btn" id="play-sheet">♫ Écouter à 60 BPM</button><button class="btn secondary" id="stop-sheet">■ Arrêter</button><button class="btn secondary" id="print-sheet">Imprimer / PDF</button><button class="btn ghost" id="export-sheet">↓ MusicXML</button></div></section>' +
    '<section class="panel no-print" style="margin-top:24px"><p class="eyebrow">POUR ALLER PLUS LOIN</p><h2>Les classiques du pupitre.</h2><p class="muted">Des partitions externes pour prolonger la pratique. Vérifiez la licence de l’édition proposée.</p>' +
    '<div class="resource"><span class="resource-icon">𝄞</span><div><h3>Czerny · Méthode pratique, op. 599</h3><p>Premières leçons au piano. Commencez par les exercices 1 à 5, à tempo lent.</p><span class="chip">ÉDITIONS HISTORIQUES · DOMAINE PUBLIC SELON PAYS</span></div><a class="btn secondary" href="https://imslp.org/wiki/Practical_Exercises_for_Beginners%2C_Op.599_%28Czerny%2C_Carl%29" target="_blank" rel="noopener noreferrer">Ouvrir les partitions ↗</a></div>' +
    '<div class="resource"><span class="resource-icon">♩</span><div><h3>Partition historique de Czerny</h3><p>PDF numérisé : Practical Method for Beginners, édition Schirmer. Lien externe.</p></div><a class="btn secondary" href="https://s9.imslp.org/files/imglnks/usimg/b/b8/IMSLP105466-PMLP08821-Practical_Method_for_Beginners.pdf" target="_blank" rel="noopener noreferrer">Consulter le PDF ↗</a></div></section>';
  $("#sheet-type").onchange = (e) => {
    sheetType = e.target.value;
    sheetsPage();
  };
  $("#sheet-clef").onchange = (e) => {
    sheetClef = e.target.value;
    sheetsPage();
  };
  $("#sheet-level").onchange = (e) => {
    sheetLevel = e.target.value;
    sheetsPage();
  };
  $("#regenerate").onclick = () => sheetsPage();
  $("#play-sheet").onclick = () => sound(() => playSequence(sheetNotes, 60));
  $("#stop-sheet").onclick = stopAudio;
  $("#print-sheet").onclick = () => window.print();
  $("#export-sheet").onclick = () =>
    download(
      "exercice-atelier-piano.musicxml",
      musicXML(sheetNotes, sheetClef, "Exercice Atelier Piano"),
      "application/vnd.recordare.musicxml+xml",
    );
}
function lessonsPage() {
  main.innerHTML =
    head(
      "COMPRENDRE POUR MIEUX JOUER",
      "Les essentiels, tout simplement.",
      "Quelques repères clairs pour transformer les symboles en musique.",
    ) +
    '<div class="lesson-grid"><article class="lesson"><p class="eyebrow">01 · LA PORTÉE</p><h2>Cinq lignes, une infinité de musiques.</h2><p>Une portée comporte <strong>5 lignes et 4 interlignes</strong>, comptés de bas en haut. Monter d’une ligne à l’interligne suivant fait avancer d’un nom de note : do, ré, mi, fa, sol, la, si, puis do.</p>' +
    staffSVG(
      [30, 31, 32, 33, 34, 35, 36, 37, 38].map((d) => diatonicNote(d)),
      { labels: true, title: "Les notes de la portée en clef de sol" },
    ) +
    "<p>Les petites lignes supplémentaires prolongent la portée. Le do central du piano (do 4) se trouve sur la première ligne supplémentaire sous la clef de sol.</p></article>" +
    '<article class="lesson"><p class="eyebrow">02 · LA CLEF DE SOL</p><h2>Le sol vous montre le chemin.</h2><p>La clef de sol indique le <strong>sol sur la deuxième ligne</strong>. Les lignes sont mi, sol, si, ré, fa ; les interlignes sont fa, la, do, mi.</p>' +
    staffSVG(
      [32, 34, 36].map((d) => diatonicNote(d)),
      { labels: true, highlight: 0, title: "Sol, si et ré en clef de sol" },
    ) +
    '<p>Au piano, on l’utilise souvent pour la main droite, mais le choix de la clef dépend du registre, pas de la main.</p><a class="text-link" href="#lecture">Mettre en pratique →</a></article>' +
    '<article class="lesson"><p class="eyebrow">03 · LA CLEF DE FA</p><h2>Un autre registre, les mêmes notes.</h2><p>Les deux points entourent la <strong>quatrième ligne : le fa</strong>. Les lignes sont sol, si, ré, fa, la ; les interlignes sont la, do, mi, sol.</p>' +
    staffSVG(
      [18, 20, 22, 24, 26].map((d) => diatonicNote(d)),
      {
        clef: "bass",
        labels: true,
        highlight: 3,
        title: "Lignes en clef de fa : sol, si, ré, fa, la",
      },
    ) +
    "<p>Le do central (do 4) se trouve sur la première ligne supplémentaire au-dessus de la portée en clef de fa.</p></article>" +
    '<article class="lesson"><p class="eyebrow">04 · TONS & DEMI-TONS</p><h2>Les petits pas qui changent tout.</h2><p>Un <strong>demi-ton</strong> sépare deux touches voisines du piano, noires ou blanches. Un ton correspond à deux demi-tons. Entre mi–fa et si–do, il n’y a pas de touche noire : seulement un demi-ton.</p><p><strong>♯ Dièse</strong> : monte d’un demi-ton.<br><strong>♭ Bémol</strong> : descend d’un demi-ton.<br><strong>♮ Bécarre</strong> : annule une altération.</p><p>Do♯ et ré♭ correspondent à la même touche sur un piano accordé au tempérament égal ; leur écriture dépend du contexte musical.</p></article>' +
    '<article class="lesson"><p class="eyebrow">05 · LE RYTHME</p><h2>Donner du temps à chaque note.</h2><p>Avec la noire comme unité de temps : <strong>une ronde = 4 temps, une blanche = 2 temps, une noire = 1 temps, une croche = ½ temps.</strong></p><p>En 4/4, chaque mesure contient quatre temps de noire. Comptez « 1, 2, 3, 4 » régulièrement. Le tempo en BPM indique le nombre de pulsations par minute ; nos exercices utilisent la noire comme pulsation.</p><p>Commencez lentement : la régularité compte plus que la vitesse. Les exercices imprimables de cette version utilisent des noires.</p></article>' +
    '<article class="lesson"><p class="eyebrow">06 · LES GAMMES</p><h2>Une recette d’intervalles.</h2><p>La gamme majeure suit : <strong>ton, ton, demi-ton, ton, ton, ton, demi-ton</strong>. En do : do, ré, mi, fa, sol, la, si, do.</p><p>La mineure naturelle abaisse les degrés 3, 6 et 7 de la majeure de même tonique. Le blues mineur ajoute une quinte diminuée à la pentatonique mineure. En jazz, le dorien et le mixolydien offrent d’autres couleurs.</p><a class="text-link" href="#gammes">Explorer les gammes au clavier →</a></article></div>' +
    '<div class="panel" style="margin-top:20px"><p class="eyebrow">VOTRE PARCOURS CONSEILLÉ</p><h2>Dix minutes qui font avancer.</h2><p class="muted">3 minutes de lecture en clef de sol → 3 minutes en clef de fa → 2 minutes d’écoute avec référence → 2 minutes sur une gamme. Passez au niveau suivant après deux séances à au moins 8/10.</p></div>';
}
function progressPage() {
  const sessions = [...progress.sessions].reverse().slice(0, 20);
  main.innerHTML =
    head(
      "OBSERVER LE CHEMIN PARCOURU",
      "Vos petites victoires s’additionnent.",
      "Votre progression est enregistrée uniquement dans ce navigateur, sur cet appareil.",
    ) +
    '<div class="stats-row">' +
    stat("♩", progress.attempts, "réponses enregistrées") +
    stat(
      "◎",
      progress.attempts ? accuracy() + " %" : "—",
      "de bonnes réponses",
    ) +
    stat("▧", progress.sessions.length, "séances terminées") +
    "</div>" +
    '<section class="panel"><h2>Votre carnet de pratique.</h2>' +
    (sessions.length
      ? '<div class="table-wrap"><table><thead><tr><th>Date</th><th>Exercice</th><th>Niveau</th><th>Résultat</th></tr></thead><tbody>' +
        sessions
          .map(
            (s) =>
              "<tr><td>" +
              new Date(s.date).toLocaleDateString("fr-FR") +
              "</td><td>" +
              (s.mode === "lecture" ? "Lecture de notes" : "Oreille musicale") +
              "</td><td>" +
              ({
                beginner: "Débutant",
                intermediate: "Intermédiaire",
                advanced: "Étendue élargie",
              }[s.level] || "—") +
              "</td><td>" +
              s.correct +
              " / " +
              s.total +
              "</td></tr>",
          )
          .join("") +
        "</tbody></table></div>"
      : '<div class="empty"><span class="card-icon">𝄞</span><h2>La première page est à vous.</h2><p class="muted">Terminez une séance de dix notes pour écrire votre première ligne dans ce carnet.</p><a class="btn" href="#lecture">Commencer une séance →</a></div>') +
    '<div class="action-row"><button class="btn secondary" id="export-progress">↓ Sauvegarder mes données</button><button class="btn ghost" id="import-progress">↑ Restaurer une sauvegarde</button><input type="file" id="progress-file" accept=".json,application/json" hidden><button class="btn danger" id="reset-progress">Effacer ma progression</button></div><p class="subtle">Les réponses sont comptées immédiatement, même si vous quittez une séance. Le carnet affiche les 20 dernières séances terminées ; 200 sont conservées. Les gammes et partitions ne modifient pas ces statistiques.</p></section>' +
    '<dialog id="reset-dialog"><h2>Effacer votre progression ?</h2><p>Cette action supprime les statistiques de cet appareil. Sauvegardez-les auparavant si vous souhaitez les conserver.</p><div class="action-row"><button class="btn secondary" id="cancel-reset">Annuler</button><button class="btn danger" id="confirm-reset">Tout effacer</button></div></dialog>';
  $("#export-progress").onclick = () =>
    download(
      "atelier-piano-progression.json",
      JSON.stringify(progress, null, 2),
      "application/json",
    );
  $("#import-progress").onclick = () => $("#progress-file").click();
  $("#progress-file").onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast("Fichier trop volumineux (2 Mo maximum).");
      return;
    }
    try {
      const data = JSON.parse(await file.text());
      validateProgress(data);
      progress = data;
      save();
      progressPage();
      toast("Votre progression a été restaurée.");
    } catch {
      toast("Cette sauvegarde est invalide ou incompatible.");
    }
  };
  $("#reset-progress").onclick = () => $("#reset-dialog").showModal();
  $("#cancel-reset").onclick = () => $("#reset-dialog").close();
  $("#confirm-reset").onclick = () => {
    progress = blank();
    save();
    progressPage();
    toast("Progression effacée sur cet appareil.");
  };
}
function validateProgress(p) {
  const count = (n) => Number.isSafeInteger(n) && n >= 0;
  if (
    !p ||
    p.version !== 1 ||
    !count(p.attempts) ||
    !count(p.correct) ||
    p.correct > p.attempts ||
    !Array.isArray(p.sessions) ||
    p.sessions.length > 200 ||
    !p.days ||
    Array.isArray(p.days) ||
    !p.mistakes ||
    Array.isArray(p.mistakes)
  )
    throw Error();
  for (const [date, n] of Object.entries(p.days))
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !count(n)) throw Error();
  for (const [k, n] of Object.entries(p.mistakes))
    if (!/^(treble|bass):\d+$/.test(k) || !count(n)) throw Error();
  for (const s of p.sessions)
    if (
      !s ||
      !["lecture", "oreille"].includes(s.mode) ||
      !["beginner", "intermediate", "advanced"].includes(s.level) ||
      !count(s.correct) ||
      s.total !== 10 ||
      s.correct > 10 ||
      typeof s.date !== "string" ||
      !Number.isFinite(Date.parse(s.date))
    )
      throw Error();
}
function sourcesPage() {
  main.innerHTML =
    head(
      "DES BASES SOLIDES",
      "Les sources de votre atelier.",
      "Références pédagogiques consultées et ressources pour aller plus loin.",
    ) +
    '<section class="panel"><h2>Comprendre les notes et les gammes.</h2><ol class="source-list"><li><a href="https://www.musictheory.net/lessons" target="_blank" rel="noopener noreferrer">musictheory.net — Lessons</a><br>Portées, clefs, lignes supplémentaires, durées, gammes majeures et mineures. Notre parcours et nos explications sont rédigés pour Atelier Piano.</li><li><a href="https://viva.pressbooks.pub/openmusictheory/chapter/intro-to-diatonic-modes-and-the-chromatic-scale/" target="_blank" rel="noopener noreferrer">Open Music Theory — Diatonic Modes</a><br>Référence pour les modes dorien et mixolydien et leurs intervalles.</li><li><a href="https://viva.pressbooks.pub/openmusictheorycopy/chapter/blues-melodies-and-the-blues-scale/" target="_blank" rel="noopener noreferrer">Open Music Theory — Blues Melodies and the Blues Scale</a><br>Référence pour la pentatonique mineure et l’ajout de la blue note.</li><li><a href="https://imslp.org/wiki/Practical_Exercises_for_Beginners%2C_Op.599_%28Czerny%2C_Carl%29" target="_blank" rel="noopener noreferrer">IMSLP — Czerny, op. 599</a><br>Bibliothèque de partitions. Certaines éditions historiques sont indiquées comme domaine public ; des éditions récentes ont leur propre licence, notamment CC BY 4.0 pour l’édition Pannenberg des exercices 1–10. Vérifiez les conditions de l’édition et de votre pays.</li></ol><h2>À propos de cette première version.</h2><p class="muted">Les gammes sont calculées à partir de leurs intervalles, dans les douze tonalités. Les exercices affichés sont originaux et générés par l’application ; les partitions de Czerny sont des liens externes, non recopiées. L’audio est une synthèse, sans enregistrement téléchargé.</p><p class="muted">L’exercice d’oreille est une reconnaissance de note avec do de référence et réponses sans octave. Il ne mesure pas l’oreille absolue. Aucun microphone, compte ou piano MIDI n’est requis.</p><p class="muted">La progression reste sur cet appareil. Des polices Google peuvent être chargées ; une police locale prend le relais si la connexion est indisponible. Le piano et les exercices fonctionnent sans API externe après chargement des fichiers.</p></section>';
}
function download(filename, content, type) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function navigate() {
  stopAudio();
  const next = location.hash.slice(1) || "accueil";
  route = titles[next] ? next : "accueil";
  quiz = null;
  $("#breadcrumb").textContent = titles[route];
  document.title = titles[route] + " · Atelier Piano";
  document.querySelectorAll("[data-nav]").forEach((a) => {
    a.classList.toggle("active", a.dataset.nav === route);
    if (a.dataset.nav === route) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  });
  ({
    accueil: dashboard,
    lecture: () => quizPage("lecture"),
    oreille: () => quizPage("oreille"),
    gammes: scalesPage,
    partitions: sheetsPage,
    cours: lessonsPage,
    progres: progressPage,
    sources: sourcesPage,
  })[route]();
  window.scrollTo({ top: 0, behavior: "instant" });
}
document.addEventListener("keydown", (e) => {
  if (
    ["INPUT", "SELECT", "TEXTAREA"].includes(document.activeElement?.tagName) ||
    e.altKey ||
    e.ctrlKey ||
    e.metaKey
  )
    return;
  if (["lecture", "oreille"].includes(route) && /^[1-7]$/.test(e.key)) {
    e.preventDefault();
    answer(Number(e.key) - 1);
  }
});
window.addEventListener("hashchange", navigate);
document.addEventListener("visibilitychange", () => {
  if (document.hidden) stopAudio();
});
navigate();
