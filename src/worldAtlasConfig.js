import { ENEMY_TYPE } from "./constants.js";

// Quellrechtecke fuer Props aus dem Atlas (sx/sy/sw/sh in Atlas-Pixeln).
export const PROP_FRAMES = {
  "big-crate": { sx: 50, sy: 59, sw: 32, sh: 32 },
  "block-big": { sx: 2, sy: 93, sw: 32, sh: 32 },
  block: { sx: 84, sy: 19, sw: 16, sh: 16 },
  crate: { sx: 26, sy: 37, sw: 16, sh: 16 },
  "face-block": { sx: 36, sy: 93, sw: 32, sh: 32 },
  "platform-long": { sx: 50, sy: 19, sw: 32, sh: 16 },
  "small-platform": { sx: 32, sy: 19, sw: 16, sh: 16 },
  door: { sx: 70, sy: 93, sw: 22, sh: 33 },
  bush: { sx: 2, sy: 59, sw: 46, sh: 28 },
  tree: { sx: 2, sy: 128, sw: 105, sh: 93 },
  house: { sx: 2, sy: 223, sw: 87, sh: 108 },
  shrooms: { sx: 73, sy: 2, sw: 16, sh: 15 },
  sign: { sx: 68, sy: 37, sw: 18, sh: 20 },
  skulls: { sx: 36, sy: 2, sw: 16, sh: 10 },
  rock: { sx: 2, sy: 19, sw: 28, sh: 15 },
  spikes: { sx: 19, sy: 2, sw: 15, sh: 10 },
  "spikes-top": { sx: 2, sy: 2, sw: 15, sh: 9 },
  "spike-skull": { sx: 54, sy: 2, sw: 17, sh: 12 },
  "crank-down": { sx: 2, sy: 37, sw: 22, sh: 16 },
  "crank-up": { sx: 44, sy: 37, sw: 22, sh: 16 },
};

// Kategorisierung steuert Kollision und Rendering-Layer in level.js.
export const WORLD_PROP_KEYS = {
  solid: [
    "big-crate",
    "block-big",
    "block",
    "crate",
    "face-block",
    "platform-long",
    "small-platform",
  ],
  oneWay: ["platform-long", "small-platform"],
  overworldDecoration: ["bush", "tree", "house"],
  caveDecoration: ["rock", "shrooms", "sign", "skulls"],
  hazard: ["spike-skull", "spikes-top", "spikes"],
  interactable: ["crank-down", "crank-up"],
};

// Standard-Props fuer das aktuell eingebaute Einzel-Level.
export const DEFAULT_WORLD_PROPS = [
  { key: "platform-long", col: 26, row: 6, layer: "solid" },
  { key: "small-platform", col: 52, row: 4, layer: "solid" },
  { key: "small-platform", col: 53, row: 4, layer: "solid" },
  { key: "crate", col: 58, row: 7, layer: "solid" },
  { key: "big-crate", col: 60, row: 7, layer: "solid" },
  { key: "face-block", col: 103, row: 7, layer: "solid" },
  { key: "bush", col: 6, row: 7, layer: "decoration" },
  { key: "tree", col: 12, row: 6, layer: "decoration" },
  { key: "house", col: 124, row: 5, layer: "decoration" },
  { key: "shrooms", col: 77, row: 9, layer: "decoration" },
  { key: "sign", col: 83, row: 8, layer: "decoration" },
  { key: "skulls", col: 90, row: 8, layer: "decoration" },
  { key: "rock", col: 92, row: 8, layer: "decoration" },
  { key: "spikes", col: 84, row: 9, layer: "hazard" },
  { key: "spikes", col: 85, row: 9, layer: "hazard" },
  { key: "spike-skull", col: 91, row: 9, layer: "hazard" },
  { key: "spikes-top", col: 88, row: 7, layer: "hazard" },
  { key: "spikes-top", col: 89, row: 7, layer: "hazard" },
  { key: "crank-down", col: 72, row: 9, layer: "interactable" },
];

// Gegner-Animationsframes fuer Rechteck-Rendering (ohne separates SpriteSheet-Objekt).
export const ENEMY_RECT_FRAMES = {
  [ENEMY_TYPE.possum]: {
    walk: [
      { sx: 368, sy: 68, sw: 36, sh: 28 },
      { sx: 292, sy: 68, sw: 36, sh: 28 },
      { sx: 330, sy: 68, sw: 36, sh: 28 },
      { sx: 406, sy: 68, sw: 36, sh: 28 },
      { sx: 0, sy: 102, sw: 36, sh: 28 },
      { sx: 444, sy: 68, sw: 36, sh: 28 },
    ],
  },
  [ENEMY_TYPE.frog]: {
    idle: [
      { sx: 181, sy: 68, sw: 35, sh: 32 },
      { sx: 255, sy: 68, sw: 35, sh: 32 },
      { sx: 144, sy: 68, sw: 35, sh: 32 },
      { sx: 107, sy: 68, sw: 35, sh: 32 },
    ],
    jump: [
      { sx: 218, sy: 68, sw: 35, sh: 32 },
      { sx: 70, sy: 68, sw: 35, sh: 32 },
    ],
  },
  [ENEMY_TYPE.eagle]: {
    fly: [
      { sx: 332, sy: 102, sw: 40, sh: 41 },
      { sx: 416, sy: 102, sw: 40, sh: 41 },
      { sx: 374, sy: 102, sw: 40, sh: 41 },
      { sx: 290, sy: 102, sw: 40, sh: 41 },
    ],
  },
};
