# PAL frontend deployment — mainVira

Public site: **https://palcoffee.ir** through Arvan HTTPS → verified Caddy HTTPS →
Nginx → Docker containers. Staff panel: `/manage`. Django `/admin` remains closed.
Backend: `../Pal-Back`, shared MySQL8.4, private Redis/Celery. No old-data import.

## Release commands

From sibling infrastructure repository:

```sh
cd ../secondViraVps
./runScript ../palCoffee --dry-run
./runScript ../palCoffee
# Separate backend release; see ../Pal-Back/DEPLOYMENT.md:
./runScript ../Pal-Back
```

`.deploy.json` selects registered project `pal-front`, registry repository
`registry.hamdocker.ir/virarayanesh/pal-front`, public deploy console
`https://up.virarayanesh.ir`. CLI auth uses private
`~/.config/vira/deploy.netrc`0600 outside build context; registry auth uses Docker's
credential store. Never paste credentials or commit env files.

`runScript` checks registration/auth first, runs configured tests, builds current
working tree, pushes unique image tag, triggers executor and polls health.
It **does not commit/push Git**, apply migrations, change runtime secrets or seed
content. Uncommitted allowed files are included; Git SHA in tag is not proof of
exact source. Prefer reviewed commits for subsequent releases.

Old GitHub deploy workflow was disabled remotely and its local YAML removed.
Git pushes no longer use that workflow. Historical PM2/SSH scripts in `ops/` and
`scripts/deploy-front.sh` are not mainVira deployment commands; do not run them.

## Image/runtime contract

Dockerfile: Bun1.4.2 frozen `bun.lock`, Node22, unit/lint/type/build gates, standalone
server with `public` + `.next/static`. Git LFS videos must be hydrated. Allowlisted
context excludes env, agent setup, design inputs and generated builds. Runtime
removes any traced env files and rejects LFS pointers.

Browser API base empty; build-time rewrite destination **http://pal-back:8000**.
Changing runtime env cannot alter baked rewrites: rebuild instead. Never use host
loopback8091 inside a container.

Installed `/opt/pal/front/{compose.yaml,.env}`, network alias `pal-front:3000` on
`projects-web` only, no host ports/DB network. UID1000, read-only root, bounded
writable image-cache tmpfs, resource/PID/log limits. Server-owned Compose/ingress
runbooks: `../secondViraVps/projects/pal/`.

Executor pins current/previous registry digests, updates only APP_IMAGE and waits
for health; activation failure attempts verified code rollback. Schema/media/env
are not reverted. Old images retained; no automatic pruning or zero-downtime claim.
Deployment controller is existing host `vira-deploy.service`; applications remain
Docker services. Normal app releases do not restart controller/shared proxies.

## Live checkpoint — 18 October 2026

Frontend release `bbd70f33bce9-20261018T195534Z-c5849e`, image
`registry.hamdocker.ir/virarayanesh/pal-front@sha256:0d72c929ff4c7d72c026ce18dd846ed0683f01e8d277044bee37c743536ea595`,
succeeded via runScript; previous digest retained. 22 unit tests, typecheck/build
passed; lint0errors/7 existing browser-script warnings. Backend47 MySQL tests pass;
event-location migration0002 applied before frontend activation, row counts unchanged.

Public catalog has8 real PAL coffees, show-only (sales disabled). Admin shares
landing theme; venue coordinates and safe customer deletion are deployed. Isolated
mocked CRUD/map browser checks are in `docs/scripts/browser-admin-crud.cjs`.
Actual owner API/browser password login, JWT refresh, products and logout verified;
initial overview401 before sign-in is expected. A reported credential-POST401 was
not reproduced; never reset accounts without evidence.

Ingress verifies TLS, HTTPS redirects/HSTS, no-store API/login/manage, anonymous
staff API401, private media404 and authenticated receipt access. Only staff
login/refresh/staff-management writes pass proxy gate. OTP503 and public
customer/financial writes403 remain deliberate launch gates.

Melipayamak configured privately; one authorized test rejected with **-111**,
no automatic retry. Provider diagnosis and confirmed delivery required before
opening OTP/customer registration. No payment or beat activation. No demo seed,
real financial test writes, DB import or backup workflow added.

Origin certificate expires **2027-01-16**, manual DNS-01 renewal required around
mid-December; private keys stay server-only. Third-party Enamad/domain behavior
and real operational content/payment acceptance remain separate checks.
