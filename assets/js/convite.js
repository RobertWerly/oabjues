// ============================================================================
// O CONVITE QUE ABRE QUANDO O ADVOGADO SE CREDENCIA.
//
// Quem chega aqui foi redirecionado do site da OAB e acabou de digitar a
// própria inscrição. Ele sabe que pediram um número; não sabe necessariamente
// o que é este site, de onde vem o acervo, nem que existe uma ferramenta maior
// atrás dele. É o único momento em que dizer isso não interrompe nada — a
// busca ainda não começou.
//
// ── O QUE ESTE DIÁLOGO NÃO FAZ ──────────────────────────────────────────────
//
// Não trava a busca. `Esc`, clique fora e o X fecham, e por baixo dele a
// página já está pronta. Um convite que segura a porta não é convite.
//
// Não promete o que esta busca não entrega. O acervo aqui é o texto do
// tribunal, na íntegra e sem análise: nada de taxa de concessão, perfil de
// desembargador ou tese. O convite diz isso na cara — é justamente a diferença
// que justifica o cadastro no JUES, e prometer aqui o que só existe lá faria a
// busca parecer quebrada.
//
// Não é publicidade travestida. O primeiro parágrafo serve a quem só quer
// pesquisar e ir embora; o CTA vem depois, e fechar sem clicar é um caminho de
// primeira classe.
// ============================================================================
import { JUES } from "./jues.js";

const ID = "convite-jues";

/**
 * Abre o convite. Chamado uma vez, logo depois do `veredito: valido`.
 *
 * @param {{recursos?: number}} ctx  números que a página já carregou, para o
 *        texto falar do acervo real em vez de um número escrito à mão que
 *        envelhece. Sem eles, a frase simplesmente não cita número.
 */
export function abrirConvite(ctx = {}) {
  if (document.getElementById(ID)) return;

  const quantos = Number.isFinite(ctx.recursos) && ctx.recursos > 0
    ? `${ctx.recursos} classes recursais criminais`
    : "as classes recursais criminais";

  const cx = document.createElement("div");
  cx.id = ID;
  cx.className = "convite-fundo";
  cx.innerHTML = `
    <div class="convite" role="dialog" aria-modal="true"
         aria-labelledby="${ID}-t" aria-describedby="${ID}-d">
      <button type="button" class="convite-x" aria-label="Fechar">
        <i class="fas fa-times" aria-hidden="true"></i>
      </button>

      <div class="convite-marcas">
        <img src="/public/logos/jues.png" alt="JUES" width="32" height="32">
        <span class="logo-x" aria-hidden="true">✕</span>
        <img src="/public/logos/oab.png" alt="OAB/ES" height="26">
      </div>

      <h2 id="${ID}-t" class="convite-titulo fonte-titulo">Sua inscrição foi confirmada</h2>

      <p id="${ID}-d" class="convite-texto">
        Esta busca é uma parceria da <strong>OAB/ES</strong> com o
        <strong>JUES</strong>. Ela abre para você o acervo de acórdãos
        criminais do <strong>TJES</strong> em ${quantos} — com o
        <strong>inteiro teor como o tribunal publicou</strong>, sem resumo e
        sem edição.
      </p>

      <div class="convite-linha" role="separator"></div>

      <p class="convite-texto convite-texto-2">
        O que esta página <strong>não</strong> mostra: taxa de concessão,
        perfil de cada desembargador, tese e estatística. Isso não é limitação
        da busca — é o que o JUES faz, e é onde ele vive.
      </p>

      <div class="convite-acoes">
        <a class="btn btn-jues" href="${JUES.cadastro("convite")}"
           target="_blank" rel="noopener">
          <i class="fas fa-arrow-right me-2" aria-hidden="true"></i>Criar conta no JUES
        </a>
        <button type="button" class="btn btn-link convite-depois">
          Agora só quero pesquisar
        </button>
      </div>

      <p class="convite-rodape">
        Advogado inscrito na OAB/ES tem <strong>15 dias</strong> de acesso
        integral ao cadastrar. ·
        <a href="/suporte">Suporte</a> · <a href="/privacidade">Privacidade</a>
      </p>
    </div>`;

  // Foco e teclado. Um diálogo que não devolve o foco deixa quem usa teclado
  // preso atrás dele — e quem usa leitor de tela sem saber que abriu.
  const antes = document.activeElement;
  function fechar() {
    cx.remove();
    document.removeEventListener("keydown", tecla);
    if (antes && antes.focus) antes.focus();
  }
  function tecla(e) {
    if (e.key === "Escape") { e.preventDefault(); fechar(); return; }
    if (e.key !== "Tab") return;
    // Prende o Tab dentro do diálogo enquanto ele existe.
    const foco = cx.querySelectorAll("a[href], button");
    if (!foco.length) return;
    const [pri, ult] = [foco[0], foco[foco.length - 1]];
    if (e.shiftKey && document.activeElement === pri) { e.preventDefault(); ult.focus(); }
    else if (!e.shiftKey && document.activeElement === ult) { e.preventDefault(); pri.focus(); }
  }

  cx.querySelector(".convite-x").addEventListener("click", fechar);
  cx.querySelector(".convite-depois").addEventListener("click", fechar);
  // `mousedown` no fundo, e conferindo o alvo: com `click`, arrastar uma
  // seleção de texto de dentro para fora fecharia o diálogo.
  cx.addEventListener("mousedown", (e) => { if (e.target === cx) fechar(); });
  document.addEventListener("keydown", tecla);

  document.body.appendChild(cx);
  cx.querySelector(".btn-jues").focus();
}
