/**
 * Zentrale Lautstärke-Konfiguration für alle Gameplay-SFX.
 * Alle playSfx()-Aufrufe referenzieren diese Werte – Balancing nur hier ändern.
 *
 * Werte sind relative Multiplikatoren auf den globalen sfxVolume-Wert des AudioManagers.
 * Gültige Spanne: 0.0 – 1.5  (AudioElement-Hardware-Maximum: 1.0)
 */
export const SFX_VOLUME = {
  jump:      0.1,
  enemyKill: 0.9,
  landing:   0.3,
  footstep:  0.2,
  pickup:    0.4,
  hurt:      0.6,
  death:     1.0,
  switch:    0.5,
  roll:      0.4,
};
