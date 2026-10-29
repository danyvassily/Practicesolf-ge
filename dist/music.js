export const NAMES = ["Do", "Ré", "Mi", "Fa", "Sol", "La", "Si"];
export const LETTERS = ["C", "D", "E", "F", "G", "A", "B"];
export const NATURALS = [0, 2, 4, 5, 7, 9, 11];
export const ROOTS = [
  ["Do", 0, 0],
  ["Ré♭", 1, 1],
  ["Ré", 2, 1],
  ["Mi♭", 3, 2],
  ["Mi", 4, 2],
  ["Fa", 5, 3],
  ["Fa♯", 6, 3],
  ["Sol", 7, 4],
  ["La♭", 8, 5],
  ["La", 9, 5],
  ["Si♭", 10, 6],
  ["Si", 11, 6],
];
export const SCALES = {
  major: {
    name: "Majeure",
    genre: "Classique",
    intervals: [0, 2, 4, 5, 7, 9, 11, 12],
    degrees: [0, 1, 2, 3, 4, 5, 6, 7],
    formula: "1 · 2 · 3 · 4 · 5 · 6 · 7",
    tip: "Une couleur lumineuse. Les demi-tons se trouvent entre les degrés 3–4 et 7–8.",
  },
  minor: {
    name: "Mineure naturelle",
    genre: "Classique",
    intervals: [0, 2, 3, 5, 7, 8, 10, 12],
    degrees: [0, 1, 2, 3, 4, 5, 6, 7],
    formula: "1 · 2 · ♭3 · 4 · 5 · ♭6 · ♭7",
    tip: "Compare sa tierce avec celle de la gamme majeure : elle est abaissée d’un demi-ton.",
  },
  harmonic: {
    name: "Mineure harmonique",
    genre: "Classique",
    intervals: [0, 2, 3, 5, 7, 8, 11, 12],
    degrees: [0, 1, 2, 3, 4, 5, 6, 7],
    formula: "1 · 2 · ♭3 · 4 · 5 · ♭6 · 7",
    tip: "La septième est relevée par rapport à la mineure naturelle : elle attire vers la tonique.",
  },
  pentatonic: {
    name: "Pentatonique majeure",
    genre: "Blues",
    intervals: [0, 2, 4, 7, 9, 12],
    degrees: [0, 1, 2, 4, 5, 7],
    formula: "1 · 2 · 3 · 5 · 6",
    tip: "Cinq sons pour improviser. Commence par de petites phrases de trois notes.",
  },
  minorPent: {
    name: "Pentatonique mineure",
    genre: "Blues",
    intervals: [0, 3, 5, 7, 10, 12],
    degrees: [0, 2, 3, 4, 6, 7],
    formula: "1 · ♭3 · 4 · 5 · ♭7",
    tip: "Un vocabulaire de base du blues et du rock. Laisse un silence entre deux phrases.",
  },
  blues: {
    name: "Blues mineure",
    genre: "Blues",
    intervals: [0, 3, 5, 6, 7, 10, 12],
    degrees: [0, 2, 3, 4, 4, 6, 7],
    formula: "1 · ♭3 · 4 · ♭5 · 5 · ♭7",
    tip: "La quinte diminuée est la blue note. Utilise-la comme une note de passage.",
  },
  dorian: {
    name: "Dorienne",
    genre: "Jazz",
    intervals: [0, 2, 3, 5, 7, 9, 10, 12],
    degrees: [0, 1, 2, 3, 4, 5, 6, 7],
    formula: "1 · 2 · ♭3 · 4 · 5 · 6 · ♭7",
    tip: "Une couleur mineure avec une sixte majeure. À explorer sur un accord mineur 7.",
  },
  mixolydian: {
    name: "Mixolydienne",
    genre: "Jazz",
    intervals: [0, 2, 4, 5, 7, 9, 10, 12],
    degrees: [0, 1, 2, 3, 4, 5, 6, 7],
    formula: "1 · 2 · 3 · 4 · 5 · 6 · ♭7",
    tip: "Une gamme majeure avec une septième mineure. À explorer sur un accord de dominante 7.",
  },
};
export function diatonicNote(diatonic, alter = 0) {
  const letter = ((diatonic % 7) + 7) % 7,
    octave = Math.floor(diatonic / 7);
  const accidental =
    alter === 0
      ? ""
      : alter === 1
        ? "♯"
        : alter === -1
          ? "♭"
          : alter === 2
            ? "𝄪"
            : "𝄫";
  return {
    diatonic,
    letter,
    octave,
    alter,
    midi: 12 * (octave + 1) + NATURALS[letter] + alter,
    name: NAMES[letter] + accidental,
    abc: LETTERS[letter],
  };
}
export function scaleNotes(rootIndex = 0, type = "major") {
  const root = ROOTS[rootIndex],
    definition = SCALES[type];
  if (!root || !definition) throw new RangeError("Gamme inconnue");
  const rootD = 28 + root[2],
    rootMidi = 60 + root[1];
  return definition.intervals.map((offset, i) => {
    const natural = diatonicNote(rootD + definition.degrees[i]);
    return diatonicNote(natural.diatonic, rootMidi + offset - natural.midi);
  });
}
export function frequency(midi) {
  return 440 * 2 ** ((midi - 69) / 12);
}
export function notePool(clef = "treble", level = "beginner") {
  const bottom = clef === "bass" ? 18 : 30;
  const [low, high] =
    level === "advanced"
      ? [bottom - 4, bottom + 12]
      : level === "intermediate"
        ? [bottom - 2, bottom + 10]
        : [bottom, bottom + 8];
  return Array.from({ length: high - low + 1 }, (_, i) =>
    diatonicNote(low + i),
  );
}
export function staffSVG(
  notes,
  {
    clef = "treble",
    labels = false,
    highlight = -1,
    title = "Portée musicale",
  } = {},
) {
  const bottom = clef === "bass" ? 18 : 30;
  const width = Math.max(420, 120 + notes.length * 58),
    x = (i) => 100 + (i * (width - 135)) / Math.max(notes.length, 1);
  const y = (d) => 106 - (d - bottom) * 7;
  let content = [0, 1, 2, 3, 4]
    .map(
      (i) =>
        '<line x1="24" y1="' +
        (50 + i * 14) +
        '" x2="' +
        (width - 20) +
        '" y2="' +
        (50 + i * 14) +
        '" stroke="currentColor" stroke-opacity=".35"/>',
    )
    .join("");
  content +=
    '<text x="29" y="' +
    (clef === "bass" ? 88 : 100) +
    '" font-size="' +
    (clef === "bass" ? 53 : 74) +
    '" font-family="serif">' +
    (clef === "bass" ? "𝄢" : "𝄞") +
    "</text>";
  const previousAlter = new Map();
  notes.forEach((n, i) => {
    const px = x(i),
      py = y(n.diatonic);
    for (let d = bottom - 2; d >= n.diatonic; d -= 2)
      content +=
        '<line x1="' +
        (px - 15) +
        '" y1="' +
        y(d) +
        '" x2="' +
        (px + 15) +
        '" y2="' +
        y(d) +
        '" stroke="currentColor"/>';
    for (let d = bottom + 10; d <= n.diatonic; d += 2)
      content +=
        '<line x1="' +
        (px - 15) +
        '" y1="' +
        y(d) +
        '" x2="' +
        (px + 15) +
        '" y2="' +
        y(d) +
        '" stroke="currentColor"/>';
    const color = i === highlight ? "#c66746" : "currentColor";
    if (n.alter || (previousAlter.get(n.diatonic) || 0) !== n.alter)
      content +=
        '<text x="' +
        (px - 25) +
        '" y="' +
        (py + 6) +
        '" font-size="24">' +
        (n.alter === 0
          ? "♮"
          : n.alter === 1
            ? "♯"
            : n.alter === -1
              ? "♭"
              : n.alter === 2
                ? "𝄪"
                : "𝄫") +
        "</text>";
    previousAlter.set(n.diatonic, n.alter);
    content +=
      '<ellipse cx="' +
      px +
      '" cy="' +
      py +
      '" rx="9" ry="6" transform="rotate(-18 ' +
      px +
      " " +
      py +
      ')" fill="' +
      color +
      '"/>';
    content +=
      '<line x1="' +
      (px + (py >= 78 ? 8 : -8)) +
      '" y1="' +
      py +
      '" x2="' +
      (px + (py >= 78 ? 8 : -8)) +
      '" y2="' +
      (py + (py >= 78 ? -36 : 36)) +
      '" stroke="' +
      color +
      '" stroke-width="1.6"/>';
    if (labels)
      content +=
        '<text x="' +
        px +
        '" y="171" text-anchor="middle" font-size="13" fill="currentColor">' +
        n.name +
        "</text>";
  });
  return (
    '<svg class="staff" xmlns="http://www.w3.org/2000/svg" viewBox="0 -5 ' +
    width +
    ' 190" role="img" aria-label="' +
    title +
    '">' +
    content +
    "</svg>"
  );
}
export function musicXML(
  notes,
  clef = "treble",
  title = "Exercice Atelier Piano",
) {
  const measures = [];
  for (let i = 0; i < notes.length; i += 4) {
    const group = notes.slice(i, i + 4);
    const header =
      i === 0
        ? "<attributes><divisions>1</divisions><key><fifths>0</fifths></key><time><beats>4</beats><beat-type>4</beat-type></time><clef><sign>" +
          (clef === "bass" ? "F" : "G") +
          "</sign><line>" +
          (clef === "bass" ? 4 : 2) +
          "</line></clef></attributes>"
        : "";
    const body = group
      .map(
        (n) =>
          "<note><pitch><step>" +
          n.abc +
          "</step><alter>" +
          n.alter +
          "</alter><octave>" +
          n.octave +
          "</octave></pitch><duration>1</duration><type>quarter</type></note>",
      )
      .join("");
    const rest =
      group.length < 4
        ? "<note><rest/><duration>" +
          (4 - group.length) +
          "</duration><type>" +
          { 1: "quarter", 2: "half", 3: "half" }[4 - group.length] +
          "</type>" +
          (4 - group.length === 3 ? "<dot/>" : "") +
          "</note>"
        : "";
    measures.push(
      '<measure number="' +
        (measures.length + 1) +
        '">' +
        header +
        body +
        rest +
        "</measure>",
    );
  }
  return (
    '<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 4.0 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">\n<score-partwise version="4.0"><work><work-title>' +
    title +
    '</work-title></work><part-list><score-part id="P1"><part-name>Piano</part-name></score-part></part-list><part id="P1">' +
    measures.join("") +
    "</part></score-partwise>"
  );
}
