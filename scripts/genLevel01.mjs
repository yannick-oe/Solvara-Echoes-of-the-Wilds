import fs   from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outPath   = path.join(__dirname, '..', 'assets', 'data', 'levels', 'level_01.json');

const COLS = 25;
const ROWS = 12;

// Tile-Definitionen (txCol/txRow im Tileset-Raster, 16 px)
const tiles = {
  g: { pass: false, txCol: 0, txRow: 5 },  // Gras-Oberfläche
  d: { pass: false, txCol: 1, txRow: 5 },  // Erde
  p: { pass: false, txCol: 4, txRow: 2 },  // Plattform
};

// Hilfsfunktion: leere Zeile, optional einzelne Felder füllen
function emptyRow(fills = []) {
  const r = new Array(COLS).fill(null);
  for (const [col, key] of fills) r[col] = key;
  return r;
}

// Zusammenhängende Gruppe von Plattform-Tiles
function plat(startCol, length) {
  return Array.from({ length }, (_, i) => [startCol + i, 'p']);
}

// Vollständig mit einem Key gefüllte Zeile
function fullRow(key) {
  return new Array(COLS).fill(key);
}

// ---------------------------------------------------------------------------
// Levelaufbau (25 Spalten × 12 Zeilen)
//
// Sprungweite   ≈ 3,25 Kacheln  (v²/2g = 750²/3600)
// Stufe 1 (tief):  row 7  — 3 Zeilen über dem Boden  → erreichbar
// Stufe 2 (hoch):  row 4  — 3 Zeilen über Stufe 1    → erreichbar
//
//  row  4: ........ ppp ........... ppp .....   (obere Plattformen)
//  row  7: ... ppp ......... pppp ..........    (untere Plattformen)
//  row 10: g g g g g g g g g g g g g g g g g   (Boden)
//  row 11: d d d d d d d d d d d d d d d d d   (Erde)
// ---------------------------------------------------------------------------
const map = [
  emptyRow(),                                      //  0
  emptyRow(),                                      //  1
  emptyRow(),                                      //  2
  emptyRow(),                                      //  3
  emptyRow([...plat(7, 3), ...plat(19, 3)]),       //  4  obere Stufe
  emptyRow(),                                      //  5
  emptyRow(),                                      //  6
  emptyRow([...plat(3, 3), ...plat(12, 4)]),       //  7  untere Stufe
  emptyRow(),                                      //  8
  emptyRow(),                                      //  9
  fullRow('g'),                                    // 10  Boden (Gras)
  fullRow('d'),                                    // 11  Boden (Erde)
];

const payload = { level: 'level_01', meta: { tileSize: 16, columns: COLS, rows: ROWS }, tiles, map };

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(payload, null, 2) + '\n', 'utf8');

console.log('Geschrieben:', outPath);
console.log(`${ROWS} Zeilen, ${COLS} Spalten je Zeile`);
