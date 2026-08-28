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
import { esc, grifar, trecho, dataBr, dataCurta, classeDistintivo }
  from "./formato.js";

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
// esc, grifar, trecho, dataBr, dataCurta e classeDistintivo vivem em
// formato.js: a página do acórdão mostra o mesmo texto e usa as mesmas regras.

const NUM = new Intl.NumberFormat("pt-BR");

/**
 * "Página 3 de 7".
 *
 * `paginas` vem do servidor já limitado ao teto de 200, e não é o mesmo que
 * total/20: uma pesquisa com 8.235 acórdãos tem 412 páginas no acervo e 10
 * aqui. Escrever o número do acervo prometeria uma página que a própria API
 * recusa com 400.
 *
 * Sem `paginas` na resposta — API antiga, ou resposta sem contagem — mostra só
 * a página atual, como antes.
 */
function rotuloPagina(n, r) {
  return r?.paginas > 0 ? `Página ${n} de ${r.paginas}` : `Página ${n}`;
}

/**
 * Quantos acórdãos a resposta contém.
 *
 * É o número entregue, não o do acervo: no teto dá 200, abaixo dele dá o que
 * for. A API já entrega assim — o tamanho da fatia do acervo não sai de lá,
 * porque repetir a pergunta variando o filtro transformaria isso num mapa do
 * que existe.
 */
function rotuloTotal(r) {
  if (!(r?.total >= 0)) {
    return `${r.itens.length} ${r.itens.length === 1 ? "decisão" : "decisões"} nesta página`;
  }
  return `${NUM.format(r.total)} ${r.total === 1 ? "acórdão" : "acórdãos"}`;
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
        <a class="btn btn-sm btn-oab text-nowrap" data-acao="teor">
          <i class="fas fa-book-open me-1"></i> Inteiro teor
        </a>
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

  // "Inteiro teor" vai para a PÁGINA do acórdão. É link de verdade, com href:
  // abre em nova aba com o meio, o buscador do navegador acha, e o advogado
  // copia o endereço de um acórdão específico.
  const aTeor = el.querySelector('[data-acao="teor"]');
  aTeor.href = `acordao.html?id=${encodeURIComponent(item.id)}`
    + `&recurso=${encodeURIComponent($("recurso").value)}`;

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
      <div class="icone"><i class="fas ${inicial ? "fa-search" : "fa-folder-open"}"></i></div>
      <h2>${inicial
        ? "Pesquise a jurisprudência criminal do TJES"
        : "Nada encontrado para esta pesquisa"}</h2>
      <p>${inicial
        ? "Digite um termo, o número de um processo, ou use os filtros acima. Comece por um destes:"
        : "Tente menos filtros, outro tipo de recurso, ou uma destas buscas:"}</p>
      <div class="exemplos">
        ${EXEMPLOS.map((e) => `<button type="button" data-exemplo="${esc(e)}">${esc(e)}</button>`).join("")}
      </div>
    </div>
    <section id="recentes" class="mt-4" aria-label="Últimos acórdãos"></section>`;
  for (const b of lista.querySelectorAll("[data-exemplo]")) {
    b.addEventListener("click", () => {
      $("q").value = b.dataset.exemplo;
      executar(1);
    });
  }
  carregarRecentes();
}

/** As últimas da janela, abaixo do estado vazio. A janela é do servidor: a
 *  resposta traz `desde` e `dias`, e a página só repete o que ele disse. */
async function carregarRecentes(n = 1) {
  const alvo = $("recentes");
  if (!alvo) return;
  const rotulo = $("recurso").selectedOptions[0]?.text ?? "";
  alvo.innerHTML = `<p class="text-center py-3" style="color:var(--oab-texto-3);font-size:.88rem">
    <span class="spinner-border spinner-border-sm me-2"></span>Carregando os últimos acórdãos…</p>`;
  try {
    const r = await recentes($("recurso").value, n);
    const cabecalho = `
      <div class="cabecalho-recentes d-flex align-items-baseline justify-content-between flex-wrap gap-2">
        <h2>Últimos acórdãos (${r.dias ?? 7} dias) — ${esc(rotulo)}</h2>
        <span class="desde">${r.total >= 0 ? `${NUM.format(r.total)} ${r.total === 1 ? "acórdão" : "acórdãos"}` : ""}${
          r.total >= 0 && r.desde ? " · " : ""}${r.desde ? `desde ${dataCurta(r.desde)}` : ""}</span>
      </div>`;
    if (!r.itens?.length) {
      // Caso real, não hipótese: em embargos infringentes o acervo pára quase
      // um mês atrás, e a janela vem vazia. Dizer isso é melhor que uma seção
      // com título e nada embaixo.
      alvo.innerHTML = `${cabecalho}
        <div class="estado estado-compacto" data-papel="recentes-vazio">
          <div class="icone"><i class="far fa-calendar-times"></i></div>
          <h2>Nada encontrado nos últimos ${r.dias ?? 7} dias</h2>
          <p>Nenhum acórdão de <strong>${esc(rotulo)}</strong> foi julgado
            ${r.desde ? `desde ${dataCurta(r.desde)}` : "no período"}.
            Use a busca acima para consultar o acervo inteiro.</p>
        </div>`;
      return;
    }
    alvo.innerHTML = cabecalho;
    for (const item of r.itens) alvo.appendChild(cartao(item, [], rotulo));

    // A janela pode ter mais que uma página, e o mesmo teto de 200 vale aqui.
    // Sem contagem na resposta, `tem_mais` é o único sinal de que há próxima —
    // por isso "Próxima" nasce desabilitada e só liga quando o servidor diz.
    const nav = document.createElement("nav");
    nav.className = "paginacao d-flex justify-content-center align-items-center gap-2 mt-3";
    nav.setAttribute("aria-label", "Paginação dos últimos acórdãos");
    nav.innerHTML = `
      <button type="button" class="btn btn-sm btn-contorno" data-ir="anterior" ${n <= 1 ? "disabled" : ""}>
        <i class="fas fa-chevron-left me-1"></i> Anterior</button>
      <span style="font-size:.85rem;color:var(--oab-texto-2)">${rotuloPagina(n, r)}</span>
      <button type="button" class="btn btn-sm btn-contorno" data-ir="proxima" ${r.tem_mais ? "" : "disabled"}>
        Próxima <i class="fas fa-chevron-right ms-1"></i></button>`;
    nav.addEventListener("click", (e) => {
      const b = e.target.closest("button[data-ir]");
      if (!b || b.disabled) return;
      carregarRecentes(b.dataset.ir === "anterior" ? n - 1 : n + 1);
      alvo.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    alvo.appendChild(nav);

    if (!r.tem_mais && n >= PAGINA_MAX) {
      const teto = document.createElement("p");
      teto.className = "text-center mt-2";
      teto.style.cssText = "font-size:.82rem;color:var(--oab-texto-3)";
      teto.textContent = `Esta lista mostra até ${PAGINA_MAX * POR_PAGINA} acórdãos; use a busca para ir além.`;
      alvo.appendChild(teto);
    }
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
  // Período em branco não vira chave. Mandar `dataInicio: ""` seria pior que
  // não mandar: no motor a string vazia vira NULL pelo `nullif` e o filtro
  // some — o pedido pareceria ter intervalo e não teria. Sem data, o pedido
  // sai exatamente como saía antes deste campo existir.
  const ini = $("data-inicio").value, fim = $("data-fim").value;
  if (ini) p.dataInicio = ini;
  if (fim) p.dataFim = fim;
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

    $("rotulo-pagina").textContent = rotuloTotal(r);
    paginacao.hidden = false;
    $("pagina-atual").textContent = rotuloPagina(pagina, r);
    $("anterior").disabled = pagina <= 1;
    $("proxima").disabled = !r.tem_mais || pagina >= PAGINA_MAX;
    // Acabar a lista não é aviso: o botão "Próxima" desabilitado já diz isso, e
    // uma tarja amarela no topo de uma página cheia de resultados parece
    // problema onde não há.
    if (r.tem_mais && pagina >= PAGINA_MAX) {
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

/**
 * As bordas do calendário — o acórdão mais antigo e o mais novo DO RECURSO.
 *
 * É por recurso e não do acervo porque as classes não cobrem o mesmo tempo
 * (medido: habeas corpus começa em 27/01/2022; apelação, só em 09/01/2024).
 * Uma borda única ofereceria a quem busca apelação dois anos inteiros em que
 * não existe uma única apelação para achar.
 *
 * Trocar o recurso pode deixar uma data escolhida fora da borda nova. Nesse
 * caso ela é apagada e o advogado é avisado — deixá-la travaria o formulário
 * na validação do navegador, com uma bolha nativa que não explica nada.
 */
function aplicarPeriodo(periodo) {
  const ini = $("data-inicio"), fim = $("data-fim");
  const min = periodo?.min ?? "", max = periodo?.max ?? "";
  let apagou = false;
  for (const el of [ini, fim]) {
    if (min) el.min = min; else el.removeAttribute("min");
    if (max) el.max = max; else el.removeAttribute("max");
    if (el.value && min && max && (el.value < min || el.value > max)) {
      el.value = "";
      apagou = true;
    }
  }
  $("dica-periodo").textContent = min && max
    ? `Acórdãos de ${dataBr(min)} a ${dataBr(max)}`
    : "";
  if (apagou) {
    nota(`<i class="fas fa-calendar-alt me-1"></i> O período foi limpo: este tipo
      de recurso só tem acórdãos entre ${esc(dataBr(min))} e ${esc(dataBr(max))}.`);
  }
}

async function carregarVocabulario() {
  // Sem isto, assunto e comarca viram caixa de texto onde qualquer valor
  // devolve zero em silêncio — a comarca se disca por id, não por nome.
  try {
    const v = await vocabulario($("recurso").value);
    encher($("assunto"), v.assunto, "Todos");
    encher($("comarca"), v.comarca, "Todas");
    aplicarPeriodo(v.periodo);
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
  // Repõe as bordas do calendário: `form.reset()` devolve o recurso ao
  // primeiro da lista, e as bordas são por recurso.
  carregarVocabulario();
});
$("anterior").addEventListener("click", () => executar(Math.max(1, pagina - 1)));
$("proxima").addEventListener("click", () => executar(Math.min(PAGINA_MAX, pagina + 1)));

estadoVazio({ inicial: true });
carregarVocabulario();
