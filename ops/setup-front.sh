#!/usr/bin/env bash
# Run as root after CI activates the frontend; --tls runs interactive Certbot.
set -euo pipefail
[[ $EUID == 0 ]] || { echo 'Run with sudo' >&2; exit 1; }
[[ $# == 0 || ( $# == 1 && $1 == --tls ) ]] || { echo 'Usage: setup-front.sh [--tls]' >&2; exit 1; }
source_dir=$(cd "$(dirname "$0")" && pwd)
site=/etc/nginx/sites-available/palcoffee.conf
link=/etc/nginx/sites-enabled/palcoffee.conf
for command in nginx systemctl pm2 curl; do command -v "$command" >/dev/null; done
if [[ ${1:-} == --tls ]]; then command -v certbot >/dev/null; fi
curl --fail --silent --show-error --max-time 10 http://127.0.0.1:3005/ >/dev/null
# Confirm existing configuration is healthy before touching it.
nginx -t
created_site=false
created_link=false
if [[ -e "$site" || -L "$site" ]]; then
  [[ -f "$site" && ! -L "$site" ]] || { echo "Refusing unexpected site path: $site" >&2; exit 1; }
  grep -q '^# PAL frontend only\.' "$site" || { echo "Review existing $site manually; not overwriting" >&2; exit 1; }
  echo 'Preserving existing PAL config, including TLS changes.'
else
  # Refuse duplicate domain ownership in another enabled site.
  if grep -REq 'server_name[^;]*\bpalcoffee\.ir\b' /etc/nginx/sites-enabled/; then
    echo 'PAL domain already configured in another enabled site; review manually' >&2
    exit 1
  fi
  install -m 0644 "$source_dir/palcoffee.nginx.conf" "$site"
  created_site=true
fi
if [[ -e "$link" || -L "$link" ]]; then
  [[ -L "$link" && $(readlink -f "$link") == "$site" ]] || { echo "Review existing $link manually" >&2; exit 1; }
else
  ln -s "$site" "$link"
  created_link=true
fi
if ! nginx -t; then
  [[ "$created_link" == false ]] || rm -f "$link"
  [[ "$created_site" == false ]] || rm -f "$site"
  echo 'Nginx validation failed; new files removed, live service unchanged' >&2
  exit 1
fi
systemctl reload nginx
home=$(getent passwd deploy | cut -d: -f6)
[[ -n "$home" && -d "$home" ]]
env PATH="$PATH" pm2 startup systemd -u deploy --hp "$home"
# CI saves PM2 state as deploy. Root must not overwrite deploy's saved list.
systemctl is-enabled pm2-deploy
if [[ ${1:-} == --tls ]]; then
  certbot --nginx -d palcoffee.ir
  nginx -t
  systemctl reload nginx
fi
echo 'PAL Nginx and PM2 boot setup finished.'
echo 'Verify DNS/CDN origin, HTTPS, and frontend pages. Backend flows remain pending.'
