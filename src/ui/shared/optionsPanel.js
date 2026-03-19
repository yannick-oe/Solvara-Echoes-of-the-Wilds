/**
 * Shared options and controls panel for StartScreen and PauseScreen.
 */

// #region Imports
import { currentLang, setLang, t, LANGS } from '../../core/localization.js';
import { audioManager } from '../../core/audioManager.js';
import { rrect } from './canvasUtils.js';
import { normalizeCharacterId } from '../../config/characterConfig.js';
// #endregion

// #region Constants
/** @type {string[]} Order of option rows */
export const OPTIONS_IDS = ['masterVolume', 'musicVolume', 'sfxVolumeMaster', 'language'];
/**
 * Handles keyboard input in the options sub-panel.
 * Mutates `screen._optionIndex`, `screen._prevUp`, `screen._prevDown`,
 * `screen._prevLeft`, `screen._prevRight`, and `screen._subScreen`.
 *
 * @param {object} screen  - Screen object with the listed fields
 * @param {object} input   - current input state
 */
// #endregion

// #region Public Methods
/** Handles options Input. @param {*} screen - Screen value. @param {*} input - Current input state. @returns {void} - Nothing. */
export function handleOptionsInput(screen, input) {
  if (input.backPressed) { screen._subScreen = null; return; }
  _updateOptionNavigation(screen, input);
  const row = OPTIONS_IDS[screen._optionIndex];
  const { leftEdge, rightEdge } = _consumeHorizontalEdges(screen, input);
  _applyOptionChange(row, leftEdge, rightEdge, input);
}

/** Updates option Navigation. @param {*} screen - Screen value. @param {*} input - Current input state. @returns {void} - Nothing. */
function _updateOptionNavigation(screen, input) {
  if (input.up && !screen._prevUp) screen._optionIndex = (screen._optionIndex - 1 + OPTIONS_IDS.length) % OPTIONS_IDS.length;
  if (input.down && !screen._prevDown) screen._optionIndex = (screen._optionIndex + 1) % OPTIONS_IDS.length;
  screen._prevUp = input.up;
  screen._prevDown = input.down;
}

/** Handles consume Horizontal Edges. @param {*} screen - Screen value. @param {*} input - Current input state. @returns {*} - Resulting value. */
function _consumeHorizontalEdges(screen, input) {
  const leftEdge  = input.left && !screen._prevLeft;
  const rightEdge = input.right && !screen._prevRight;
  screen._prevLeft = input.left;
  screen._prevRight = input.right;
  return { leftEdge, rightEdge };
}

/** Applies option Change. @param {*} row - Row value. @param {*} leftEdge - Left Edge value. @param {*} rightEdge - Right Edge value. @param {*} input - Current input state. @returns {*} - Resulting value. */
function _applyOptionChange(row, leftEdge, rightEdge, input) {
  if (row === 'masterVolume') return _applyVolumeDelta(leftEdge, rightEdge, audioManager.masterVolume, v => audioManager.setMasterVolume(v));
  if (row === 'musicVolume') return _applyVolumeDelta(leftEdge, rightEdge, audioManager.musicVolume, v => audioManager.setMusicVolume(v));
  if (row === 'sfxVolumeMaster') return _applyVolumeDelta(leftEdge, rightEdge, audioManager.sfxVolumeMaster, v => audioManager.setSfxVolumeMaster(v));
  if (row === 'language') _toggleLanguage(leftEdge, rightEdge, input);
}

/** Applies volume Delta. @param {*} leftEdge - Left Edge value. @param {*} rightEdge - Right Edge value. @param {*} value - Value to apply. @param {*} setter - Setter value. @returns {void} - Nothing. */
function _applyVolumeDelta(leftEdge, rightEdge, value, setter) {
  if (leftEdge) setter(value - 0.1);
  if (rightEdge) setter(value + 0.1);
}

/** Toggles language. @param {*} leftEdge - Left Edge value. @param {*} rightEdge - Right Edge value. @param {*} input - Current input state. @returns {void} - Nothing. */
function _toggleLanguage(leftEdge, rightEdge, input) {
  if (!(leftEdge || rightEdge || input.enterPressed || input.jumpPressed)) return;
  const next = LANGS[(LANGS.indexOf(currentLang) + 1) % LANGS.length];
  setLang(next);
}

/** Draws options Content. @param {*} ctx - Ctx value. @param {*} optionIndex - Option Index value. @param {*} panelX - Panel X value. @param {*} panelY - Panel Y value. @param {*} panelW - Panel W value. @param {*} _panelH - Panel H value. @param {*} cx - Cx value. @returns {void} - Nothing. */
export function drawOptionsContent(ctx, optionIndex, panelX, panelY, panelW, _panelH, cx) {
  const rowY0   = panelY + 78;
  const rowStep = 62;
  OPTIONS_IDS.forEach((id, i) => {
    const y = rowY0 + i * rowStep;
    const selected = i === optionIndex;
    _drawOptionRow(ctx, id, selected, panelX, panelW, _panelH, y, cx);
  });
}

/** Draws option Row. @param {*} ctx - Ctx value. @param {*} id - Id value. @param {*} selected - Selected value. @param {*} panelX - Panel X value. @param {*} panelW - Panel W value. @param {*} panelH - Panel H value. @param {*} y - Y value. @param {*} cx - Cx value. @returns {void} - Nothing. */
function _drawOptionRow(ctx, id, selected, panelX, panelW, panelH, y, cx) {
  if (selected) _drawOptionHighlight(ctx, panelX, panelW, y);
  _drawOptionLabel(ctx, id, selected, panelX, y);
  if (_isVolumeOption(id)) _drawVolumeBar(ctx, id, selected, panelX, panelW, panelH, y, cx);
  else if (id === 'language') _drawLanguageRow(ctx, selected, panelX, panelW, y);
}

/** Draws option Highlight. @param {*} ctx - Ctx value. @param {*} panelX - Panel X value. @param {*} panelW - Panel W value. @param {*} y - Y value. @returns {void} - Nothing. */
function _drawOptionHighlight(ctx, panelX, panelW, y) {
  const hl = ctx.createLinearGradient(panelX, y, panelX + panelW, y);
  hl.addColorStop(0, 'rgba(20, 10, 4, 0.00)');
  hl.addColorStop(0.08, 'rgba(20, 10, 4, 0.50)');
  hl.addColorStop(0.92, 'rgba(20, 10, 4, 0.50)');
  hl.addColorStop(1, 'rgba(20, 10, 4, 0.00)');
  ctx.fillStyle = hl;
  ctx.fillRect(panelX, y - 28, panelW, 56);
}

/** Draws option Label. @param {*} ctx - Ctx value. @param {*} id - Id value. @param {*} selected - Selected value. @param {*} panelX - Panel X value. @param {*} y - Y value. @returns {void} - Nothing. */
function _drawOptionLabel(ctx, id, selected, panelX, y) {
  ctx.fillStyle = selected ? '#fff4c0' : '#f6e3c3';
  ctx.font      = selected ? 'bold 13px monospace' : '12px monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(t(id), panelX + 28, y - 10);
}

/** Checks whether volume Option. @param {*} id - Id value. @returns {boolean} - Whether the check passes. */
function _isVolumeOption(id) {
  return id === 'masterVolume' || id === 'musicVolume' || id === 'sfxVolumeMaster';
}

/** Draws volume Bar. @param {*} ctx - Ctx value. @param {*} id - Id value. @param {*} selected - Selected value. @param {*} panelX - Panel X value. @param {*} panelW - Panel W value. @param {*} _panelH - Panel H value. @param {*} y - Y value. @param {*} cx - Cx value. @returns {void} - Nothing. */
function _drawVolumeBar(ctx, id, selected, panelX, panelW, _panelH, y, cx) {
  const vol = _volumeForRow(id);
  const barX = panelX + 28;
  const barW = panelW - 56;
  const barY = y + 8;
  const barH = 10;
  _drawVolumePercent(ctx, selected, panelX, panelW, y, vol);
  _drawVolumeTrack(ctx, barX, barY, barW, barH);
  _drawVolumeFill(ctx, barX, barY, barW, barH, vol);
  _drawVolumeTicks(ctx, barX, barY, barW, barH);
  _drawVolumeKnob(ctx, selected, cx, barX, barY, barW, barH, vol);
}

/** Handles volume For Row. @param {*} id - Id value. @returns {*} - Resulting value. */
function _volumeForRow(id) {
  if (id === 'masterVolume') return audioManager.masterVolume;
  if (id === 'musicVolume') return audioManager.musicVolume;
  return audioManager.sfxVolumeMaster;
}

/** Draws volume Percent. @param {*} ctx - Ctx value. @param {*} selected - Selected value. @param {*} panelX - Panel X value. @param {*} panelW - Panel W value. @param {*} y - Y value. @param {*} vol - Vol value. @returns {void} - Nothing. */
function _drawVolumePercent(ctx, selected, panelX, panelW, y, vol) {
  ctx.fillStyle = selected ? '#fff4c0' : '#d6c7a2';
  ctx.font      = selected ? 'bold 12px monospace' : '11px monospace';
  ctx.textAlign = 'right';
  ctx.fillText(Math.round(vol * 100) + '%', panelX + panelW - 28, y - 10);
}

/** Draws volume Track. @param {*} ctx - Ctx value. @param {*} barX - Bar X value. @param {*} barY - Bar Y value. @param {*} barW - Bar W value. @param {*} barH - Bar H value. @returns {void} - Nothing. */
function _drawVolumeTrack(ctx, barX, barY, barW, barH) {
  ctx.fillStyle = 'rgba(20, 10, 4, 0.55)';
  rrect(ctx, barX, barY, barW, barH, 4);
  ctx.fill();
}

/** Draws volume Fill. @param {*} ctx - Ctx value. @param {*} barX - Bar X value. @param {*} barY - Bar Y value. @param {*} barW - Bar W value. @param {*} barH - Bar H value. @param {*} vol - Vol value. @returns {void} - Nothing. */
function _drawVolumeFill(ctx, barX, barY, barW, barH, vol) {
  const fillW = Math.round(barW * vol);
  if (fillW <= 4) return;
  const grd = ctx.createLinearGradient(barX, barY, barX + fillW, barY);
  grd.addColorStop(0, '#b06020');
  grd.addColorStop(0.5, '#f0a030');
  grd.addColorStop(1, '#f0c040');
  rrect(ctx, barX, barY, fillW, barH, 4);
  ctx.fillStyle = grd;
  ctx.fill();
}

/** Draws volume Ticks. @param {*} ctx - Ctx value. @param {*} barX - Bar X value. @param {*} barY - Bar Y value. @param {*} barW - Bar W value. @param {*} barH - Bar H value. @returns {void} - Nothing. */
function _drawVolumeTicks(ctx, barX, barY, barW, barH) {
  ctx.strokeStyle = 'rgba(255,220,120,0.25)';
  ctx.lineWidth = 1;
  for (let s = 1; s < 10; s++) {
    const tx = barX + Math.round(barW * s / 10);
    ctx.beginPath();
    ctx.moveTo(tx, barY + 2);
    ctx.lineTo(tx, barY + barH - 2);
    ctx.stroke();
  }
}

/** Draws volume Knob. @param {*} ctx - Ctx value. @param {*} selected - Selected value. @param {*} cx - Cx value. @param {*} barX - Bar X value. @param {*} barY - Bar Y value. @param {*} barW - Bar W value. @param {*} barH - Bar H value. @param {*} vol - Vol value. @returns {void} - Nothing. */
function _drawVolumeKnob(ctx, selected, cx, barX, barY, barW, barH, vol) {
  const kx = barX + Math.round(barW * vol);
  ctx.fillStyle = selected ? '#f0c040' : '#c8a060';
  ctx.beginPath();
  ctx.arc(kx, barY + barH / 2, 7, 0, Math.PI * 2);
  ctx.fill();
  if (!selected) return;
  _drawVolumeHint(ctx, cx, barY, barH);
}

/** Draws volume Hint. @param {*} ctx - Ctx value. @param {*} cx - Cx value. @param {*} barY - Bar Y value. @param {*} barH - Bar H value. @returns {void} - Nothing. */
function _drawVolumeHint(ctx, cx, barY, barH) {
  ctx.strokeStyle = 'rgba(240,192,0,0.5)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.fillStyle = 'rgba(240,192,0,0.55)';
  ctx.font = '11px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('◄  ►', cx, barY + barH / 2);
}

/** Draws language Row. @param {*} ctx - Ctx value. @param {*} selected - Selected value. @param {*} panelX - Panel X value. @param {*} panelW - Panel W value. @param {*} y - Y value. @returns {void} - Nothing. */
function _drawLanguageRow(ctx, selected, panelX, panelW, y) {
  const langDisplay = currentLang === 'en' ? 'English' : 'Deutsch';
  ctx.save();
  ctx.shadowColor = selected ? 'rgba(240,192,0,0.5)' : 'transparent';
  ctx.shadowBlur  = selected ? 5 : 0;
  ctx.fillStyle   = selected ? '#f0c040' : '#c8b090';
  ctx.font        = selected ? 'bold 15px monospace' : '14px monospace';
  ctx.textAlign   = 'right';
  ctx.fillText('◄ ' + langDisplay + ' ►', panelX + panelW - 28, y - 10);
  ctx.restore();
}

/** Draws controls Content. @param {*} ctx - Ctx value. @param {*} panelX - Panel X value. @param {*} panelY - Panel Y value. @param {*} panelW - Panel W value. @param {*} characterId - Character Id value. @returns {void} - Nothing. */
export function drawControlsContent(ctx, panelX, panelY, panelW, characterId = 'fox') {
  const rows = _buildControlsRows(characterId);
  ctx.textBaseline = 'middle';
  _drawControlBlock(ctx, rows.upper, panelX, panelW, panelY + 88, 26);
  _drawControlsDivider(ctx, panelX, panelW, panelY + 184);
  _drawControlBlock(ctx, rows.lower, panelX, panelW, panelY + 205, 26);
}

/** Builds controls Rows. @param {*} characterId - Character Id value. @returns {*} - Resulting value. */
function _buildControlsRows(characterId) {
  const activeCharacter = normalizeCharacterId(characterId);
  return { upper: _upperControlRows(activeCharacter), lower: _lowerControlRows() };
}

/** Handles upper Control Rows. @param {*} activeCharacter - Active Character value. @returns {*} - Resulting value. */
function _upperControlRows(activeCharacter) {
  return [
    [t('move'), 'Arrow Keys / WASD'],
    [t('jump'), 'Space'],
    [t('crouch'), 'S / ↓'],
    _buildActionControlRow(activeCharacter),
  ];
}

/** Handles lower Control Rows. @returns {*} - Resulting value. */
function _lowerControlRows() {
  return [
    [t('climb'), 'W / S  ↑ / ↓'],
    [t('lookUp'), 'E'],
    [t('pause'), 'P'],
    [t('fullscreen'), 'F'],
    [t('back'), 'Q'],
  ];
}

/** Draws control Block. @param {*} ctx - Ctx value. @param {*} rows - Rows value. @param {*} panelX - Panel X value. @param {*} panelW - Panel W value. @param {*} startY - Start Y value. @param {*} step - Step value. @returns {void} - Nothing. */
function _drawControlBlock(ctx, rows, panelX, panelW, startY, step) {
  rows.forEach(([label, keys], i) => _drawControlRow(ctx, label, keys, panelX, panelW, startY + i * step));
}

/** Draws control Row. @param {*} ctx - Ctx value. @param {*} label - Label value. @param {*} keys - Keys value. @param {*} panelX - Panel X value. @param {*} panelW - Panel W value. @param {*} y - Y value. @returns {void} - Nothing. */
function _drawControlRow(ctx, label, keys, panelX, panelW, y) {
  ctx.fillStyle = '#f6e3c3';
  ctx.font      = '13px monospace';
  ctx.textAlign = 'left';
  ctx.fillText(label, panelX + 30, y);
  ctx.fillStyle = '#f0c040';
  ctx.textAlign = 'right';
  ctx.fillText(keys, panelX + panelW - 30, y);
}

/** Draws controls Divider. @param {*} ctx - Ctx value. @param {*} panelX - Panel X value. @param {*} panelW - Panel W value. @param {*} y - Y value. @returns {void} - Nothing. */
function _drawControlsDivider(ctx, panelX, panelW, y) {
  ctx.strokeStyle = 'rgba(59, 38, 21, 0.35)';
  ctx.lineWidth   = 1;
  ctx.beginPath();
  ctx.moveTo(panelX + 30, y);
  ctx.lineTo(panelX + panelW - 30, y);
  ctx.stroke();
}

/** Builds action Control Row. @param {*} characterId - Character Id value. @returns {*} - Resulting value. */
function _buildActionControlRow(characterId) {
  if (characterId === 'imp') {
    return [t('specialFireball'), t('specialFireballInput')];
  }
  return [t('specialRoll'), t('specialRollInput')];
}
// #endregion