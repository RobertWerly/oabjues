// ============================================================================
// ARQUIVO GERADO — não edite aqui.
//
// É o relay `oab-api` (a API de jurisprudência) empacotado para rodar na
// Vercel. A fonte é o repositório brainrotjuri:
//
//     supabase/functions/oab-api/index.ts
//     supabase/functions/_shared/oabApi/*
//     supabase/functions/_shared/busca/*
//
// POR QUE ELE EXISTE AQUI
//
// O lugar do relay é a edge function do Supabase, e é lá que ele vai ficar. Só
// que o deploy daquele projeto depende do agente do Lovable, que depende de
// crédito na workspace — quando o crédito acaba, a API congela na última
// versão publicada. Este arquivo existe para o deploy não depender disso: a
// Vercel publica por push, que é coisa que se controla.
//
// O QUE NÃO MUDA
//
// O código que decide é o mesmo: mesma allowlist de entrada, mesma projeção de
// saída, mesmo teto de 200, mesma verificação de HMAC. O que muda é quem
// serve. Trocar de volta é uma variável de ambiente: aponte OABJUS_URL para a
// edge function outra vez.
//
// VARIÁVEIS (Vercel › Settings › Environment Variables)
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, OAB_API_CHAVES
//
// O endereço público é /api/oab-api/<rota>, e o vercel.json reescreve para cá.
// A assinatura cobre o caminho depois de `oab-api`, então a base assinada aqui
// sai idêntica à do Supabase.
//
// Reescrita nomeada, e não rota dinâmica de arquivo: medido, com
// [[...rota]].mjs a Vercel casava /api/oab-api/busca e devolvia NOT_FOUND em
// /api/oab-api/recentes/habeas_corpus — metade das rotas fora do ar.
// ============================================================================

var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// supabase/functions/_shared/oabApi/postgrest.ts
function criarCliente(url, chaveServico) {
  const base = (url ?? "").replace(/\/+$/, "");
  const cabecalhos = {
    "content-type": "application/json",
    apikey: chaveServico,
    authorization: `Bearer ${chaveServico}`
  };
  async function chamar(caminho, corpo, extras = {}) {
    try {
      const r = await fetch(`${base}${caminho}`, {
        method: "POST",
        headers: { ...cabecalhos, ...extras },
        body: JSON.stringify(corpo ?? {})
      });
      if (!r.ok) {
        return { data: null, error: { status: r.status, corpo: await r.text() } };
      }
      const texto2 = await r.text();
      return { data: texto2 ? JSON.parse(texto2) : null, error: null };
    } catch (e) {
      return { data: null, error: e };
    }
  }
  return {
    rpc: (nome, argumentos) => chamar(`/rest/v1/rpc/${nome}`, argumentos ?? {}),
    from: (tabela) => ({
      insert: (linha) => chamar(`/rest/v1/${tabela}`, linha, { prefer: "return=minimal" })
    })
  };
}
var init_postgrest = __esm({
  "supabase/functions/_shared/oabApi/postgrest.ts"() {
    "use strict";
  }
});

// supabase/functions/_shared/busca/plano.ts
function hashPlano(conceitos, unico, numero) {
  const chave = conceitos.map((c) => {
    const termos = c.termos.slice().sort().join("+");
    const formas = c.realizacoes.map((r) => r.formas.map((f) => f.slice().sort().join(",")).join(";")).sort().join("/");
    return `${termos}#${formas}`;
  }).sort().join("|");
  const comFrase = unico ? `${chave}!${unico.termos.join("+")}#${unico.realizacoes[0]?.formas.map((f) => f.slice().sort().join(",")).join(";") ?? ""}` : chave;
  const comNumero = numero ? `${comFrase}@${numero}` : comFrase;
  let h = 2166136261;
  for (let i = 0; i < comNumero.length; i++) {
    h ^= comNumero.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h.toString(16).padStart(8, "0");
}
var LIMITES;
var init_plano = __esm({
  "supabase/functions/_shared/busca/plano.ts"() {
    "use strict";
    LIMITES = {
      /** conceitos por pergunta */
      conceitos: 12,
      /** realizações por conceito */
      realizacoes: 16,
      /** caracteres da pergunta */
      caracteres: 2e3,
      /** termos de conteúdo por conceito antes de gerar só as formas principais */
      termosParaFormasCompletas: 4
    };
  }
});

// supabase/functions/_shared/busca/normalizar.ts
function corrigirTypos(texto2) {
  let v = texto2;
  for (const [re, para] of TYPOS) v = v.replace(re, para);
  return v;
}
function semAcento(texto2) {
  return texto2.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}
function normalizar(texto2) {
  return semAcento(corrigirTypos(texto2 ?? "")).replace(/[^a-z0-9]+/g, " ").trim().replace(/\s+/g, " ");
}
function limitarTamanho(texto2) {
  if (texto2.length <= LIMITES.caracteres) return { texto: texto2, truncou: false };
  return { texto: texto2.slice(0, LIMITES.caracteres), truncou: true };
}
function ehConteudo(token) {
  if (VAZIAS.has(token)) return false;
  if (token.length >= 3) return true;
  return SIGLAS.has(token) || /^\d+$/.test(token);
}
var TYPOS, LIGADORES, VAZIAS, SIGLAS;
var init_normalizar = __esm({
  "supabase/functions/_shared/busca/normalizar.ts"() {
    "use strict";
    init_plano();
    TYPOS = [
      [/\bnuilidades\b/gi, "nulidades"],
      [/\bnuilidade\b/gi, "nulidade"],
      [/\bnulidae\b/gi, "nulidade"],
      [/\bnuldiade\b/gi, "nulidade"],
      [/\bhomoafectiv([oa]s?)\b/gi, "homoafetiv$1"],
      [/\b(h+i+micidio|hh?micidio)\b/gi, "homicidio"],
      [/\bvuneravel\b/gi, "vulneravel"],
      [/\bprizao\b/gi, "prisao"],
      [/\bilegau\b/gi, "ilegal"]
    ];
    LIGADORES = /* @__PURE__ */ new Set(["de", "da", "do", "das", "dos"]);
    VAZIAS = /* @__PURE__ */ new Set([
      "de",
      "da",
      "do",
      "das",
      "dos",
      "e",
      "a",
      "o",
      "as",
      "os",
      "em",
      "no",
      "na",
      "nos",
      "nas",
      "por",
      "para",
      "com",
      "que"
    ]);
    SIGLAS = /* @__PURE__ */ new Set(["hc", "mp", "re", "ap", "tj", "rese", "pad", "cp", "cpp", "lep"]);
  }
});

// supabase/functions/_shared/busca/numeroProcesso.ts
function numeroDeProcesso(bruto) {
  if (!bruto) return null;
  for (const achado of bruto.matchAll(PADRAO)) {
    const digitos = achado[0].replace(/\D/g, "");
    if (digitos.length >= 7 && digitos.length <= DIGITOS_CNJ) return digitos;
  }
  return null;
}
function semONumero(bruto) {
  return bruto.replace(PADRAO, " ").replace(/\s+/g, " ").trim();
}
var DIGITOS_CNJ, PADRAO;
var init_numeroProcesso = __esm({
  "supabase/functions/_shared/busca/numeroProcesso.ts"() {
    "use strict";
    DIGITOS_CNJ = 20;
    PADRAO = /(?<!\d)\d{7}[-.\d]*/g;
  }
});

// supabase/functions/_shared/busca/segmentar.ts
function segmentar(texto2, catalogo = CATALOGO_VAZIO) {
  const norm = normalizar(texto2);
  if (!norm) return [];
  const palavras = norm.split(" ");
  const usada = new Array(palavras.length).fill(false);
  const out = [];
  for (let n = Math.min(5, palavras.length); n >= 2; n--) {
    for (let i2 = 0; i2 + n <= palavras.length; i2++) {
      if (usada.slice(i2, i2 + n).some(Boolean)) continue;
      const frase = palavras.slice(i2, i2 + n).join(" ");
      if (!catalogo.frases.has(frase)) continue;
      out.push({ termos: palavras.slice(i2, i2 + n).filter(ehConteudo), origem: "catalogo" });
      for (let k = i2; k < i2 + n; k++) usada[k] = true;
    }
  }
  let i = 0;
  while (i < palavras.length) {
    if (usada[i] || !ehConteudo(palavras[i])) {
      i++;
      continue;
    }
    let fim = i;
    while (fim + 2 < palavras.length && !usada[fim + 1] && !usada[fim + 2] && LIGADORES.has(palavras[fim + 1]) && ehConteudo(palavras[fim + 2])) fim += 2;
    if (fim > i) {
      if (fim + 1 < palavras.length && !usada[fim + 1] && ehConteudo(palavras[fim + 1]) && catalogo.colocacoes.has(`${palavras[fim]} ${palavras[fim + 1]}`)) fim += 1;
      out.push({
        termos: palavras.slice(i, fim + 1).filter(ehConteudo),
        origem: "preposicional"
      });
      for (let k = i; k <= fim; k++) usada[k] = true;
      i = fim + 1;
      continue;
    }
    i++;
  }
  for (let j = 0; j + 1 < palavras.length; j++) {
    if (usada[j] || usada[j + 1]) continue;
    if (!ehConteudo(palavras[j]) || !ehConteudo(palavras[j + 1])) continue;
    if (!catalogo.colocacoes.has(`${palavras[j]} ${palavras[j + 1]}`)) continue;
    out.push({ termos: [palavras[j], palavras[j + 1]], origem: "colocacao" });
    usada[j] = usada[j + 1] = true;
  }
  for (let k = 0; k < palavras.length; k++) {
    if (usada[k] || !ehConteudo(palavras[k])) continue;
    out.push({ termos: [palavras[k]], origem: "sobra" });
    usada[k] = true;
  }
  return out.filter((c) => c.termos.length > 0);
}
function comoConceito(b) {
  return { termos: b.termos, realizacoes: [], peso: 0, origem: b.origem };
}
var CATALOGO_VAZIO;
var init_segmentar = __esm({
  "supabase/functions/_shared/busca/segmentar.ts"() {
    "use strict";
    init_normalizar();
    CATALOGO_VAZIO = { frases: /* @__PURE__ */ new Set(), colocacoes: /* @__PURE__ */ new Set() };
  }
});

// supabase/functions/_shared/busca/morfologia.ts
function plurais(p) {
  const irr = IRREGULARES.get(p);
  if (irr) return irr.slice();
  if (p.length < 3) return [];
  if (p.endsWith("ao")) {
    const raiz = p.slice(0, -2);
    return [`${raiz}oes`, `${raiz}aos`, `${raiz}aes`];
  }
  if (p.endsWith("m")) return [`${p.slice(0, -1)}ns`];
  if (p.endsWith("l")) {
    const raiz = p.slice(0, -1);
    return p.endsWith("il") ? [`${p.slice(0, -2)}is`] : [`${raiz}is`];
  }
  if (/[rz]$/.test(p)) return [`${p}es`];
  if (p.endsWith("s")) return [p];
  return [`${p}s`];
}
function singulares(p) {
  if (p.length < 4) return [];
  const fora = [];
  if (p.endsWith("oes")) fora.push(`${p.slice(0, -3)}ao`);
  if (p.endsWith("aes")) fora.push(`${p.slice(0, -3)}ao`);
  if (p.endsWith("aos")) fora.push(`${p.slice(0, -3)}ao`);
  if (p.endsWith("ns")) fora.push(`${p.slice(0, -2)}m`);
  if (p.endsWith("eis")) fora.push(`${p.slice(0, -3)}el`);
  if (p.endsWith("ais")) fora.push(`${p.slice(0, -3)}al`);
  if (p.endsWith("is") && !p.endsWith("ais") && !p.endsWith("eis")) fora.push(`${p.slice(0, -2)}il`);
  if (p.endsWith("zes")) fora.push(p.slice(0, -2));
  if (p.endsWith("res")) fora.push(p.slice(0, -2));
  if (p.endsWith("s") && fora.length === 0) fora.push(p.slice(0, -1));
  return fora.filter((x) => x.length >= 3);
}
function formasDe(termo, sinonimos) {
  const set = /* @__PURE__ */ new Set();
  for (const palavra of [termo, ...sinonimos?.get(termo) ?? []]) {
    set.add(palavra);
    for (const f of plurais(palavra)) set.add(f);
    for (const f of singulares(palavra)) set.add(f);
  }
  return [...set];
}
var IRREGULARES;
var init_morfologia = __esm({
  "supabase/functions/_shared/busca/morfologia.ts"() {
    "use strict";
    IRREGULARES = /* @__PURE__ */ new Map([
      ["mao", ["maos"]],
      ["pao", ["paes"]],
      ["alemao", ["alemaes"]],
      ["cidadao", ["cidadaos"]],
      // "réu" flexiona em "réus" e no feminino "ré" — e o feminino NÃO entra.
      //
      // Não é esquecimento: é que depois de tirar o acento "ré" vira `re`, duas
      // letras, e `re` não é a palavra — é a abreviação de Recurso Extraordinário,
      // que é o que o acervo escreve. Medido: o lexema `re` está em 2.026 acórdãos;
      // lidos 60 deles, 43 são "RE 603.616/RO" e parentes, 16 são a ré de verdade.
      // Três de cada quatro casamentos seriam de uma sigla do STF.
      //
      // E o estrago não parava no recorte. O destaque casa por PREFIXO do lexema,
      // que é como o stem do Postgres alcança a flexão — com um lexema de duas
      // letras isso vira "toda palavra que começa com re". Medido no topo de
      // "excesso de prazo na formação da culpa em réu preso", em produção:
      // "redesignações", "residência", "reiteração", "requerendo", "revogação",
      // "recebimento", "resposta" — 13 das 177 marcas do topo das 15 buscas.
      ["reu", ["reus"]],
      ["juiz", ["juizes"]]
    ]);
  }
});

// supabase/functions/_shared/busca/realizacoes.ts
function df(termos, freq) {
  let min = Number.POSITIVE_INFINITY;
  for (const t of termos) {
    const v = freq.get(t);
    if (v != null && v < min) min = v;
  }
  return Number.isFinite(min) ? min : 0;
}
function gerarRealizacoes(termos, freq, avisos = [], sinonimos) {
  const formas = (t) => formasDe(t, sinonimos);
  const n = termos.length;
  if (n === 0) return [];
  if (n === 1) return [{ termos: [termos[0]], formas: [formas(termos[0])], folga: 0, especificidade: 1, df: df(termos, freq) }];
  const combos = [];
  const completo = termos.slice();
  if (n <= LIMITES.termosParaFormasCompletas) {
    for (let mask = 1; mask < 1 << n; mask++) {
      const sub = termos.filter((_, i) => mask >> i & 1);
      if (sub.length >= 2) combos.push(sub);
    }
  } else {
    combos.push(completo);
    for (let i = 0; i + 1 < n; i++) combos.push([termos[i], termos[i + 1]]);
    const doisMaisRaros = termos.slice().sort((a, b) => (freq.get(a) ?? 0) - (freq.get(b) ?? 0)).slice(0, 2);
    const naOrdem = termos.filter((t) => doisMaisRaros.includes(t));
    if (naOrdem.length === 2) combos.push(naOrdem);
  }
  const vistos = /* @__PURE__ */ new Set();
  const saida = [];
  for (const sub of combos) {
    const chave = sub.join("+");
    if (vistos.has(chave)) continue;
    vistos.add(chave);
    saida.push({
      termos: sub,
      formas: sub.map(formas),
      folga: sub.length > 1 ? FOLGA : 0,
      especificidade: sub.length / n,
      df: df(sub, freq)
    });
  }
  for (const t of termos) {
    if (vistos.has(t)) continue;
    vistos.add(t);
    saida.push({ termos: [t], formas: [formas(t)], folga: 0, especificidade: 1 / n, df: df([t], freq) });
  }
  saida.sort((a, b) => b.especificidade - a.especificidade || a.df - b.df);
  if (saida.length > LIMITES.realizacoes) {
    avisos.push({ tipo: "truncou_realizacoes", conceito: termos.join(" "), limite: LIMITES.realizacoes });
    return saida.slice(0, LIMITES.realizacoes);
  }
  return saida;
}
function discriminancia(df2, acervo) {
  if (acervo <= 0) return 1;
  if (df2 <= 0) return 1;
  const p = Math.min(df2 / acervo, 1);
  return Math.max(0, Math.min(1, Math.log(1 / p) / Math.log(acervo)));
}
function pesoConceito(termos, freq, acervo) {
  return discriminancia(df(termos, freq), acervo);
}
var FOLGA;
var init_realizacoes = __esm({
  "supabase/functions/_shared/busca/realizacoes.ts"() {
    "use strict";
    init_plano();
    init_morfologia();
    FOLGA = 2;
  }
});

// supabase/functions/_shared/busca/planejar.ts
function temOperadores(bruto) {
  return /["/,]/.test(bruto) || /(^|\s)-\S/.test(bruto);
}
function ordenarCanonicamente(cs) {
  return cs.slice().sort(
    (a, b) => b.peso - a.peso || a.termos.join("+").localeCompare(b.termos.join("+"))
  );
}
function planejar(entrada, ctx = {}) {
  const catalogo = ctx.catalogo ?? CATALOGO_VAZIO;
  const frequencias = ctx.frequencias ?? /* @__PURE__ */ new Map();
  const acervo = ctx.acervo ?? 0;
  const sinonimos = ctx.sinonimos ?? SEM_SINONIMOS;
  const avisos = [];
  const origem = entrada ?? "";
  const { texto: cortado, truncou } = limitarTamanho(origem);
  if (truncou) avisos.push({ tipo: "query_truncada", limite: LIMITES.caracteres });
  const numeroProcesso = numeroDeProcesso(cortado) ?? void 0;
  const semNumero = numeroProcesso ? semONumero(cortado) : cortado;
  const normalizado = normalizar(semNumero);
  let conceitos = segmentar(semNumero, catalogo).map((b) => {
    const c = comoConceito(b);
    c.realizacoes = gerarRealizacoes(c.termos, frequencias, avisos, sinonimos);
    c.peso = pesoConceito(c.termos, frequencias, acervo);
    return c;
  });
  if (conceitos.length > LIMITES.conceitos) {
    const ordenados = conceitos.slice().sort((a, b) => b.peso - a.peso);
    avisos.push({
      tipo: "truncou_conceitos",
      limite: LIMITES.conceitos,
      descartados: conceitos.length - LIMITES.conceitos
    });
    conceitos = ordenados.slice(0, LIMITES.conceitos);
  }
  for (const c of conceitos) {
    for (const t of c.termos) {
      if (!frequencias.has(t)) avisos.push({ tipo: "termo_sem_indice", termo: t });
    }
  }
  const termosNaOrdem = normalizado.split(" ").filter(ehConteudo);
  const conceitoUnico = conceitos.length > 1 && termosNaOrdem.length >= 2 && termosNaOrdem.length <= LIMITES.conceitos && !temOperadores(semNumero) ? {
    termos: termosNaOrdem,
    realizacoes: gerarRealizacoes(termosNaOrdem, frequencias, [], sinonimos),
    peso: pesoConceito(termosNaOrdem, frequencias, acervo),
    origem: "catalogo"
  } : void 0;
  const canonicos = ordenarCanonicamente(conceitos);
  return {
    versao: 2,
    origem,
    normalizado,
    hash: hashPlano(canonicos, conceitoUnico, numeroProcesso),
    conceitos: canonicos,
    ...conceitoUnico ? { conceitoUnico } : {},
    ...numeroProcesso ? { numeroProcesso } : {},
    avisos
  };
}
var SEM_SINONIMOS;
var init_planejar = __esm({
  "supabase/functions/_shared/busca/planejar.ts"() {
    "use strict";
    init_normalizar();
    init_numeroProcesso();
    init_segmentar();
    init_realizacoes();
    init_plano();
    SEM_SINONIMOS = /* @__PURE__ */ new Map();
  }
});

// supabase/functions/_shared/busca/catalogo.ts
function interpretar(bruto) {
  const p = bruto ?? {};
  const lista = (v) => Array.isArray(v) ? v.filter((x) => typeof x === "string") : [];
  const frequencias = /* @__PURE__ */ new Map();
  const fr = p.frequencias;
  if (fr && typeof fr === "object") {
    for (const [k, v] of Object.entries(fr)) {
      const n = Number(v);
      if (Number.isFinite(n) && n > 0) frequencias.set(k, n);
    }
  }
  const sinonimos = /* @__PURE__ */ new Map();
  const sin = p.sinonimos;
  if (sin && typeof sin === "object") {
    for (const [termo, irmaos] of Object.entries(sin)) {
      if (!termo) continue;
      const limpos = lista(irmaos).filter((x) => x.length > 1);
      if (limpos.length) sinonimos.set(termo, limpos);
    }
  }
  const acervo = Number(p.acervo);
  return {
    catalogo: {
      frases: new Set(lista(p.frases)),
      colocacoes: new Set(lista(p.colocacoes))
    },
    frequencias,
    acervo: Number.isFinite(acervo) ? acervo : 0,
    sinonimos,
    degradado: false
  };
}
async function carregarCatalogo(rpc, agora = Date.now()) {
  if (cache && agora - cache.em < TTL_MS) return cache.valor;
  if (emVoo) return emVoo;
  emVoo = (async () => {
    try {
      const { data, error } = await rpc("oab_busca_catalogo");
      if (error) return CATALOGO_AUSENTE;
      const lido = interpretar(data);
      cache = { valor: lido, em: agora };
      return lido;
    } catch {
      return CATALOGO_AUSENTE;
    } finally {
      emVoo = null;
    }
  })();
  return emVoo;
}
var CATALOGO_AUSENTE, TTL_MS, cache, emVoo;
var init_catalogo = __esm({
  "supabase/functions/_shared/busca/catalogo.ts"() {
    "use strict";
    CATALOGO_AUSENTE = {
      catalogo: { frases: /* @__PURE__ */ new Set(), colocacoes: /* @__PURE__ */ new Set() },
      frequencias: /* @__PURE__ */ new Map(),
      acervo: 0,
      sinonimos: /* @__PURE__ */ new Map(),
      degradado: true
    };
    TTL_MS = 10 * 6e4;
    cache = null;
    emVoo = null;
  }
});

// supabase/functions/_shared/oabApi/contrato.ts
function texto(v, campo) {
  if (typeof v !== "string") throw new ErroContrato(campo, `${campo} deve ser texto`);
  const t = v.trim();
  if (!t) throw new ErroContrato(campo, `${campo} n\xE3o pode ser vazio`);
  if (t.length > 200) throw new ErroContrato(campo, `${campo} passa de 200 caracteres`);
  return t;
}
function validarPedido(corpo, opcoes = {}) {
  const conhecidas = new Set(opcoes.aceita ?? CHAVES_BUSCA);
  for (const chave of Object.keys(corpo ?? {})) {
    if (conhecidas.has(chave)) continue;
    const motivo = RECUSADAS[chave];
    throw new ErroContrato(
      chave,
      motivo ? `'${chave}' n\xE3o \xE9 aceito: ${motivo}` : `'${chave}' n\xE3o \xE9 um filtro desta API`
    );
  }
  if (corpo.recurso === void 0) {
    throw new ErroContrato("recurso", `'recurso' \xE9 obrigat\xF3rio: ${RECURSOS.join(", ")}`);
  }
  const recurso = texto(corpo.recurso, "recurso");
  if (!RECURSOS.includes(recurso)) {
    throw new ErroContrato("recurso", `recurso desconhecido: ${RECURSOS.join(", ")}`);
  }
  const q = corpo.q === void 0 || corpo.q === null ? "" : texto(corpo.q, "q");
  let pagina = 1;
  if (corpo.pagina !== void 0) {
    const n = Number(corpo.pagina);
    if (!Number.isInteger(n) || n < 1) {
      throw new ErroContrato("pagina", "pagina deve ser inteiro \u2265 1");
    }
    if (n > PAGINA_MAX) {
      throw new ErroContrato(
        "pagina",
        opcoes.msgTeto ?? `o teto \xE9 ${PAGINA_MAX} p\xE1ginas (${PAGINA_MAX * POR_PAGINA} resultados); refine a busca`
      );
    }
    pagina = n;
  }
  const filtros = { tipo_acao: recurso };
  for (const [deles, nosso] of Object.entries(TRADUCAO)) {
    if (!conhecidas.has(deles)) continue;
    const v = corpo[deles];
    if (v === void 0 || v === null) continue;
    filtros[nosso] = texto(v, deles);
  }
  return { recurso, q, filtros, pagina, offset: (pagina - 1) * POR_PAGINA };
}
function paraMotor(v) {
  const f = { ...v.filtros };
  if (typeof f.comarcas === "string") f.comarcas = [f.comarcas];
  return f;
}
function projetarItem(bruto) {
  if (!bruto || typeof bruto !== "object") return null;
  const i = bruto;
  const s = (v) => typeof v === "string" && v !== "" ? v : null;
  const id = s(i.id);
  if (!id) return null;
  return {
    id,
    numero: s(i.numero_processo),
    data: s(i.data_julgamento),
    magistrado: s(i.magistrado),
    camara: s(i.orgao_julgador),
    // O assunto CANÔNICO, com o campo cru como reserva.
    //
    // É o mesmo valor que o vocabulário oferece no filtro, e é o que o
    // aplicativo mostra. Servir o cru aqui deixava a tela incoerente: o
    // advogado filtrava por "Tráfico de drogas", o cartão respondia
    // "Constrangimento ilegal", e o mesmo acórdão aparecia com um assunto no
    // JurimetriaES e outro no site da OAB.
    //
    // A reserva existe para 3 dos 8.235 acórdãos de habeas corpus, que não têm
    // canônico. Sem ela o cartão ficaria com o campo vazio.
    assunto: s(i.assunto_canonico) ?? s(i.assunto),
    resultado: s(i.resultado),
    // `ementa` do motor NÃO sai. Em 93% dos entregáveis ela não é a ementa do
    // tribunal, e sim um documento montado que abre em "IDENTIFICAÇÃO" e
    // termina em "DISPOSITIVOS RELEVANTES / JURISPRUDÊNCIA CITADA" — resumo do
    // inteiro teor, que o contrato veta. O texto sai por `inteiro_teor`.
    inteiro_teor: null
  };
}
function anexarTeores(itens, mapa) {
  const m = mapa && typeof mapa === "object" ? mapa : {};
  for (const item of itens) {
    const v = m[item.id];
    item.inteiro_teor = typeof v === "string" && v !== "" ? v : null;
  }
  return itens;
}
function projetarAvisos(bruto) {
  return Array.isArray(bruto) ? bruto : [];
}
function projetarRadicais(bruto) {
  return Array.isArray(bruto) ? bruto : [];
}
function janelaRecentes(agora = Date.now()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date(agora - DIAS_RECENTES * 864e5));
}
function janelaValida(d) {
  return /^\d{4}-\d{2}-\d{2}$/.test(d);
}
var RECURSOS, PAGINA_MAX, POR_PAGINA, ErroContrato, TRADUCAO, RECUSADAS, CHAVES_BUSCA, CHAVES_RECENTES, OPCOES_RECENTES, DIAS_RECENTES;
var init_contrato = __esm({
  "supabase/functions/_shared/oabApi/contrato.ts"() {
    "use strict";
    RECURSOS = [
      "habeas_corpus",
      "apelacao_criminal",
      "agravo_execucao",
      "recurso_sentido_estrito",
      "revisao_criminal",
      "embargos_infringentes"
    ];
    PAGINA_MAX = 10;
    POR_PAGINA = 20;
    ErroContrato = class extends Error {
      // Campo declarado e atribuído no corpo, e não como parameter property: a
      // forma abreviada não é apagável só com remoção de tipos, e este módulo
      // precisa rodar tanto no Deno da edge function quanto no Node dos testes.
      campo;
      constructor(campo, mensagem) {
        super(mensagem);
        this.name = "ErroContrato";
        this.campo = campo;
      }
    };
    TRADUCAO = {
      camara: "orgaoJulgador",
      assunto: "assunto",
      // SINGULAR: casa assunto_canonico OU assunto livre
      magistrado: "magistrado",
      // SINGULAR: normaliza caixa e acento
      comarca: "comarcas"
      // o motor só tem a forma array para comarca
    };
    RECUSADAS = {
      resultado: "desliga a trava de m\xE9rito no motor (medido: 'N\xE3o conhecido' devolve 1.329 ac\xF3rd\xE3os, todos n\xE3o-m\xE9rito)",
      classeResultado: "mesma trava que 'resultado'",
      incluirNaoConhecido: "traz n\xE3o-m\xE9rito para o recorte",
      incluirPrejudicado: "traz n\xE3o-m\xE9rito para o recorte",
      assuntos: "o array casa s\xF3 o assunto can\xF4nico e devolve 0; use 'assunto'",
      subAssunto: "o valor n\xE3o sobrevive \xE0 proje\xE7\xE3o, ent\xE3o o site nunca saberia disc\xE1-lo",
      subAssuntos: "idem",
      magistrados: "o array casa igualdade crua e devolve 0; use 'magistrado'",
      teses: "tese n\xE3o sai desta API",
      tiposPedido: "n\xE3o sai desta API",
      ordenacao: "a ordem \xE9 do servidor; o cliente n\xE3o escolhe",
      dataInicio: "a janela \xE9 fixada pelo servidor em /recentes; o cliente n\xE3o pede intervalo (medido: dataInicio='1900-01-01' devolveria o acervo inteiro, 8.235 em habeas corpus contra 118 na janela de 7 dias)",
      dataFim: "a janela \xE9 fixada pelo servidor; o cliente n\xE3o pede intervalo"
    };
    CHAVES_BUSCA = [...Object.keys(TRADUCAO), "recurso", "q", "pagina"];
    CHAVES_RECENTES = ["recurso", "pagina"];
    OPCOES_RECENTES = {
      aceita: CHAVES_RECENTES,
      msgTeto: "esta lista mostra as \xFAltimas 200; use a busca para ir al\xE9m"
    };
    DIAS_RECENTES = 7;
  }
});

// supabase/functions/_shared/oabApi/auth.ts
function hex(buf) {
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
async function sha256Hex(texto2) {
  return hex(await crypto.subtle.digest("SHA-256", enc.encode(texto2)));
}
async function assinar(segredo, base) {
  const k = await crypto.subtle.importKey(
    "raw",
    enc.encode(segredo),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  return hex(await crypto.subtle.sign("HMAC", k, enc.encode(base)));
}
function iguaisEmTempoConstante(a, b) {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}
function baseDaAssinatura(metodo, rota, ts, nonce, corpoHash) {
  return [metodo.toUpperCase(), rota, ts, nonce, corpoHash].join("\n");
}
function lerChaves(bruto) {
  const m = /* @__PURE__ */ new Map();
  for (const par of (bruto ?? "").split(",")) {
    const i = par.indexOf(":");
    if (i <= 0) continue;
    const id = par.slice(0, i).trim();
    const seg = par.slice(i + 1).trim();
    if (id && seg.length >= 32) m.set(id, seg);
  }
  return m;
}
async function autenticar(req, rota, corpo, chaves, consumirNonce, agora = Date.now()) {
  const chave = req.headers.get("x-oab-key") ?? "";
  const ts = req.headers.get("x-oab-timestamp") ?? "";
  const nonce = req.headers.get("x-oab-nonce") ?? "";
  const assinatura = (req.headers.get("x-oab-signature") ?? "").toLowerCase();
  if (!chave || !ts || !nonce || !assinatura) return { ok: false, motivo: "credencial ausente" };
  if (nonce.length < 16 || nonce.length > 128) return { ok: false, motivo: "nonce inv\xE1lido" };
  const segredo = chaves.get(chave);
  if (!segredo) return { ok: false, motivo: "assinatura inv\xE1lida" };
  const quando = Number(ts);
  if (!Number.isFinite(quando) || Math.abs(agora - quando) > JANELA_MS) {
    return { ok: false, motivo: "timestamp fora da janela de 5 minutos" };
  }
  const esperada = await assinar(
    segredo,
    baseDaAssinatura(req.method, rota, ts, nonce, await sha256Hex(corpo))
  );
  if (!iguaisEmTempoConstante(esperada, assinatura)) {
    return { ok: false, motivo: "assinatura inv\xE1lida" };
  }
  if (!await consumirNonce(chave, nonce)) return { ok: false, motivo: "nonce j\xE1 usado" };
  return { ok: true, id: { chave } };
}
var JANELA_MS, enc;
var init_auth = __esm({
  "supabase/functions/_shared/oabApi/auth.ts"() {
    "use strict";
    JANELA_MS = 5 * 6e4;
    enc = new TextEncoder();
  }
});

// supabase/functions/oab-api/index.ts
var oab_api_exports = {};
__export(oab_api_exports, {
  atender: () => atender
});
async function carregarAjustes(agora = Date.now()) {
  if (agora - ajustesEm < TTL_AJUSTES_MS) return;
  ajustesEm = agora;
  const { data, error } = await sb.rpc("oab_api_ajustes");
  if (error || !data || typeof data !== "object") return;
  const a = data;
  const doBanco = a.chaves && typeof a.chaves === "object" ? Object.entries(a.chaves).filter((par) => typeof par[1] === "string" && par[1].length >= 32) : [];
  CHAVES = new Map([...CHAVES_ENV, ...doBanco]);
  ORIGENS = typeof a.origens === "string" && a.origens.trim() !== "" ? a.origens.split(",").map((x) => x.trim()).filter(Boolean) : ORIGENS_ENV;
  const teto = Number(a.teto_docs_dia);
  TETO_DOCS_DIA = Number.isFinite(teto) && teto >= 0 ? teto : TETO_ENV;
}
function cors(origem) {
  const livre = ORIGENS.includes("*");
  const permitida = livre ? origem ?? "*" : origem && ORIGENS.includes(origem) ? origem : ORIGENS[0];
  return {
    "Access-Control-Allow-Origin": permitida,
    "Access-Control-Allow-Headers": "content-type, x-oab-key, x-oab-timestamp, x-oab-nonce, x-oab-signature",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Vary": "Origin"
  };
}
function json(corpo, status, origem) {
  return new Response(JSON.stringify(corpo), {
    status,
    headers: { ...cors(origem), "content-type": "application/json; charset=utf-8" }
  });
}
function erroDoMotor() {
  return { erro: "falha ao consultar o acervo" };
}
async function registrar(chave, rota, recurso, hash, ids, status, ms) {
  try {
    await sb.from("oab_api_log").insert({
      chave,
      rota,
      recurso,
      consulta_hash: hash,
      ids,
      status,
      duracao_ms: ms
    });
  } catch {
  }
}
async function comTeores(itens) {
  if (itens.length === 0) return itens;
  const { data, error } = await sb.rpc("oab_api_teores", { p_ids: itens.map((i) => i.id) });
  if (error) return null;
  return anexarTeores(itens, data);
}
function contagem(bruto) {
  const n = Number(bruto);
  if (!Number.isFinite(n) || n < 0) return {};
  const entregues = Math.min(n, PAGINA_MAX * POR_PAGINA);
  return { total: entregues, paginas: Math.ceil(entregues / POR_PAGINA) };
}
async function estourouTeto(chave) {
  if (TETO_DOCS_DIA <= 0) return false;
  const { data, error } = await sb.rpc("oab_api_documentos_hoje", { p_chave: chave });
  if (error) return false;
  return Number(data ?? 0) >= TETO_DOCS_DIA;
}
async function rotaBusca(corpo, chave, origem, t0) {
  let pedido;
  try {
    pedido = validarPedido(corpo ? JSON.parse(corpo) : {});
  } catch (e) {
    if (e instanceof ErroContrato) {
      return json({ erro: e.message, campo: e.campo }, 400, origem);
    }
    return json({ erro: "corpo inv\xE1lido: esperado JSON" }, 400, origem);
  }
  if (await estourouTeto(chave)) {
    return json(
      { erro: `teto de ${TETO_DOCS_DIA} ac\xF3rd\xE3os distintos por dia atingido` },
      429,
      origem
    );
  }
  const cat = await carregarCatalogo((nome) => sb.rpc(nome));
  const plano = pedido.q ? planejar(pedido.q, cat) : {};
  const { data, error } = await sb.rpc("oab_busca", {
    p_plano: plano,
    p_filtros: paraMotor(pedido),
    p_limit: POR_PAGINA + 1,
    p_offset: pedido.offset
  });
  const ms = Date.now() - t0;
  if (error) {
    await registrar(chave, "busca", pedido.recurso, null, [], 502, ms);
    return json(erroDoMotor(), 502, origem);
  }
  const linha = Array.isArray(data) ? data[0] : data;
  const brutos = Array.isArray(linha?.itens) ? linha.itens : [];
  const temMais = brutos.length > POR_PAGINA && pedido.pagina < PAGINA_MAX;
  const itens = await comTeores(
    brutos.slice(0, POR_PAGINA).map(projetarItem).filter((i) => i !== null)
  );
  if (itens === null) {
    await registrar(chave, "busca", pedido.recurso, null, [], 502, Date.now() - t0);
    return json(erroDoMotor(), 502, origem);
  }
  const hash = typeof plano.hash === "string" ? plano.hash : null;
  await registrar(chave, "busca", pedido.recurso, hash, itens.map((i) => i.id), 200, ms);
  return json({
    itens,
    pagina: pedido.pagina,
    tamanho: POR_PAGINA,
    tem_mais: temMais,
    ...contagem(linha?.total),
    // `facetas` fica de fora: são 12 breakdowns sobre o universo inteiro, entre
    // eles porMagistrado e porTese — perfil decisório e tese agregada.
    // `avisos` e `radicais` entram: o motor dizendo o que fez com a pergunta,
    // e os lexemas que ele usou para o grifo. Sem os avisos, filtrar pode
    // FAZER A LISTA CRESCER sem explicação (medido: 8 → 16 acórdãos).
    avisos: projetarAvisos(linha?.avisos),
    radicais: projetarRadicais(linha?.radicais)
  }, 200, origem);
}
async function rotaAcordao(id, chave, origem, t0) {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return json({ erro: "id inv\xE1lido" }, 400, origem);
  }
  if (await estourouTeto(chave)) {
    return json({ erro: `teto de ${TETO_DOCS_DIA} ac\xF3rd\xE3os distintos por dia atingido` }, 429, origem);
  }
  const { data, error } = await sb.rpc("oab_api_acordao", { p_id: id });
  const ms = Date.now() - t0;
  if (error) {
    await registrar(chave, "acordao", null, null, [], 502, ms);
    return json(erroDoMotor(), 502, origem);
  }
  if (!data) {
    await registrar(chave, "acordao", null, null, [], 404, ms);
    return json({ erro: "ac\xF3rd\xE3o n\xE3o encontrado" }, 404, origem);
  }
  await registrar(chave, "acordao", null, null, [id], 200, ms);
  return json(data, 200, origem);
}
async function rotaRecentes(recurso, pagina, chave, origem, t0) {
  let pedido;
  try {
    pedido = validarPedido(
      { recurso, ...pagina === null ? {} : { pagina: Number(pagina) } },
      OPCOES_RECENTES
    );
  } catch (e) {
    if (e instanceof ErroContrato) return json({ erro: e.message, campo: e.campo }, 400, origem);
    return json({ erro: "pedido inv\xE1lido" }, 400, origem);
  }
  if (await estourouTeto(chave)) {
    return json({ erro: `teto de ${TETO_DOCS_DIA} ac\xF3rd\xE3os distintos por dia atingido` }, 429, origem);
  }
  const desde = janelaRecentes();
  if (!janelaValida(desde)) {
    return json({ erro: "erro interno" }, 500, origem);
  }
  const { data, error } = await sb.rpc("oab_busca", {
    p_plano: {},
    p_filtros: { ...paraMotor(pedido), dataInicio: desde, ordenacao: "mais-recente" },
    p_limit: POR_PAGINA + 1,
    p_offset: pedido.offset
  });
  const ms = Date.now() - t0;
  if (error) {
    await registrar(chave, "recentes", pedido.recurso, null, [], 502, ms);
    return json(erroDoMotor(), 502, origem);
  }
  const linha = Array.isArray(data) ? data[0] : data;
  const brutos = Array.isArray(linha?.itens) ? linha.itens : [];
  const itens = await comTeores(
    brutos.slice(0, POR_PAGINA).map(projetarItem).filter((i) => i !== null)
  );
  if (itens === null) {
    await registrar(chave, "recentes", pedido.recurso, null, [], 502, Date.now() - t0);
    return json(erroDoMotor(), 502, origem);
  }
  await registrar(chave, "recentes", pedido.recurso, null, itens.map((i) => i.id), 200, ms);
  return json({
    itens,
    pagina: pedido.pagina,
    tamanho: POR_PAGINA,
    tem_mais: brutos.length > POR_PAGINA && pedido.pagina < PAGINA_MAX,
    ...contagem(linha?.total),
    // O servidor DIZ a janela que usou. É seguro — informar não é receber — e
    // sem isso a página não tem como dizer "nenhum acórdão desde tal data" em
    // vez de exibir uma seção com título e nada embaixo.
    desde,
    dias: DIAS_RECENTES
    // `avisos` e `radicais` não vêm: com plano vazio os dois voltam vazios por
    // construção (sem conceitos, sem escada, sem radicais). Seriam dois campos
    // que nunca teriam conteúdo.
  }, 200, origem);
}
async function rotaVocabulario(recurso, chave, origem, t0) {
  if (!RECURSOS.includes(recurso)) {
    return json({ erro: `recurso desconhecido: ${RECURSOS.join(", ")}` }, 400, origem);
  }
  const { data, error } = await sb.rpc("oab_api_vocabulario", { p_recurso: recurso });
  const ms = Date.now() - t0;
  if (error) {
    await registrar(chave, "vocabulario", recurso, null, [], 502, ms);
    return json(erroDoMotor(), 502, origem);
  }
  await registrar(chave, "vocabulario", recurso, null, [], 200, ms);
  return new Response(JSON.stringify(data ?? {}), {
    status: 200,
    headers: {
      ...cors(origem),
      "content-type": "application/json; charset=utf-8",
      "cache-control": "public, max-age=3600"
    }
  });
}
async function atender(req) {
  const t0 = Date.now();
  const origem = req.headers.get("origin");
  await carregarAjustes();
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors(origem) });
  const url = new URL(req.url);
  const segs = url.pathname.split("/").filter(Boolean);
  const i = segs.indexOf("oab-api");
  const rota = i >= 0 ? segs.slice(i + 1) : segs;
  if (!SUPABASE_URL || !SERVICE_KEY) {
    return json({ erro: "API n\xE3o configurada" }, 503, origem);
  }
  if (CHAVES.size === 0) {
    return json({ erro: "API n\xE3o configurada" }, 503, origem);
  }
  const corpo = req.method === "POST" ? await req.text() : "";
  const caminho = "/" + rota.join("/");
  const auth = await autenticar(req, caminho, corpo, CHAVES, async (chave, nonce) => {
    const { data, error } = await sb.rpc("oab_api_consumir_nonce", { p_chave: chave, p_nonce: nonce });
    return !error && data === true;
  });
  if (!auth.ok) return json({ erro: auth.motivo }, 401, origem);
  try {
    if (req.method === "POST" && rota[0] === "busca") {
      return await rotaBusca(corpo, auth.id.chave, origem, t0);
    }
    if (req.method === "GET" && rota[0] === "acordao" && rota[1]) {
      return await rotaAcordao(rota[1], auth.id.chave, origem, t0);
    }
    if (req.method === "GET" && rota[0] === "recentes" && rota[1]) {
      return await rotaRecentes(rota[1], url.searchParams.get("pagina"), auth.id.chave, origem, t0);
    }
    if (req.method === "GET" && rota[0] === "vocabulario") {
      return await rotaVocabulario(url.searchParams.get("recurso") ?? "", auth.id.chave, origem, t0);
    }
    return json({ erro: "rota desconhecida" }, 404, origem);
  } catch (_e) {
    return json({ erro: "erro interno" }, 500, origem);
  }
}
var SUPABASE_URL, SERVICE_KEY, CHAVES_ENV, ORIGENS_ENV, TETO_ENV, CHAVES, ORIGENS, TETO_DOCS_DIA, ajustesEm, sb, TTL_AJUSTES_MS;
var init_oab_api = __esm({
  "supabase/functions/oab-api/index.ts"() {
    "use strict";
    init_postgrest();
    init_planejar();
    init_catalogo();
    init_contrato();
    init_auth();
    SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    CHAVES_ENV = lerChaves(Deno.env.get("OAB_API_CHAVES"));
    ORIGENS_ENV = (Deno.env.get("OAB_API_ORIGENS") ?? "https://www.oabes.org.br,https://oabes.org.br").split(",").map((s) => s.trim()).filter(Boolean);
    TETO_ENV = Number(Deno.env.get("OAB_API_TETO_DOCS_DIA") ?? "0");
    CHAVES = CHAVES_ENV;
    ORIGENS = ORIGENS_ENV;
    TETO_DOCS_DIA = TETO_ENV;
    ajustesEm = 0;
    sb = criarCliente(SUPABASE_URL, SERVICE_KEY);
    TTL_AJUSTES_MS = 6e4;
    if (typeof Deno !== "undefined" && typeof Deno.serve === "function") Deno.serve(atender);
  }
});

// ../../../tmp/claude-0/-home-user/0eeb1014-9b44-5c85-8381-7f498463bf52/scratchpad/shim-deno.mjs
if (typeof globalThis.Deno === "undefined") {
  globalThis.Deno = { env: { get: (nome) => process.env[nome] } };
}

// ../../../tmp/claude-0/-home-user/0eeb1014-9b44-5c85-8381-7f498463bf52/scratchpad/relay-entry.ts
var relay = null;
async function carregar() {
  relay ??= await Promise.resolve().then(() => (init_oab_api(), oab_api_exports));
  return relay;
}
async function handler(req, res) {
  try {
    const { atender: atender2 } = await carregar();
    const original = new URL(req.url, `https://${req.headers.host ?? "localhost"}`);
    const rota = String(original.searchParams.get("rota") ?? "").replace(/^\/+/, "");
    original.searchParams.delete("rota");
    const url = new URL(
      `/oab-api/${rota}${original.search}`,
      `https://${req.headers.host ?? "localhost"}`
    );
    const corpo = req.method === "POST" ? await lerCorpo(req) : void 0;
    const pedido = new Request(url, {
      method: req.method,
      headers: new Headers(req.headers),
      body: corpo
    });
    const resposta = await atender2(pedido);
    res.status(resposta.status);
    resposta.headers.forEach((v, k) => res.setHeader(k, v));
    res.send(await resposta.text());
  } catch (e) {
    res.status(500).setHeader("content-type", "application/json; charset=utf-8").send(JSON.stringify({
      erro: "falha ao iniciar o relay",
      detalhe: String(e?.stack ?? e).slice(0, 900)
    }));
  }
}
function lerCorpo(req) {
  if (typeof req.body === "string") return Promise.resolve(req.body);
  if (req.body && typeof req.body === "object") return Promise.resolve(JSON.stringify(req.body));
  return new Promise((resolve, reject) => {
    let dados = "";
    req.on("data", (p) => {
      dados += p;
      if (dados.length > 65536) reject(new Error("corpo grande demais"));
    });
    req.on("end", () => resolve(dados));
    req.on("error", reject);
  });
}
export {
  handler as default
};
