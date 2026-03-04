/**
 * Scales the game container pixel-perfect to the browser window.
 * @param {HTMLElement} container The surrounding container element.
 * @param {number} baseW Base width of the game resolution.
 * @param {number} baseH Base height of the game resolution.
 */
export function fitCanvasToWindow(container, baseW, baseH) {
    const scaleX = Math.floor(window.innerWidth / baseW);
    const scaleY = Math.floor(window.innerHeight / baseH);
    const scale = Math.max(1, Math.min(scaleX, scaleY));
    const displayW = baseW * scale;
    const displayH = baseH * scale;
    container.style.width = `${displayW}px`;
    container.style.height = `${displayH}px`;
    container.style.left = `${Math.floor((window.innerWidth - displayW) / 2)}px`;
    container.style.top = `${Math.floor((window.innerHeight - displayH) / 2)}px`;
    return scale;
}