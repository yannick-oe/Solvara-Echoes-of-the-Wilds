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
/**
 * Handles handle options input.
 * @param {object} screen Input parameter.
 * @param {object} input Input parameter.
 */
export function handleOptionsInput(screen, input) {
  if (input.backPressed) { screen._subScreen = null; return; }
  _updateOptionNavigation(screen, input);
  const row = OPTIONS_IDS[screen._optionIndex];
  const { leftEdge, rightEdge } = _consumeHorizontalEdges(screen, input);
  _applyOptionChange(row, leftEdge, rightEdge, input);
}

/**
 * Updates options row navigation state.
 * @param {object} screen Input parameter.
 * @param {object} input Input parameter.
 */
function _updateOptionNavigation(screen, input) {
  if (input.up && !screen._prevUp) screen._optionIndex = (screen._optionIndex - 1 + OPTIONS_IDS.length) % OPTIONS_IDS.length;
  if (input.down && !screen._prevDown) screen._optionIndex = (screen._optionIndex + 1) % OPTIONS_IDS.length;
  screen._prevUp = input.up;
  screen._prevDown = input.down;
}

/**
 * Consumes horizontal input edges and stores prev-state.
 * @param {object} screen Input parameter.
 * @param {object} input Input parameter.
 */
function _consumeHorizontalEdges(screen, input) {
  const leftEdge  = input.left && !screen._prevLeft;
  const rightEdge = input.right && !screen._prevRight;
  screen._prevLeft = input.left;
  screen._prevRight = input.right;
  return { leftEdge, rightEdge };
}

/**
 * Applies selected option row changes.
 * @param {string} row Input parameter.
 * @param {boolean} leftEdge Input parameter.
 * @param {boolean} rightEdge Input parameter.
 * @param {object} input Input parameter.
 */
function _applyOptionChange(row, leftEdge, rightEdge, input) {
  if (row === 'masterVolume') return _applyVolumeDelta(leftEdge, rightEdge, audioManager.masterVolume, v => audioManager.setMasterVolume(v));
  if (row === 'musicVolume') return _applyVolumeDelta(leftEdge, rightEdge, audioManager.musicVolume, v => audioManager.setMusicVolume(v));
  if (row === 'sfxVolumeMaster') return _applyVolumeDelta(leftEdge, rightEdge, audioManager.sfxVolumeMaster, v => audioManager.setSfxVolumeMaster(v));
  if (row === 'language') _toggleLanguage(leftEdge, rightEdge, input);
}

/**
 * Applies +/- 0.1 volume changes from horizontal edges.
 * @param {boolean} leftEdge Input parameter.
 * @param {boolean} rightEdge Input parameter.
 * @param {number} value Input parameter.
 * @param {Function} setter Input parameter.
 */
function _applyVolumeDelta(leftEdge, rightEdge, value, setter) {
  if (leftEdge) setter(value - 0.1);
  if (rightEdge) setter(value + 0.1);
}

/**
 * Toggles language when left/right/confirm input is pressed.
 * @param {boolean} leftEdge Input parameter.
 * @param {boolean} rightEdge Input parameter.
 * @param {object} input Input parameter.
 */
function _toggleLanguage(leftEdge, rightEdge, input) {
  if (!(leftEdge || rightEdge || input.enterPressed || input.jumpPressed)) return;
  const next = LANGS[(LANGS.indexOf(currentLang) + 1) % LANGS.length];
  setLang(next);
}

/**
 * Draws the contents of the options panel (volume sliders + language).
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number}                  optionIndex
 * @param {number}                  panelX
 * @param {number}                  panelY
 * @param {number}                  panelW
 * @param {number}                  panelH
 * @param {number}                  cx
 */
export function drawOptionsContent(ctx, optionIndex, panelX, panelY, panelW, _panelH, cx) {
  const rowY0   = panelY + 78;
  const rowStep = 62;
  OPTIONS_IDS.forEach((id, i) => {
    const y = rowY0 + i * rowStep;
    const selected = i === optionIndex;
    _drawOptionRow(ctx, id, selected, panelX, panelW, _panelH, y, cx);
  });
}

/**
 * Draws one options row and value widget.
 * @param {CanvasRenderingContext2D} ctx Input parameter.
 * @param {string} id Input parameter.
 * @param {boolean} selected Input parameter.
 * @param {number} panelX Input parameter.
 * @param {number} panelW Input parameter.
 * @param {number} panelH Input parameter.
 * @param {number} y Input parameter.
 * @param {number} cx Input parameter.
 */
function _drawOptionRow(ctx, id, selected, panelX, panelW, panelH, y, cx) {
  if (selected) _drawOptionHighlight(ctx, panelX, panelW, y);
  _drawOptionLabel(ctx, id, selected, panelX, y);
  if (_isVolumeOption(id)) _drawVolumeBar(ctx, id, selected, panelX, panelW, panelH, y, cx);
  else if (id === 'language') _drawLanguageRow(ctx, selected, panelX, panelW, y);
}

/**
 * Draws selected options-row background highlight.
 * @param {CanvasRenderingContext2D} ctx Input parameter.
 * @param {number} panelX Input parameter.
 * @param {number} panelW Input parameter.
 * @param {number} y Input parameter.
 */
function _drawOptionHighlight(ctx, panelX, panelW, y) {
  const hl = ctx.createLinearGradient(panelX, y, panelX + panelW, y);
  hl.addColorStop(0, 'rgba(20, 10, 4, 0.00)');
  hl.addColorStop(0.08, 'rgba(20, 10, 4, 0.50)');
  hl.addColorStop(0.92, 'rgba(20, 10, 4, 0.50)');
  hl.addColorStop(1, 'rgba(20, 10, 4, 0.00)');
  ctx.fillStyle = hl;
  ctx.fillRect(panelX, y - 28, panelW, 56);
}

/**
 * Draws option label text.
 * @param {CanvasRenderingContext2D} ctx Input parameter.
 * @param {string} id Input parameter.
 * @param {boolean} selected Input parameter.
 * @param {number} panelX Input parameter.
 * @param {number} y Input parameter.
 */
function _drawOptionLabel(ctx, id, selected, panelX, y) {
  ctx.fillStyle = selected ? '#fff4c0' : '#f6e3c3';
  ctx.font      = selected ? 'bold 13px monospace' : '12px monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(t(id), panelX + 28, y - 10);
}

/**
 * Returns true when row uses a volume slider.
 * @param {string} id Input parameter.
 */
function _isVolumeOption(id) {
  return id === 'masterVolume' || id === 'musicVolume' || id === 'sfxVolumeMaster';
}

/**
 * Draws a volume bar row inside the options panel.
 * @param {CanvasRenderingContext2D} ctx Input parameter.
 * @param {string} id Input parameter.
 * @param {boolean} selected Input parameter.
 * @param {number} panelX Input parameter.
 * @param {number} panelW Input parameter.
 * @param {number} _panelH Input parameter.
 * @param {number} y Input parameter.
 * @param {number} cx Input parameter.
 */
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

/**
 * Returns current volume value for a row id.
 * @param {string} id Input parameter.
 */
function _volumeForRow(id) {
  if (id === 'masterVolume') return audioManager.masterVolume;
  if (id === 'musicVolume') return audioManager.musicVolume;
  return audioManager.sfxVolumeMaster;
}

/**
 * Draws volume percentage label.
 */
function _drawVolumePercent(ctx, selected, panelX, panelW, y, vol) {
  ctx.fillStyle = selected ? '#fff4c0' : '#d6c7a2';
  ctx.font      = selected ? 'bold 12px monospace' : '11px monospace';
  ctx.textAlign = 'right';
  ctx.fillText(Math.round(vol * 100) + '%', panelX + panelW - 28, y - 10);
}

/**
 * Draws empty volume track.
 */
function _drawVolumeTrack(ctx, barX, barY, barW, barH) {
  ctx.fillStyle = 'rgba(20, 10, 4, 0.55)';
  rrect(ctx, barX, barY, barW, barH, 4);
  ctx.fill();
}

/**
 * Draws filled volume segment.
 */
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

/**
 * Draws volume tick marks.
 */
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

/**
 * Draws volume knob and selected-row hint.
 */
function _drawVolumeKnob(ctx, selected, cx, barX, barY, barW, barH, vol) {
  const kx = barX + Math.round(barW * vol);
  ctx.fillStyle = selected ? '#f0c040' : '#c8a060';
  ctx.beginPath();
  ctx.arc(kx, barY + barH / 2, 7, 0, Math.PI * 2);
  ctx.fill();
  if (!selected) return;
  ctx.strokeStyle = 'rgba(240,192,0,0.5)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.fillStyle = 'rgba(240,192,0,0.55)';
  ctx.font = '11px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('◄  ►', cx, barY + barH / 2);
}

/**
 * Draws the language selection row inside the options panel.
 * @param {CanvasRenderingContext2D} ctx Input parameter.
 * @param {boolean} selected Input parameter.
 * @param {number} panelX Input parameter.
 * @param {number} panelW Input parameter.
 * @param {number} y Input parameter.
 */
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

/**
 * Draws the contents of the controls panel (key bindings).
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} panelX
 * @param {number} panelY
 * @param {number} panelW
 * @param {string} characterId
 */
export function drawControlsContent(ctx, panelX, panelY, panelW, characterId = 'fox') {
  const rows = _buildControlsRows(characterId);
  ctx.textBaseline = 'middle';
  _drawControlBlock(ctx, rows.upper, panelX, panelW, panelY + 88, 26);
  _drawControlsDivider(ctx, panelX, panelW, panelY + 184);
  _drawControlBlock(ctx, rows.lower, panelX, panelW, panelY + 205, 26);
}

/**
 * Builds controls rows for upper and lower blocks.
 * @param {string} characterId Input parameter.
 */
function _buildControlsRows(characterId) {
  const activeCharacter = normalizeCharacterId(characterId);
  return { upper: _upperControlRows(activeCharacter), lower: _lowerControlRows() };
}

/**
 * Builds upper controls rows.
 * @param {string} activeCharacter Input parameter.
 */
function _upperControlRows(activeCharacter) {
  return [
    [t('move'), 'Arrow Keys / WASD'],
    [t('jump'), 'Space'],
    [t('crouch'), 'S / ↓'],
    _buildActionControlRow(activeCharacter),
  ];
}

/** Builds lower controls rows. */
function _lowerControlRows() {
  return [
    [t('climb'), 'W / S  ↑ / ↓'],
    [t('lookUp'), 'E'],
    [t('pause'), 'P'],
    [t('fullscreen'), 'F'],
    [t('back'), 'Q'],
  ];
}

/**
 * Draws a block of controls rows.
 */
function _drawControlBlock(ctx, rows, panelX, panelW, startY, step) {
  rows.forEach(([label, keys], i) => _drawControlRow(ctx, label, keys, panelX, panelW, startY + i * step));
}

/**
 * Draws one controls row label + binding.
 */
function _drawControlRow(ctx, label, keys, panelX, panelW, y) {
  ctx.fillStyle = '#f6e3c3';
  ctx.font      = '13px monospace';
  ctx.textAlign = 'left';
  ctx.fillText(label, panelX + 30, y);
  ctx.fillStyle = '#f0c040';
  ctx.textAlign = 'right';
  ctx.fillText(keys, panelX + panelW - 30, y);
}

/**
 * Draws divider line between controls blocks.
 */
function _drawControlsDivider(ctx, panelX, panelW, y) {
  ctx.strokeStyle = 'rgba(59, 38, 21, 0.35)';
  ctx.lineWidth   = 1;
  ctx.beginPath();
  ctx.moveTo(panelX + 30, y);
  ctx.lineTo(panelX + panelW - 30, y);
  ctx.stroke();
}

/**
 * Builds the action row text for the current character.
 * @param {string} characterId Input parameter.
 */
function _buildActionControlRow(characterId) {
  if (characterId === 'imp') {
    return [t('specialFireball'), t('specialFireballInput')];
  }
  return [t('specialRoll'), t('specialRollInput')];
}
// #endregion
