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

/**
 * Onde o BFF está publicado.
 *
 * O padrão é relativo à página, que funciona quando os dois ficam lado a lado.
 * No portal da OAB dificilmente ficam: a página vai numa rota (`/jurisprudencia/`)
 * e o PHP em outra. Para apontar sem mexer em JavaScript, ponha no HTML:
 *
 *     <meta name="oabjus-bff" content="/servicos/jurisprudencia-bff.php">
 *
 * Aceita caminho absoluto do site ou URL inteira. Um caminho relativo com a
 * página numa subpasta é o erro clássico: `/jurisprudencia/bff/...` não existe,
 * e a página responde 404 em tudo sem dizer por quê.
 */
const BASE = document.querySelector('meta[name="oabjus-bff"]')?.content?.trim()
  || "bff/jurisprudencia.php";

/**
 * A página fala com o backend por padrão. `?demo=1` força os dados fictícios,
 * para ver a tela sem BFF publicado.
 *
 * Era o contrário enquanto a chave não existia: o padrão era demonstração e
 * `?demo=0` ligava o serviço. Com o BFF no ar, o padrão certo é o real —
 * senão o site publicado mostra acórdão inventado para quem não souber do
 * parâmetro.
 */
export const DEMO = new URLSearchParams(location.search).get("demo") === "1";

// A lista de recursos NÃO mora aqui. Ela vem de `vocabulario()` sem argumento,
// junto com os rótulos. Escrevê-la neste arquivo era ter o catálogo do acervo
// em dois lugares — e os dois já tinham divergido: aqui dizia "Agravo em
// Execução" e "Embargos Infringentes", o JurimetriaES diz "Agravo em Execução
// Penal" e "Embargos Infringentes e de Nulidade".

export const POR_PAGINA = 20;
export const PAGINA_MAX = 10;

export class ErroApi extends Error {
  constructor(mensagem, status, campo) {
    super(mensagem);
    this.status = status;
    this.campo = campo;
  }
}

/**
 * `rota` é a rota canônica — o que o BFF assina. `params` são os extras, que
 * viajam como parâmetros de verdade.
 *
 * Os dois foram separados porque juntá-los estava quebrado: `vocabulario&recurso=x`
 * ia inteiro dentro de `?rota=`, chegava ao BFF como uma rota só e caía na
 * allowlist dele. Só `busca` funcionava; vocabulário e recentes davam 400.
 */
async function chamar(rota, params = {}, opcoes = {}) {
  const q = Object.entries(params)
    .map(([k, v]) => `&${k}=${encodeURIComponent(v)}`).join("");
  let r;
  try {
    r = await fetch(`${BASE}?rota=${encodeURIComponent(rota)}${q}`, opcoes);
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
  return chamar("busca", {}, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(pedido),
  });
}

export async function acordao(id) {
  if (DEMO) return demoAcordao(id);
  return chamar(`acordao/${encodeURIComponent(id)}`);
}

/** Sem `recurso`, devolve só a lista de recursos — que é o que a página precisa
 *  antes de poder escolher um. Com ele, devolve o vocabulário daquele recurso
 *  (que também traz a lista, para a página não precisar de duas idas). */
export async function vocabulario(recurso) {
  if (DEMO) return demoVocabulario(recurso);
  return chamar("vocabulario", recurso ? { recurso } : {});
}

/** As últimas jurisprudências da janela que o SERVIDOR define. O intervalo de
 *  datas existe em /busca e NÃO existe aqui: a rota recusa `dataInicio` e
 *  `dataFim`, para a janela dos 7 dias não poder ser trocada em trânsito. */
export async function recentes(recurso, pagina = 1) {
  if (DEMO) return demoRecentes(recurso, pagina);
  // O recurso vai no CAMINHO porque a assinatura cobre a rota e não a query:
  // trocá-lo em trânsito serviria outra lista e gravaria o recurso errado no
  // log, que é a única trilha de auditoria que existe.
  return chamar(`recentes/${encodeURIComponent(recurso)}`, { pagina });
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
    inteiro_teor:
      "ESTADO DO ESPÍRITO SANTO\nPODER JUDICIÁRIO\n\n\n\nTRIBUNAL DE JUSTIÇA\n" +
      "PROCESSO Nº 5000000-11.2025.8.08.0000\n\n\n" +
      "EMENTA FICTÍCIA — HABEAS CORPUS. TRÁFICO DE DROGAS. BUSCA DOMICILIAR SEM " +
      "MANDADO. AUSÊNCIA DE FUNDADAS RAZÕES ANTERIORES AO INGRESSO. NULIDADE DA " +
      "DILIGÊNCIA E DAS PROVAS DELA DERIVADAS. ORDEM CONCEDIDA.\n\n" +
      "1. O ingresso em domicílio sem mandado exige justa causa demonstrada por " +
      "elementos concretos anteriores à diligência, não bastando a alegação " +
      "genérica de atitude suspeita.\n" +
      "2. Não comprovada a existência de fundadas razões prévias, impõe-se o " +
      "reconhecimento da nulidade da busca domiciliar e o desentranhamento das " +
      "provas dela decorrentes.\n" +
      "3. Ordem concedida para trancar a ação penal.\n\n" +
      "RELATÓRIO\n\nTrata-se de habeas corpus impetrado em favor do paciente, " +
      "no qual se alega a nulidade da busca domiciliar realizada sem mandado " +
      "judicial.\n\nVOTO\n\nA jurisprudência exige justa causa prévia e " +
      "demonstrável para o ingresso em domicílio. No caso, os elementos " +
      "anteriores à diligência não foram demonstrados.\n\nDISPOSITIVO\n\n" +
      "Ante o exposto, concede-se a ordem.",
  },
  {
    id: "00000000-0000-4000-8000-000000000002",
    numero: "5000000-22.2025.8.08.0000",
    data: "2025-09-18",
    magistrado: "DESEMBARGADORA EXEMPLO SEGUNDA",
    camara: "2ª Câmara Criminal",
    assunto: "Habeas Corpus - Prisão Preventiva",
    resultado: "Não concedida",
    inteiro_teor:
      "ESTADO DO ESPÍRITO SANTO\nPODER JUDICIÁRIO\n\n\n\nTRIBUNAL DE JUSTIÇA\n" +
      "PROCESSO Nº 5000000-22.2025.8.08.0000\n\n\n" +
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
    inteiro_teor:
      "ESTADO DO ESPÍRITO SANTO\nPODER JUDICIÁRIO\n\n\n\nTRIBUNAL DE JUSTIÇA\n" +
      "PROCESSO Nº 5000000-33.2024.8.08.0000\n\n\n" +
      "EMENTA FICTÍCIA — HABEAS CORPUS. EXCESSO DE PRAZO NA FORMAÇÃO DA CULPA. " +
      "FEITO PARALISADO POR MAIS DE CENTO E OITENTA DIAS SEM CAUSA ATRIBUÍVEL À " +
      "DEFESA. ORDEM PARCIALMENTE CONCEDIDA.\n\n" +
      "1. A demora não decorreu da complexidade do feito nem de ato da defesa.\n" +
      "2. Substituição da preventiva por medidas cautelares diversas.",
  },
];

function pausa(ms) { return new Promise((r) => setTimeout(r, ms)); }

async function demoBuscar(pedido) {
  await pausa(320);
  const termo = (pedido.q ?? "").toLowerCase();
  let itens = DEMO_ITENS;
  if (pedido.camara) itens = itens.filter((i) => i.camara === pedido.camara);
  if (pedido.magistrado) itens = itens.filter((i) => i.magistrado === pedido.magistrado);
  // O período com as duas pontas inclusivas, como no motor. Comparação de
  // string basta porque as datas são ISO — é a mesma ordem.
  if (pedido.dataInicio) itens = itens.filter((i) => i.data >= pedido.dataInicio);
  if (pedido.dataFim) itens = itens.filter((i) => i.data <= pedido.dataFim);
  if (termo) {
    itens = itens.filter((i) => i.inteiro_teor.toLowerCase().includes(termo.split(/\s+/)[0]));
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
  // `recurso_rotulo` acompanha o acórdão de verdade: a página do acórdão lê o
  // rótulo da resposta, não de uma lista escrita nela.
  return { ...i, recurso: "habeas_corpus", recurso_rotulo: "Habeas Corpus" };
}

async function demoRecentes(recurso, pagina) {
  await pausa(280);
  // embargos_infringentes é o caso real que a medição achou: zero acórdãos na
  // janela de 7 dias, porque o acervo desse recurso pára quase um mês atrás.
  // A demonstração reproduz isso de propósito — é o estado que a página
  // precisa saber desenhar.
  const vazio = recurso === "embargos_infringentes";
  const desde = new Date(Date.now() - 7 * 864e5).toISOString().slice(0, 10);
  return {
    itens: vazio || pagina > 1 ? [] : DEMO_ITENS,
    pagina, tamanho: POR_PAGINA, tem_mais: false, desde, dias: 7,
  };
}

const DEMO_RECURSOS = [
  { id: "habeas_corpus", rotulo: "Habeas Corpus" },
  { id: "apelacao_criminal", rotulo: "Apelação Criminal" },
  { id: "agravo_execucao", rotulo: "Agravo em Execução Penal" },
  { id: "recurso_sentido_estrito", rotulo: "Recurso em Sentido Estrito" },
  { id: "revisao_criminal", rotulo: "Revisão Criminal" },
  { id: "embargos_infringentes", rotulo: "Embargos Infringentes e de Nulidade" },
];

async function demoVocabulario(recurso) {
  await pausa(120);
  if (!recurso) return { recursos: DEMO_RECURSOS };
  return {
    recursos: DEMO_RECURSOS,
    camara: ["1ª Câmara Criminal", "2ª Câmara Criminal"],
    // Mesmo formato da API: nome + a câmara de que ele é TITULAR. Vem do
    // cadastro da composição vigente, não de onde o nome aparece nos acórdãos.
    // O terceiro é `null` de propósito — é o substituto/convocado, o caso que
    // hoje não existe no acervo e que o seletor precisa saber desenhar.
    magistrado: [
      { nome: "DESEMBARGADOR EXEMPLO PRIMEIRO", camara: "1ª Câmara Criminal" },
      { nome: "DESEMBARGADORA EXEMPLO SEGUNDA", camara: "2ª Câmara Criminal" },
      { nome: "DESEMBARGADOR EXEMPLO CONVOCADO", camara: null },
    ],
    assunto: [...new Set(DEMO_ITENS.map((i) => i.assunto))].sort(),
    comarca: [
      { id: "vitoria", nome: "Vitória" },
      { id: "vila-velha", nome: "Vila Velha" },
      { id: "serra", nome: "Serra" },
    ],
    // As bordas do calendário. Na API de verdade vêm do acórdão mais antigo e
    // do mais novo do recurso escolhido; aqui, dos próprios itens fictícios.
    periodo: {
      min: DEMO_ITENS.map((i) => i.data).sort()[0],
      max: DEMO_ITENS.map((i) => i.data).sort().at(-1),
    },
  };
}
