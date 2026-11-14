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

---

# B3G · aba Analytics (Google Analytics 4)

Mesmo padrão das outras abas: página estática + `api.php` no próprio servidor (sem n8n). O `abas.js` carrega `../analyticsb3g/` num iframe.

## Arquivos
- `analyticsb3g/index.html`: visitas, origem do tráfego, páginas mais vistas, cliques no WhatsApp e leads.
- `analyticsb3g/api.php`: consulta a GA4 Data API (`runReport`) com uma conta de serviço do Google.
- `analyticsb3g/config.sample.php`: copie para `config.php` no servidor.
- `analyticsb3g/.htaccess`: bloqueia `.json` e `.env` nesta pasta, por segurança.
- `dashboardb3g/abas.js`: a versão atual do servidor com **uma linha a mais** (aba Analytics). Depois de subir, troque `abas.js?v=2` por `abas.js?v=3` no `index.html` do dashboard para limpar o cache.

## Configuração (uma vez)
1. No Google Cloud: crie (ou use) um projeto, ative **Google Analytics Data API** e crie uma **conta de serviço**; gere a chave **JSON**.
2. No GA4 (Administrador > Acesso à propriedade), adicione o e-mail da conta de serviço como **Leitor** na propriedade B3G Empreendimentos.
3. Guarde o JSON **fora do `public_html`** (por exemplo `/home/USUARIO/segredos/b3g-ga4.json`) e aponte `service_account_file` no `config.php`.
4. Suba `analyticsb3g/` para `public_html/analyticsb3g/`, copie o `B3G-03.png`, e suba o `abas.js` novo.
5. Para ver o layout com números fictícios: `/dashboardb3g/?demo=1`, aba Analytics.

## Eventos
`click_whatsapp` e `generate_lead` são lidos pelo nome do evento, então aparecem na aba mesmo antes de marcá-los como eventos-chave no GA4.
