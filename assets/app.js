// ============================================================================
// A tela. Traduz o que a API devolve em algo que um advogado lê.
//
// Três coisas aqui existem por causa de comportamento medido do motor, e não
// por capricho de interface:
//
//   `avisos`   — filtrar pode AFROUXAR a pergunta e fazer a lista CRESCER
//                (medido: 8 → 16 acórdãos ao escolher um magistrado). Sem
//                mostrar isso, o advogado lê resultados que só casam metade
//                da pergunta achando que casam ela inteira.
//   `radicais` — os lexemas que o motor de fato usou. Grifar por conta própria
//                falhou duas vezes no app; aqui a marcação vem do servidor.
//   sem total  — a API não devolve contagem. O fim da lista é `tem_mais:false`,
//                nunca um zero que se confunde com "nada encontrado".
// ============================================================================
import {
  buscar, acordao, vocabulario, RECURSOS, PAGINA_MAX, POR_PAGINA, DEMO, ErroApi,
} from "./api.js";

const $ = (id) => document.getElementById(id);
const form = $("form");
const msgs = $("mensagens");
const lista = $("resultados");
const paginacao = $("paginacao");

let pagina = 1;
let ultimoPedido = null;
let carregando = false;

if (DEMO) $("demo-aviso").hidden = false;

for (const [valor, rotulo] of RECURSOS) {
  form.recurso.add(new Option(rotulo, valor));
}

function texto(el) { return el.value.trim(); }

function montarPedido(n) {
  const p = { recurso: form.recurso.value, pagina: n };
  const q = texto(form.q);
  if (q) p.q = q;
  for (const campo of ["camara", "comarca", "assunto", "magistrado"]) {
    const v = texto(form[campo]);
    if (v) p[campo] = v;
  }
  return p;
}

function escapar(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

/** Grifa só o que o motor disse ter usado. Nada de adivinhar o stemmer. */
function grifar(txt, radicais) {
  const seguro = escapar(txt);
  if (!radicais?.length) return seguro;
  const alt = radicais
    .filter((r) => typeof r === "string" && r.length >= 3)
    .map((r) => r.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .sort((a, b) => b.length - a.length);
  if (!alt.length) return seguro;
  return seguro.replace(new RegExp(`(${alt.join("|")})\\p{L}*`, "giu"), "<mark>$&</mark>");
}

const DATA = new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" });
function dataBr(iso) {
  if (!iso) return "—";
  const d = new Date(`${iso}T00:00:00Z`);
  return Number.isNaN(+d) ? iso : DATA.format(d);
}

function nota(classe, html) {
  const d = document.createElement("div");
  d.className = `caixa ${classe}`;
  d.innerHTML = html;
  msgs.appendChild(d);
}

/** Traduz o aviso do motor para português de advogado. */
function explicarAviso(a) {
  switch (a?.tipo) {
    case "conceitos_relaxados":
      return `A busca foi <strong>afrouxada</strong>: destes resultados, muitos casam
        apenas ${a.casaram} de ${a.de} partes da sua pergunta. Isso costuma acontecer
        quando um filtro remove os acórdãos que casavam a pergunta inteira —
        <strong>a lista pode ficar maior, não menor</strong>.`;
    case "processo_em_outro_recurso":
      return `O processo <strong>${escapar(a.numero ?? "")}</strong> existe no acervo, mas
        como <strong>${escapar(a.recurso ?? "outro recurso")}</strong>. Troque o tipo de
        recurso para encontrá-lo.`;
    case "termo_ausente":
      return `A palavra <strong>${escapar(a.termo ?? "")}</strong> não aparece em nenhum
        acórdão do acervo${a.sugestao?.length ? ` — você quis dizer <strong>${escapar(a.sugestao[0])}</strong>?` : "."}`;
    case "query_truncada":
      return `Sua pergunta foi cortada em ${a.limite} caracteres.`;
    default:
      return null;
  }
}

function cardDe(item, radicais) {
  const el = document.createElement("article");
  el.className = "card";
  el.innerHTML = `
    <h2>${escapar(item.numero ?? "sem número")}</h2>
    <div class="meta">
      <span><b>${escapar(item.camara ?? "—")}</b></span>
      <span>Rel. ${escapar(item.magistrado ?? "—")}</span>
      <span>${dataBr(item.data)}</span>
      <span>${escapar(item.assunto ?? "—")}</span>
      <span class="selo">${escapar(item.resultado ?? "—")}</span>
    </div>
    <div class="ementa">${grifar(item.ementa ?? "", radicais)}</div>
    <div class="rodape-card">
      <button type="button" class="secundario" data-acao="ementa">Ver ementa inteira</button>
      <button type="button" class="secundario" data-acao="teor">Ver inteiro teor</button>
    </div>`;

  const ementa = el.querySelector(".ementa");
  el.querySelector('[data-acao="ementa"]').addEventListener("click", (e) => {
    ementa.classList.toggle("aberta");
    e.target.textContent = ementa.classList.contains("aberta")
      ? "Recolher ementa" : "Ver ementa inteira";
  });

  const botaoTeor = el.querySelector('[data-acao="teor"]');
  botaoTeor.addEventListener("click", async () => {
    const jaAberto = el.querySelector(".teor");
    if (jaAberto) {
      jaAberto.remove();
      botaoTeor.textContent = "Ver inteiro teor";
      return;
    }
    botaoTeor.disabled = true;
    botaoTeor.innerHTML = '<span class="carregando"></span>Carregando';
    try {
      // Um acórdão por requisição — é assim que a API entrega o inteiro teor.
      const d = await acordao(item.id);
      const div = document.createElement("div");
      div.className = "teor";
      div.innerHTML = grifar(d.inteiro_teor ?? "(sem inteiro teor)", radicais);
      el.appendChild(div);
      botaoTeor.textContent = "Recolher inteiro teor";
    } catch (e) {
      const div = document.createElement("div");
      div.className = "caixa erro";
      div.textContent = e instanceof ErroApi && e.status === 404
        ? "Este acórdão não está disponível para consulta."
        : "Não foi possível carregar o inteiro teor.";
      el.appendChild(div);
      botaoTeor.textContent = "Ver inteiro teor";
    } finally {
      botaoTeor.disabled = false;
    }
  });

  return el;
}

async function executar(n) {
  if (carregando) return;
  carregando = true;
  $("enviar").disabled = true;
  msgs.innerHTML = "";
  lista.dataset.estado = "carregando";
  lista.innerHTML = '<div class="vazio" data-papel="carregando"><span class="carregando"></span>Pesquisando…</div>';
  paginacao.hidden = true;

  const pedido = montarPedido(n);
  try {
    const r = await buscar(pedido);
    ultimoPedido = pedido;
    pagina = r.pagina ?? n;
    lista.innerHTML = "";

    for (const a of r.avisos ?? []) {
      const t = explicarAviso(a);
      if (t) nota("aviso", t);
    }

    if (!r.itens?.length) {
      lista.dataset.estado = "vazio";
      lista.innerHTML = `<div class="vazio" data-papel="vazio">
        Nenhum acórdão encontrado para esta combinação de filtros.<br>
        Tente menos filtros, ou outro tipo de recurso.</div>`;
      return;
    }

    lista.dataset.estado = "lista";
    for (const item of r.itens) lista.appendChild(cardDe(item, r.radicais));

    // Sem contagem: a navegação vive de `tem_mais`, e o teto de 200 é dito
    // quando o advogado chega nele — não escondido.
    paginacao.hidden = false;
    $("pagina-atual").textContent = `Página ${pagina}`;
    $("anterior").disabled = pagina <= 1;
    $("proxima").disabled = !r.tem_mais || pagina >= PAGINA_MAX;
    if (!r.tem_mais) {
      nota("neutra", "Fim dos resultados para esta pesquisa.");
    } else if (pagina >= PAGINA_MAX) {
      nota("neutra", `Esta pesquisa mostra até ${PAGINA_MAX * POR_PAGINA} acórdãos.
        Há mais no acervo — <strong>refine os filtros</strong> para chegar neles.`);
    }
  } catch (e) {
    lista.dataset.estado = "erro";
    lista.innerHTML = "";
    if (e instanceof ErroApi && e.status === 400) {
      nota("erro", `Não foi possível pesquisar: ${escapar(e.message)}`);
      if (e.campo && form[e.campo]) form[e.campo].focus();
    } else if (e instanceof ErroApi && e.status === 429) {
      nota("erro", `Limite de consultas atingido. ${escapar(e.message)}`);
    } else {
      nota("erro", "O serviço de jurisprudência está indisponível no momento.");
    }
  } finally {
    carregando = false;
    $("enviar").disabled = false;
  }
}

function encher(select, valores, vazio) {
  const atual = select.value;
  select.innerHTML = "";
  select.add(new Option(vazio, ""));
  for (const v of valores ?? []) {
    if (typeof v === "string") select.add(new Option(v, v));
    else if (v && typeof v === "object") select.add(new Option(v.nome, v.id));
  }
  if ([...select.options].some((o) => o.value === atual)) select.value = atual;
}

async function carregarVocabulario() {
  // Sem isto, comarca e assunto viram caixa de texto onde qualquer valor
  // devolve zero em silêncio — a comarca se disca por id, não por nome.
  try {
    const v = await vocabulario(form.recurso.value);
    encher(form.camara, v.camara, "Todas");
    encher(form.comarca, v.comarca, "Todas");
    encher(form.assunto, v.assunto, "Todos");
    encher(form.magistrado, v.magistrado, "Todos");
    $("dica-comarca").textContent =
      "Cerca de 3 em cada 10 acórdãos não têm comarca registrada e não aparecem ao filtrar por ela.";
  } catch {
    $("dica-comarca").textContent = "Não foi possível carregar as opções de filtro.";
  }
}

form.addEventListener("submit", (e) => { e.preventDefault(); executar(1); });
form.recurso.addEventListener("change", carregarVocabulario);
$("limpar").addEventListener("click", () => {
  form.reset();
  msgs.innerHTML = "";
  lista.innerHTML = "";
  lista.dataset.estado = "inicial";
  paginacao.hidden = true;
  carregarVocabulario();
});
$("anterior").addEventListener("click", () => executar(Math.max(1, pagina - 1)));
$("proxima").addEventListener("click", () => executar(Math.min(PAGINA_MAX, pagina + 1)));

carregarVocabulario();
