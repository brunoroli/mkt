# B3G · aba de Instagram

Nova página `instagramb3g/` para o site da B3G (mesma pasta pai de `dashboardb3g/` e `calendariob3g/`).

## Arquivos
- `instagramb3g/index.html`: página (métricas, posts do período, calendário mensal de posts publicados).
- `instagramb3g/api.php`: endpoint que consulta a Instagram Graph API (Meta). O token nunca vai para o navegador.
- `instagramb3g/config.sample.php`: copie para `config.php` no servidor e preencha (não vai para o Git).
- Copie `B3G-03.png` (logo) para a mesma pasta, como no dashboard atual.

## Configuração
1. Em `config.php`, informe o token de longa duração (permissões `instagram_basic` e `instagram_manage_insights`) e o `ig_user_id` de `@b3g_empreendimentos` e `@residencialcanada`.
2. Suba a pasta para `public_html/instagramb3g/` na Hostinger.
3. Acesse `/instagramb3g/`. Para ver o layout com números fictícios: `/instagramb3g/?demo=1`.

## Navegação entre abas
Adicione este bloco no topo das páginas `dashboardb3g` e `calendariob3g`:

```html
<nav>
  <a href="/dashboardb3g/">Mídia paga</a>
  <a href="/instagramb3g/">Instagram</a>
  <a href="/calendariob3g/">Calendário de postagens</a>
</nav>
```
