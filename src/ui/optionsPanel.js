/**
 * Shared options and controls panel for StartScreen and PauseScreen.
 */

// #region Imports
import { currentLang, setLang, t, LANGS } from '../core/localization.js';
import { audioManager } from '../core/audioManager.js';
import { rrect } from './canvasUtils.js';
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
  const upNow    = input.up;
  const downNow  = input.down;
  const leftNow  = input.left;
  const rightNow = input.right;
  if (upNow && !screen._prevUp) {
    screen._optionIndex = (screen._optionIndex - 1 + OPTIONS_IDS.length) % OPTIONS_IDS.length;
  }
  if (downNow && !screen._prevDown) {
    screen._optionIndex = (screen._optionIndex + 1) % OPTIONS_IDS.length;
  }
  screen._prevUp   = upNow;
  screen._prevDown = downNow;
  const row = OPTIONS_IDS[screen._optionIndex];
  const leftEdge  = leftNow  && !screen._prevLeft;
  const rightEdge = rightNow && !screen._prevRight;
  screen._prevLeft  = leftNow;
  screen._prevRight = rightNow;
  if (row === 'masterVolume') {
    if (leftEdge)  audioManager.setMasterVolume(audioManager.masterVolume - 0.1);
    if (rightEdge) audioManager.setMasterVolume(audioManager.masterVolume + 0.1);
  } else if (row === 'musicVolume') {
    if (leftEdge)  audioManager.setMusicVolume(audioManager.musicVolume - 0.1);
    if (rightEdge) audioManager.setMusicVolume(audioManager.musicVolume + 0.1);
  } else if (row === 'sfxVolumeMaster') {
    if (leftEdge)  audioManager.setSfxVolumeMaster(audioManager.sfxVolumeMaster - 0.1);
    if (rightEdge) audioManager.setSfxVolumeMaster(audioManager.sfxVolumeMaster + 0.1);
  } else if (row === 'language') {
    if (leftEdge || rightEdge || input.enterPressed || input.jumpPressed) {
      const next = LANGS[(LANGS.indexOf(currentLang) + 1) % LANGS.length];
      setLang(next);
    }
  }
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
    const y        = rowY0 + i * rowStep;
    const selected = i === optionIndex;
    if (selected) {
      const hl = ctx.createLinearGradient(panelX, y, panelX + panelW, y);
      hl.addColorStop(0,    'rgba(20, 10, 4, 0.00)');
      hl.addColorStop(0.08, 'rgba(20, 10, 4, 0.50)');
      hl.addColorStop(0.92, 'rgba(20, 10, 4, 0.50)');
      hl.addColorStop(1,    'rgba(20, 10, 4, 0.00)');
      ctx.fillStyle = hl;
      ctx.fillRect(panelX, y - 28, panelW, 56);
    }
    ctx.fillStyle    = selected ? '#fff4c0' : '#f6e3c3';
    ctx.font         = selected ? 'bold 13px monospace' : '12px monospace';
    ctx.textAlign    = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(t(id), panelX + 28, y - 10);
    if (id === 'masterVolume' || id === 'musicVolume' || id === 'sfxVolumeMaster') {
      _drawVolumeBar(ctx, id, selected, panelX, panelW, _panelH, y, cx);
    } else if (id === 'language') {
      _drawLanguageRow(ctx, selected, panelX, panelW, y);
    }
  });
}

function _drawVolumeBar(ctx, id, selected, panelX, panelW, _panelH, y, cx) {
  const vol = id === 'masterVolume'    ? audioManager.masterVolume
            : id === 'musicVolume'     ? audioManager.musicVolume
            :                           audioManager.sfxVolumeMaster;
  const barX  = panelX + 28;
  const barW  = panelW - 56;
  const barY  = y + 8;
  const barH  = 10;
  const steps = 10;
  ctx.fillStyle = selected ? '#fff4c0' : '#d6c7a2';
  ctx.font      = selected ? 'bold 12px monospace' : '11px monospace';
  ctx.textAlign = 'right';
  ctx.fillText(Math.round(vol * 100) + '%', panelX + panelW - 28, y - 10);
  ctx.fillStyle = 'rgba(20, 10, 4, 0.55)';
  rrect(ctx, barX, barY, barW, barH, 4);
  ctx.fill();
  const fillW = Math.round(barW * vol);
  if (fillW > 4) {
    const grd = ctx.createLinearGradient(barX, barY, barX + fillW, barY);
    grd.addColorStop(0,   '#b06020');
    grd.addColorStop(0.5, '#f0a030');
    grd.addColorStop(1,   '#f0c040');
    rrect(ctx, barX, barY, fillW, barH, 4);
    ctx.fillStyle = grd;
    ctx.fill();
  }
  ctx.strokeStyle = 'rgba(255,220,120,0.25)';
  ctx.lineWidth   = 1;
  for (let s = 1; s < steps; s++) {
    const tx = barX + Math.round(barW * s / steps);
    ctx.beginPath();
    ctx.moveTo(tx, barY + 2);
    ctx.lineTo(tx, barY + barH - 2);
    ctx.stroke();
  }
  const kx = barX + Math.round(barW * vol);
  ctx.fillStyle = selected ? '#f0c040' : '#c8a060';
  ctx.beginPath();
  ctx.arc(kx, barY + barH / 2, 7, 0, Math.PI * 2);
  ctx.fill();
  if (selected) {
    ctx.strokeStyle = 'rgba(240,192,0,0.5)';
    ctx.lineWidth   = 1.5;
    ctx.stroke();

    ctx.fillStyle = 'rgba(240,192,0,0.55)';
    ctx.font      = '11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('◄  ►', cx, barY + barH / 2);
  }
}

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
 */
export function drawControlsContent(ctx, panelX, panelY, panelW) {
  ctx.textBaseline = 'middle';
  const midY    = panelY + 184;
  const b1Start = panelY + 88;
  const b1Step  = 26;
  const b1Rows = [
    [t('move'),   'Arrow Keys / WASD'],
    [t('jump'),   'Space'],
    [t('crouch'), 'S / ↓'],
    [t('roll'),   'S + ← / →'],
  ];
  b1Rows.forEach(([label, keys], i) => {
    const y = b1Start + i * b1Step;
    ctx.fillStyle = '#f6e3c3';
    ctx.font      = '13px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(label, panelX + 30, y);
    ctx.fillStyle = '#f0c040';
    ctx.textAlign = 'right';
    ctx.fillText(keys, panelX + panelW - 30, y);
  });
  ctx.strokeStyle = 'rgba(59, 38, 21, 0.35)';
  ctx.lineWidth   = 1;
  ctx.beginPath();
  ctx.moveTo(panelX + 30,         midY);
  ctx.lineTo(panelX + panelW - 30, midY);
  ctx.stroke();
  const b2Start = panelY + 205;
  const b2Step  = 26;
  const b2Rows = [
    [t('climb'),      'W / S  ↑ / ↓'],
    [t('lookUp'),     'E'],
    [t('pause'),      'P'],
    [t('fullscreen'), 'F'],
    [t('back'),       'Q'],
  ];
  b2Rows.forEach(([label, keys], i) => {
    const y = b2Start + i * b2Step;
    ctx.fillStyle = '#f6e3c3';
    ctx.font      = '13px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(label, panelX + 30, y);
    ctx.fillStyle = '#f0c040';
    ctx.textAlign = 'right';
    ctx.fillText(keys, panelX + panelW - 30, y);
  });
}
// #endregion