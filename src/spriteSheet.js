/*
  spriteSheet.js
  --------------
  Utility that translates frame index or row/column into a source rectangle
  for ctx.drawImage(...).
*/

export class SpriteSheet {
  /**
   * @param {HTMLImageElement} image Spritesheet image.
   * @param {number} frameWidth Width of one frame in source pixels.
   * @param {number} frameHeight Height of one frame in source pixels.
   */
  constructor(image, frameWidth, frameHeight) {
    this.image = image;
    this.frameWidth = frameWidth;
    this.frameHeight = frameHeight;
    this.columns = Math.floor(image.width / frameWidth);
  }

  /**
   * Returns frame rectangle by linear index.
   * @param {number} index Linear frame index.
   */
  frame(index) {
    const col = index % this.columns;
    const row = Math.floor(index / this.columns);

    return {
      sx: col * this.frameWidth,
      sy: row * this.frameHeight,
      sw: this.frameWidth,
      sh: this.frameHeight,
    };
  }

  /**
   * Returns frame rectangle by explicit column and row.
   * @param {number} column Column index in spritesheet grid.
   * @param {number} row Row index in spritesheet grid.
   */
  frameAt(column, row) {
    return {
      sx: column * this.frameWidth,
      sy: row * this.frameHeight,
      sw: this.frameWidth,
      sh: this.frameHeight,
    };
  }
}