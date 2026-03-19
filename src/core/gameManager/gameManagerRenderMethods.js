import { CANVAS_HEIGHT, CANVAS_WIDTH, GAME_STATES } from '../constants.js';
import { imageCache } from '../imageCache.js';

export const gameManagerRenderMethods = {
/** Handles draw. @returns {void} - Nothing. */
  _draw() {
    this._clearFrame();
    this.ctx.imageSmoothingEnabled = false;
    this._drawStateFrame();
  },

/** Clears frame. @returns {void} - Nothing. */
  _clearFrame() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = '#1a1220';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  },

/** Draws state Frame. @returns {*} - Resulting value. */
  _drawStateFrame() {
    if (this.state === GAME_STATES.START) return this._startScreen.draw(this.ctx);
    if (this.state === GAME_STATES.PLAYING) return this._drawWorld();
    if (this.state === GAME_STATES.PAUSED) return this._drawPausedWorld();
    if (this.state === GAME_STATES.GAMEOVER) return this._gameOverScreen.draw(this.ctx);
    if (this.state === GAME_STATES.VICTORY) this._victoryScreen.draw(this.ctx);
  },

/** Draws paused World. @returns {void} - Nothing. */
  _drawPausedWorld() {
    this._drawWorld();
    this._pauseScreen.draw(this.ctx);
  },

/** Draws world. @returns {void} - Nothing. */
  _drawWorld() {
    this._drawParallaxLayer();
    this._drawWorldEntities();
    this._drawLightingOverlay();
    this._hud.draw(this.ctx, this.gameState);
  },

/** Draws parallax Layer. @returns {void} - Nothing. */
  _drawParallaxLayer() {
    this._parallax?.draw(this.ctx, this._camera.x);
  },

/** Draws world Entities. @returns {void} - Nothing. */
  _drawWorldEntities() {
    this.ctx.save();
    this._camera.applyTransform(this.ctx);
    this._level.tileMap?.draw(this.ctx, this._camera);
    this._drawWorldPropAndEntityPass();
    this.ctx.restore();
  },

/** Draws world Prop And Entity Pass. @returns {void} - Nothing. */
  _drawWorldPropAndEntityPass() {
    this._drawProps('back');
    this._drawEntityGroup(this._hazards);
    this._drawEntityGroup(this._interactables);
    this._player?.draw(this.ctx, this._camera, imageCache);
    this._drawActiveEntityGroup(this._projectiles);
    this._drawActiveEntityGroup(this._enemies);
    this._drawActiveEntityGroup(this._effects);
    this._drawActiveEntityGroup(this._pickups);
    this._drawProps('front');
  },

/** Draws entity Group. @param {*} entities - Entities value. @returns {void} - Nothing. */
  _drawEntityGroup(entities) {
    for (const entity of entities) entity.draw(this.ctx, this._camera, imageCache);
  },

/** Draws active Entity Group. @param {*} entities - Entities value. @returns {void} - Nothing. */
  _drawActiveEntityGroup(entities) {
    for (const entity of entities) if (entity.active) entity.draw(this.ctx, this._camera, imageCache);
  },

/** Draws lighting Overlay. @returns {void} - Nothing. */
  _drawLightingOverlay() {
    const lightGrd = this.ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    lightGrd.addColorStop(0, 'rgba(255,240,180,0.08)');
    lightGrd.addColorStop(1, 'rgba(0,0,0,0.08)');
    this.ctx.fillStyle = lightGrd;
    this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    this.ctx.fillStyle = 'rgba(255,230,150,0.03)';
    this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  },

/** Draws props. @param {*} layer - Layer value. @returns {void} - Nothing. */
  _drawProps(layer) {
    for (const prop of this._props) if (prop.layer === layer) this._drawSingleProp(prop);
  },

/** Draws single Prop. @param {*} prop - Prop value. @returns {void} - Nothing. */
  _drawSingleProp(prop) {
    const img = imageCache.get(prop.key);
    if (!img) return;
    const size = this._propDrawSize(img, prop);
    this.ctx.save();
    if (prop.alpha !== 1) this.ctx.globalAlpha = prop.alpha;
    this._drawPropImage(prop, img, size);
    this.ctx.restore();
  },

/** Handles prop Draw Size. @param {*} img - Img value. @param {*} prop - Prop value. @returns {number} - Computed numeric value. */
  _propDrawSize(img, prop) {
    return { w: img.naturalWidth * prop.scaleX, h: img.naturalHeight * prop.scaleY };
  },

/** Draws prop Image. @param {*} prop - Prop value. @param {*} img - Img value. @param {*} size - Size value. @returns {*} - Resulting value. */
  _drawPropImage(prop, img, size) {
    if (!prop.flipX && !prop.flipY) return this.ctx.drawImage(img, prop.x, prop.y, size.w, size.h);
    this._drawFlippedPropImage(prop, img, size);
  },

/** Draws flipped Prop Image. @param {*} prop - Prop value. @param {*} img - Img value. @param {*} size - Size value. @returns {void} - Nothing. */
  _drawFlippedPropImage(prop, img, size) {
    const sx = prop.flipX ? -1 : 1;
    const sy = prop.flipY ? -1 : 1;
    this.ctx.translate(prop.x + (prop.flipX ? size.w : 0), prop.y + (prop.flipY ? size.h : 0));
    this.ctx.scale(sx, sy);
    this.ctx.drawImage(img, 0, 0, size.w, size.h);
  },
};