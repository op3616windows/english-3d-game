# Archive — 003-npc-quests-and-voice

Milestone: npc-quests-and-voice
Shipped: 2026-11-10
Final verdict: all criteria met; project verify passed
Waves: 2  Tasks: 2 done / 2 total  Review cycles used: 1/1
Carried forward: none

## Success criteria at ship

| Criterion | Verdict | Evidence |
|-----------|---------|----------|
| Người chơi lại gần NPC và bấm phím tương tác để mở hộp thoại giao tiếp bằng tiếng Anh. | met | src/npc.js:10, src/dialogue.js:4, src/main.js:45 |
| NPC giao nhiệm vụ tìm kiếm đồ vật và yêu cầu phát âm từ vựng để hoàn thành. | met | src/quest.js:11, src/main.js:52 |
| Người chơi có thể nói vào micro để hệ thống nhận diện từ phát âm đúng, hoặc chuyển sang chế độ gõ chữ/trắc nghiệm nếu không có micro. | met | src/voice.js:5, src/dialogue.js:136, src/main.js:37 |
| Trả quest cho NPC hiển thị thông báo hoàn thành nhiệm vụ kèm hiệu ứng và âm thanh chúc mừng. | met | src/quest.js:125, src/dialogue.js:377, src/voice.js:148, src/main.js:55 |

## Contents

- build/evidence.json
- build/verify-ledger.jsonl
- intent/INTENT.md
- plan/PLAN.md
- research/DOCS-AUDIT.md
- research/SYNTHESIS.md
- research/evidence-codebase.md
- review/FINAL.md
- review/final-gap-1.md
- review/wave-1.cycle1.md
- review/wave-2.cycle1.md
- tasks/T001-npc-and-dialogue.md
- tasks/T002-quest-engine-and-voice-recognition.md

## Notes

- none
