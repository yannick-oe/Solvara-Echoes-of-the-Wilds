import { GAME_STATES } from '../../core/constants.js';

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

export function isTouchDevice() {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

export function isMobileLayout() {
  if (!isTouchDevice()) return false;
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  const noHover = window.matchMedia('(hover: none)').matches;
  const maxDim = Math.max(window.innerWidth, window.innerHeight);
  return coarse && noHover && maxDim <= TABLET_MAX_DIM;
}

export function isPortraitMobile() {
  return isMobileLayout() && window.innerWidth < window.innerHeight;
}

export function shouldShowTouchControls(state) {
  return isMobileLayout() &&
    !isPortraitMobile() &&
    (state === GAME_STATES.START || state === GAME_STATES.PLAYING || state === GAME_STATES.PAUSED);
}

export function isMenuTouchState(state) {
  return state === GAME_STATES.START || state === GAME_STATES.PAUSED;
}

export function isGameplayTouchState(state) {
  return state === GAME_STATES.PLAYING;
}
