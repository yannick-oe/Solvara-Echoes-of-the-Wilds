// #region Imports
import { audioManager } from '../core/audioManager.js';
// #endregion

// #region Public Methods
/** Initializes the page shell controls. @returns {void} Nothing. */
export function initPageShell() {
  const shell = _getShellElements();
  if (!shell.muteButtons.length) return;
  audioManager.subscribe(state => _renderMuteButtons(shell.muteButtons, state));
  _bindMuteButtons(shell.muteButtons);
  _bindMobileMenu(shell);
}
// #endregion

// #region Helper Functions
/** Returns the shell elements. @returns {{ muteButtons: HTMLElement[], menu: HTMLElement|null, toggle: HTMLButtonElement|null, closers: HTMLElement[] }} The shell elements. */
function _getShellElements() {
  return {
    muteButtons: [...document.querySelectorAll('[data-mute-toggle]')],
    menu: document.getElementById('shellMobileMenu'),
    toggle: document.getElementById('shellMenuToggle'),
    closers: [...document.querySelectorAll('[data-shell-close]')],
  };
}

/** Binds the mute buttons. @param {HTMLElement[]} buttons - The mute buttons. @returns {void} Nothing. */
function _bindMuteButtons(buttons) {
  for (const button of buttons) button.addEventListener('click', () => audioManager.toggleMuted());
}

/** Updates the mute button states. @param {HTMLElement[]} buttons - The mute buttons. @param {{ muted: boolean }} state - The current audio state. @returns {void} Nothing. */
function _renderMuteButtons(buttons, state) {
  for (const button of buttons) _renderMuteButton(button, state);
}

/** Updates one mute button state. @param {HTMLElement} button - The mute button. @param {{ muted: boolean }} state - The current audio state. @returns {void} Nothing. */
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

/** Binds the mobile menu interactions. @param {{ menu: HTMLElement|null, toggle: HTMLButtonElement|null, closers: HTMLElement[] }} shell - The shell elements. @returns {void} Nothing. */
function _bindMobileMenu(shell) {
  if (!shell.menu || !shell.toggle) return;
  shell.toggle.addEventListener('click', () => _toggleMenu(shell));
  for (const closer of shell.closers) closer.addEventListener('click', () => _closeMenu(shell));
  document.addEventListener('click', event => _handleOutsideClick(event, shell));
  document.addEventListener('keydown', event => _handleEscape(event, shell));
}

/** Toggles the mobile menu. @param {{ menu: HTMLElement, toggle: HTMLButtonElement }} shell - The shell elements. @returns {void} Nothing. */
function _toggleMenu(shell) {
  if (shell.menu.hidden) return _openMenu(shell);
  _closeMenu(shell);
}

/** Opens the mobile menu. @param {{ menu: HTMLElement, toggle: HTMLButtonElement }} shell - The shell elements. @returns {void} Nothing. */
function _openMenu(shell) {
  shell.menu.hidden = false;
  shell.toggle.setAttribute('aria-expanded', 'true');
}

/** Closes the mobile menu. @param {{ menu: HTMLElement, toggle: HTMLButtonElement }} shell - The shell elements. @returns {void} Nothing. */
function _closeMenu(shell) {
  shell.menu.hidden = true;
  shell.toggle.setAttribute('aria-expanded', 'false');
}

/** Handles outside click closing. @param {MouseEvent} event - The click event. @param {{ menu: HTMLElement, toggle: HTMLButtonElement }} shell - The shell elements. @returns {void} Nothing. */
function _handleOutsideClick(event, shell) {
  if (shell.menu.hidden) return;
  if (shell.menu.contains(event.target) || shell.toggle.contains(event.target)) return;
  _closeMenu(shell);
}

/** Handles escape closing. @param {KeyboardEvent} event - The keyboard event. @param {{ menu: HTMLElement, toggle: HTMLButtonElement }} shell - The shell elements. @returns {void} Nothing. */
function _handleEscape(event, shell) {
  if (event.key === 'Escape') _closeMenu(shell);
}
// #endregion
