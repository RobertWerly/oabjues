// ============================================================================
// Página do acórdão — o porte de src/components/InteiroTeorView.tsx.
//
// Mesma estrutura do componente que já existia no repositório: voltar, cartão
// de cabeçalho com número/resultado/metadados, faixa do JUES, alternador
// Resumida/Original, copiar ementa, buscar no texto e o inteiro teor.
//
// A diferença é a que o resto do protótipo já segue: HTML e CSS de navegador,
// nas cores da OAB-ES, sem React e sem build.
//
// É uma PÁGINA, com endereço próprio e limpo: `/acordao/{id}`. O advogado copia
// o link de um acórdão, o botão voltar do navegador funciona e abrir em nova
// aba não perde a busca.
// ============================================================================
import { acordao, ErroApi } from "./api.js";
import { montarAcordao, erroAcordao } from "./acordaoVista.js";

const $ = (id) => document.getElementById(id);
const alvo = $("conteudo");
/**
 * O id vem do CAMINHO — `/acordao/{uuid}` — e a query fica como reserva.
 *
 * As duas formas continuam funcionando de propósito: link que alguém já
 * copiou, ou salvou nos favoritos, na forma antiga não pode virar 404 porque
 * a rota mudou. A rota nova é a que a página gera; a antiga só é lida.
 */
function idDaRota() {
  const doCaminho = location.pathname.match(/\/acordao\/([^/?#]+)\/?$/);
  if (doCaminho) return decodeURIComponent(doCaminho[1]);
  return new URLSearchParams(location.search).get("id") ?? "";
}

const id = idDaRota();

// O rótulo do recurso vem NA RESPOSTA do acórdão (`recurso_rotulo`), não da
// query string nem de uma tabela escrita aqui. O `?recurso=` que a busca
// acrescenta ao link continua sendo aceito, mas só como reserva para o
// instante entre abrir a página e a resposta chegar.
let rotuloRecurso = "";

// Quem chegou da busca volta para ela como estava; quem colou o link cai na
// página inicial.
// A busca agora mora em "/", e não mais em "/index.html" — a comparação
// antiga por sufixo nunca casaria e o botão "voltar" perderia os filtros.
const voltaParaBusca = (url) => {
  const c = new URL(url, location.href).pathname.replace(/\/+$/, "");
  return c === "" || c.endsWith("/index.html") || c.endsWith("/index");
};
if (document.referrer && voltaParaBusca(document.referrer)) {
  $("voltar").href = document.referrer;
}

// ── carregar ──────────────────────────────────────────────────────────────
if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
  erroAcordao(alvo, "Acórdão não informado", "O endereço desta página precisa do identificador do acórdão.");
} else {
  try {
    const d = await acordao(id);
    rotuloRecurso = d.recurso_rotulo ?? "";
    montarAcordao(alvo, d, rotuloRecurso);
  } catch (e) {
    if (e instanceof ErroApi && e.status === 404) {
      erroAcordao(alvo, "Acórdão não encontrado",
                  "Este acórdão não está disponível para consulta nesta base.");
    } else {
      erroAcordao(alvo, "Não foi possível carregar o acórdão",
                  "Tente de novo em instantes. Se persistir, avise o suporte do portal.");
    }
  }
}
