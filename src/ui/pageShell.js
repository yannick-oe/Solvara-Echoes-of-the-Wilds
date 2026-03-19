// #region Imports
import { audioManager } from '../core/audioManager.js';
// #endregion

// #region Public Methods
/** Initializes the page shell controls. @returns {void} Nothing. */
export function initPageShell() {
  const muteButton = _getMuteButton();
  if (!muteButton) return;
  audioManager.subscribe(state => _renderMuteButton(muteButton, state));
  muteButton.addEventListener('click', () => audioManager.toggleMuted());
}
// #endregion

// #region Helper Functions
/** Returns the mute button element. @returns {HTMLButtonElement|null} The mute button. */
function _getMuteButton() {
  return document.getElementById('muteToggle');
}

/** Updates the mute button state. @param {HTMLButtonElement} button - The mute button. @param {{ muted: boolean }} state - The current audio state. @returns {void} Nothing. */
function _renderMuteButton(button, state) {
  const icon = button.querySelector('[data-mute-icon]');
  const label = button.querySelector('[data-mute-label]');
  const muted = state.muted;
  button.dataset.muted = String(muted);
  button.setAttribute('aria-pressed', String(muted));
  button.setAttribute('aria-label', muted ? 'Audio einschalten' : 'Audio stummschalten');
  if (icon) icon.textContent = muted ? '🔇' : '🔊';
  if (label) label.textContent = muted ? 'Ton an' : 'Ton aus';
}
// #endregion
