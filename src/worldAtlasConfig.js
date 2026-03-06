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

// Standard-Props mit festen Weltpixelkoordinaten und Rendergroessen.
export const DEFAULT_WORLD_PROPS = [
  { key: "platform-long", x: 1248, y: 288, width: 96, height: 48, layer: "solid" },
  { key: "small-platform", x: 2496, y: 192, width: 48, height: 48, layer: "solid" },
  { key: "small-platform", x: 2544, y: 192, width: 48, height: 48, layer: "solid" },
  { key: "crate", x: 2784, y: 336, width: 48, height: 48, layer: "solid" },
  { key: "big-crate", x: 2880, y: 336, width: 96, height: 96, layer: "solid" },
  { key: "face-block", x: 4944, y: 336, width: 96, height: 96, layer: "solid" },
  { key: "bush", x: 288, y: 336, width: 138, height: 84, layer: "decoration" },
  { key: "tree", x: 576, y: 288, width: 315, height: 279, layer: "decoration" },
  { key: "house", x: 5952, y: 240, width: 261, height: 324, layer: "decoration" },
  { key: "shrooms", x: 3696, y: 432, width: 48, height: 45, layer: "decoration" },
  { key: "sign", x: 3984, y: 384, width: 54, height: 60, layer: "decoration" },
  { key: "skulls", x: 4320, y: 384, width: 48, height: 30, layer: "decoration" },
  { key: "rock", x: 4416, y: 384, width: 84, height: 45, layer: "decoration" },
  { key: "spikes", x: 4032, y: 432, width: 45, height: 30, layer: "hazard" },
  { key: "spikes", x: 4080, y: 432, width: 45, height: 30, layer: "hazard" },
  { key: "spike-skull", x: 4368, y: 432, width: 51, height: 36, layer: "hazard" },
  { key: "spikes-top", x: 4224, y: 336, width: 45, height: 27, layer: "hazard" },
  { key: "spikes-top", x: 4272, y: 336, width: 45, height: 27, layer: "hazard" },
  { key: "crank-down", x: 3456, y: 432, width: 66, height: 48, layer: "interactable" },
];

