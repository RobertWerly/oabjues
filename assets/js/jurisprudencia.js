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
import { buscar, vocabulario, recentes, identificar, PAGINA_MAX, POR_PAGINA, DEMO, ErroApi }
  from "./api.js";
import { comBusca } from "./seletor.js";
import { abrirConvite } from "./convite.js";
import { esc, grifar, trecho, dataBr, dataCurta, classeDistintivo }
  from "./formato.js";

const $ = (id) => document.getElementById(id);
const form = $("form"), msgs = $("mensagens"), lista = $("resultados"), paginacao = $("paginacao");
let pagina = 1, camara = "", carregando = false;

if (DEMO) $("aviso-demo").hidden = false;

// ── seletor de câmara ─────────────────────────────────────────────────────
$("seg-camara").addEventListener("click", (e) => {
  const b = e.target.closest("button[data-camara]");
  if (!b) return;
  camara = b.dataset.camara;
  for (const outro of $("seg-camara").querySelectorAll("button")) {
    outro.setAttribute("aria-pressed", String(outro === b));
  }
});

/**
 * Os botões de câmara, montados com o que o acervo tem NAQUELE recurso.
 *
 * Eram três botões escritos no HTML: Todas, 1ª Câmara, 2ª Câmara. Isso estava
 * errado além de duplicado — em revisão criminal e embargos infringentes o
 * órgão julgador não é "1ª Câmara Criminal", é "Câmaras Criminais Reunidas" e
 * "Reunidas - 1º Grupo Criminal". Nesses dois recursos, clicar em "1ª Câmara"
 * pedia um valor que não existe e a busca voltava vazia sem dizer por quê.
 *
 * A câmara escolhida é zerada quando não sobrevive à troca de recurso, pelo
 * mesmo motivo do período: filtro invisível que continua valendo é pior que
 * filtro nenhum.
 */
function montarCamaras(camaras) {
  const cx = $("seg-camara");
  const lista = camaras ?? [];
  if (!lista.includes(camara)) camara = "";
  cx.innerHTML = "";
  const botao = (valor, rotulo) => {
    const b = document.createElement("button");
    b.type = "button";
    b.dataset.camara = valor;
    b.textContent = rotulo;
    b.setAttribute("aria-pressed", String(valor === camara));
    cx.appendChild(b);
  };
  botao("", "Todas");
  // "1ª Câmara Criminal" vira "1ª Câmara" no botão: a palavra "Criminal" se
  // repete em todos e o painel inteiro já é de jurisprudência criminal. Nomes
  // que não terminam em "Criminal" aparecem inteiros.
  for (const c of lista) botao(c, c.replace(/ Criminal$/, ""));
}

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
  // Rota limpa: `/acordao/{id}`, sem extensão e sem query. O `&recurso=` que
  // ia junto saiu — o rótulo da classe vem na resposta, em `recurso_rotulo`.
  aTeor.href = `/acordao/${encodeURIComponent(item.id)}`;

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

/** Dias atrás, em ISO — o formato que o contrato exige. */
function diasAtras(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

/** A janela de quem não pediu nada. É a mesma dos "últimos acórdãos" que a
 *  tela inicial já mostra, para as duas telas falarem do mesmo período. */
export const DIAS_PADRAO = 7;

/** Quantos dias a última busca cobriu por conta própria, ou 0 se o advogado
 *  escolheu o recorte. Lido por `executar` para escrever o aviso. */
let janelaImplicita = 0;

function montarPedido(n) {
  const p = { recurso: $("recurso").value, pagina: n };
  const q = $("q").value.trim();
  if (q) p.q = q;
  if (camara) p.camara = camara;
  for (const c of ["assunto", "comarca", "magistrado"]) if ($(c).value) p[c] = $(c).value;
  // O interruptor só acrescenta a chave quando está ligado. Desligado é
  // "todos", e todos é a ausência do filtro — não um terceiro valor.
  if ($("so-favoravel").checked) p.desfecho = "favoravel";
  // Período em branco não vira chave. Mandar `dataInicio: ""` seria pior que
  // não mandar: no motor a string vazia vira NULL pelo `nullif` e o filtro
  // some — o pedido pareceria ter intervalo e não teria. Sem data, o pedido
  // sai exatamente como saía antes deste campo existir.
  const ini = $("data-inicio").value, fim = $("data-fim").value;
  if (ini) p.dataInicio = ini;
  if (fim) p.dataFim = fim;

  // ── SEM TERMO E SEM FILTRO: OS ÚLTIMOS 7 DIAS, DITOS EM VOZ ALTA ────────
  //
  // Antes, buscar com a caixa vazia mandava um pedido sem recorte nenhum. O
  // motor devolve do mais novo para o mais velho e a página corta em 200, então
  // o resultado PARECIA "os últimos dias" — mas era só o topo de uma lista de
  // milhares, e o corte caía onde calhasse. Ligar "só concedidas" e ver 200
  // acórdãos recentes dava a impressão de um recorte que ninguém tinha pedido.
  //
  // Agora o recorte existe de verdade e é o mesmo da tela inicial: 7 dias. O
  // aviso em `executar` diz qual é, e o botão limpa em um clique. Quem digita
  // termo ou escolhe qualquer filtro sai desta regra e pesquisa o acervo
  // inteiro — a janela é o padrão de quem não pediu nada, não uma trava.
  const escolheu = q || camara || ini || fim
    || ["assunto", "comarca", "magistrado"].some((c) => $(c).value);
  janelaImplicita = escolheu ? 0 : DIAS_PADRAO;
  if (janelaImplicita) p.dataInicio = diasAtras(janelaImplicita);

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
      if (janelaImplicita) {
        nota(`<i class="far fa-calendar-times me-1"></i> Nenhum acórdão nos
          <strong>últimos ${janelaImplicita} dias</strong>. Digite um termo ou
          escolha um filtro para pesquisar o acervo inteiro.`, "aviso-janela");
      }
      $("rotulo-pagina").textContent = "";
      return;
    }

    // O aviso da janela vem ANTES dos cartões e é a primeira coisa lida: o
    // recorte foi decisão da página, não do advogado, então ela tem que dizer.
    if (janelaImplicita) {
      const so = $("so-favoravel").checked
        ? ` <strong>${esc(($("rotulo-favoravel").textContent || "").replace(/^Só\s*/i, "").trim())}</strong>`
        : "";
      nota(`<i class="far fa-calendar-alt me-1"></i> Sem termo e sem filtro, esta
        busca mostra <strong>todos os acórdãos${so} dos últimos
        ${janelaImplicita} dias</strong> — de ${dataCurta(diasAtras(janelaImplicita))}
        até hoje. Digite um termo ou escolha um filtro para pesquisar o acervo
        inteiro.`, "aviso-janela");
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
    // `nome` na comarca, `rotulo` no desfecho — o vocabulário usa a palavra do
    // domínio de cada um, e o seletor aceita as duas em vez de exigir que a
    // API se dobre à forma do <select>.
    else if (v && typeof v === "object") sel.add(new Option(v.rotulo ?? v.nome, v.id));
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

/**
 * O seletor de desembargador, separado pela composição VIGENTE das câmaras.
 *
 * São quatro titulares em cada uma — é a mesma lista que o aplicativo mostra
 * na tela de Desembargadores, colhida do site oficial do TJES. Todo o resto é
 * convocado ou substituto, tenha mil acórdãos na câmara ou nenhum: ter atuado
 * lá não é compor.
 *
 * Foi exatamente aí que as duas primeiras versões erraram. A primeira montou o
 * grupo a partir das câmaras em que o nome APARECE nos acórdãos; a segunda, da
 * coluna `camaras` do cadastro, que lista onde a pessoa compõe ou já compôs.
 * As duas leram rastro de atuação como se fosse composição, e por isso
 * dividiam 28 nomes em 19 e 9 — quando a câmara tem quatro.
 *
 * A ordem dentro do grupo é a oficial, não a alfabética, e vem pronta da API:
 * as duas telas mostram os titulares na mesma sequência.
 */
function encherMagistrados(sel, valores) {
  const atual = sel.value;
  sel.innerHTML = "";
  sel.add(new Option("Todos", ""));

  const lista = (valores ?? [])
    .map((v) => (typeof v === "string" ? { nome: v, camara: null } : v))
    .filter((v) => v && v.nome);

  const grupo = (rotulo, gente) => {
    if (!gente.length) return;
    const g = document.createElement("optgroup");
    g.label = rotulo;
    for (const m of gente) g.appendChild(new Option(m.nome, m.nome));
    sel.appendChild(g);
  };

  const camaras = [...new Set(lista.map((m) => m.camara).filter(Boolean))].sort();
  for (const c of camaras) grupo(c, lista.filter((m) => m.camara === c));
  grupo("Substitutos e convocados", lista.filter((m) => !m.camara));

  if ([...sel.options].some((o) => o.value === atual)) sel.value = atual;
}

/**
 * O rótulo do interruptor, que muda com a classe processual.
 *
 * Habeas corpus é concedido, apelação é provida, revisão é procedente — e o
 * texto vem da API justamente para a página não ter esse vocabulário escrito
 * nela. Se a API não mandar (rota velha, ou recurso sem rótulo cadastrado), o
 * interruptor é escondido em vez de mostrar um texto genérico: melhor não
 * oferecer o filtro do que oferecê-lo com a palavra errada.
 */
function aplicarDesfecho(opcoes) {
  const favoravel = (opcoes ?? []).find((o) => o && o.id === "favoravel");
  const campo = $("so-favoravel").closest(".col-12");
  if (!favoravel) {
    $("so-favoravel").checked = false;
    if (campo) campo.hidden = true;
    return;
  }
  if (campo) campo.hidden = false;
  $("rotulo-favoravel").textContent = `Só ${favoravel.rotulo.toLowerCase()}`;
}

/** Os seletores longos ganham campo de busca. São 94 assuntos, 59 comarcas e
 *  28 desembargadores — rolar até achar é o que isto resolve. */
function aplicarBusca() {
  comBusca($("recurso"), { placeholder: "Buscar recurso…" });
  comBusca($("assunto"), { placeholder: "Buscar assunto…" });
  comBusca($("comarca"), { placeholder: "Buscar comarca…" });
  comBusca($("magistrado"), { placeholder: "Buscar desembargador…" });
}

async function carregarVocabulario() {
  // Sem isto, assunto e comarca viram caixa de texto onde qualquer valor
  // devolve zero em silêncio — a comarca se disca por id, não por nome.
  try {
    const v = await vocabulario($("recurso").value);
    montarCamaras(v.camara);
    encher($("assunto"), v.assunto, "Todos");
    encher($("comarca"), v.comarca, "Todas");
    encherMagistrados($("magistrado"), v.magistrado);
    aplicarDesfecho(v.desfecho);
    aplicarPeriodo(v.periodo);
    // O <select> foi repovoado; a caixa por cima precisa reler as opções.
    aplicarBusca();
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

/**
 * O arranque. Os recursos vêm da API — a página não nasce sabendo quais são.
 *
 * É uma ida a mais na primeira carga, e é o preço de não ter o catálogo do
 * acervo escrito dentro do site da OAB. As duas cópias já tinham divergido: o
 * site dizia "Agravo em Execução" e "Embargos Infringentes"; o JurimetriaES,
 * "Agravo em Execução Penal" e "Embargos Infringentes e de Nulidade". A rota
 * responde com cache de uma hora, então a ida extra acontece uma vez.
 */
// ── identificação ─────────────────────────────────────────────────────────
/**
 * A porta. Sem identificar, não há busca — E NÃO SE GUARDA NADA.
 *
 * Até 10/09/2026 o "valido" era gravado no `localStorage`, e nas visitas
 * seguintes a porta era pulada. Estava errado por dois motivos, e o segundo é
 * o que importa:
 *
 *   1. NÃO ERA VERIFICAÇÃO. O que abria a porta era uma chave no navegador do
 *      próprio visitante, que ele escreve com uma linha no console. Bastava
 *      `localStorage.setItem('oabjus-advogado','{"inscricao":"1"}')`. A trava
 *      conferia um bilhete que o visitante emitia para si mesmo.
 *
 *   2. O FLUXO É OUTRO. O advogado chega REDIRECIONADO do site da OAB e se
 *      identifica ali, na hora. A verificação é sempre contra a base do
 *      convênio, a cada visita — não contra uma lembrança de uma visita
 *      passada. Uma inscrição cancelada, suspensa ou transferida continuava
 *      entrando enquanto o navegador não fosse limpo.
 *
 * Então: toda carga desta página passa pela porta, e toda porta passa pela
 * API. Sem `localStorage`, sem `sessionStorage`, sem cookie.
 *
 * O custo é uma chamada por visita. É `/identificar`, que só devolve
 * veredito, e o teto por hora continua valendo.
 */
const GUARDA = "oabjus-advogado";

/** Apaga o que as versões antigas deixaram gravado.
 *
 *  Nada mais lê essa chave, então ela não abre porta nenhuma — mas é o número
 *  de inscrição de uma pessoa parado no navegador dela sem servir a nada, e
 *  dado que não serve a nada não fica guardado. */
function limparGuardaAntiga() {
  try { localStorage.removeItem(GUARDA); } catch { /* armazenamento bloqueado */ }
}

function abrirBusca() {
  $("portao").hidden = true;
  $("tudo-da-busca").hidden = false;
}

function notaPortao(html, classe = "aviso-motor") {
  $("erro-identificacao").innerHTML = `<div class="${classe}">${html}</div>`;
}

async function tentarIdentificar(e) {
  e.preventDefault();
  const botao = $("entrar");
  const inscricao = $("inscricao").value.trim();
  const cpf = $("cpf").value.trim();
  const seccional = $("seccional").value;
  const nome = $("nome-advogado").value.trim();
  if (!inscricao || !cpf) return;

  botao.disabled = true;
  $("erro-identificacao").innerHTML = "";
  try {
    const r = await identificar({ inscricao, cpf, seccional, nome });
    switch (r.veredito) {
      case "valido":
        // Abre e pronto. Nada é gravado: a próxima visita pergunta de novo.
        abrirBusca();
        // O convite vem DEPOIS de abrir a busca, não no lugar dela: quem
        // fechar sem ler já encontra a página pronta atrás. `recursos` sai do
        // <select> que a página acabou de encher — o texto fala do acervo
        // real, e não de um número escrito à mão que envelhece sozinho.
        abrirConvite({ recursos: $("recurso").options.length });
        return;
      case "cpf_nao_confere":
        // Dito com todas as letras, e não como "não consta": quem errou um
        // dígito do próprio CPF procuraria erro no número da OAB.
        notaPortao(`<i class="fas fa-times-circle me-1"></i> O <strong>CPF não
          confere</strong> com a inscrição <strong>${esc(r.inscricao ?? inscricao)}</strong>
          na base da OAB/${esc(r.seccional ?? seccional)}. Confira os dois números.`);
        return;
      case "nao_encontrado":
        notaPortao(`<i class="fas fa-times-circle me-1"></i> A inscrição
          <strong>${esc(r.inscricao ?? inscricao)}</strong> não consta da base da
          OAB/${esc(r.seccional ?? seccional)}. Confira o número e tente de novo.`);
        return;
      default:
        notaPortao('<i class="fas fa-times-circle me-1"></i> Informe um número de inscrição válido — somente números.');
        return;
    }
  } catch (err) {
    // 422 = `sem_base`: a API não tem a base daquela seccional, então não dá
    // para conferir. Isto JÁ FOI passagem, e era um furo: com {"seccional":"SP"}
    // qualquer número inventado abria a porta. Agora recusa, e diz a verdade —
    // "não existe" seria mentira, "não consigo conferir" é o que aconteceu.
    if (err instanceof ErroApi && err.status === 422 && err.veredito === "sem_cpf_na_base") {
      // A base do convênio não tem o CPF DESTA inscrição — 28 das 30.089 do
      // ES. Não é erro de quem digitou, e não abre a porta: liberar sem
      // conferir transformaria essas 28 em números que entram com qualquer
      // CPF, e a inscrição é dado público.
      notaPortao(`<i class="fas fa-circle-info me-1"></i> A base da OAB/ES não tem
        o CPF vinculado a esta inscrição, então não conseguimos conferir os dois
        juntos. <a href="/suporte">Fale com o suporte</a> para liberar seu acesso.`);
    } else if (err instanceof ErroApi && err.status === 422) {
      notaPortao(`<i class="fas fa-circle-info me-1"></i> Só conseguimos conferir
        inscrições da seccional do Espírito Santo. Se a sua é de outra seccional,
        fale com a OAB/ES.`);
    } else if (err instanceof ErroApi && err.status === 429) {
      notaPortao(`<i class="fas fa-hourglass-half me-1"></i> Muitas tentativas
        seguidas deste dispositivo. Espere alguns minutos e tente de novo.`);
    } else if (err instanceof ErroApi && err.status === 400) {
      // A API diz QUAL campo caiu; repetir isso é a diferença entre corrigir
      // em um toque e conferir os dois campos no escuro.
      notaPortao(err.campo === "cpf"
        ? '<i class="fas fa-times-circle me-1"></i> <strong>CPF inválido.</strong> Confira os números digitados.'
        : '<i class="fas fa-times-circle me-1"></i> Informe um número de inscrição válido — somente números.');
    } else {
      notaPortao('<i class="fas fa-plug me-1"></i> Não foi possível conferir a inscrição agora. Tente de novo em instantes.');
    }
  } finally {
    botao.disabled = false;
  }
}

/** Máscara enquanto digita. Só formatação: o que vai para a API são os
 *  dígitos, e quem confere os verificadores é o contrato do outro lado. */
$("cpf").addEventListener("input", (e) => {
  const d = e.target.value.replace(/\D+/g, "").slice(0, 11);
  e.target.value = d
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d{1,2})$/, ".$1-$2");
});

$("form-identificacao").addEventListener("submit", tentarIdentificar);

async function iniciar() {
  // A PORTA PRIMEIRO, antes de qualquer rede.
  //
  // Ela ficava depois do vocabulário, e isso tinha duas consequências: um
  // soluço na rede deixava a página muda — sem porta e sem busca — e a chave
  // que as versões antigas gravaram sobrevivia à visita. A porta não depende
  // de saber quais recursos existem; o vocabulário carrega atrás dela.
  limparGuardaAntiga();
  $("portao").hidden = false;

  const sel = $("recurso");
  try {
    const { recursos, seccionais } = await vocabulario();
    for (const r of recursos ?? []) sel.add(new Option(r.rotulo, r.id));
    // Só as seccionais que a API consegue CONFERIR. Oferecer uma sem base
    // seria prometer verificação que não existe.
    encher($("seccional"), (seccionais ?? []).map((x) => ({ id: x.uf, rotulo: `${x.nome} (${x.uf})` })), "");
    $("seccional").remove(0);   // tira o "" que `encher` põe na frente
  } catch {
    // Sem a lista não há busca possível: `recurso` é obrigatório no contrato.
    // Melhor dizer isso do que deixar um seletor vazio parecendo escolha.
    nota('<i class="fas fa-plug me-1"></i> O serviço de jurisprudência está indisponível no momento.');
    return;
  }
  if (!sel.options.length) {
    nota('<i class="fas fa-plug me-1"></i> O serviço de jurisprudência não devolveu nenhum tipo de recurso.');
    return;
  }
  aplicarBusca();

  estadoVazio({ inicial: true });
  await carregarVocabulario();
}

iniciar();
