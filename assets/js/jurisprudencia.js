// ============================================================================
// Busca de jurisprudência — OAB-ES × JUES. JavaScript de navegador, sem build.
//
// Três comportamentos aqui vêm de como o motor de busca funciona de fato, e
// não de escolha de interface:
//
//   avisos    filtrar pode AFROUXAR a pergunta e fazer a lista CRESCER (medido:
//             8 → 16 acórdãos ao escolher um magistrado). Sem exibir isso, o
//             advogado lê resultados que casam metade da pergunta achando que
//             casam ela inteira.
//   radicais  o grifo usa os lexemas que o servidor disse ter usado. Adivinhar
//             o alcance do stemmer no navegador já falhou duas vezes no app.
//   sem total a API não devolve contagem. O fim da lista é `tem_mais: false`,
//             nunca um zero que se confunde com "nada encontrado".
// ============================================================================
import { buscar, acordao, vocabulario, RECURSOS, PAGINA_MAX, POR_PAGINA, DEMO, ErroApi }
  from "./api.js";

const $ = (id) => document.getElementById(id);
const form = $("form"), msgs = $("mensagens"), lista = $("resultados"), paginacao = $("paginacao");
let pagina = 1, camara = "", carregando = false;

if (DEMO) $("aviso-demo").hidden = false;

for (const [valor, rotulo] of RECURSOS) $("recurso").add(new Option(rotulo, valor));

// ── seletor de câmara ─────────────────────────────────────────────────────
$("seg-camara").addEventListener("click", (e) => {
  const b = e.target.closest("button[data-camara]");
  if (!b) return;
  camara = b.dataset.camara;
  for (const outro of $("seg-camara").querySelectorAll("button")) {
    outro.setAttribute("aria-pressed", String(outro === b));
  }
});

// ── utilidades ────────────────────────────────────────────────────────────
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function grifar(txt, radicais) {
  const seguro = esc(txt);
  const alt = (radicais ?? [])
    .filter((r) => typeof r === "string" && r.length >= 3)
    .map((r) => r.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .sort((a, b) => b.length - a.length);
  if (!alt.length) return seguro;
  return seguro.replace(new RegExp(`(${alt.join("|")})\\p{L}*`, "giu"), "<mark>$&</mark>");
}

const FMT = new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" });
function dataBr(iso) {
  if (!iso) return "—";
  const d = new Date(`${iso}T00:00:00Z`);
  return Number.isNaN(+d) ? iso : FMT.format(d);
}

/** As classes do distintivo seguem o desfecho, como no protótipo. */
function classeDistintivo(r) {
  const v = (r ?? "").toLowerCase();
  if (v.includes("parcial")) return "parcial";
  if (v.startsWith("não") || v.startsWith("nao") || v === "improcedente") return "negada";
  if (["concedida", "provido", "procedente"].some((x) => v.startsWith(x))) return "concedida";
  return "outro";
}

function nota(html, classe = "aviso-motor") {
  const d = document.createElement("div");
  d.className = `${classe} mb-2`;
  d.innerHTML = html;
  msgs.appendChild(d);
}

function explicarAviso(a) {
  switch (a?.tipo) {
    case "conceitos_relaxados":
      return `<i class="fas fa-exclamation-triangle me-1"></i>
        A busca foi <strong>afrouxada</strong>: muitos destes resultados casam apenas
        ${a.casaram} de ${a.de} partes da sua pergunta. Costuma acontecer quando um
        filtro remove os acórdãos que casavam a pergunta inteira —
        <strong>a lista pode ficar maior, não menor</strong>.`;
    case "processo_em_outro_recurso":
      return `<i class="fas fa-info-circle me-1"></i>
        O processo <strong>${esc(a.numero ?? "")}</strong> existe no acervo, mas como
        <strong>${esc(a.recurso ?? "outro recurso")}</strong>. Troque o tipo de recurso.`;
    case "termo_ausente":
      return `<i class="fas fa-info-circle me-1"></i>
        A palavra <strong>${esc(a.termo ?? "")}</strong> não aparece em nenhum acórdão do
        acervo${a.sugestao?.length ? ` — você quis dizer <strong>${esc(a.sugestao[0])}</strong>?` : "."}`;
    case "query_truncada":
      return `Sua pergunta foi cortada em ${a.limite} caracteres.`;
    default: return null;
  }
}

// ── cartão ────────────────────────────────────────────────────────────────
function cartao(item, radicais, rotuloRecurso) {
  const el = document.createElement("article");
  el.className = "cartao p-3 p-sm-4 mb-3";
  el.innerHTML = `
    <div class="d-flex flex-column flex-lg-row justify-content-between gap-3">
      <div class="flex-grow-1 min-w-0">

        <div class="d-flex flex-wrap align-items-center gap-2 mb-2">
          <button type="button" class="numero-processo" data-acao="copiar"
                  title="Copiar número do processo">
            ${esc(item.numero ?? "sem número")} <i class="far fa-copy ms-1 opacity-75"></i>
          </button>
          <span style="color:var(--oab-texto-3)">•</span>
          <span class="distintivo ${classeDistintivo(item.resultado)}">${esc(item.resultado ?? "—")}</span>
          <span style="color:var(--oab-texto-3)">•</span>
          <span style="font-size:.8rem;color:var(--oab-texto-2)">${dataBr(item.data)}</span>
        </div>

        <div class="mb-1"><span class="rotulo-campo">Tipo de recurso:</span>
          <span class="valor-recurso ms-1">${esc(rotuloRecurso)}</span></div>

        <div class="mb-2"><span class="rotulo-campo">Assunto:</span>
          <span class="valor-assunto ms-1">${esc(item.assunto ?? "—")}</span></div>

        <div class="bloco-ementa mb-2">
          <span class="titulo">Trecho da ementa</span>
          <p class="cortada">${grifar(item.ementa ?? "", radicais)}</p>
        </div>

        <div style="font-size:.85rem">
          <span class="rotulo-campo">Desembargador(a):</span>
          <span class="fw-bold ms-1">Des. ${esc(item.magistrado ?? "—")}</span>
          <span class="mx-1" style="color:var(--oab-texto-3)">•</span>
          <span style="color:var(--oab-texto-2)">${esc(item.camara ?? "—")}</span>
        </div>

      </div>

      <div class="d-flex flex-row flex-wrap flex-lg-nowrap align-items-start gap-2">
        <a class="btn btn-sm btn-contorno text-nowrap" data-acao="jues" target="_blank" rel="noopener noreferrer">
          <i class="fas fa-external-link-alt me-1" style="color:var(--oab-vermelho)"></i> Abrir no JUES
        </a>
        <button type="button" class="btn btn-sm btn-oab text-nowrap" data-acao="teor">
          <i class="fas fa-book-open me-1"></i> Inteiro teor
        </button>
      </div>
    </div>`;

  const numeros = (item.numero ?? "").replace(/\D/g, "");
  el.querySelector('[data-acao="jues"]').href =
    `https://sistemas.tjes.jus.br/consultaprocessual/consulta/${numeros}`;

  el.querySelector('[data-acao="copiar"]').addEventListener("click", async (e) => {
    try {
      await navigator.clipboard.writeText(item.numero ?? "");
      const i = e.currentTarget.querySelector("i");
      i.className = "fas fa-check ms-1 text-success";
      setTimeout(() => { i.className = "far fa-copy ms-1 opacity-75"; }, 1500);
    } catch { /* sem permissão de área de transferência */ }
  });

  const bTeor = el.querySelector('[data-acao="teor"]');
  bTeor.addEventListener("click", async () => {
    const aberto = el.querySelector(".teor");
    if (aberto) {
      aberto.remove();
      bTeor.innerHTML = '<i class="fas fa-book-open me-1"></i> Inteiro teor';
      return;
    }
    bTeor.disabled = true;
    bTeor.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span> Carregando';
    try {
      // Um acórdão por requisição — é assim que a API entrega o inteiro teor.
      const d = await acordao(item.id);
      const div = document.createElement("div");
      div.className = "teor mt-3";
      div.innerHTML = grifar(d.inteiro_teor ?? "(sem inteiro teor)", radicais);
      el.appendChild(div);
      bTeor.innerHTML = '<i class="fas fa-compress-alt me-1"></i> Recolher';
    } catch (e) {
      const div = document.createElement("div");
      div.className = "aviso-motor mt-3";
      div.textContent = e instanceof ErroApi && e.status === 404
        ? "Este acórdão não está disponível para consulta."
        : "Não foi possível carregar o inteiro teor.";
      el.appendChild(div);
      bTeor.innerHTML = '<i class="fas fa-book-open me-1"></i> Inteiro teor';
    } finally {
      bTeor.disabled = false;
    }
  });

  return el;
}

// ── busca ─────────────────────────────────────────────────────────────────
function montarPedido(n) {
  const p = { recurso: $("recurso").value, pagina: n };
  const q = $("q").value.trim();
  if (q) p.q = q;
  if (camara) p.camara = camara;
  for (const c of ["assunto", "comarca"]) if ($(c).value) p[c] = $(c).value;
  return p;
}

async function executar(n) {
  if (carregando) return;
  carregando = true;
  $("enviar").disabled = true;
  msgs.innerHTML = "";
  lista.dataset.estado = "carregando";
  lista.innerHTML = `<div class="text-center py-5" data-papel="carregando">
    <span class="spinner-border spinner-border-sm me-2"></span>Pesquisando…</div>`;
  paginacao.hidden = true;

  const rotuloRecurso = $("recurso").selectedOptions[0]?.text ?? "";
  try {
    const r = await buscar(montarPedido(n));
    pagina = r.pagina ?? n;
    lista.innerHTML = "";

    for (const a of r.avisos ?? []) {
      const t = explicarAviso(a);
      if (t) nota(t);
    }

    if (!r.itens?.length) {
      lista.dataset.estado = "vazio";
      lista.innerHTML = `<div class="painel p-5 text-center" data-papel="vazio">
        <i class="fas fa-search fa-2x mb-2" style="color:var(--oab-texto-3)"></i>
        <p class="fw-bold mb-3">Nenhuma decisão encontrada com os filtros selecionados</p>
        <button type="button" class="btn btn-sm btn-oab" onclick="document.getElementById('limpar').click()">
          Limpar filtros</button></div>`;
      $("rotulo-pagina").textContent = "";
      return;
    }

    lista.dataset.estado = "lista";
    for (const item of r.itens) lista.appendChild(cartao(item, r.radicais, rotuloRecurso));

    // Sem contagem: a navegação vive de `tem_mais`, e o teto de 200 é dito ao
    // advogado quando ele chega nele, em vez de a lista simplesmente acabar.
    $("rotulo-pagina").textContent =
      `${r.itens.length} ${r.itens.length === 1 ? "decisão" : "decisões"} nesta página`;
    paginacao.hidden = false;
    $("pagina-atual").textContent = `Página ${pagina}`;
    $("anterior").disabled = pagina <= 1;
    $("proxima").disabled = !r.tem_mais || pagina >= PAGINA_MAX;
    if (!r.tem_mais) {
      nota('<i class="fas fa-check-circle me-1"></i> Fim dos resultados para esta pesquisa.');
    } else if (pagina >= PAGINA_MAX) {
      nota(`<i class="fas fa-info-circle me-1"></i> Esta pesquisa mostra até
        ${PAGINA_MAX * POR_PAGINA} acórdãos. Há mais no acervo —
        <strong>refine os filtros</strong> para chegar neles.`);
    }
  } catch (e) {
    lista.dataset.estado = "erro";
    lista.innerHTML = "";
    if (e instanceof ErroApi && e.status === 400) {
      nota(`<i class="fas fa-times-circle me-1"></i> Não foi possível pesquisar: ${esc(e.message)}`);
    } else if (e instanceof ErroApi && e.status === 429) {
      nota(`<i class="fas fa-hourglass-half me-1"></i> Limite de consultas atingido. ${esc(e.message)}`);
    } else {
      nota('<i class="fas fa-plug me-1"></i> O serviço de jurisprudência está indisponível no momento.');
    }
  } finally {
    carregando = false;
    $("enviar").disabled = false;
  }
}

// ── vocabulário ───────────────────────────────────────────────────────────
function encher(sel, valores, vazio) {
  const atual = sel.value;
  sel.innerHTML = "";
  sel.add(new Option(vazio, ""));
  for (const v of valores ?? []) {
    if (typeof v === "string") sel.add(new Option(v, v));
    else if (v && typeof v === "object") sel.add(new Option(v.nome, v.id));
  }
  if ([...sel.options].some((o) => o.value === atual)) sel.value = atual;
}

async function carregarVocabulario() {
  // Sem isto, assunto e comarca viram caixa de texto onde qualquer valor
  // devolve zero em silêncio — a comarca se disca por id, não por nome.
  try {
    const v = await vocabulario($("recurso").value);
    encher($("assunto"), v.assunto, "Todos");
    encher($("comarca"), v.comarca, "Todas");
    $("nota-comarca").textContent =
      "Cerca de 3 em cada 10 acórdãos não têm comarca registrada e não aparecem ao filtrar por ela.";
  } catch {
    $("nota-comarca").textContent = "Não foi possível carregar as opções de filtro.";
  }
}

form.addEventListener("submit", (e) => { e.preventDefault(); executar(1); });
$("recurso").addEventListener("change", carregarVocabulario);
$("limpar").addEventListener("click", () => {
  form.reset();
  camara = "";
  for (const b of $("seg-camara").querySelectorAll("button")) {
    b.setAttribute("aria-pressed", String(b.dataset.camara === ""));
  }
  msgs.innerHTML = "";
  lista.innerHTML = "";
  lista.dataset.estado = "inicial";
  $("rotulo-pagina").textContent = "";
  paginacao.hidden = true;
  carregarVocabulario();
});
$("anterior").addEventListener("click", () => executar(Math.max(1, pagina - 1)));
$("proxima").addEventListener("click", () => executar(Math.min(PAGINA_MAX, pagina + 1)));

carregarVocabulario();
