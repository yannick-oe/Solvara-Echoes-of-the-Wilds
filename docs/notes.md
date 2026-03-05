# Coaching-Notizen (Platformer)

## Was jetzt schon gut ist
- Klare Trennung in `game`, `player`, `level`, `camera`, `input`.
- Solide Basis-Physik: horizontal + vertikal getrennte Kollision.
- Saubere Game-Loop mit Delta-Time und Frame-Cap.

## Was verbessert wurde
- Fall-Respawn funktioniert jetzt zuverlässig (kein unsichtbarer Boden mehr unterhalb der Welt).
- Hazard-Tiles sind vorbereitet (`spike`) und lösen Respawn aus.
- Level-Layout ist stärker wie ein echter Platformer aufgebaut (Training → Vertical Challenge → Goal).
- Spieler-Logik ist in kleinere Funktionen zerlegt und dadurch leichter zu lesen.

## So baust du weitere Tiles ein
1. Neue Tile-ID in `src/constants.js` ergänzen (`TILE_ID`).
2. Entscheiden: `solid`, `hazard` oder rein dekorativ.
3. Falls `solid`, ID in `SOLID_TILE_IDS` aufnehmen.
4. Falls `hazard`, ID in `HAZARD_TILE_IDS` aufnehmen.
5. Tile im Level platzieren, z. B. in `src/level.js` über `fillRow`, `fillBlock` oder `fillPlatform`.

## Mini-Beispiel
- Neue Kiste: `crate: 90` zu `TILE_ID`.
- Dann `crate` zu `SOLID_TILE_IDS`.
- Platzieren mit `this.fillBlock(tiles, 6, 20, TILE_ID.crate);`

## Nächste sinnvolle Schritte
- Checkpoint-System (`spawnX/spawnY` bei Flaggen aktualisieren).
- Zwei bis drei kurze Level statt ein langes.
- Einfache Gegner mit Patrouillen-Logik auf Plattformen.
