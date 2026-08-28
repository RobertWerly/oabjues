# Busca de Jurisprudência — OAB/ES

Página de pesquisa de jurisprudência criminal do TJES para o site da OAB-ES,
servida pelo acervo do **JurimetriaES**.

**HTML, CSS e JavaScript de navegador. Sem build, sem `npm install`.**
Copiou os arquivos para o servidor, está no ar.

---

## O que é de quem

```
├─ PARA O PORTAL DA OAB ─────────────────────────────────────────────
│  index.html      a busca
│  acordao.html    a página de um acórdão
│  assets/         CSS e JS das duas páginas + Bootstrap vendorizado
│  public/         logos
│  bff/            o intermediário que guarda a chave e assina (PHP)
│
├─ SÓ DO PROTÓTIPO NA VERCEL — NÃO COPIAR PARA O PORTAL ─────────────
│  api/            o mesmo BFF, em Node (ver api/README.md)
│  vercel.json     rotas do deploy na Vercel
│  .vercelignore   mantém o .php fora do deploy da Vercel
```

O protótipo publicado (`oabjues.vercel.app`) usa a metade de baixo porque a
Vercel não roda PHP. No portal da OAB o papel inteiro é do
`bff/jurisprudencia.php`, e a pasta `api/` não deve existir lá.

A divisão que faz a segurança valer: **a OAB fica com a página, o BFF e a
chave; o JurimetriaES fica com a API, o banco e o motor de busca.** A OAB
assina as chamadas; quem lê o acervo é o JurimetriaES. Se a chave vazar, ela é
revogada de um lado só e nada mais muda.

---

## Publicar no portal

1. **Copie** `index.html`, `acordao.html`, `assets/`, `public/` e `bff/`
   (inclusive o `.htaccess`, que bloqueia arquivo oculto na pasta). As duas
   páginas ficam na **mesma pasta**: a busca linka `acordao.html?id=…` por
   caminho relativo.

2. **Configure as três variáveis** no processo PHP — nunca no código, nunca
   no Git. Os valores reais chegam por canal fechado, junto com a chave:

   | variável | valor |
   |---|---|
   | `OABJUS_URL` | endereço da API (chega com a chave) |
   | `OABJUS_CHAVE` | identificador da chave |
   | `OABJUS_SEGREDO` | segredo correspondente |

   **Renomear `bff/.env.example` para `.env` não funciona** — o PHP não
   carrega `.env` sozinho, e o arquivo ficaria dentro da pasta publicada. O
   `.env.example` traz o trecho pronto para Apache (`SetEnv`), PHP-FPM
   (`env[...]`) e nginx (`fastcgi_param`), com as pegadinhas de cada um.

3. **Diga à página onde o BFF está**, se ele não ficar ao lado dela.
   Descomente no `<head>` das duas páginas:

   ```html
   <meta name="oabjus-bff" content="/servicos/jurisprudencia-bff.php">
   ```

   Sem isso o caminho é relativo à página — numa subpasta, aponta para um
   lugar que não existe e tudo responde 404 sem dizer por quê.

4. **Confira** pelo próprio servidor:

   ```
   curl "https://<portal>/bff/jurisprudencia.php?rota=vocabulario&recurso=habeas_corpus"
   ```

   | resposta | significado |
   |---|---|
   | JSON com câmaras e assuntos | está certo |
   | `{"erro":"...não configurado"}` | as variáveis não chegaram ao PHP |
   | o código-fonte PHP na tela | o `.php` não está sendo executado |

   A página já sobe falando com o acervo; `?demo=1` mostra a interface com
   dados fictícios, sem tocar no serviço.

### Embutir no template do portal

Nas duas páginas:

- **remova** `<link rel="stylesheet" href="assets/vendor/bootstrap.min.css">`
  — o portal já carrega Bootstrap 5.3.3, e duas cópias brigam entre si.
  Mantenha `assets/css/jurisprudencia.css`, que só traz o que o Bootstrap
  não dá;
- Font Awesome 5.12 e as fontes Montserrat/Roboto o portal já carrega;
- `assets/` e `public/` são referenciados por **caminho relativo** — mudou a
  página de pasta, ou os arquivos vão junto, ou os caminhos viram absolutos;
- o JavaScript é **módulo ES** (`<script type="module">`); se o portal tiver
  CSP, `script-src` precisa admitir os arquivos de `assets/js/`.

As cores vêm do CSS de produção da própria OAB-ES: `#274364` (o navy do
portal) e `#d02015` (o vermelho institucional), em variáveis no topo de
`assets/css/jurisprudencia.css`.

---

## O que a API entrega

Por acórdão: **número do processo, data de julgamento, magistrado, câmara,
assunto, resultado e o inteiro teor** — o texto do tribunal, verbatim, já na
listagem. Abrir o acórdão não custa segunda requisição. O assunto é o
**canônico**: o mesmo valor que o filtro oferece.

Vem também **quantos acórdãos a resposta contém** e **em quantas páginas** —
o número entregue, capado no teto de 200; nunca o tamanho do acervo.

**Não são devolvidos**, e não existem no contrato: dados de jurimetria,
perfil decisório, teses, classificações, resumos gerados por IA, facetas ou
contagens do acervo.

### Rotas (todas exigem assinatura — o BFF cuida disso)

| método | rota | devolve |
|---|---|---|
| `POST` | `/busca` | resultados da pesquisa |
| `GET` | `/recentes/{recurso}` | os últimos acórdãos (7 dias) |
| `GET` | `/acordao/{id}` | um acórdão, com inteiro teor |
| `GET` | `/vocabulario?recurso={recurso}` | valores aceitos pelos filtros e as bordas do período |

### Limites

- **200 resultados por pesquisa** (10 páginas de 20); além disso, refine os
  filtros.
- **Tipo de recurso é obrigatório** — uma pesquisa não cruza recursos.
- Assunto, comarca, câmara e magistrado aceitam **um valor cada**.
- **Período é opcional.** Em branco, a busca é a mesma de sempre. Preenchido,
  vai em `AAAA-MM-DD`, com as duas pontas inclusivas e qualquer uma delas
  sozinha ("de tal data em diante", "até tal data"). O `/vocabulario` devolve
  `periodo: {min, max}` — o acórdão mais antigo e o mais novo **do recurso
  escolhido**, que é o que a página usa como borda do calendário.
- A lista de últimos acórdãos **não** aceita período: a janela de 7 dias é
  fixada pelo servidor.

---

## Onde mexer

| para mudar | mexa em |
|---|---|
| cor, espaçamento, tamanho | `assets/css/jurisprudencia.css` — variáveis no topo |
| texto de rótulo ou aviso | `index.html` e `assets/js/jurisprudencia.js` |
| endereço do BFF | a `<meta name="oabjus-bff">` no `<head>` das duas páginas |
| o que aparece no cartão | função `cartao()` em `assets/js/jurisprudencia.js` |
| a página do acórdão | `acordao.html` e `assets/js/acordao.js` |

---

## Suporte

Dúvidas sobre a API, a chave ou o acervo: JurimetriaES.
