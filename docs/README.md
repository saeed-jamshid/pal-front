# PAL store + events integration

Store and event integration is committed as `9f7433b`. The frontend admin panel and staff-only backend APIs were approved on 2026-10-05. Public-site visual redesign still needs separate approval. Admin changes have not been committed or deployed; no live payments or production migrations were performed.

- [API contract](api.md): source-backed routes, payloads, units and known gaps.
- [Customer flows](flows.md): coffee purchase, event registration, review and recovery.
- [Local setup](setup.md): isolated backend and frontend, safe demo mode.
- [Verification](testing.md): commands, evidence, limitations, approval gate.
- [Admin panel](admin.md): staff access, supported controls, text guidelines and admin tests.

Backend baseline: `../Pal-Back` commit `e100c43`, with local admin API changes. Frontend baseline: `9f7433b`, with local admin and text changes. Previously staged agent skills and local configs are preserved. Structural graph tools unavailable in this session; contract audit used actual models, serializers, views, services and URL modules. OpenAPI YAML/build spec are not treated as current runtime truth.

Historical `catalog-plan.md` and `friday-event-launch-plan.md` describe previous guesses/old standalone event backend. Current contracts here supersede their integration assumptions, not their historical records.
