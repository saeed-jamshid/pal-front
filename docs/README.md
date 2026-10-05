# PAL store + events integration

Current scope: verify new Django backend, integrate real API and customer flows using existing UI. **Visual redesign requires user confirmation after testing.** No Git restore, commit, deployment, live payment or production migration authorized/applied.

- [API contract](api.md): source-backed routes, payloads, units and known gaps.
- [Customer flows](flows.md): coffee purchase, event registration, review and recovery.
- [Local setup](setup.md): isolated backend and frontend, safe demo mode.
- [Verification](testing.md): commands, evidence, limitations, approval gate.

Backend baseline: `../Pal-Back` commit `e100c43`. Frontend HEAD: `ba17811`; worktree contained substantial prior staged/unstaged/untracked work, preserved rather than reset. Structural graph tools unavailable in this session; contract audit used actual models, serializers, views, services and URL modules. OpenAPI YAML/build spec are not treated as current runtime truth.

Historical `catalog-plan.md` and `friday-event-launch-plan.md` describe previous guesses/old standalone event backend. Current contracts here supersede their integration assumptions, not their historical records.
