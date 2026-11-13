#!/bin/sh
# Envia um post do repositório para o WordPress como RASCUNHO, via n8n.
# Uso: scripts/enviar-rascunho.sh posts/arquivo.md [imagem-destacada.jpg]
# A autenticação (cabeçalho X-N8N-API-KEY) é adicionada pelo segredo de rede do ambiente.
set -eu
post=$1; imagem=${2:-}
dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
url=${B3G_BLOG_WEBHOOK:-https://n8n-k16t.srv1847340.hstgr.cloud/webhook/b3g-blog-rascunho}
json=$(python3 -I "$dir/md_para_wp.py" "$post")
if [ -n "$imagem" ]; then
  curl -sS --fail-with-body --max-time 300 --form-string "post=$json" -F "imagem=@$imagem" "$url"
else
  curl -sS --fail-with-body --max-time 300 --form-string "post=$json" "$url"
fi
echo
