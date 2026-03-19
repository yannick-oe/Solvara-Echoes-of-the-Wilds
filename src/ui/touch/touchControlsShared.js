import { GAME_STATES } from '../../core/constants.js';

export const BTN = 56;
export const BTN_SM = 40;
export const EDGE = 12;
export const GAP = 8;
const TABLET_MAX_DIM = 1400;

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
  background: rgba(22, 14, 6, 0.60);
  border: 2px solid rgba(180, 140, 55, 0.55);
  color: rgba(236, 196, 88, 0.92);
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
  box-shadow: 0 2px 10px rgba(0,0,0,0.60), inset 0 0 0 1px rgba(240,200,100,0.10);
  transition: background 0.07s, border-color 0.07s;
`;

export function isTouchDevice() {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

export function isMobileLayout() {
  if (!isTouchDevice()) return false;
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  const noHover = window.matchMedia('(hover: none)').matches;
  const maxDim = Math.max(window.screen.width, window.screen.height);
  return coarse && noHover && maxDim <= TABLET_MAX_DIM;
}

export function isPortraitMobile() {
  return isMobileLayout() && window.innerWidth < window.innerHeight;
}

export function shouldShowTouchControls(state) {
  return isMobileLayout() &&
    !isPortraitMobile() &&
    (state === GAME_STATES.PLAYING || state === GAME_STATES.PAUSED);
}
