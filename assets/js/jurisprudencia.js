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
import { buscar, vocabulario, recentes, RECURSOS, PAGINA_MAX, POR_PAGINA, DEMO, ErroApi }
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
  // `radicais` vem ANINHADO do motor — uma lista por conceito, cada uma com uma
  // lista por realização: [[[["excess"],["praz"]],[["excess"]],[["praz"]]]].
  // Sem achatar, o filtro de string descarta tudo e o grifo some sem erro
  // nenhum na tela. Medido contra a API em produção.
  const alt = (Array.isArray(radicais) ? radicais.flat(Infinity) : [])
    .filter((r) => typeof r === "string" && r.length >= 3)
    .map((r) => r.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .sort((a, b) => b.length - a.length);
  if (!alt.length) return seguro;
  return seguro.replace(new RegExp(`(${alt.join("|")})\\p{L}*`, "giu"), "<mark>$&</mark>");
}

/**
 * O inteiro teor vem do tribunal como texto extraído de PDF: dezenas de linhas
 * em branco, cabeçalho de brasão, quebras no meio de frase. A API entrega
 * verbatim — mexer no texto é dela para fora, não dela para dentro. Quem
 * arruma para LER é a página, e só o espaço em branco.
 */
function limparEspacos(txt) {
  return String(txt ?? "")
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * O trecho do card — três linhas, então cada palavra conta.
 *
 * Duas decisões, as duas medidas no acervo:
 *
 * 1. Espaço vira espaço, sempre. O acórdão vem com o brasão em coluna e uma
 *    linha em branco entre cada parágrafo; preservar isso gastaria as três
 *    linhas do card em "ESTADO DO ESPÍRITO SANTO" e ar. No botão o texto abre
 *    com a formatação intacta.
 * 2. Começa na ÚLTIMA "EMENTA" da primeira metade do documento, não na
 *    primeira. O texto costuma trazer "EMENTA" como título, depois o
 *    cabeçalho do processo (câmara, número, partes, relator) e só então
 *    "ACÓRDÃO EMENTA: DIREITO PROCESSUAL PENAL…", que é o resumo de verdade.
 *    Parar na primeira ocorrência mostra o cabeçalho; parar na última mostra
 *    o julgado.
 */
function trecho(txt) {
  const corrido = String(txt ?? "").replace(/\s+/g, " ").trim();
  const limite = corrido.length * 0.6;
  let inicio = 0;
  for (const m of corrido.matchAll(/\bEMENTAS?\b\s*:?\s*/gi)) {
    if (m.index > limite) break;
    inicio = m.index + m[0].length;
  }
  return corrido.slice(inicio);
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

        <div class="bloco-teor mb-2">
          <span class="titulo">Trecho do acórdão</span>
          ${item.inteiro_teor
            ? `<p class="cortada">${grifar(trecho(item.inteiro_teor), radicais)}</p>`
            : `<p class="sem-texto">Texto integral não disponível — o acórdão não está no
                índice de jurisprudência do tribunal.</p>`}
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

  // O texto JÁ VEIO na listagem — a API devolve inteiro teor em cada item.
  // Abrir não custa requisição, não custa espera e não conta contra o teto
  // diário de documentos. O endpoint de detalhe continua existindo no contrato
  // (e em api.js), para quem integrar de outro jeito.
  const bTeor = el.querySelector('[data-acao="teor"]');
  bTeor.addEventListener("click", () => {
    const aberto = el.querySelector(".teor");
    if (aberto) {
      aberto.remove();
      bTeor.innerHTML = '<i class="fas fa-book-open me-1"></i> Inteiro teor';
      return;
    }
    const div = document.createElement("div");
    const texto = limparEspacos(item.inteiro_teor);
    if (texto) {
      div.className = "teor mt-3";
      div.innerHTML = grifar(texto, radicais);
      bTeor.innerHTML = '<i class="fas fa-compress-alt me-1"></i> Recolher';
    } else {
      // 4 acórdãos do acervo (de 21.493) não têm o texto: o TJES não os
      // devolve em nenhum core da API de jurisprudência. Eles continuam na
      // lista, com os metadados que existem, e dizem o que houve.
      div.className = "aviso-motor mt-3";
      div.textContent = "O inteiro teor deste acórdão não está disponível no acervo.";
    }
    el.appendChild(div);
  });

  return el;
}

// ── busca ─────────────────────────────────────────────────────────────────
/** Sugestões que preenchem o campo e já disparam a busca — quem chega na
 *  página em branco não sabe o que ela aceita. */
const EXEMPLOS = [
  "nulidade da busca domiciliar",
  "excesso de prazo",
  "prisão preventiva",
  "dosimetria da pena",
];

function estadoVazio({ inicial }) {
  lista.dataset.estado = inicial ? "inicial" : "vazio";
  lista.innerHTML = `
    <div class="estado" data-papel="${inicial ? "inicial" : "vazio"}">
      <div class="icone"><i class="fas fa-search"></i></div>
      <h2>${inicial
        ? "Pesquise a jurisprudência criminal do TJES"
        : "Nenhuma decisão encontrada com esses filtros"}</h2>
      <p>${inicial
        ? "Digite um termo, o número de um processo, ou use os filtros acima. Comece por um destes:"
        : "Tente menos filtros, outro tipo de recurso, ou uma destas buscas:"}</p>
      <div class="exemplos">
        ${EXEMPLOS.map((e) => `<button type="button" data-exemplo="${esc(e)}">${esc(e)}</button>`).join("")}
      </div>
    </div>
    <section id="recentes" class="mt-4" aria-label="Últimas jurisprudências"></section>`;
  for (const b of lista.querySelectorAll("[data-exemplo]")) {
    b.addEventListener("click", () => {
      $("q").value = b.dataset.exemplo;
      executar(1);
    });
  }
  carregarRecentes();
}

const DATA_CURTA = new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC", day: "2-digit", month: "2-digit" });
function dataCurta(iso) {
  if (!iso) return "";
  const d = new Date(`${iso}T00:00:00Z`);
  return Number.isNaN(+d) ? iso : DATA_CURTA.format(d);
}

/** As últimas da janela, abaixo do estado vazio. A janela é do servidor: a
 *  resposta traz `desde` e `dias`, e a página só repete o que ele disse. */
async function carregarRecentes() {
  const alvo = $("recentes");
  if (!alvo) return;
  const rotulo = $("recurso").selectedOptions[0]?.text ?? "";
  alvo.innerHTML = `<p class="text-center py-3" style="color:var(--oab-texto-3);font-size:.88rem">
    <span class="spinner-border spinner-border-sm me-2"></span>Carregando as últimas decisões…</p>`;
  try {
    const r = await recentes($("recurso").value, 1);
    const cabecalho = `
      <div class="cabecalho-recentes d-flex align-items-baseline justify-content-between flex-wrap gap-2">
        <h2>Últimas dos ${r.dias ?? 7} dias — ${esc(rotulo)}</h2>
        ${r.desde ? `<span class="desde">desde ${dataCurta(r.desde)}</span>` : ""}
      </div>`;
    if (!r.itens?.length) {
      // Caso real, não hipótese: em embargos infringentes o acervo pára quase
      // um mês atrás, e a janela vem vazia. Dizer isso é melhor que uma seção
      // com título e nada embaixo.
      alvo.innerHTML = `${cabecalho}
        <div class="painel p-4 text-center" data-papel="recentes-vazio">
          <p class="mb-0" style="font-size:.92rem;color:var(--oab-texto-2)">
            Nenhum acórdão de <strong>${esc(rotulo)}</strong> julgado
            ${r.desde ? `desde ${dataCurta(r.desde)}` : "no período"}.
            Use a busca acima para consultar o acervo inteiro.</p>
        </div>`;
      return;
    }
    alvo.innerHTML = cabecalho;
    for (const item of r.itens) alvo.appendChild(cartao(item, [], rotulo));
  } catch {
    alvo.innerHTML = "";   // a lista é um extra; falhar nela não estraga a página
  }
}

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
      estadoVazio({ inicial: false });
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
  } catch {
    // O elemento da nota não existe mais; o aviso vai para a área de mensagens.
    nota('<i class="fas fa-info-circle me-1"></i> Não foi possível carregar as opções de filtro. A busca por texto continua funcionando.');
  }
}

form.addEventListener("submit", (e) => { e.preventDefault(); executar(1); });
$("recurso").addEventListener("change", () => {
  carregarVocabulario();
  // A lista é por recurso: trocar o recurso troca a lista.
  if (lista.dataset.estado === "inicial" || lista.dataset.estado === "vazio") carregarRecentes();
});
$("limpar").addEventListener("click", () => {
  form.reset();
  camara = "";
  for (const b of $("seg-camara").querySelectorAll("button")) {
    b.setAttribute("aria-pressed", String(b.dataset.camara === ""));
  }
  msgs.innerHTML = "";
  $("rotulo-pagina").textContent = "";
  paginacao.hidden = true;
  estadoVazio({ inicial: true });
  estadoVazio({ inicial: true });
carregarVocabulario();
});
$("anterior").addEventListener("click", () => executar(Math.max(1, pagina - 1)));
$("proxima").addEventListener("click", () => executar(Math.min(PAGINA_MAX, pagina + 1)));

estadoVazio({ inicial: true });
carregarVocabulario();
