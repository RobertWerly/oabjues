// ============================================================================
// Formatação compartilhada entre a busca e a página do acórdão.
//
// Vive num arquivo próprio porque as duas telas mostram o MESMO texto do
// tribunal, e duas cópias das regras de espaço e de grifo divergiriam no
// primeiro conserto.
// ============================================================================

export const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

export function grifar(txt, radicais) {
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
export function limparEspacos(txt) {
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
 *    linhas do card em "ESTADO DO ESPÍRITO SANTO" e ar. Na página do acórdão o
 *    texto abre com a formatação intacta.
 * 2. Começa na ÚLTIMA "EMENTA" da primeira metade do documento, não na
 *    primeira. O texto costuma trazer "EMENTA" como título, depois o
 *    cabeçalho do processo (câmara, número, partes, relator) e só então
 *    "ACÓRDÃO EMENTA: DIREITO PROCESSUAL PENAL…", que é o resumo de verdade.
 *    Parar na primeira ocorrência mostra o cabeçalho; parar na última mostra
 *    o julgado.
 */
export function trecho(txt) {
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
export function dataBr(iso) {
  if (!iso) return "—";
  const d = new Date(`${iso}T00:00:00Z`);
  return Number.isNaN(+d) ? iso : FMT.format(d);
}

const DATA_CURTA = new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC", day: "2-digit", month: "2-digit" });
export function dataCurta(iso) {
  if (!iso) return "";
  const d = new Date(`${iso}T00:00:00Z`);
  return Number.isNaN(+d) ? iso : DATA_CURTA.format(d);
}

/** As classes do distintivo seguem o desfecho, como no protótipo. */
export function classeDistintivo(r) {
  const v = (r ?? "").toLowerCase();
  if (v.includes("parcial")) return "parcial";
  if (v.startsWith("não") || v.startsWith("nao") || v === "improcedente") return "negada";
  if (["concedida", "provido", "procedente"].some((x) => v.startsWith(x))) return "concedida";
  return "outro";
}
