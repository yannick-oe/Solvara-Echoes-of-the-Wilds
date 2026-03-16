# Solvara: Echoes of the Wilds

A handcrafted 2D platformer built with vanilla JavaScript and the HTML5 Canvas API.

The project demonstrates a modular game architecture, entity-based systems, and a fully interactive game loop including menus, collisions, pickups, enemies, and level progression.

---

## 🎮 Game Overview

**Solvara: Echoes of the Wilds** is a fantasy-themed platformer where the player explores a mysterious forest world filled with dangers, puzzles, and hidden elements.

The player must navigate the level, interact with objects, avoid enemies, collect items, and ultimately reach the goal to complete the level.

The project focuses on **clean architecture, maintainable code structure, and modular gameplay systems**.

---

## 🕹 Controls

| Action | Key |
|------|------|
| Move Left | A / ← |
| Move Right | D / → |
| Jump | Space |
| Pause Menu | P |
| Confirm / Menu Select | Enter |
| Toggle Fullscreen | F |

---

## ⚙ Features

- HTML5 Canvas based game rendering
- Modular JavaScript architecture
- Entity-based gameplay system
- Collision detection system
- Enemy interaction system
- Pickup and collectible system
- Pause and options menus
- Adjustable audio settings
- Game over and victory states
- Keyboard input handling
- Responsive canvas scaling
- Fullscreen support

---

## 🏗 Project Architecture

The project follows a modular structure separating gameplay systems, UI logic, and world logic.

src
│
├── config → global configuration and constants
├── core → core game systems (game manager, input, camera, etc.)
├── entities → player, enemies, hazards, pickups
├── ui → menus, HUD, interface systems
├── world → level, tilemap, parallax and world logic

This separation improves maintainability and keeps systems loosely coupled.

---

## 🧠 Code Quality

The project was developed with a strong focus on maintainability and readability:

- Modular file structure
- Maximum file size limit enforced
- JSDoc documentation for all functions
- Clear function responsibilities
- Region-based code organization
- No unused imports or dead code
- Consistent naming conventions
- Clean separation of systems

---

## 📦 Technologies Used

- **JavaScript (ES Modules)**
- **HTML5 Canvas API**
- **CSS**
- **Vanilla JS Game Loop**
- **VS Code**

No external libraries or game engines were used.

---

## 🚀 How to Run the Game

Clone the repository and start a local development server.

Example using VS Code Live Server:

1. Clone the repository
2. Open the project folder in VS Code
3. Run a local server (e.g. Live Server extension)
4. Open: http://127.0.0.1:5500/index.html

---

## 📁 Assets

Game assets include:

- pixel-art backgrounds
- sprite animations
- tile sets
- sound effects
- background music

All assets are used for educational purposes within the project.

---

## 📚 Learning Goals

This project was built to practice and demonstrate:

- JavaScript game architecture
- canvas rendering
- modular code organization
- object-oriented design
- game loops and update cycles
- collision systems
- input handling
- UI state management

---

## 🧑‍💻 Author

Yannick Oe

---

## 📄 License

This project is for educational purposes.
