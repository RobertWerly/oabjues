// ============================================================================
// Cliente da API de jurisprudência — protótipo OAB-ES.
//
// O navegador NUNCA fala com o JurimetriaES direto. Ele chama o BFF da própria
// OAB (bff/jurisprudencia.php), que guarda a chave e assina com HMAC. É a
// única forma de "só funciona no site da OAB" ser verdade: Origin e Referer
// são cabeçalhos que um curl escolhe.
//
// Trocar DEMO por real é trocar BASE — nada mais neste arquivo muda.
// ============================================================================

/** Rota do BFF da OAB. No site real, aponta para onde o PHP for publicado. */
const BASE = "bff/jurisprudencia.php";

/** Sem backend publicado, a página roda com dados de demonstração. */
export const DEMO = new URLSearchParams(location.search).get("demo") !== "0";

export const RECURSOS = [
  ["habeas_corpus", "Habeas Corpus"],
  ["apelacao_criminal", "Apelação Criminal"],
  ["agravo_execucao", "Agravo em Execução"],
  ["recurso_sentido_estrito", "Recurso em Sentido Estrito"],
  ["revisao_criminal", "Revisão Criminal"],
  ["embargos_infringentes", "Embargos Infringentes"],
];

export const POR_PAGINA = 20;
export const PAGINA_MAX = 10;

export class ErroApi extends Error {
  constructor(mensagem, status, campo) {
    super(mensagem);
    this.status = status;
    this.campo = campo;
  }
}

async function chamar(rota, opcoes = {}) {
  let r;
  try {
    r = await fetch(`${BASE}?rota=${encodeURIComponent(rota)}`, opcoes);
  } catch {
    throw new ErroApi("não foi possível falar com o servidor", 0);
  }
  let corpo = null;
  try { corpo = await r.json(); } catch { /* resposta sem JSON */ }
  if (!r.ok) {
    throw new ErroApi(corpo?.erro ?? `erro ${r.status}`, r.status, corpo?.campo);
  }
  return corpo ?? {};
}

export async function buscar(pedido) {
  if (DEMO) return demoBuscar(pedido);
  return chamar("busca", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(pedido),
  });
}

export async function acordao(id) {
  if (DEMO) return demoAcordao(id);
  return chamar(`acordao/${encodeURIComponent(id)}`);
}

export async function vocabulario(recurso) {
  if (DEMO) return demoVocabulario();
  return chamar(`vocabulario&recurso=${encodeURIComponent(recurso)}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// Modo demonstração.
//
// Os acórdãos abaixo são FICTÍCIOS, escritos para exercitar o formato — não são
// decisões reais do TJES. Servem para ver a página funcionando antes de a chave
// existir. Os números de processo seguem o padrão CNJ mas não correspondem a
// processo nenhum.
//
// O formato replica o da API de verdade, incluindo `avisos` e `radicais`, que
// são justamente as partes que um mock preguiçoso esqueceria.
// ─────────────────────────────────────────────────────────────────────────────
const DEMO_ITENS = [
  {
    id: "00000000-0000-4000-8000-000000000001",
    numero: "5000000-11.2025.8.08.0000",
    data: "2025-11-04",
    magistrado: "DESEMBARGADOR EXEMPLO PRIMEIRO",
    camara: "1ª Câmara Criminal",
    assunto: "Habeas Corpus - Cabimento",
    resultado: "Concedida",
    ementa:
      "EMENTA FICTÍCIA — HABEAS CORPUS. TRÁFICO DE DROGAS. BUSCA DOMICILIAR SEM " +
      "MANDADO. AUSÊNCIA DE FUNDADAS RAZÕES ANTERIORES AO INGRESSO. NULIDADE DA " +
      "DILIGÊNCIA E DAS PROVAS DELA DERIVADAS. ORDEM CONCEDIDA.\n\n" +
      "1. O ingresso em domicílio sem mandado exige justa causa demonstrada por " +
      "elementos concretos anteriores à diligência, não bastando a alegação " +
      "genérica de atitude suspeita.\n" +
      "2. Não comprovada a existência de fundadas razões prévias, impõe-se o " +
      "reconhecimento da nulidade da busca domiciliar e o desentranhamento das " +
      "provas dela decorrentes.\n" +
      "3. Ordem concedida para trancar a ação penal.",
  },
  {
    id: "00000000-0000-4000-8000-000000000002",
    numero: "5000000-22.2025.8.08.0000",
    data: "2025-09-18",
    magistrado: "DESEMBARGADORA EXEMPLO SEGUNDA",
    camara: "2ª Câmara Criminal",
    assunto: "Habeas Corpus - Prisão Preventiva",
    resultado: "Não concedida",
    ementa:
      "EMENTA FICTÍCIA — HABEAS CORPUS. PRISÃO PREVENTIVA. NULIDADE DA BUSCA " +
      "DOMICILIAR ALEGADA. CONSENTIMENTO VÁLIDO DO MORADOR REGISTRADO EM " +
      "GRAVAÇÃO. SEGREGAÇÃO FUNDAMENTADA. ORDEM DENEGADA.\n\n" +
      "1. Havendo consentimento do morador documentado em gravação audiovisual, " +
      "não há falar em nulidade da diligência.\n" +
      "2. A custódia cautelar está fundamentada em elementos concretos.\n" +
      "3. Ordem denegada.",
  },
  {
    id: "00000000-0000-4000-8000-000000000003",
    numero: "5000000-33.2024.8.08.0000",
    data: "2024-06-27",
    magistrado: "DESEMBARGADOR EXEMPLO PRIMEIRO",
    camara: "1ª Câmara Criminal",
    assunto: "Habeas Corpus - Excesso de Prazo",
    resultado: "Concedida parcialmente",
    ementa:
      "EMENTA FICTÍCIA — HABEAS CORPUS. EXCESSO DE PRAZO NA FORMAÇÃO DA CULPA. " +
      "FEITO PARALISADO POR MAIS DE CENTO E OITENTA DIAS SEM CAUSA ATRIBUÍVEL À " +
      "DEFESA. ORDEM PARCIALMENTE CONCEDIDA.\n\n" +
      "1. A demora não decorreu da complexidade do feito nem de ato da defesa.\n" +
      "2. Substituição da preventiva por medidas cautelares diversas.",
  },
];

const DEMO_TEOR =
  "INTEIRO TEOR FICTÍCIO — este texto existe apenas para demonstrar o formato " +
  "do endpoint de detalhe.\n\nRELATÓRIO\n\nTrata-se de habeas corpus impetrado " +
  "em favor do paciente, no qual se alega a nulidade da busca domiciliar " +
  "realizada sem mandado judicial.\n\nVOTO\n\nA jurisprudência exige justa " +
  "causa prévia e demonstrável para o ingresso em domicílio. No caso, os " +
  "elementos anteriores à diligência não foram demonstrados.\n\nDISPOSITIVO\n\n" +
  "Ante o exposto, concede-se a ordem.";

function pausa(ms) { return new Promise((r) => setTimeout(r, ms)); }

async function demoBuscar(pedido) {
  await pausa(320);
  const termo = (pedido.q ?? "").toLowerCase();
  let itens = DEMO_ITENS;
  if (pedido.camara) itens = itens.filter((i) => i.camara === pedido.camara);
  if (pedido.magistrado) itens = itens.filter((i) => i.magistrado === pedido.magistrado);
  if (termo) {
    itens = itens.filter((i) => i.ementa.toLowerCase().includes(termo.split(/\s+/)[0]));
  }
  const avisos = [];
  // Reproduz o aviso que mais importa: filtrar pode afrouxar a pergunta, e
  // sem isso a lista cresce sem explicação.
  if (pedido.magistrado && termo.split(/\s+/).length > 1) {
    avisos.push({ tipo: "conceitos_relaxados", casaram: 1, de: 2 });
  }
  const radicais = termo
    ? termo.split(/\s+/).filter((t) => t.length > 3).map((t) => t.slice(0, 6))
    : [];
  const pagina = pedido.pagina ?? 1;
  return {
    itens: pagina === 1 ? itens : [],
    pagina,
    tamanho: POR_PAGINA,
    tem_mais: false,
    avisos,
    radicais,
  };
}

async function demoAcordao(id) {
  await pausa(260);
  const i = DEMO_ITENS.find((x) => x.id === id);
  if (!i) throw new ErroApi("acórdão não encontrado", 404);
  return { ...i, inteiro_teor: DEMO_TEOR };
}

async function demoVocabulario() {
  await pausa(120);
  return {
    camara: ["1ª Câmara Criminal", "2ª Câmara Criminal"],
    magistrado: [...new Set(DEMO_ITENS.map((i) => i.magistrado))].sort(),
    assunto: [...new Set(DEMO_ITENS.map((i) => i.assunto))].sort(),
    comarca: [
      { id: "vitoria", nome: "Vitória" },
      { id: "vila-velha", nome: "Vila Velha" },
      { id: "serra", nome: "Serra" },
    ],
  };
}
