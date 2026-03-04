# Solvara – Beginner Friendly Structure

Das Spielgefühl bleibt erhalten (Parallax, Tileset, Spieler-Sprite, Jump'n'Run),
aber die Code-Struktur ist jetzt deutlich einfacher aufgebaut.

## Aktueller Stand

- 1 funktionierendes Level
- Spieler mit laufen, springen, ducken
- Kamera folgt dem Spieler
- Parallax-Hintergrund mit vorhandenen Assets
- Ziel am Level-Ende

## Steuerung

- `A` / `D` oder Pfeiltasten links/rechts → laufen
- `Space` → springen
- `S` oder Pfeil runter → ducken
- `F` → Fullscreen

## Einfache Struktur

- `src/main.js` → Start, Resize, Fullscreen
- `src/game.js` → Game-Loop, Laden, Update, Draw
- `src/constants.js` → alle zentralen Werte
- `src/imageCache.js` → Bilder laden
- `src/input.js` → Tastatur
- `src/level.js` → Tilemap + Ziel
- `src/player.js` → Spielerphysik + Animation
- `src/camera.js` → Kamera-Follow
- `src/parallax.js` → Hintergrund-Layer
- `src/spriteSheet.js` → SpriteFrames

Damit ist das Projekt für Einsteiger gut nachvollziehbar, ohne das eigentliche Spiel zu verlieren.
