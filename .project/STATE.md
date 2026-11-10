---
pipeline: gsd-path/v2
project: english-3d-game
milestone: 3d-core-and-movement
phase: plan
                    # inspect only for brownfield; greenfield starts at define
                    # roadmap only in program flow (CHARTER.md exists)
status: done
branch: gsd-path/M001        # bound per milestone as gsd-path/M00N; after integration
                    # the router rebinds before any next-milestone file change
                    # the bound branch is never main; ship integrates it there
archive: null       # persisted archive transaction path; never recomputed
integration_default: direct # direct | pull-request | external-landing; project setting
integration: direct # current milestone; may override the default before build
integration_source: default # default | milestone; preserves override provenance
default_branch: main # origin default branch; initialization records it once, nothing changes it
---

# Project State

One file, always current. The router reads this first; every phase updates
it on completion. If this file and the artifacts disagree, the artifacts win
— fix this file.

## Log

<!-- append one line per transition: date, phase, event -->
- repository initialized — binding: .project/REPOSITORY.md
- 2026-11-10 — define — program charter approved
- 2026-11-10 — research — research started
- 2026-11-10 — research — manifest .project/research/RESEARCH.md dispatched pitfalls,stack skipped domain,similar questions 2
- 2026-11-10 — decide — decision synthesis started
- 2026-11-10 — decide — synthesis .project/SYNTHESIS.md
- 2026-11-10 — roadmap — roadmap started
- 2026-11-10 — roadmap — program roadmap approved
- 2026-11-10 — define — definition started
- 2026-11-10 — define — milestone intent approved
- 2026-11-10 — plan — planning started
- 2026-11-10 — plan — plan approved
