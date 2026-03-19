// #region Imports
import { GAME_STATES } from '../../core/constants.js';

// #endregion
// #region Shared Helpers
export const BTN = 56;
export const BTN_SM = 40;
export const EDGE = 12;
export const GAP = 4;
const TABLET_MAX_DIM = 1600;

export const TOUCH_LAYER_STYLE = [
  'position: fixed',
  'inset: 0',
  'z-index: 40',
  'pointer-events: none',
  'user-select: none',
  '-webkit-user-select: none',
  'display: none',
].join('; ');

export const BUTTON_CSS_TEMPLATE = `
  position: fixed;
  __POS__;
  width:  __SIZE__px;
  height: __SIZE__px;
  border-radius: 50%;
  background:
    radial-gradient(circle at 30% 26%, rgba(255, 234, 194, 0.10), rgba(214, 166, 86, 0.06) 18%, rgba(26, 19, 15, 0.16) 56%, rgba(8, 7, 8, 0.20));
  border: 1px solid rgba(214, 177, 103, 0.56);
  color: rgba(249, 231, 181, 0.94);
  font-size: __FONT__px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: auto;
  touch-action: none;
  -webkit-touch-callout: none;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
  -webkit-user-select: none;
  cursor: pointer;
  outline: none;
  overflow: visible;
  text-shadow: 0 0 10px rgba(255, 224, 150, 0.22);
  backdrop-filter: blur(12px) saturate(118%);
  -webkit-backdrop-filter: blur(12px) saturate(118%);
  box-shadow:
    0 10px 24px rgba(0,0,0,0.24),
    0 0 16px rgba(192, 145, 72, 0.10),
    inset 0 1px 0 rgba(255, 239, 205, 0.14),
    inset 0 -8px 14px rgba(0,0,0,0.12);
  transition:
    background 0.12s,
    border-color 0.12s,
    color 0.12s,
    transform 0.12s,
    box-shadow 0.12s,
    opacity 0.12s;
`;

export const TOUCH_BUTTON_STATE_STYLE = `
  .tc-btn {
    position: fixed;
    isolation: isolate;
  }
  .tc-btn::before,
  .tc-btn::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    pointer-events: none;
  }
  .tc-btn::before {
    inset: 1px;
    background:
      linear-gradient(180deg, rgba(255, 247, 223, 0.12), rgba(255, 247, 223, 0.03) 26%, rgba(255, 247, 223, 0.00) 54%),
      radial-gradient(circle at 50% 18%, rgba(255, 221, 157, 0.10), rgba(255, 221, 157, 0.00) 58%);
    box-shadow:
      inset 0 1px 0 rgba(255, 247, 223, 0.12),
      inset 0 -8px 10px rgba(0, 0, 0, 0.12);
    opacity: 0.95;
  }
  .tc-btn::after {
    inset: -4px;
    border: 1px solid rgba(228, 190, 108, 0.14);
    box-shadow:
      0 0 16px rgba(216, 161, 78, 0.09),
      inset 0 0 8px rgba(255, 233, 173, 0.06);
    opacity: 0.90;
  }
  [id^='tc-dir-'] {
    border-color: rgba(214, 180, 114, 0.52) !important;
  }
  [id^='tc-act-'] {
    border-color: rgba(224, 189, 112, 0.58) !important;
  }
  #tc-act-jump,
  #tc-act-action {
    box-shadow:
      0 12px 26px rgba(0,0,0,0.26),
      0 0 18px rgba(198, 151, 75, 0.12),
      inset 0 1px 0 rgba(255, 243, 212, 0.16),
      inset 0 -10px 16px rgba(0,0,0,0.14) !important;
  }
  #tc-act-pause,
  #tc-act-fullscreen,
  #tc-act-back {
    background:
      radial-gradient(circle at 30% 26%, rgba(255, 234, 194, 0.08), rgba(214, 166, 86, 0.04) 18%, rgba(24, 18, 15, 0.14) 56%, rgba(8, 7, 8, 0.18)) !important;
    border-color: rgba(204, 168, 96, 0.48) !important;
  }
  .tc-btn.tc-active {
    background:
      radial-gradient(circle at 30% 24%, rgba(255, 237, 202, 0.18), rgba(220, 176, 92, 0.12) 20%, rgba(44, 30, 16, 0.26) 60%, rgba(11, 8, 8, 0.28)) !important;
    border-color: rgba(248, 220, 146, 0.96) !important;
    color: rgba(255, 247, 214, 1.0) !important;
    text-shadow: 0 0 14px rgba(255, 234, 181, 0.34);
    transform: translateY(1px) scale(0.97);
    box-shadow:
      0 12px 28px rgba(0,0,0,0.28),
      0 0 24px rgba(226, 171, 83, 0.22),
      inset 0 1px 0 rgba(255, 246, 219, 0.22),
      inset 0 -10px 14px rgba(0,0,0,0.18) !important;
  }
  .tc-btn.tc-active::before {
    opacity: 1;
    background:
      linear-gradient(180deg, rgba(255, 247, 223, 0.18), rgba(255, 247, 223, 0.06) 30%, rgba(255, 247, 223, 0.00) 58%),
      radial-gradient(circle at 50% 16%, rgba(255, 223, 163, 0.14), rgba(255, 223, 163, 0.00) 58%);
  }
  .tc-btn.tc-active::after {
    border-color: rgba(248, 220, 146, 0.28);
    box-shadow:
      0 0 20px rgba(226, 171, 83, 0.18),
      inset 0 0 10px rgba(255, 236, 186, 0.08);
  }
`;

/** Checks whether touch Device. @returns {boolean} - Whether the check passes. */
export function isTouchDevice() {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

/** Checks whether mobile Layout. @returns {boolean} - Whether the check passes. */
export function isMobileLayout() {
  if (!isTouchDevice()) return false;
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  const noHover = window.matchMedia('(hover: none)').matches;
  const maxDim = Math.max(window.innerWidth, window.innerHeight);
  return coarse && noHover && maxDim <= TABLET_MAX_DIM;
}

/** Checks whether portrait Mobile. @returns {boolean} - Whether the check passes. */
export function isPortraitMobile() {
  return isMobileLayout() && window.innerWidth < window.innerHeight;
}

/** Checks whether show Touch Controls. @param {*} state - State value. @returns {boolean} - Whether the check passes. */
export function shouldShowTouchControls(state) {
  return isMobileLayout() &&
    !isPortraitMobile() &&
    (state === GAME_STATES.START || state === GAME_STATES.PLAYING || state === GAME_STATES.PAUSED);
}

/** Checks whether menu Touch State. @param {*} state - State value. @returns {boolean} - Whether the check passes. */
export function isMenuTouchState(state) {
  return state === GAME_STATES.START || state === GAME_STATES.PAUSED;
}

/** Checks whether gameplay Touch State. @param {*} state - State value. @returns {boolean} - Whether the check passes. */
export function isGameplayTouchState(state) {
  return state === GAME_STATES.PLAYING;
}
// #endregion