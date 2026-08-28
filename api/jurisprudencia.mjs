// ============================================================================
// BFF de jurisprudência — versão Vercel.
//
// É o MESMO papel de bff/jurisprudencia.php, linha por linha: o navegador
// chama aqui, aqui assina com HMAC, e só aqui a chave existe. O portal da
// OAB-ES roda PHP; esta versão existe para publicar o protótipo num host de
// funções sem precisar de servidor PHP.
//
// As duas ficam no repositório de propósito. Quem publicar em PHP usa o .php e
// pode apagar esta pasta; quem publicar na Vercel usa esta e pode apagar
// aquela. `vercel.json` reescreve /bff/jurisprudencia.php para cá, então a
// página não precisa saber qual das duas está no ar.
//
// VARIÁVEIS DE AMBIENTE (Vercel › Settings › Environment Variables)
//   OABJUS_URL      https://<projeto>.supabase.co/functions/v1/oab-api
//   OABJUS_CHAVE    o identificador da chave
//   OABJUS_SEGREDO  o segredo correspondente
//
// Nunca no código, nunca no Git.
// ============================================================================
import { createHash, createHmac, randomBytes } from "node:crypto";

/** Rotas que o navegador pode pedir. O parâmetro vem de fora: não pode virar
 *  caminho arbitrário no host de destino. */
const ROTA_VALIDA = /^(busca|vocabulario|recentes\/[a-z_]{3,40}|acordao\/[0-9a-fA-F-]{36})$/;
const ROTAS_POST = new Set(["busca"]);
const CORPO_MAX = 8192;

function responder(res, status, corpo) {
  res.status(status)
     .setHeader("content-type", "application/json; charset=utf-8")
     .setHeader("x-content-type-options", "nosniff")
     .setHeader("cache-control", "no-store")
     .send(JSON.stringify(corpo));
}

async function lerCorpo(req) {
  if (typeof req.body === "string") return req.body;
  if (req.body && typeof req.body === "object") return JSON.stringify(req.body);
  const pedacos = [];
  let tamanho = 0;
  for await (const p of req) {
    tamanho += p.length;
    if (tamanho > CORPO_MAX) throw new Error("grande demais");
    pedacos.push(p);
  }
  return Buffer.concat(pedacos).toString("utf8");
}

export default async function handler(req, res) {
  const base = process.env.OABJUS_URL ?? "";
  const chave = process.env.OABJUS_CHAVE ?? "";
  const segredo = process.env.OABJUS_SEGREDO ?? "";
  if (!base || !chave || !segredo) {
    return responder(res, 503, { erro: "serviço de jurisprudência não configurado" });
  }

  const rota = String(req.query?.rota ?? "");
  if (!ROTA_VALIDA.test(rota)) {
    return responder(res, 400, { erro: "rota inválida" });
  }

  const metodo = ROTAS_POST.has(rota.split("/")[0]) ? "POST" : "GET";
  let corpo = "";
  if (metodo === "POST") {
    try {
      corpo = await lerCorpo(req);
    } catch {
      return responder(res, 413, { erro: "pedido grande demais" });
    }
    if (corpo !== "") {
      try { JSON.parse(corpo); }
      catch { return responder(res, 400, { erro: "corpo inválido: esperado JSON" }); }
    }
  }

  // A assinatura cobre a ROTA CANÔNICA, não o caminho completo da URL.
  //
  // MEDIDO em produção: o gateway do Supabase corta o prefixo /functions/v1
  // antes de a função ver a requisição — ela enxerga /oab-api/busca. Assinar o
  // caminho completo fazia os dois lados assinarem strings diferentes, e
  // NENHUMA chamada autenticava.
  const caminho = "/" + rota;

  // A query não entra na assinatura, então cada parâmetro que atravessa é
  // higienizado aqui, um a um, e nenhum outro passa.
  let destino = base.replace(/\/+$/, "") + "/" + rota;
  if (rota === "vocabulario" && req.query?.recurso) {
    destino += "?recurso=" + encodeURIComponent(String(req.query.recurso).replace(/[^a-z_]/g, ""));
  } else if (rota.startsWith("recentes/") && req.query?.pagina) {
    destino += "?pagina=" + Math.max(1, Math.min(10, parseInt(req.query.pagina, 10) || 1));
  }

  const ts = String(Date.now());
  const nonce = randomBytes(16).toString("hex");
  const assinatura = createHmac("sha256", segredo)
    .update([metodo, caminho, ts, nonce, createHash("sha256").update(corpo).digest("hex")].join("\n"))
    .digest("hex");

  let resposta;
  try {
    resposta = await fetch(destino, {
      method: metodo,
      headers: {
        "content-type": "application/json",
        "x-oab-key": chave,
        "x-oab-timestamp": ts,
        "x-oab-nonce": nonce,
        "x-oab-signature": assinatura,
      },
      body: metodo === "POST" ? corpo : undefined,
      signal: AbortSignal.timeout(25_000),
    });
  } catch {
    return responder(res, 502, { erro: "serviço de jurisprudência indisponível" });
  }

  // Repassa o JSON como veio. A projeção é responsabilidade da API, não daqui:
  // duas camadas decidindo o que sai é duas camadas para manter em dia.
  const texto = await resposta.text();
  res.status(resposta.status)
     .setHeader("content-type", "application/json; charset=utf-8")
     .setHeader("x-content-type-options", "nosniff")
     .setHeader("cache-control", "no-store")
     .send(texto);
}
