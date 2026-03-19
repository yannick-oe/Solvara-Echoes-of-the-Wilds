// #region Imports
import {
  CHARACTER_PROFILES,
  normalizeCharacterId,
  saveSelectedCharacter,
} from '../../../config/characterConfig.js';
import { handleOptionsInput } from '../../shared/optionsPanel.js';
import { MENU_IDS, createFireflies } from './startScreenShared.js';

// #endregion
// #region Input Methods
export const startScreenInputMethods = {
/** Handles reset. @returns {void} - Nothing. */
  _reset() {
    this._started = false;
    this._selectedIndex = 0;
    this._subScreen = null;
    this._optionIndex = 0;
    this._resetInputEdges();
    this._fireflies = createFireflies();
    this._lastDrawTime = null;
  },

/** Handles reset Input Edges. @returns {void} - Nothing. */
  _resetInputEdges() {
    this._prevUp = false;
    this._prevDown = false;
    this._prevLeft = false;
    this._prevRight = false;
  },

/** Handles reset. @returns {void} - Nothing. */
  reset() {
    this._reset();
  },

/** Gets selected Character. @returns {*} - Resulting value. */
  getSelectedCharacter() {
    return this._selectedCharacter;
  },

/** Sets selected Character. @param {*} characterId - Character Id value. @returns {void} - Nothing. */
  setSelectedCharacter(characterId) {
    this._selectedCharacter = normalizeCharacterId(characterId);
  },

/** Checks whether sub Panel Open. @returns {boolean} - Whether the check passes. */
  isSubPanelOpen() {
    return this._subScreen !== null;
  },

/** Handles input. @param {*} input - Current input state. @returns {void} - Nothing. */
  handleInput(input) {
    if (this._handleSubScreenInput(input)) return;
    this._handleMainMenuInput(input);
  },

/** Handles sub Screen Input. @param {*} input - Current input state. @returns {boolean} - Whether the check passes. */
  _handleSubScreenInput(input) {
    if (this._subScreen === null) return false;
    if (this._subScreen === 'options') this._handleOptionsInput(input);
    else if (input.backPressed) this._subScreen = null;
    return true;
  },

/** Handles main Menu Input. @param {*} input - Current input state. @returns {void} - Nothing. */
  _handleMainMenuInput(input) {
    const upNow = input.up;
    const downNow = input.down;
    const leftNow = input.left;
    const rightNow = input.right;
    this._handleVerticalInput(upNow, downNow);
    this._handleCharacterInput(leftNow, rightNow);
    this._cacheDirectionEdges(upNow, downNow, leftNow, rightNow);
    if (input.enterPressed || input.jumpPressed) this._activate(MENU_IDS[this._selectedIndex]);
  },

/** Handles vertical Input. @param {*} upNow - Up Now value. @param {*} downNow - Down Now value. @returns {void} - Nothing. */
  _handleVerticalInput(upNow, downNow) {
    if (upNow && !this._prevUp) this._selectedIndex = (this._selectedIndex - 1 + MENU_IDS.length) % MENU_IDS.length;
    if (downNow && !this._prevDown) this._selectedIndex = (this._selectedIndex + 1) % MENU_IDS.length;
  },

/** Handles cache Direction Edges. @param {*} upNow - Up Now value. @param {*} downNow - Down Now value. @param {*} leftNow - Left Now value. @param {*} rightNow - Right Now value. @returns {void} - Nothing. */
  _cacheDirectionEdges(upNow, downNow, leftNow, rightNow) {
    this._prevUp = upNow;
    this._prevDown = downNow;
    this._prevLeft = leftNow;
    this._prevRight = rightNow;
  },

/** Handles character Input. @param {*} leftNow - Left Now value. @param {*} rightNow - Right Now value. @returns {void} - Nothing. */
  _handleCharacterInput(leftNow, rightNow) {
    if (MENU_IDS[this._selectedIndex] !== 'character') return;
    const leftEdge = leftNow && !this._prevLeft;
    const rightEdge = rightNow && !this._prevRight;
    if (!leftEdge && !rightEdge) return;
    this._shiftSelectedCharacter(rightEdge ? 1 : -1);
  },

/** Handles shift Selected Character. @param {*} direction - Direction value. @returns {void} - Nothing. */
  _shiftSelectedCharacter(direction) {
    const keys = Object.keys(CHARACTER_PROFILES);
    const current = keys.indexOf(this._selectedCharacter);
    const index = (current + direction + keys.length) % keys.length;
    this._selectedCharacter = keys[index];
    saveSelectedCharacter(this._selectedCharacter);
  },

/** Handles options Input. @param {*} input - Current input state. @returns {void} - Nothing. */
  _handleOptionsInput(input) {
    handleOptionsInput(this, input);
  },

/** Handles activate. @param {*} id - Id value. @returns {void} - Nothing. */
  _activate(id) {
    const action = {
      start: () => this._activateStart(),
      character: () => this._shiftSelectedCharacter(1),
      options: () => this._openOptions(),
      controls: () => this._openSubScreen('controls'),
      credits: () => this._openSubScreen('credits'),
    }[id];
    if (action) action();
  },

/** Handles activate Start. @returns {void} - Nothing. */
  _activateStart() {
    if (this._started) return;
    this._started = true;
    this._onStart();
  },

/** Handles open Options. @returns {void} - Nothing. */
  _openOptions() {
    this._subScreen = 'options';
    this._optionIndex = 0;
  },

/** Handles open Sub Screen. @param {*} name - Name value. @returns {void} - Nothing. */
  _openSubScreen(name) {
    this._subScreen = name;
  },
};
// #endregion