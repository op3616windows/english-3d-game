# Evidence — codebase

Repo root: /root/Dev/sandbox/temp/temp4
Scanned: 2026-11-10
Checks run: `npm run build` → exit 0, all chunks compiled cleanly.

## Map

- **Stack**: Three.js v0.182+, Vite v5.4, Vanilla JavaScript (ES modules), Web Speech API, Web Audio API, HTML5 Canvas, modern CSS.
- **Entry points**: `index.html` loading `src/main.js`.
- **Architecture**:
  - `src/main.js` runs the game loop and coordinates controllers.
  - `src/scene.js` initializes Three.js camera, scene, renderer, and room lighting.
  - `src/character.js` controls the low-poly avatar with smooth movement and third-person camera follower.
  - `src/input.js` captures keyboard inputs (WASD, Arrow keys, E) and manages control pause states.
  - `src/npc.js` controls 3D NPC Teacher Alex with procedural waving animation and name tag.
  - `src/interactables.js` manages low-poly props (Book, Apple, Laptop, Table, Chair) with raycast highlighting and distance detection.
  - `src/vocabModal.js` provides 2D bilingual vocabulary card overlay with TTS audio pronunciation.
  - `src/dialogue.js` provides DialogueManager, VoiceChallengeModal, QuestTrackerHUD, and QuestCelebrationBanner.
  - `src/quest.js` implements QuestEngine with quest state transitions, objective checking, and anti-spam rewards.
  - `src/voice.js` provides VoiceService with speech recognition, timeout protection, fallback verification, and audio fanfare synthesis.
  - `src/style.css` provides modern cyber/clean gamified UI styles.
- **Conventions**: Native ES modules, class-based controllers, event callbacks (`onOpen`, `onClose`), idempotent state updates.
- **Maturity**: Milestones 1, 2, 3 complete and tested; ready for Milestone 4 (Gamification, Inventory & LocalStorage progression).
- **Recent activity**: Commits for M003: NPC Alex, DialogueManager, QuestEngine, VoiceService, celebration feedback.

## Finding: LocalStorage progression and Inventory are ready to be integrated

- **Claim**: Game state currently tracks in-memory EXP, badges, and quest status; adding `StorageService` to persist to `localStorage` will cleanly complete progression retention across browser refreshes.
- **Source**: src/quest.js:55
- **Confidence**: high
- **Why it matters here**: Milestone 4 success criteria require inventory tracking and state persistence on page reload (F5).

## Apparent intent

- A gamified 3D English learning environment with vocabulary collection, quest progression, levels, inventory, and local storage persistence.

## Open questions for define

- none

## Blocked areas

- none
