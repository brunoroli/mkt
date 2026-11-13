#!/bin/sh
# Envia um carrossel (2 a 10 JPGs, em ordem pelo nome) ao n8n para o Instagram da B3G.
# Uso: scripts/publicar-instagram.sh <pasta-com-jpgs> <arquivo-legenda.txt> [sim]
# Sem o terceiro argumento "sim", só PREPARA o carrossel e NÃO publica.
# A autenticação (cabeçalho X-N8N-API-KEY) é adicionada pelo segredo de rede do ambiente.
set -eu
dir=$1; legenda=$2; publicar=${3:-nao}
url=${B3G_IG_WEBHOOK:-https://n8n-k16t.srv1847340.hstgr.cloud/webhook/b3g-instagram-carrossel}
set -- --form-string "publicar=$publicar" -F "legenda=<$legenda"
for f in "$dir"/*.jpg; do
  [ -e "$f" ] || continue
  set -- "$@" -F "imagem$(basename "$f" .jpg)=@$f;type=image/jpeg"
done
curl -sS --fail-with-body --max-time 300 "$@" "$url"
echo
