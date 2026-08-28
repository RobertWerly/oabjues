# Busca de Jurisprudência — OAB/ES

Página de pesquisa de jurisprudência criminal do TJES para o site da OAB-ES,
servida pelo acervo do **JurimetriaES**.

**HTML, CSS e JavaScript de navegador. Sem build, sem `npm install`, sem passo
de compilação.** Copiou os arquivos para o servidor, está no ar.

> **Recebendo este repositório para publicar?** Comece por **[ENTREGA.md](ENTREGA.md)** —
> está tudo lá, em ordem.

---

## Ver funcionando agora

Com o BFF publicado e configurado, a página já sobe **falando com o acervo de
verdade**. Sem BFF, abra com `?demo=1` para ver a interface com acórdãos
fictícios — dá para clicar em tudo: buscar, filtrar, paginar, abrir inteiro
teor.

Precisa de um servidor local (o navegador bloqueia módulos em `file://`):

```
python3 -m http.server 8000
# depois abra http://localhost:8000
```

---

## Como as peças se encaixam

```
navegador  ──►  bff/jurisprudencia.php  ──►  API do JurimetriaES  ──►  motor de busca
   │              (servidor da OAB)             (edge function)          (já existente)
   │              guarda a chave                valida, traduz,
   │              assina com HMAC               projeta, registra
   └── nunca vê a chave
```

**Por que existe o BFF.** A autenticação é HMAC com chave secreta, e segredo não
mora em navegador. `Origin` e `Referer` não servem de credencial: são cabeçalhos
que qualquer cliente escolhe. Só com a assinatura feita no servidor da OAB é
verdade que a API "só funciona no site da OAB".

Ele é PHP porque é o que o portal da OAB-ES já roda, e não usa dependência
nenhuma além do que vem com o PHP (`hash_hmac` e cURL).

---

## Publicar

1. Copie `index.html`, `assets/`, `public/` e `bff/` para o servidor.

2. Receba o par **chave + segredo** do JurimetriaES por canal fechado (cofre de
   senhas — não por e-mail nem por ticket). O molde das variáveis está em
   `bff/.env.example`.

3. Defina as variáveis no processo PHP — **nunca no código, nunca no Git**:

   | variável | valor |
   |---|---|
   | `OABJUS_URL` | `https://<projeto>.supabase.co/functions/v1/oab-api` |
   | `OABJUS_CHAVE` | o identificador da chave |
   | `OABJUS_SEGREDO` | o segredo correspondente |

4. Confirme que `/bff/jurisprudencia.php` é **executado**, não servido como
   texto. Um `.php` entregue como arquivo mostra o código-fonte — e o código lê
   o segredo.

5. Abra a página. Ela já bate na API; `?demo=1` volta para os dados fictícios,
   se quiser conferir a interface sem tocar no acervo.

### Embutir no template da OAB

A página é autossuficiente, mas o portal já carrega Bootstrap 5.3.3. Ao colar
o conteúdo dentro do template de vocês:

- **remova** a linha `<link rel="stylesheet" href="assets/vendor/bootstrap.min.css">`
  — duas cópias do Bootstrap brigam entre si;
- mantenha `assets/css/jurisprudencia.css`, que só traz o que o Bootstrap não dá;
- Font Awesome e as fontes Montserrat/Roboto o portal já carrega.

---

## Onde mexer

```
index.html                       a página inteira: cabeçalho, filtros, resultados
assets/css/jurisprudencia.css    só os deltas em cima do Bootstrap (~130 linhas)
assets/js/api.js                 cliente da API + os dados de demonstração
assets/js/jurisprudencia.js      a tela: monta cartões, trata erros, pagina
assets/vendor/bootstrap.min.css  Bootstrap 5.3.3 vendorizado
bff/jurisprudencia.php           assina com HMAC e repassa  (servidor PHP)
api/jurisprudencia.mjs           o mesmo BFF, em Node        (Vercel)
api/relay.mjs                    o relay, empacotado         (GERADO — ver abaixo)
vercel.json                      manda /bff/jurisprudencia.php para a função Node
public/logos/                    JUES e OAB, com fundo recortado
```

Os dois BFFs fazem a mesma coisa e existem para hosts diferentes. O portal da
OAB-ES roda PHP: use `bff/jurisprudencia.php` e apague `api/`, `vercel.json` e
`.vercelignore`. Para publicar na Vercel é o contrário — o `vercel.json`
reescreve o caminho, então a página não precisa saber qual dos dois está no ar.

Duas linhas do `vercel.json` que parecem supérfluas e não são (JSON não aceita
comentário, então ficam explicadas aqui):

- **`outputDirectory: "."`** — sem framework detectado, a Vercel usa `public/`
  como raiz do site quando essa pasta existe. Aqui ela guarda só os logos, e o
  site inteiro respondia 404.
- **`.vercelignore` com `bff/`** — as reescritas rodam depois da busca no
  sistema de arquivos, então o `.php` seria servido como estático, mostrando o
  código-fonte em vez de executar.

### O relay dentro deste repositório (temporário)

`api/relay.mjs` é **arquivo gerado**: é a API de jurisprudência
(o relay) empacotada a partir do repositório `brainrotjuri`. O lugar dela é a
edge function do Supabase, e é para lá que ela volta.

Ela está aqui porque o deploy daquele projeto depende de crédito na workspace
do Lovable; sem crédito, a API congela na última versão publicada. A Vercel
publica por push. O código que decide é o mesmo — mesma allowlist de entrada,
mesma projeção de saída, mesmo teto de 200, mesma verificação de HMAC.

Para voltar ao Supabase: aponte `OABJUS_URL` para
`https://<projeto>.supabase.co/functions/v1/oab-api` e apague `api/relay.mjs` e a reescrita dele no `vercel.json`.

| se você quiser… | mexa em |
|---|---|
| trocar cor, espaçamento, tamanho | `assets/css/jurisprudencia.css` — as cores são variáveis no topo |
| mudar texto de rótulo ou aviso | `index.html` (formulário) e `assets/js/jurisprudencia.js` (mensagens) |
| mudar o endereço do BFF | a constante `BASE`, no topo de `assets/js/api.js` |
| mudar o que aparece no cartão | a função `cartao()` em `assets/js/jurisprudencia.js` |
| trocar os dados de demonstração | `DEMO_ITENS` no fim de `assets/js/api.js` |
| forçar os dados de demonstração | abra com `?demo=1`, ou mexa na constante `DEMO` em `assets/js/api.js` |

As cores vêm do CSS de produção da própria OAB-ES: `#274364` é o navy do portal
(o `--bs-dark` deles, e a cor do botão primário) e `#d02015` é o vermelho
institucional.

---

## O que a API devolve

Por acórdão: **número do processo, data de julgamento, magistrado, câmara,
assunto, resultado e o inteiro teor**, verbatim do tribunal, já na listagem —
abrir o texto não custa uma segunda requisição.

Não vem a ementa que o aplicativo mostra: em 93% do acervo ela não é a ementa
do tribunal, e sim um documento montado que abre em "IDENTIFICAÇÃO" e fecha em
"JURISPRUDÊNCIA CITADA". Isso é resumo do inteiro teor, que o contrato veta.

Vem também **quantos acórdãos a pesquisa achou** e **em quantas páginas eles
cabem** — sem isso a paginação não tem como dizer "página 3 de 7". Contagem de
resultados não é o que o contrato veta: o que fica de fora é contagem por
desfecho, que é perfil decisório.

Não são devolvidos, e não existem no contrato: dados de jurimetria, perfil
decisório, teses, classificações, resumos gerados por IA, nem as facetas do
motor — entre elas o total por magistrado e por tese.

### Limites

- **200 resultados por pesquisa** (10 páginas de 20). Além disso, refine os
  filtros.
- **Tipo de recurso é obrigatório**: uma pesquisa não cruza recursos. Sem ele, o
  motor assumiria habeas corpus em silêncio e esconderia cinco sextos do acervo.
- Os filtros de assunto, comarca, câmara e magistrado aceitam **um valor cada**.
- Não há filtro por período.

---

## Três coisas que a página faz de propósito

Não são capricho de interface — vêm de como o motor de busca se comporta de
fato, medido no acervo:

**Avisa quando a busca foi afrouxada.** Escolher um filtro pode fazer a lista
**crescer**: a exigência da busca é calibrada pelos acórdãos que sobraram depois
dos filtros, então remover os melhores baixa a régua. Medido: uma pesquisa que
devolvia 8 acórdãos passou a devolver 16 ao escolher um magistrado, e os 16
casavam metade da pergunta. A página mostra o aviso em vez de deixar o advogado
ler resultados achando que casam a pergunta inteira.

**Grifa só o que o servidor disse ter usado.** A marcação vem do campo
`radicais` da resposta. Adivinhar o alcance do stemmer no navegador já falhou
duas vezes no aplicativo — "invasão de domicílio" não marcava "domiciliar".

**Não exibe contagem nenhuma.** A API não devolve total, por decisão de produto.
A navegação vive de `tem_mais`, e quando o teto de 200 é atingido a página diz
isso, em vez de fingir que a lista acabou.
