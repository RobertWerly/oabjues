// ============================================================================
// SELETOR COM CAMPO DE BUSCA.
//
// O <select> nativo não tem como filtrar, e alguns destes têm 94 assuntos, 59
// comarcas e 28 desembargadores. Rolar uma lista dessas para achar "Tráfico de
// drogas" é o que este arquivo resolve.
//
// É MELHORIA PROGRESSIVA, e isso é o desenho, não um detalhe:
//
//   o <select> continua no HTML e continua sendo a verdade. Ele é escondido,
//   não removido, e todo `$("assunto").value` do resto da página continua
//   funcionando sem saber que existe uma caixa por cima. `montarPedido`,
//   `encher`, `form.reset()` e a validação nativa não foram tocados.
//
// Sem JavaScript — ou se este arquivo quebrar — a página cai no <select> do
// navegador, que funciona. Um seletor que só existe em JavaScript troca uma
// lista comprida por lista nenhuma.
// ============================================================================

/** Sem acento e em minúscula: quem digita "tráfico" e quem digita "trafico"
 *  procuram a mesma coisa, e num acervo criminal metade dos assuntos tem
 *  acento (Homicídio, Difamação, Extorsão). */
function chave(s) {
  return (s ?? "").normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

function opcoesDe(select) {
  const itens = [];
  for (const filho of select.children) {
    if (filho.tagName === "OPTGROUP") {
      // O grupo entra como cabeçalho não-selecionável: é ele que diz "1ª Câmara
      // Criminal" acima dos nomes, e sem isso a busca por desembargador
      // devolveria uma lista lisa onde a câmara some.
      itens.push({ grupo: filho.label });
      for (const o of filho.children) itens.push({ valor: o.value, texto: o.text, grupo: filho.label });
    } else if (filho.tagName === "OPTION") {
      itens.push({ valor: filho.value, texto: filho.text });
    }
  }
  return itens;
}

/**
 * Põe um campo de busca em cima de um <select> que já existe.
 *
 * Idempotente: chamar de novo no mesmo <select> só reconstrói a lista. É o que
 * permite `carregarVocabulario()` repovoar o <select> a cada troca de recurso
 * sem que a página precise saber que a caixa existe.
 */
export function comBusca(select, { placeholder = "Buscar…" } = {}) {
  if (!select) return;

  let caixa = select.__caixa;
  if (!caixa) {
    caixa = document.createElement("div");
    caixa.className = "seletor";
    select.parentNode.insertBefore(caixa, select);
    caixa.appendChild(select);
    select.classList.add("seletor-nativo");
    // Fora da navegação por teclado E fora do leitor de tela.
    //
    // `opacity:0` esconde do olho mas NÃO esconde da tecnologia assistiva —
    // ao contrário de display:none, que esconderia dos dois e cancelaria a
    // validação nativa de campo required. Sem isto, quem usa leitor ouviria o
    // mesmo campo duas vezes: uma no <select> invisível, outra na caixa.
    select.setAttribute("aria-hidden", "true");
    select.tabIndex = -1;

    caixa.insertAdjacentHTML("beforeend", `
      <button type="button" class="form-select seletor-gatilho" aria-haspopup="listbox" aria-expanded="false">
        <span class="seletor-valor"></span>
      </button>
      <div class="seletor-painel" hidden>
        <input type="text" class="form-control seletor-busca" autocomplete="off" spellcheck="false">
        <ul class="seletor-lista" role="listbox"></ul>
        <p class="seletor-vazio" hidden>Nada encontrado</p>
      </div>`);

    // O <label for="assunto"> apontava para o <select>, que agora está oculto
    // para a AT. O rótulo passa a nomear o botão, senão a caixa fica sem nome.
    const rotulo = select.id
      ? document.querySelector(`label[for="${CSS.escape(select.id)}"]`)
      : null;
    if (rotulo) {
      if (!rotulo.id) rotulo.id = `rotulo-${select.id}`;
      caixa.querySelector(".seletor-gatilho").setAttribute("aria-labelledby", rotulo.id);
      caixa.querySelector(".seletor-busca")
           .setAttribute("aria-label", `Buscar em ${rotulo.textContent.trim()}`);
    }

    select.__caixa = caixa;
    ligar(select, caixa);
  }

  const busca = caixa.querySelector(".seletor-busca");
  busca.placeholder = placeholder;
  select.__opcoes = opcoesDe(select);
  mostrarValor(select, caixa);
  desenhar(select, caixa, "");
}

function mostrarValor(select, caixa) {
  const escolhida = select.selectedOptions[0];
  const alvo = caixa.querySelector(".seletor-valor");
  alvo.textContent = escolhida ? escolhida.text : "";
  // Cinza quando o valor é o "Todos" vazio, para a caixa parecer com o
  // placeholder de um campo não preenchido, como os outros do painel.
  alvo.classList.toggle("seletor-vazio-valor", !escolhida || escolhida.value === "");
  caixa.querySelector(".seletor-gatilho").disabled = select.disabled;
}

function desenhar(select, caixa, termo) {
  const lista = caixa.querySelector(".seletor-lista");
  const k = chave(termo.trim());
  const itens = select.__opcoes ?? [];
  lista.innerHTML = "";

  let visiveis = 0;
  let grupoPendente = null;
  for (const it of itens) {
    if (it.grupo !== undefined && it.valor === undefined) { grupoPendente = it.grupo; continue; }
    if (k && !chave(it.texto).includes(k) && !chave(it.grupo ?? "").includes(k)) continue;

    // O cabeçalho do grupo só é desenhado quando algum item dele sobreviveu ao
    // filtro — senão a lista fica cheia de títulos sem nada embaixo.
    if (grupoPendente !== null) {
      const h = document.createElement("li");
      h.className = "seletor-grupo";
      h.setAttribute("role", "presentation");
      h.textContent = grupoPendente;
      lista.appendChild(h);
      grupoPendente = null;
    }

    const li = document.createElement("li");
    li.className = "seletor-item";
    li.setAttribute("role", "option");
    li.dataset.valor = it.valor;
    li.textContent = it.texto;
    if (it.valor === select.value) {
      li.setAttribute("aria-selected", "true");
      li.classList.add("seletor-escolhido");
    }
    lista.appendChild(li);
    visiveis++;
  }

  caixa.querySelector(".seletor-vazio").hidden = visiveis > 0;
  const primeiro = lista.querySelector(".seletor-escolhido") ?? lista.querySelector(".seletor-item");
  if (primeiro) primeiro.classList.add("seletor-ativo");
}

function ligar(select, caixa) {
  const gatilho = caixa.querySelector(".seletor-gatilho");
  const painel = caixa.querySelector(".seletor-painel");
  const busca = caixa.querySelector(".seletor-busca");
  const lista = caixa.querySelector(".seletor-lista");

  const aberto = () => !painel.hidden;

  function abrir() {
    painel.hidden = false;
    gatilho.setAttribute("aria-expanded", "true");
    busca.value = "";
    desenhar(select, caixa, "");
    busca.focus();
    const ativo = lista.querySelector(".seletor-ativo");
    if (ativo) ativo.scrollIntoView({ block: "nearest" });
  }

  function fechar({ devolverFoco = true } = {}) {
    painel.hidden = true;
    gatilho.setAttribute("aria-expanded", "false");
    if (devolverFoco) gatilho.focus();
  }

  function escolher(valor) {
    select.value = valor;
    // `change` de verdade, e não uma chamada direta: quem escuta o <select>
    // (a troca de recurso recarrega o vocabulário inteiro) não precisa saber
    // que a escolha veio daqui.
    select.dispatchEvent(new Event("change", { bubbles: true }));
    mostrarValor(select, caixa);
    fechar();
  }

  gatilho.addEventListener("click", () => (aberto() ? fechar() : abrir()));
  busca.addEventListener("input", () => desenhar(select, caixa, busca.value));

  lista.addEventListener("click", (e) => {
    const li = e.target.closest(".seletor-item");
    if (li) escolher(li.dataset.valor);
  });

  // Teclado: seta para andar, Enter para escolher, Esc para desistir. Sem isto
  // a caixa é pior que o <select> nativo, que já faz tudo isso.
  busca.addEventListener("keydown", (e) => {
    const itens = [...lista.querySelectorAll(".seletor-item")];
    if (!itens.length) { if (e.key === "Escape") fechar(); return; }
    let i = itens.findIndex((x) => x.classList.contains("seletor-ativo"));

    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (i >= 0) itens[i].classList.remove("seletor-ativo");
      i = e.key === "ArrowDown"
        ? (i + 1) % itens.length
        : (i <= 0 ? itens.length - 1 : i - 1);
      itens[i].classList.add("seletor-ativo");
      itens[i].scrollIntoView({ block: "nearest" });
    } else if (e.key === "Enter") {
      e.preventDefault();
      escolher(itens[Math.max(0, i)].dataset.valor);
    } else if (e.key === "Escape") {
      e.preventDefault();
      fechar();
    }
  });

  // Clicar fora fecha. `mousedown` e não `click`: com `click`, clicar num
  // campo de outro filtro fecharia esta caixa DEPOIS de o outro abrir.
  document.addEventListener("mousedown", (e) => {
    if (aberto() && !caixa.contains(e.target)) fechar({ devolverFoco: false });
  });

  // `form.reset()` não dispara `change`, então o botão "Limpar filtros"
  // deixaria a caixa mostrando o valor antigo enquanto o <select> já voltou
  // ao padrão — o filtro pareceria ativo sem estar.
  select.form?.addEventListener("reset", () => {
    setTimeout(() => mostrarValor(select, caixa), 0);
  });
  select.addEventListener("change", () => mostrarValor(select, caixa));
}
