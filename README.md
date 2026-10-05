# Pal Coffee

Persian-first Next.js 16 **coffee store + events**. Unified Django backend: `../Pal-Back/` (store, shared OTP/JWT account, orders/payments, events and staff review).

- [Current integration docs](docs/README.md): API, flows, setup and test evidence.
- [CI/CD and recovery](docs/deployment.md): GitHub Actions, standalone releases, PM2 and deployment gates.
- [Existing visual rules](DESIGN.md): retained until user approves redesign.
- [Historical event launch plan](docs/friday-event-launch-plan.md): old standalone API assumptions no longer apply.

```sh
# Backend: isolated demo stack; see docs/setup.md for env first.
cd ../Pal-Back
docker compose -p pal-local up -d --build
docker compose -p pal-local exec web python manage.py seed
cd ../palCoffee
bun run dev -- --port 3005
bun run typecheck
bun test lib/*.test.ts
bun run build
```

Local backend/API/admin: `http://127.0.0.1:8081`; frontend: `http://localhost:3005`. `.env.local`: empty `NEXT_PUBLIC_API_BASE_URL` + server-only `PAL_BACKEND_URL=http://127.0.0.1:8081`. Next proxy preserves Django trailing slashes and POST bodies. Production requires explicit backend proxy configuration and rebuild.

`/catalog` → `/cart` → address/checkout → `/orders/{number}` → card-to-card receipt/manual review. `/submit` lists backend events; paid registration needs card + receipt, free registration auto-confirms. `/login` shared OTP. `/submit/status/{uuid}` requires owner/staff login; identifier alone grants no access. `/dashboard` staff-only registration review, same account/token system. Real Saman/Bale payment activation remains separate release gate.

Local SMS prints console codes; mock gateway and dummy demo card are **not real payment**. Never transfer money to demo card. No production deployment/payment or visual redesign performed. Existing unrelated worktree changes retained.
