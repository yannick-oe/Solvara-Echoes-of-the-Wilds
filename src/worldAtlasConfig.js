import { ENEMY_TYPE } from "./constants.js"; // Import a dependency used in this file.

export const PROP_FRAMES = { // Declare a shared constant value.
  "big-crate": { sx: 50, sy: 59, sw: 32, sh: 32 }, // Execute this step in the current flow.
  "block-big": { sx: 2, sy: 93, sw: 32, sh: 32 }, // Execute this step in the current flow.
  block: { sx: 84, sy: 19, sw: 16, sh: 16 }, // Execute this step in the current flow.
  crate: { sx: 26, sy: 37, sw: 16, sh: 16 }, // Execute this step in the current flow.
  "face-block": { sx: 36, sy: 93, sw: 32, sh: 32 }, // Execute this step in the current flow.
  "platform-long": { sx: 50, sy: 19, sw: 32, sh: 16 }, // Execute this step in the current flow.
  "small-platform": { sx: 32, sy: 19, sw: 16, sh: 16 }, // Execute this step in the current flow.
  door: { sx: 70, sy: 93, sw: 22, sh: 33 }, // Execute this step in the current flow.
  bush: { sx: 2, sy: 59, sw: 46, sh: 28 }, // Execute this step in the current flow.
  tree: { sx: 2, sy: 128, sw: 105, sh: 93 }, // Execute this step in the current flow.
  house: { sx: 2, sy: 223, sw: 87, sh: 108 }, // Execute this step in the current flow.
  shrooms: { sx: 73, sy: 2, sw: 16, sh: 15 }, // Execute this step in the current flow.
  sign: { sx: 68, sy: 37, sw: 18, sh: 20 }, // Execute this step in the current flow.
  skulls: { sx: 36, sy: 2, sw: 16, sh: 10 }, // Execute this step in the current flow.
  rock: { sx: 2, sy: 19, sw: 28, sh: 15 }, // Execute this step in the current flow.
  spikes: { sx: 19, sy: 2, sw: 15, sh: 10 }, // Execute this step in the current flow.
  "spikes-top": { sx: 2, sy: 2, sw: 15, sh: 9 }, // Execute this step in the current flow.
  "spike-skull": { sx: 54, sy: 2, sw: 17, sh: 12 }, // Execute this step in the current flow.
  "crank-down": { sx: 2, sy: 37, sw: 22, sh: 16 }, // Execute this step in the current flow.
  "crank-up": { sx: 44, sy: 37, sw: 22, sh: 16 }, // Execute this step in the current flow.
};

export const WORLD_PROP_KEYS = { // Declare a shared constant value.
  solid: [ // Execute this step in the current flow.
    "big-crate", // Execute this step in the current flow.
    "block-big", // Execute this step in the current flow.
    "block", // Execute this step in the current flow.
    "crate", // Execute this step in the current flow.
    "face-block", // Execute this step in the current flow.
    "platform-long", // Execute this step in the current flow.
    "small-platform", // Execute this step in the current flow.
  ], // Execute this step in the current flow.
  oneWay: ["platform-long", "small-platform"], // Execute this step in the current flow.
  overworldDecoration: [ // Execute this step in the current flow.
    "bush", // Execute this step in the current flow.
    "tree", // Execute this step in the current flow.
    "house", // Execute this step in the current flow.
  ], // Execute this step in the current flow.
  caveDecoration: ["rock", "shrooms", "sign", "skulls"], // Execute this step in the current flow.
  hazard: ["spike-skull", "spikes-top", "spikes"], // Execute this step in the current flow.
  interactable: ["crank-down", "crank-up"], // Execute this step in the current flow.
};

export const DEFAULT_WORLD_PROPS = [ // Declare a shared constant value.
  { key: "platform-long", col: 26, row: 6, layer: "solid" }, // Execute this step in the current flow.
  { key: "small-platform", col: 52, row: 4, layer: "solid" }, // Execute this step in the current flow.
  { key: "small-platform", col: 53, row: 4, layer: "solid" }, // Execute this step in the current flow.
  { key: "crate", col: 58, row: 7, layer: "solid" }, // Execute this step in the current flow.
  { key: "big-crate", col: 60, row: 7, layer: "solid" }, // Execute this step in the current flow.
  { key: "face-block", col: 103, row: 7, layer: "solid" }, // Execute this step in the current flow.
  { key: "bush", col: 6, row: 7, layer: "decoration" }, // Execute this step in the current flow.
  { key: "tree", col: 12, row: 6, layer: "decoration" }, // Execute this step in the current flow.
  { key: "house", col: 124, row: 5, layer: "decoration" }, // Execute this step in the current flow.
  { key: "shrooms", col: 77, row: 9, layer: "decoration" }, // Execute this step in the current flow.
  { key: "sign", col: 83, row: 8, layer: "decoration" }, // Execute this step in the current flow.
  { key: "skulls", col: 90, row: 8, layer: "decoration" }, // Execute this step in the current flow.
  { key: "rock", col: 92, row: 8, layer: "decoration" }, // Execute this step in the current flow.
  { key: "spikes", col: 84, row: 9, layer: "hazard" }, // Execute this step in the current flow.
  { key: "spikes", col: 85, row: 9, layer: "hazard" }, // Execute this step in the current flow.
  { key: "spike-skull", col: 91, row: 9, layer: "hazard" }, // Execute this step in the current flow.
  { key: "spikes-top", col: 88, row: 7, layer: "hazard" }, // Execute this step in the current flow.
  { key: "spikes-top", col: 89, row: 7, layer: "hazard" }, // Execute this step in the current flow.
  { key: "crank-down", col: 72, row: 9, layer: "interactable" }, // Execute this step in the current flow.
]; // Execute this step in the current flow.

export const ENEMY_RECT_FRAMES = { // Declare a shared constant value.
  [ENEMY_TYPE.possum]: { // Execute this step in the current flow.
    walk: [ // Execute this step in the current flow.
      { sx: 368, sy: 68, sw: 36, sh: 28 }, // Execute this step in the current flow.
      { sx: 292, sy: 68, sw: 36, sh: 28 }, // Execute this step in the current flow.
      { sx: 330, sy: 68, sw: 36, sh: 28 }, // Execute this step in the current flow.
      { sx: 406, sy: 68, sw: 36, sh: 28 }, // Execute this step in the current flow.
      { sx: 0, sy: 102, sw: 36, sh: 28 }, // Execute this step in the current flow.
      { sx: 444, sy: 68, sw: 36, sh: 28 }, // Execute this step in the current flow.
    ], // Execute this step in the current flow.
  }, // Execute this step in the current flow.
  [ENEMY_TYPE.frog]: { // Execute this step in the current flow.
    idle: [ // Execute this step in the current flow.
      { sx: 181, sy: 68, sw: 35, sh: 32 }, // Execute this step in the current flow.
      { sx: 255, sy: 68, sw: 35, sh: 32 }, // Execute this step in the current flow.
      { sx: 144, sy: 68, sw: 35, sh: 32 }, // Execute this step in the current flow.
      { sx: 107, sy: 68, sw: 35, sh: 32 }, // Execute this step in the current flow.
    ], // Execute this step in the current flow.
    jump: [ // Execute this step in the current flow.
      { sx: 218, sy: 68, sw: 35, sh: 32 }, // Execute this step in the current flow.
      { sx: 70, sy: 68, sw: 35, sh: 32 }, // Execute this step in the current flow.
    ], // Execute this step in the current flow.
  }, // Execute this step in the current flow.
  [ENEMY_TYPE.eagle]: { // Execute this step in the current flow.
    fly: [ // Execute this step in the current flow.
      { sx: 332, sy: 102, sw: 40, sh: 41 }, // Execute this step in the current flow.
      { sx: 416, sy: 102, sw: 40, sh: 41 }, // Execute this step in the current flow.
      { sx: 374, sy: 102, sw: 40, sh: 41 }, // Execute this step in the current flow.
      { sx: 290, sy: 102, sw: 40, sh: 41 }, // Execute this step in the current flow.
    ], // Execute this step in the current flow.
  }, // Execute this step in the current flow.
};
