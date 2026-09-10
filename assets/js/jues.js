// ============================================================================
// OS ENDEREÇOS DO JUES, NUM LUGAR SÓ.
//
// Três telas apontam para o JUES: o convite que abre quando o advogado se
// credencia, a página de suporte e o rodapé da busca. Se cada uma escrever a
// própria URL, no dia em que o domínio mudar duas continuam certas e uma vira
// link morto — e ninguém percebe, porque link morto não dá erro de build.
//
// O domínio é `jurimetriabr.com`: MEDIDO, `jurimetriaes.com` responde 302 para
// ele. Apontar para o que redireciona custa um salto a mais em cada clique e
// perde a UTM em alguns navegadores.
// ============================================================================

const BASE = "https://jurimetriabr.com";

/** De onde veio o clique. Sem isso o JUES vê um cadastro e não sabe que ele
 *  nasceu na OAB — e a parceria fica sem número para mostrar. */
function com(origem, caminho = "/") {
  const u = new URL(caminho, BASE);
  u.searchParams.set("utm_source", "oabes");
  u.searchParams.set("utm_medium", "jurisprudencia");
  u.searchParams.set("utm_campaign", origem);
  return u.toString();
}

export const JUES = {
  site: (origem) => com(origem),
  cadastro: (origem) => com(origem, "/signup"),
  // Canais REAIS de atendimento do JUES, não caixa de mensagem que ninguém lê.
  whatsapp: "https://chat.whatsapp.com/K2dBUMMghsBK1zsncQnj0p?mode=gi_t",
  instagram: "https://www.instagram.com/jurimetriaes",
  email: "contato@jurimetria.es",
};

/** `mailto:` com assunto e corpo prontos.
 *
 *  Quem escreve do zero costuma mandar "não está funcionando" e some; o
 *  atendimento gasta duas idas só para descobrir de onde a pessoa fala. O
 *  assunto já diz que veio da OAB e o corpo já traz o que foi tentado. */
export function emailComContexto(assunto, corpo) {
  return `mailto:${JUES.email}?subject=${encodeURIComponent(`[OAB/ES] ${assunto}`)}`
       + `&body=${encodeURIComponent(corpo)}`;
}
