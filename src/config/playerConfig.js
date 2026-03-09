/**
 * Zentrales Gameplay-Tuning für den Spieler.
 * Alle Zeitkonstanten und Geschwindigkeitswerte hier ändern –
 * niemals direkt in player.js nach Zahlen suchen müssen.
 */

// ─── Roll ─────────────────────────────────────────────────────────────────────
/** Sekunden DOWN + Richtung halten, bis die Roll-Bewegung startet. */
export const ROLL_CHARGE_TIME = 0.22;   // s
/** Startgeschwindigkeit der Roll-Bewegung. */
export const ROLL_SPEED_INIT  = 350;    // px/s
/** Abbremsung (Reibung) während der Roll-Bewegung. */
export const ROLL_FRICTION    = 280;    // px/s²
/** Mindestgeschwindigkeit; darunter wird die Roll-Bewegung beendet. */
export const ROLL_MIN_SPEED   = 80;     // px/s

// ─── Schaden / Unverwundbarkeit ───────────────────────────────────────────────
/** Dauer der Unverwundbarkeit nach einem Treffer. */
export const INVUL_DURATION = 1.1;      // s
/** Dauer des Hurt-Zustands (Stoß-Bremsphase). */
export const HURT_DURATION  = 0.35;    // s
/** Blink-Intervall während Unverwundbarkeit. */
export const BLINK_INTERVAL = 0.09;    // s
/** Horizontale Rückstoßkraft beim Treffer. */
export const KNOCKBACK_X    = 280;     // px/s
/** Vertikale Rückstoßkraft beim Treffer (negativ = aufwärts). */
export const KNOCKBACK_Y    = -340;    // px/s

// ─── Wall Grab / Jump ─────────────────────────────────────────────────────────
/** Reduzierte Schwerkraft am Wandgriff. */
export const WALL_SLIDE_GRAVITY   = 180;    // px/s²
/** Maximale Gleitgeschwindigkeit am Wandgriff. */
export const WALL_SLIDE_MAX_SPEED = 90;     // px/s
/** Horizontale Abstoßkraft beim Wandsprung. */
export const WALL_JUMP_X          = 380;    // px/s
/** Vertikale Wandsprung-Kraft (negativ = aufwärts). */
export const WALL_JUMP_Y          = -680;   // px/s

// ─── Leiter ───────────────────────────────────────────────────────────────────
/** Klettergeschwindigkeit an Leitern. */
export const CLIMB_SPEED = 120;     // px/s

// ─── Coyote-Time / Sprungpuffer ───────────────────────────────────────────────
/** Sekunden nach Plattformverlassen, in denen noch gesprungen werden kann. */
export const COYOTE_TIME = 0.10;    // s
/** Sekunden Voraus-Sprungpuffer (Sprungknopf vor Landung drücken). */
export const JUMP_BUFFER = 0.12;    // s
