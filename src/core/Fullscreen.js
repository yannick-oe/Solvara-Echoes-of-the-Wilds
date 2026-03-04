/**
 * Toggles fullscreen mode for a target element.
 * @param {HTMLElement | null | undefined} element The target element for fullscreen.
 */
export async function toggleFullscreen(element) {
    const target = element instanceof HTMLElement ? element : document.documentElement;
    const isFullscreen = document.fullscreenElement !== null;
    if (!isFullscreen) {
        await target.requestFullscreen();
    } else {
        await document.exitFullscreen();
    }
}