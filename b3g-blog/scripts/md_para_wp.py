"""Converte um post do blog (Markdown com front matter) no JSON que o n8n envia ao WordPress.

Uso: python3 scripts/md_para_wp.py posts/arquivo.md > post.json
"""
import html
import json
import re
import sys

CATEGORIAS = {"território": 31, "territorio": 31, "critério": 30, "criterio": 30, "bastidores": 32}


def inline(texto):
    t = html.escape(texto, quote=False)
    t = re.sub(r"\[([^\]]+)\]\((https?://[^)]+)\)", r'<a href="\2">\1</a>', t)
    t = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", t)
    t = re.sub(r"\*(.+?)\*", r"<em>\1</em>", t)
    return t


def paragrafo(texto):
    return f"<!-- wp:paragraph -->\n<p>{inline(texto)}</p>\n<!-- /wp:paragraph -->"


def converter(caminho):
    bruto = open(caminho, encoding="utf-8").read()
    meta, corpo = {}, bruto
    m = re.match(r"^---\n(.*?)\n---\n(.*)$", bruto, re.S)
    if m:
        for linha in m.group(1).splitlines():
            if ":" in linha:
                k, v = linha.split(":", 1)
                meta[k.strip()] = v.strip().strip('"')
        corpo = m.group(2)

    blocos, citacao = [], []

    def fechar_citacao():
        if not citacao:
            return
        linhas = [c for c in citacao if c]
        autor = linhas.pop() if len(linhas) > 1 else "B3G Empreendimentos"
        texto = " ".join(linhas)
        blocos.append(
            '<!-- wp:quote -->\n<blockquote class="wp-block-quote">' + paragrafo(texto)
            + f"<cite>{inline(autor)}</cite></blockquote>\n<!-- /wp:quote -->"
        )
        citacao.clear()

    for bloco in re.split(r"\n\s*\n", corpo.strip()):
        linhas = [l for l in bloco.strip().splitlines() if l.strip() != "---"]
        if not linhas:
            continue
        if all(l.startswith(">") for l in linhas):
            citacao.extend(l.lstrip(">").strip() for l in linhas)
            continue
        fechar_citacao()
        primeira = linhas[0]
        if primeira.startswith("# "):
            meta.setdefault("titulo", primeira[2:].strip())
            continue
        if primeira.startswith("## "):
            titulo = inline(primeira[3:].strip())
            blocos.append(f'<!-- wp:heading -->\n<h2 class="wp-block-heading">{titulo}</h2>\n<!-- /wp:heading -->')
            continue
        blocos.append(paragrafo(" ".join(l.strip() for l in linhas)))
    fechar_citacao()

    categoria = CATEGORIAS.get(meta.get("categoria", "").lower(), 31)
    return {
        "title": meta.get("titulo", ""),
        "slug": meta.get("slug", ""),
        "excerpt": meta.get("resumo", ""),
        "content": "\n\n".join(blocos),
        "categories": [categoria],
    }


if __name__ == "__main__":
    json.dump(converter(sys.argv[1]), sys.stdout, ensure_ascii=False)
