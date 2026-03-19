import {
  CHARACTER_PROFILES,
  normalizeCharacterId,
  saveSelectedCharacter,
} from '../../config/characterConfig.js';
import { handleOptionsInput } from '../optionsPanel.js';
import { MENU_IDS, createFireflies } from './startScreenShared.js';

export const startScreenInputMethods = {
  _reset() {
    this._started = false;
    this._selectedIndex = 0;
    this._subScreen = null;
    this._optionIndex = 0;
    this._resetInputEdges();
    this._fireflies = createFireflies();
    this._lastDrawTime = null;
  },

  _resetInputEdges() {
    this._prevUp = false;
    this._prevDown = false;
    this._prevLeft = false;
    this._prevRight = false;
  },

  reset() {
    this._reset();
  },

  getSelectedCharacter() {
    return this._selectedCharacter;
  },

  setSelectedCharacter(characterId) {
    this._selectedCharacter = normalizeCharacterId(characterId);
  },

  isSubPanelOpen() {
    return this._subScreen !== null;
  },

  handleInput(input) {
    if (this._handleSubScreenInput(input)) return;
    this._handleMainMenuInput(input);
  },

  _handleSubScreenInput(input) {
    if (this._subScreen === null) return false;
    if (this._subScreen === 'options') this._handleOptionsInput(input);
    else if (input.backPressed) this._subScreen = null;
    return true;
  },

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

  _handleVerticalInput(upNow, downNow) {
    if (upNow && !this._prevUp) this._selectedIndex = (this._selectedIndex - 1 + MENU_IDS.length) % MENU_IDS.length;
    if (downNow && !this._prevDown) this._selectedIndex = (this._selectedIndex + 1) % MENU_IDS.length;
  },

  _cacheDirectionEdges(upNow, downNow, leftNow, rightNow) {
    this._prevUp = upNow;
    this._prevDown = downNow;
    this._prevLeft = leftNow;
    this._prevRight = rightNow;
  },

  _handleCharacterInput(leftNow, rightNow) {
    if (MENU_IDS[this._selectedIndex] !== 'character') return;
    const leftEdge = leftNow && !this._prevLeft;
    const rightEdge = rightNow && !this._prevRight;
    if (!leftEdge && !rightEdge) return;
    this._shiftSelectedCharacter(rightEdge ? 1 : -1);
  },

  _shiftSelectedCharacter(direction) {
    const keys = Object.keys(CHARACTER_PROFILES);
    const current = keys.indexOf(this._selectedCharacter);
    const index = (current + direction + keys.length) % keys.length;
    this._selectedCharacter = keys[index];
    saveSelectedCharacter(this._selectedCharacter);
  },

  _handleOptionsInput(input) {
    handleOptionsInput(this, input);
  },

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

  _activateStart() {
    if (this._started) return;
    this._started = true;
    this._onStart();
  },

  _openOptions() {
    this._subScreen = 'options';
    this._optionIndex = 0;
  },

  _openSubScreen(name) {
    this._subScreen = name;
  },
};
