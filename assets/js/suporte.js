// ============================================================================
// SUPORTE — CHAT GUIADO, COM SAÍDA PARA GENTE DE VERDADE.
//
// ── POR QUE GUIADO, E NÃO CAMPO LIVRE ───────────────────────────────────────
//
// Campo livre com robô do outro lado seria mentira: não há atendente aqui, e
// um chat que responde "não entendi" três vezes é pior que uma página de
// perguntas frequentes, porque promete conversa e entrega labirinto.
//
// Campo livre com humano do outro lado exigiria fila, backend, armazenamento
// de mensagem e um turno de atendimento — nada disso existe, e inventar meia
// caixa de entrada que ninguém lê é o pior dos dois mundos.
//
// Então: as perguntas que esta página SABE responder são respondidas na hora,
// e tudo que depende de gente sai daqui para um canal onde tem gente — com o
// contexto já escrito na mensagem, para o atendimento não gastar duas idas
// perguntando de onde a pessoa fala.
//
// ── O DESENHO ───────────────────────────────────────────────────────────────
//
// Um grafo. Cada nó tem uma fala e as saídas dele; `IR` é a única coisa que
// muda a tela. Acrescentar assunto é acrescentar chave no objeto — não mexe em
// função nenhuma, e é por isso que ele é um objeto e não uma cadeia de `if`.
//
// A ÁRVORE É DADO, A MECÂNICA É CÓDIGO. São 40 linhas de mecânica para
// qualquer número de assuntos.
// ============================================================================
import { JUES, emailComContexto } from "./jues.js";

const $ = (id) => document.getElementById(id);

/** O contexto que acompanha quem sai daqui para o WhatsApp ou o e-mail:
 *  por onde passou, de que navegador, em que hora. Sem isso o atendimento
 *  começa por "me conta o que aconteceu". */
const trilha = [];

function corpoDoContexto() {
  return [
    "— enviado pela busca de jurisprudência OAB/ES —",
    `quando: ${new Date().toLocaleString("pt-BR")}`,
    `caminho: ${trilha.join(" › ") || "(entrou direto)"}`,
    "",
    "Descreva abaixo o que aconteceu:",
    "",
  ].join("\n");
}

// ── A ÁRVORE ────────────────────────────────────────────────────────────────
//
// `fala`  o que o suporte diz (HTML curto)
// `saidas` [rótulo, destino] — destino é chave de nó, ou {url} / {mail}
const ARVORE = {
  inicio: {
    fala: `Oi. Posso ajudar com a busca de jurisprudência da OAB/ES.
           <br>Sobre o que é?`,
    saidas: [
      ["Não consegui entrar com minha inscrição", "entrar"],
      ["Não achei o acórdão que procuro", "achar"],
      ["Quero taxa de concessão, perfil de desembargador", "jurimetria"],
      ["O que é este site?", "oque"],
      ["O que vocês guardam sobre mim?", "dados"],
      ["Outro assunto", "humano"],
    ],
  },

  entrar: {
    fala: `A conferência é de <strong>CPF e inscrição juntos</strong>, feita na hora
           contra a base do convênio OAB/ES —
           por isso ela é pedida em toda visita, e nada fica guardado no seu
           navegador. O que apareceu?`,
    saidas: [
      ['"não consta da base da OAB/ES"', "naoconsta"],
      ['"O CPF não confere"', "cpfnaoconfere"],
      ["Não temos o CPF desta inscrição", "semcpfnabase"],
      ["Sou de outra seccional", "outrasec"],
      ["Disse que foram muitas tentativas", "tentativas"],
      ["Outra coisa", "humano"],
    ],
  },
  naoconsta: {
    fala: `Confira se digitou <strong>só os números</strong>, sem pontos,
           barra ou a sigla — <code>12345</code>, e não <code>OAB/ES
           12.345</code>. Zeros à frente não atrapalham.
           <br><br>Se o número está certo e mesmo assim não consta, a base do
           convênio pode estar desatualizada para a sua inscrição: quem
           resolve isso é a OAB/ES, e o JUES ajuda a apurar.`,
    saidas: [["Falar com alguém", "humano"], ["Voltar ao início", "inicio"]],
  },
  cpfnaoconfere: {
    fala: `O número da inscrição foi encontrado, mas o CPF informado não é o que
           a OAB/ES tem vinculado a ele. Confira os dois — um dígito trocado em
           qualquer um dos dois campos dá nisso.
           <br><br>Se os dois estão certos, o vínculo na base do convênio pode
           estar desatualizado.`,
    saidas: [["Continua não conferindo", "humano"], ["Voltar ao início", "inicio"]],
  },
  semcpfnabase: {
    fala: `Quer dizer que a base do convênio tem a sua inscrição, mas não tem o
           CPF vinculado a ela — são 28 casos em pouco mais de 30 mil. Não dá
           para conferir os dois juntos, e liberar sem conferir transformaria
           esses números em porta aberta.
           <br><br>O suporte resolve caso a caso.`,
    saidas: [["Falar com o suporte", "humano"], ["Voltar ao início", "inicio"]],
  },
  outrasec: {
    fala: `Hoje só conseguimos conferir inscrições da <strong>seccional do
           Espírito Santo</strong> — é a base que a OAB/ES compartilhou no
           convênio. Não é que a sua inscrição não valha; é que daqui não dá
           para conferir.
           <br><br>O acesso pelo JUES não depende da seccional.`,
    saidas: [["Ver o JUES", { url: JUES.cadastro("suporte-seccional") }],
             ["Voltar ao início", "inicio"]],
  },
  tentativas: {
    fala: `Existe um teto de tentativas por hora, para impedir que alguém use
           esta porta para descobrir quais inscrições existem. Ele solta
           sozinho — espere alguns minutos e tente de novo.
           <br><br>Se você divide a conexão com o escritório inteiro, o teto
           pode ter sido gasto por outra pessoa na mesma rede.`,
    saidas: [["Ainda não libera", "humano"], ["Voltar ao início", "inicio"]],
  },

  achar: {
    fala: `Três coisas costumam explicar:
           <br><br><strong>1.</strong> A busca não cruza classes recursais —
           habeas corpus e apelação são pesquisas separadas. Confira o campo
           <em>Tipo de recurso</em>.
           <br><strong>2.</strong> O acervo tem julgados de <strong>mérito</strong>.
           Decisão que não chegou ao mérito não entra.
           <br><strong>3.</strong> Cada busca mostra até <strong>200</strong>
           resultados. Passando disso, use assunto, câmara, comarca ou período
           para estreitar.`,
    saidas: [["Continua sem aparecer", "humano"], ["Voltar ao início", "inicio"]],
  },

  jurimetria: {
    fala: `Isso não sai por aqui, e é de propósito. Esta página serve o
           <strong>texto do tribunal</strong> — acórdão na íntegra, como
           publicado.
           <br><br>Taxa de concessão, perfil decisório de cada desembargador,
           tese e estatística são o <strong>JUES</strong>. É a mesma base, com
           a análise em cima.`,
    saidas: [["Criar conta no JUES", { url: JUES.cadastro("suporte-jurimetria") }],
             ["Voltar ao início", "inicio"]],
  },

  oque: {
    fala: `É uma parceria da <strong>OAB/ES</strong> com o <strong>JUES</strong>.
           A OAB abre a busca do acervo criminal do TJES para os advogados
           inscritos; o JUES é quem mantém o acervo e a tecnologia.
           <br><br>A inscrição é pedida para que o acesso fique com quem é da
           OAB/ES — não é login, não tem senha, e não guardamos nada no seu
           navegador.`,
    saidas: [["Conhecer o JUES", { url: JUES.site("suporte-oque") }],
             ["Voltar ao início", "inicio"]],
  },

  dados: {
    fala: `Inscrição, seccional, o nome se você informar, e um <strong>hash</strong>
           do seu IP — nunca o IP em si. <strong>O CPF não é guardado</strong>: ele é
           comparado com o código que a OAB/ES já tem e descartado na mesma chamada.
           Não existe coluna de CPF no banco. Do texto que você digita fica só um hash,
           não a pergunta.
           <br><br>A busca <strong>não fica ligada a você</strong>: identificação e
           registro de uso ficam em tabelas separadas, e o registro de uso não guarda
           inscrição. Identificações somem em 180 dias; o registro de uso, em 90.
           <br><br>Nada fica no seu navegador — sem cookie, sem login.`,
    saidas: [["Ler a página de privacidade", { url: "/privacidade" }],
             ["Voltar ao início", "inicio"]],
  },

  humano: {
    fala: `Então vamos para onde tem gente. O time do JUES atende nos dois
           canais abaixo — a mensagem já vai com o que você percorreu aqui,
           para ninguém precisar recomeçar.`,
    saidas: [
      ["Falar no WhatsApp", { url: JUES.whatsapp }],
      ["Mandar e-mail", { mail: true }],
      ["Voltar ao início", "inicio"],
    ],
  },
};

// ── A MECÂNICA ──────────────────────────────────────────────────────────────

function balao(quem, html) {
  const li = document.createElement("li");
  li.className = `balao balao-${quem}`;
  li.innerHTML = html;
  $("conversa").appendChild(li);
  return li;
}

function rolar() {
  const c = $("conversa");
  c.scrollTop = c.scrollHeight;
  // Foca a primeira opção nova: quem usa teclado continua de onde a conversa
  // parou, em vez de ter que tabular a conversa inteira de novo.
  const b = $("opcoes").querySelector("button, a");
  if (b) b.focus({ preventScroll: true });
}

function IR(chave, rotuloClicado) {
  const no = ARVORE[chave];
  if (!no) return;
  if (rotuloClicado) {
    balao("eu", rotuloClicado);
    trilha.push(rotuloClicado);
  }
  balao("suporte", no.fala);

  const cx = $("opcoes");
  cx.innerHTML = "";
  for (const [rotulo, destino] of no.saidas) {
    if (typeof destino === "string") {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "opcao";
      b.textContent = rotulo;
      b.addEventListener("click", () => IR(destino, rotulo));
      cx.appendChild(b);
    } else {
      // Saída para fora: vira link de verdade (`<a href>`), não botão com
      // `window.open` — abre em aba nova, o meio do clique funciona, e o
      // navegador mostra para onde vai antes de clicar.
      const a = document.createElement("a");
      a.className = "opcao opcao-saida";
      a.href = destino.mail
        ? emailComContexto("Suporte — busca de jurisprudência", corpoDoContexto())
        : destino.url;
      if (!destino.mail) { a.target = "_blank"; a.rel = "noopener"; }
      a.innerHTML = `${rotulo} <i class="fas fa-external-link-alt" aria-hidden="true"></i>`;
      cx.appendChild(a);
    }
  }
  rolar();
}

$("recomecar").addEventListener("click", () => {
  $("conversa").innerHTML = "";
  trilha.length = 0;
  IR("inicio");
});

IR("inicio");
