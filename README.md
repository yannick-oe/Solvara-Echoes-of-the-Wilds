# Solvara: Echoes of the Wilds

2D Jump'n'Run mit Canvas (720x480), fester Update-Rate von 60 FPS und modularer OOP-Struktur.

## Steuerung

- `A` / `D` oder Pfeiltasten links/rechts: laufen
- `Space`: springen
- `S` oder Pfeil nach unten: ducken
- `F`: Fullscreen umschalten (Container-Div, nicht Canvas direkt)

## Architektur

- `src/core/Game.js`: Game-Loop, Preload, Levelwechsel, Entity-Update/Draw
- `src/core/Time.js`: Fixed-Timestep (`1/60`) für stabile Physik
- `src/entities/Entity.js`: Basisklasse für Vererbung
- `src/entities/Player.js`: Spielerlogik, Kollision, Animation (stoppable intervals)
- `world/Level.js`: Laden und Bauen von Levels aus JSON

## Leveldaten

Level liegen in:

- `assets/data/levels/level_01.json`
- `assets/data/levels/level_02.json`

Format:

- `width`, `height`, `groundRow`
- `spawnCol`, `spawnRow`
- `groundSections`: Arrays aus `[startCol, endCol]`
- `platforms`: Arrays aus `[row, startCol, endCol]`

## Hinweise

- Assets werden zentral über `ImageCache` geladen.
- Animationen verwenden stoppbare `setInterval`-IDs, damit sie sauber beendet werden können.
- Levelwechsel erfolgt am rechten Levelrand automatisch.
