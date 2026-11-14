/* Abas do dashboard B3G: Mídia paga | Instagram | Analytics | Calendário. Carregado por uma linha no fim do index.html. */
(function () {
  var main = document.querySelector("main");
  if (!main || !main.parentNode) return;

  var css = document.createElement("style");
  css.textContent =
    ".b3g-tabs{display:flex;flex-wrap:wrap;gap:8px;max-width:1120px;margin:0 auto;padding:20px 24px 0}" +
    ".b3g-tabs button{font:inherit;font-size:14px;padding:9px 18px;border-radius:999px;border:1px solid #E7E9EE;background:#fff;color:#131E2D;cursor:pointer}" +
    ".b3g-tabs button[aria-selected=true]{background:#131E2D;border-color:#131E2D;color:#fff}" +
    ".b3g-panel{margin:0 auto}" +
    ".b3g-panel iframe{display:block;width:100%;border:0;height:320px}";
  document.head.appendChild(css);

  var demo = /[?&]demo=1/.test(location.search) ? "?demo=1" : "";
  var ABAS = [
    { id: "midia",      rotulo: "Mídia paga" },
    { id: "instagram",  rotulo: "Instagram",  src: "../instagramb3g/" + demo, embed: true },
    { id: "analytics",  rotulo: "Analytics",  src: "../analyticsb3g/" + demo, embed: true },
    { id: "calendario", rotulo: "Calendário", src: "calendario.html" }
  ];

  var bar = document.createElement("nav");
  bar.className = "b3g-tabs";
  bar.setAttribute("role", "tablist");
  main.parentNode.insertBefore(bar, main);

  var anchor = main;
  ABAS.forEach(function (a) {
    a.botao = document.createElement("button");
    a.botao.textContent = a.rotulo;
    a.botao.setAttribute("role", "tab");
    a.botao.addEventListener("click", function () { mostrar(a.id); });
    bar.appendChild(a.botao);

    if (a.id === "midia") { a.painel = main; return; }
    a.painel = document.createElement("section");
    a.painel.className = "b3g-panel";
    a.painel.hidden = true;
    a.frame = document.createElement("iframe");
    a.frame.title = a.rotulo;
    a.painel.appendChild(a.frame);
    anchor.parentNode.insertBefore(a.painel, anchor.nextSibling);
    anchor = a.painel;
  });

  /* Ajusta a altura do quadro ao conteúdo real, sem sobra. Mesma origem, então dá para ler o documento. */
  function ajustar(a) {
    try {
      var d = a.frame.contentDocument;
      if (!d || !d.body) return;
      var h = Math.ceil(d.body.getBoundingClientRect().height);
      if (h > 0) a.frame.style.height = h + "px";
    } catch (e) {}
  }
  function aoCarregar(a) {
    try {
      var d = a.frame.contentDocument;
      if (a.embed) {
        var s = d.createElement("style");
        s.textContent = ".hero,.cal-card{display:none!important}body{background:transparent!important}";
        d.head.appendChild(s);
      }
      if (window.ResizeObserver) new ResizeObserver(function () { ajustar(a); }).observe(d.body);
    } catch (e) {}
    ajustar(a);
  }

  function mostrar(id) {
    ABAS.forEach(function (a) {
      var ativa = a.id === id;
      a.painel.hidden = !ativa;
      a.botao.setAttribute("aria-selected", String(ativa));
      if (ativa && a.frame && !a.frame.getAttribute("src")) {
        a.frame.addEventListener("load", function () { aoCarregar(a); });
        a.frame.setAttribute("src", a.src);
      } else if (ativa && a.frame) {
        ajustar(a);
      }
    });
    try { history.replaceState(null, "", id === "midia" ? location.pathname + location.search : "#" + id); } catch (e) {}
  }

  window.addEventListener("resize", function () { ABAS.forEach(function (a) { if (a.frame && !a.painel.hidden) ajustar(a); }); });

  var inicial = location.hash.replace("#", "");
  mostrar(ABAS.some(function (a) { return a.id === inicial; }) ? inicial : "midia");
})();
