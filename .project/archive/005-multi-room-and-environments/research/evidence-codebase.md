# Evidence — codebase

Repo root: /root/Dev/sandbox/temp/temp4
Scanned: 2026-11-11
Checks run: `npm run build` → vite v5.4.21 built in 2.02s (dist/assets/index-BQM0bm_S.css 19.89 kB, dist/assets/index-nqKntf91.js 536.38 kB)

## Map

- **Stack**: JavaScript (ES Modules), Three.js v0.170.0, Vite v5.4.11, HTML5/CSS3 (custom styles with CSS variables), Web Audio API, Web Speech API (SpeechSynthesis & SpeechRecognition), LocalStorage.
- **Entry points**: `index.html` loads `/src/main.js`. `main.js` initializes `SceneManager`, `CharacterController`, `InteractableManager`, `NPCManager`, `QuestEngine`, `InventoryUI`, `ProgressionManager`, and `StorageService`.
- **Architecture**: Modular client-side architecture with Three.js rendering loop in `SceneManager` (`scene.js`), player avatar and input handling in `CharacterController` (`character.js`, `input.js`), raycasting/proximity interactables in `InteractableManager` (`interactables.js`, `vocabModal.js`), NPC & quest loop in `NPCManager` & `QuestEngine` (`npc.js`, `dialogue.js`, `quest.js`, `voice.js`), and inventory/state progression in `InventoryUI`, `ProgressionManager`, and `StorageService` (`inventory.js`, `progression.js`, `storage.js`).
- **Conventions**: CamelCase class names and method names, ES module imports/exports, centralized DOM manipulation helpers, auto-save listeners on game state mutations, semantic git commit style (`T001: ...`, `build: ...`, `ship: ...`).
- **Maturity**: Fully functional single-player 3D game running entirely in browser. Production bundle builds cleanly in ~2 seconds. Full core gamification loop (exploration, vocab discovery, quest solving, voice check, inventory, leveling, persistence).
- **Recent activity**: Last 4 milestones developed in order: M001 (3D core engine & movement), M002 (raycast vocab interaction & audio), M003 (NPC quest & voice recognition), M004 (inventory, progression XP/Level, and LocalStorage persistence).

## Finding: Vocabulary and Scene assets are procedurally generated Three.js low-poly primitives

- **Claim**: All 3D meshes (character, NPC, furniture, study room walls, interactable items) are built programmatically using Three.js built-in geometries (BoxGeometry, CylinderGeometry, SphereGeometry, ConeGeometry) and standard materials rather than loading external `.gltf`/`.glb` files.
- **Source**: `src/scene.js:25-90`, `src/character.js:35-120`, `src/interactables.js:40-250`
- **Confidence**: high
- **Why it matters here**: Adding new rooms or expanding environments in M005 does not require setting up a heavy 3D asset pipeline or external CDN; new rooms and objects can be composed modularly with low-poly procedural geometries, keeping asset load times instantaneous and bundle sizes under 600KB.

## Finding: Single-room scene geometry is currently coupled to SceneManager initialization

- **Claim**: The current `SceneManager` (`src/scene.js`) constructs a fixed classroom/study room environment (room walls, floor, lights, ceiling) directly in its constructor and setup methods, without a zone or room switching mechanism.
- **Source**: `src/scene.js:20-65`
- **Confidence**: high
- **Why it matters here**: For M005 (`multi-room-and-environments`), `SceneManager` needs to be refactored or augmented with a `ZoneManager` / `RoomManager` that can detach/dispose old room geometries and mount new room layouts (Living Room, Kitchen/Cafe) dynamically.

## Finding: StorageService already supports extensible schema for state persistence

- **Claim**: `StorageService` (`src/storage.js`) uses a versioned data structure (`STORAGE_KEY = 'wordquest_save_v1'`) that stores `inventory`, `level`, `xp`, `learnedWords`, `quests`, and `playerPos`, with validation and fallback defaults.
- **Source**: `src/storage.js:10-50`
- **Confidence**: high
- **Why it matters here**: Storing the player's active room/zone or room-specific progress can easily be added to the schema without breaking existing saved game states.

## Apparent intent

- The project aims to provide a lightweight, immersive browser-based 3D English vocabulary game with zero friction (no login or heavy downloads required).
- Moving from a single study room to a multi-room environment is the logical progression to expand thematic vocabulary (food, household, public places).

## Open questions for define

- How should room transitions be triggered (e.g. stepping through a doorway portal with a fade-to-black effect, or selecting from a zone map)?
- Which initial rooms should be introduced in M005 (e.g. Living Room + Kitchen/Cafe)?

## Blocked areas

- none
