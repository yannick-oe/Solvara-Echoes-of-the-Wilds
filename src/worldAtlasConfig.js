import { ENEMY_TYPE } from "./constants.js"; // Importiert eine in dieser Datei verwendete Abhaengigkeit.

export const PROP_FRAMES = { // Deklariert einen gemeinsamen konstanten Wert.
  "big-crate": { sx: 50, sy: 59, sw: 32, sh: 32 }, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
  "block-big": { sx: 2, sy: 93, sw: 32, sh: 32 }, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
  block: { sx: 84, sy: 19, sw: 16, sh: 16 }, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
  crate: { sx: 26, sy: 37, sw: 16, sh: 16 }, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
  "face-block": { sx: 36, sy: 93, sw: 32, sh: 32 }, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
  "platform-long": { sx: 50, sy: 19, sw: 32, sh: 16 }, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
  "small-platform": { sx: 32, sy: 19, sw: 16, sh: 16 }, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
  door: { sx: 70, sy: 93, sw: 22, sh: 33 }, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
  bush: { sx: 2, sy: 59, sw: 46, sh: 28 }, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
  tree: { sx: 2, sy: 128, sw: 105, sh: 93 }, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
  house: { sx: 2, sy: 223, sw: 87, sh: 108 }, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
  shrooms: { sx: 73, sy: 2, sw: 16, sh: 15 }, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
  sign: { sx: 68, sy: 37, sw: 18, sh: 20 }, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
  skulls: { sx: 36, sy: 2, sw: 16, sh: 10 }, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
  rock: { sx: 2, sy: 19, sw: 28, sh: 15 }, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
  spikes: { sx: 19, sy: 2, sw: 15, sh: 10 }, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
  "spikes-top": { sx: 2, sy: 2, sw: 15, sh: 9 }, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
  "spike-skull": { sx: 54, sy: 2, sw: 17, sh: 12 }, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
  "crank-down": { sx: 2, sy: 37, sw: 22, sh: 16 }, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
  "crank-up": { sx: 44, sy: 37, sw: 22, sh: 16 }, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
};

export const WORLD_PROP_KEYS = { // Deklariert einen gemeinsamen konstanten Wert.
  solid: [ // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    "big-crate", // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    "block-big", // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    "block", // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    "crate", // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    "face-block", // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    "platform-long", // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    "small-platform", // Fuehrt diesen Schritt im aktuellen Ablauf aus.
  ], // Fuehrt diesen Schritt im aktuellen Ablauf aus.
  oneWay: ["platform-long", "small-platform"], // Fuehrt diesen Schritt im aktuellen Ablauf aus.
  overworldDecoration: [ // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    "bush", // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    "tree", // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    "house", // Fuehrt diesen Schritt im aktuellen Ablauf aus.
  ], // Fuehrt diesen Schritt im aktuellen Ablauf aus.
  caveDecoration: ["rock", "shrooms", "sign", "skulls"], // Fuehrt diesen Schritt im aktuellen Ablauf aus.
  hazard: ["spike-skull", "spikes-top", "spikes"], // Fuehrt diesen Schritt im aktuellen Ablauf aus.
  interactable: ["crank-down", "crank-up"], // Fuehrt diesen Schritt im aktuellen Ablauf aus.
};

export const DEFAULT_WORLD_PROPS = [ // Deklariert einen gemeinsamen konstanten Wert.
  { key: "platform-long", col: 26, row: 6, layer: "solid" }, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
  { key: "small-platform", col: 52, row: 4, layer: "solid" }, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
  { key: "small-platform", col: 53, row: 4, layer: "solid" }, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
  { key: "crate", col: 58, row: 7, layer: "solid" }, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
  { key: "big-crate", col: 60, row: 7, layer: "solid" }, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
  { key: "face-block", col: 103, row: 7, layer: "solid" }, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
  { key: "bush", col: 6, row: 7, layer: "decoration" }, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
  { key: "tree", col: 12, row: 6, layer: "decoration" }, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
  { key: "house", col: 124, row: 5, layer: "decoration" }, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
  { key: "shrooms", col: 77, row: 9, layer: "decoration" }, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
  { key: "sign", col: 83, row: 8, layer: "decoration" }, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
  { key: "skulls", col: 90, row: 8, layer: "decoration" }, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
  { key: "rock", col: 92, row: 8, layer: "decoration" }, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
  { key: "spikes", col: 84, row: 9, layer: "hazard" }, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
  { key: "spikes", col: 85, row: 9, layer: "hazard" }, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
  { key: "spike-skull", col: 91, row: 9, layer: "hazard" }, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
  { key: "spikes-top", col: 88, row: 7, layer: "hazard" }, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
  { key: "spikes-top", col: 89, row: 7, layer: "hazard" }, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
  { key: "crank-down", col: 72, row: 9, layer: "interactable" }, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
]; // Fuehrt diesen Schritt im aktuellen Ablauf aus.

export const ENEMY_RECT_FRAMES = { // Deklariert einen gemeinsamen konstanten Wert.
  [ENEMY_TYPE.possum]: { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    walk: [ // Fuehrt diesen Schritt im aktuellen Ablauf aus.
      { sx: 368, sy: 68, sw: 36, sh: 28 }, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
      { sx: 292, sy: 68, sw: 36, sh: 28 }, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
      { sx: 330, sy: 68, sw: 36, sh: 28 }, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
      { sx: 406, sy: 68, sw: 36, sh: 28 }, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
      { sx: 0, sy: 102, sw: 36, sh: 28 }, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
      { sx: 444, sy: 68, sw: 36, sh: 28 }, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    ], // Fuehrt diesen Schritt im aktuellen Ablauf aus.
  }, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
  [ENEMY_TYPE.frog]: { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    idle: [ // Fuehrt diesen Schritt im aktuellen Ablauf aus.
      { sx: 181, sy: 68, sw: 35, sh: 32 }, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
      { sx: 255, sy: 68, sw: 35, sh: 32 }, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
      { sx: 144, sy: 68, sw: 35, sh: 32 }, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
      { sx: 107, sy: 68, sw: 35, sh: 32 }, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    ], // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    jump: [ // Fuehrt diesen Schritt im aktuellen Ablauf aus.
      { sx: 218, sy: 68, sw: 35, sh: 32 }, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
      { sx: 70, sy: 68, sw: 35, sh: 32 }, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    ], // Fuehrt diesen Schritt im aktuellen Ablauf aus.
  }, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
  [ENEMY_TYPE.eagle]: { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    fly: [ // Fuehrt diesen Schritt im aktuellen Ablauf aus.
      { sx: 332, sy: 102, sw: 40, sh: 41 }, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
      { sx: 416, sy: 102, sw: 40, sh: 41 }, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
      { sx: 374, sy: 102, sw: 40, sh: 41 }, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
      { sx: 290, sy: 102, sw: 40, sh: 41 }, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    ], // Fuehrt diesen Schritt im aktuellen Ablauf aus.
  }, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
};
