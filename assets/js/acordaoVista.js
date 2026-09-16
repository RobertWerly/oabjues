// ============================================================================
// A VISTA DO ACÓRDÃO — UMA SÓ, USADA POR DUAS TELAS.
//
// Ela nasceu dentro de `acordao.js`, presa ao `#conteudo` daquela página. A
// busca passou a precisar da MESMA vista sem sair da página (ver o comentário
// em `jurisprudencia.js` sobre voltar do acórdão), e havia dois caminhos:
// copiar as 180 linhas, ou dar um dono explícito a elas.
//
// Copiar estava fora de questão. Este projeto já pagou o preço de duas cópias
// da mesma verdade em composição de câmara e em rótulo de desfecho — as duas
// divergiram, e as duas viraram teste de paridade. Uma terceira não.
//
// Então: quem monta recebe o CONTAINER e procura dentro dele. Nada aqui usa
// `document.getElementById`, e é isso que permite a mesma vista existir numa
// página própria e dentro da busca sem as duas brigarem por id.
// ============================================================================
import { JUES as JUES_MOD } from "./jues.js";
import { esc, limparEspacos, dataBr, classeDistintivo } from "./formato.js";

const JUES = JUES_MOD.site("acordao");

/**
 * Monta o acórdão dentro de `alvo`.
 *
 * @param {HTMLElement} alvo        onde desenhar
 * @param {object}      d           o acórdão, como a API devolveu
 * @param {string}      rotuloRecurso  rótulo do recurso, para o cabeçalho
 * @param {boolean}     comTitulo   troca `document.title`. A página própria
 *        troca; a busca NÃO, senão o título da aba passaria a mentir sobre a
 *        lista que ainda está viva atrás da vista.
 */
export function montarAcordao(alvo, d, rotuloRecurso = "", comTitulo = true) {
  const q = (id) => alvo.querySelector(`#${CSS.escape(id)}`);


  const texto = limparEspacos(d.inteiro_teor);
  if (comTitulo) document.title = `${d.numero ?? "Acórdão"} — Jurisprudência criminal OAB-ES`;

  alvo.innerHTML = `
    <header class="painel p-4 p-sm-5 mb-3">
      <div class="d-flex align-items-start justify-content-between gap-3 flex-wrap mb-4">
        <div>
          <div class="d-flex align-items-center gap-2 flex-wrap">
            <h1 class="numero-acordao mb-0">${esc(d.numero ?? "sem número")}</h1>
            <button type="button" class="btn-icone" id="copiar-numero" title="Copiar número do processo">
              <i class="far fa-copy"></i>
            </button>
          </div>
          <p class="mb-0 mt-1" style="font-size:.85rem;font-weight:600;color:var(--oab-texto-2)">
            ${d.data ? `${dataBr(d.data)} · ` : ""}${esc(d.camara ?? "—")}
          </p>
        </div>
        <span class="distintivo ${classeDistintivo(d.resultado)}">${esc(d.resultado ?? "—")}</span>
      </div>

      <dl class="lista-campos mb-0">
        <dt>Magistrado</dt>
        <dd>
          <span class="valor-magistrado">${esc(d.magistrado ?? "—")}</span>
          <a class="atalho-jues" href="${JUES}" target="_blank" rel="noopener noreferrer">Ver perfil decisório →</a>
        </dd>

        <dt>Classe</dt>
        <dd>
          <span class="valor-classe">${esc(rotuloRecurso || "—")}</span>
          <a class="atalho-jues" href="${JUES}" target="_blank" rel="noopener noreferrer">Ver jurimetria do recurso →</a>
        </dd>

        <dt>Assunto</dt>
        <dd>
          <span class="valor-assunto">${esc(d.assunto ?? "—")}</span>
          <a class="atalho-jues" href="${JUES}" target="_blank" rel="noopener noreferrer">Ver jurimetria do assunto →</a>
        </dd>
      </dl>
    </header>

    <div class="faixa-jues d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-3 mb-3">
      <div>
        <h2 class="mb-1">Aprenda como cada desembargador decide antes de entrar com o recurso</h2>
        <p class="mb-0">Descubra padrões decisórios, teses acolhidas e jurimetria completa no JUES.</p>
      </div>
      <a class="btn btn-sm btn-oab-vermelho text-nowrap" href="${JUES}" target="_blank" rel="noopener noreferrer">
        Acessar JUES <i class="fas fa-external-link-alt ms-1"></i>
      </a>
    </div>

    <section aria-label="Conteúdo da decisão">
      <div class="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-2">
        <div class="abas" role="tablist" aria-label="Formato do conteúdo">
          <button type="button" role="tab" data-aba="resumida" aria-selected="false">Resumida</button>
          <button type="button" role="tab" data-aba="original" aria-selected="true">Original</button>
        </div>

        <div class="d-flex align-items-center gap-2 flex-wrap">
          <button type="button" class="btn btn-sm btn-contorno" id="copiar-ementa">
            <i class="far fa-copy me-1"></i> Copiar ementa
          </button>
          <button type="button" class="btn btn-sm btn-contorno" id="abrir-busca" aria-expanded="false">
            <i class="fas fa-search me-1"></i> Buscar no texto
          </button>
          <a class="btn btn-sm btn-contorno" href="${processual(d.numero)}" target="_blank" rel="noopener noreferrer">
            Ver no TJES <i class="fas fa-external-link-alt ms-1"></i>
          </a>
        </div>
      </div>

      <div class="barra-busca-texto align-items-center gap-2 mb-2" id="barra-busca" hidden>
        <i class="fas fa-search ms-2" style="color:var(--oab-texto-3)"></i>
        <input type="search" id="busca-texto" class="form-control form-control-sm"
               placeholder="Digite para buscar termos na ementa…" autocomplete="off">
        <span id="ocorrencias" class="contagem" hidden></span>
        <button type="button" class="btn-icone" id="fechar-busca" title="Fechar busca">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="painel p-4 p-sm-5" id="painel-original">
        ${texto
          ? `<pre class="teor-integral" id="teor"></pre>`
          : `<p class="mb-0 text-center" style="color:var(--oab-texto-2)">
               Texto integral não disponível — o acórdão não está no índice de
               jurisprudência do tribunal.</p>`}
      </div>

      <div class="painel p-4 p-sm-5 text-center" id="painel-resumida" hidden>
        <div class="mx-auto" style="max-width:28rem">
          <div class="icone-redondo mx-auto mb-3"><i class="fas fa-external-link-alt"></i></div>
          <h2 class="fonte-titulo fw-bolder mb-2" style="font-size:1.25rem">Acessar processo no JUES</h2>
          <p style="font-size:.92rem;color:var(--oab-texto-2)">
            Acesse resumos, teses, jurimetria e muito mais informações para o seu
            caso no jurimetriaes.com
          </p>
          <a class="btn btn-oab" href="${JUES}" target="_blank" rel="noopener noreferrer">
            Abrir no JUES <i class="fas fa-external-link-alt ms-1"></i>
          </a>
          <p class="mt-3 mb-0" style="font-size:.78rem;color:var(--oab-texto-3)">
            Processo nº ${esc(d.numero ?? "—")}
          </p>
        </div>
      </div>
    </section>`;

  // O texto entra por textContent e não por innerHTML: é documento do tribunal,
  // e um "<" no meio dele não pode virar marcação.
  const pre = q("teor");
  if (pre) pre.textContent = texto;

  // ── copiar ──────────────────────────────────────────────────────────────
  async function copiar(botao, valor, rotulo) {
    try {
      await navigator.clipboard.writeText(valor ?? "");
      const antes = botao.innerHTML;
      botao.innerHTML = `<i class="fas fa-check me-1 text-success"></i> ${rotulo}`;
      setTimeout(() => { botao.innerHTML = antes; }, 1500);
    } catch { /* sem permissão de área de transferência */ }
  }
  q("copiar-numero").addEventListener("click", (e) =>
    copiar(e.currentTarget, d.numero, ""));
  q("copiar-ementa").addEventListener("click", (e) =>
    copiar(e.currentTarget, texto, "Copiada!"));

  // ── abas ────────────────────────────────────────────────────────────────
  const abas = alvo.querySelectorAll("[data-aba]");
  function trocarAba(nome) {
    for (const b of abas) b.setAttribute("aria-selected", String(b.dataset.aba === nome));
    q("painel-original").hidden = nome !== "original";
    q("painel-resumida").hidden = nome !== "resumida";
    if (nome !== "original") fecharBusca();
  }
  for (const b of abas) b.addEventListener("click", () => trocarAba(b.dataset.aba));

  // ── buscar no texto ─────────────────────────────────────────────────────
  const barra = q("barra-busca"), campo = q("busca-texto"), contagem = q("ocorrencias");

  function fecharBusca() {
    barra.hidden = true;
    q("abrir-busca").setAttribute("aria-expanded", "false");
  }

  q("abrir-busca").addEventListener("click", () => {
    trocarAba("original");
    const abrindo = barra.hidden;
    barra.hidden = !abrindo;
    q("abrir-busca").setAttribute("aria-expanded", String(abrindo));
    if (abrindo) campo.focus();
  });

  q("fechar-busca").addEventListener("click", () => {
    campo.value = "";
    aplicarBusca();
    fecharBusca();
  });

  function aplicarBusca() {
    if (!pre) return;
    const termo = campo.value.trim();
    if (!termo) {
      pre.textContent = texto;
      contagem.hidden = true;
      return;
    }
    // Grifa a ocorrência EXATA do que foi digitado. `grifar()` do módulo
    // compartilhado estende a marca até o fim da palavra, o que é o certo para
    // radical de stemmer e errado para uma caixa de busca literal.
    //
    // esc() antes de montar a marcação: é documento do tribunal, e um "<" no
    // meio dele não pode virar tag.
    const re = new RegExp(`(${termo.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
    pre.innerHTML = esc(texto).replace(re, "<mark>$1</mark>");
    const n = pre.querySelectorAll("mark").length;
    contagem.textContent = `${n} ${n === 1 ? "ocorrência" : "ocorrências"}`;
    contagem.hidden = false;
  }
  campo.addEventListener("input", aplicarBusca);
}

/** O painel de erro, também com dono explícito. */
export function erroAcordao(alvo, titulo, detalhe) {
  alvo.innerHTML = `
    <div class="painel p-4 p-sm-5 text-center">
      <i class="fas fa-exclamation-circle mb-3" style="font-size:1.75rem;color:var(--oab-texto-3)"></i>
      <h1 class="fonte-titulo fw-bolder mb-2" style="font-size:1.25rem">${esc(titulo)}</h1>
      <p class="mb-0" style="font-size:.92rem;color:var(--oab-texto-2)">${esc(detalhe)}</p>
    </div>`;
}

function processual(numero) {
  return `https://sistemas.tjes.jus.br/consultaprocessual/consulta/${(numero ?? "").replace(/\D/g, "")}`;
}
