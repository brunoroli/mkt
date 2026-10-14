#!/bin/sh
# Envia os PNGs de um carrossel para o n8n, que cria uma pasta em "05 - Carrossel" no Drive.
# Uso: scripts/enviar-drive.sh <pasta-com-os-png> "<nome da pasta no Drive>"
# A autenticação (cabeçalho X-N8N-API-KEY) é adicionada pelo segredo de rede do ambiente.
set -eu
dir=$1; nome=$2
url=${B3G_DRIVE_WEBHOOK:-https://n8n-k16t.srv1847340.hstgr.cloud/webhook/b3g-carrossel-drive}
set -- -F "nome=$nome"
i=0
for f in "$dir"/*.png; do
  [ -e "$f" ] || continue
  i=$((i + 1))
  set -- "$@" -F "arquivo$i=@$f"
done
[ "$i" -gt 0 ] || { echo "Nenhum PNG em $dir" >&2; exit 1; }
curl -sS --fail-with-body --max-time 300 "$@" "$url"
echo
