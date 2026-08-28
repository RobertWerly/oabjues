# Entrega — Busca de Jurisprudência OAB/ES

Este repositório é a entrega completa. Contém a página, o cliente da API e o
servidor intermediário. Não há build, não há `npm install`, não há
dependência para instalar.

**Falta só uma coisa que não está aqui, e por segurança não pode estar: a chave
de acesso.** Ela é entregue à parte, por canal fechado.

---

## 1. Ver funcionando, em 30 segundos

```
python3 -m http.server 8000
```

Abra `http://localhost:8000`. Sem BFF configurado, use `?demo=1`: a página sobe
com acórdãos fictícios, e dá para clicar em tudo — buscar, filtrar por câmara,
assunto e comarca, paginar, abrir a página de um acórdão.

Serve para avaliar a interface antes de qualquer configuração.

---

## 2. O que precisa ser feito para conectar

Três passos, todos do lado da OAB.

### 2.1 Publicar os arquivos

Copie para o servidor:

```
index.html      a busca
acordao.html    a página de um acórdão
assets/
public/
bff/            inclusive o .htaccess, que bloqueia arquivo oculto na pasta
```

**Não copie** `api/`, `vercel.json` nem `.vercelignore`. Eles existem só para
publicar o protótipo na Vercel; no portal da OAB quem faz esse papel é
`bff/jurisprudencia.php`. Ver a seção 2.5.

As duas páginas ficam **na mesma pasta**: a busca linka `acordao.html?id=…`
por caminho relativo.

### 2.2 Configurar a chave no BFF

O arquivo `bff/jurisprudencia.php` precisa de três variáveis de ambiente no
processo PHP — **nunca no código, nunca no Git**:

| variável | valor |
|---|---|
| `OABJUS_URL` | `https://<projeto>.supabase.co/functions/v1/oab-api` |
| `OABJUS_CHAVE` | o identificador da chave |
| `OABJUS_SEGREDO` | o segredo correspondente |

Os três valores chegam junto com a chave, por canal fechado.

**Renomear `bff/.env.example` para `.env` não funciona.** O BFF lê com
`getenv()`, e o PHP não carrega arquivo `.env` sozinho — isso é coisa de
framework, não da linguagem. Pior: um `.env` ali fica dentro da pasta
publicada, onde o servidor pode entregá-lo como texto. O arquivo é só o molde
dos três nomes; ele traz o trecho pronto para Apache (`SetEnv`), PHP-FPM
(`env[...]`) e nginx (`fastcgi_param`).

O `bff/.htaccess` que acompanha bloqueia arquivo oculto nessa pasta, para o
caso de alguém criar um `.env` mesmo assim. Em nginx, a regra equivalente é
`location ~ /\. { deny all; }`.

Confirme que `/bff/jurisprudencia.php` é **executado**, e não servido como
texto: um `.php` entregue como arquivo mostra o código-fonte, e o código lê o
segredo.

### 2.3 Dizer à página onde o BFF está

Por padrão a página procura o BFF em `bff/jurisprudencia.php`, **relativo à
página**. Isso funciona com os dois lado a lado. Se a busca for para uma rota
do portal (`/jurisprudencia/`, por exemplo) e o PHP para outra, o caminho
relativo aponta para um lugar que não existe e a página responde 404 em tudo
sem dizer por quê.

Para apontar sem mexer em JavaScript, descomente a linha no `<head>` das
**duas** páginas:

```html
<meta name="oabjus-bff" content="/servicos/jurisprudencia-bff.php">
```

Aceita caminho absoluto do site ou URL inteira.

### 2.4 Conferir

A página já sobe falando com o acervo; `?demo=1` volta para os dados fictícios
se quiserem ver a interface sem tocar no serviço. Um teste rápido pelo próprio
servidor de vocês:

```
curl "https://<portal>/bff/jurisprudencia.php?rota=vocabulario&recurso=habeas_corpus"
```

Deve voltar JSON com câmaras, assuntos e comarcas. Se voltar `503`, faltam as
variáveis; se voltar o código-fonte em PHP, o arquivo não está sendo executado.

### 2.5 O que NÃO vem para vocês

O repositório traz uma pasta `api/` com um relay em Node e um `vercel.json`.
**Isso não é para o portal da OAB.** É o protótipo publicado num host de
funções, e o relay ali usa uma credencial de banco do JurimetriaES que não
acompanha a entrega — nem deve.

A divisão é esta, e é ela que faz a segurança valer:

| fica com a OAB | fica com o JurimetriaES |
|---|---|
| a página e o BFF | a API, o banco e o motor de busca |
| a **chave** (identificador + segredo do HMAC) | a credencial do banco |

A OAB assina as chamadas; quem lê o acervo é o JurimetriaES. Se a chave da OAB
vazar, ela é revogada de um lado só e nada mais precisa mudar.

---

## 3. Por que existe um servidor intermediário

```
navegador  ──►  bff/jurisprudencia.php  ──►  API do JurimetriaES
   │              (servidor da OAB)
   └── nunca vê a chave
```

A autenticação é **HMAC-SHA256**: cada chamada vai assinada sobre método,
rota, corpo, timestamp e nonce, com janela de 5 minutos e nonce de uso único.
A assinatura é feita no servidor da OAB; o segredo nunca trafega.

Se o segredo fosse para o JavaScript da página, qualquer visitante o leria no
código-fonte — e a restrição de acesso deixaria de existir, porque `Origin` e
`Referer` são cabeçalhos que qualquer cliente escolhe.

O BFF é PHP porque é o que o portal da OAB-ES já roda, e não usa dependência
nenhuma além do que vem com o PHP (`hash_hmac` e cURL).

---

## 4. O que a API entrega

Por acórdão: **número do processo, data de julgamento, magistrado, câmara,
assunto, resultado e o inteiro teor** — o texto do tribunal, verbatim, já na
listagem. Abrir o acórdão não custa uma segunda requisição.

Vem também **quantos acórdãos a resposta contém** e **em quantas páginas eles
cabem**, para a paginação poder dizer "página 3 de 7". É o número entregue,
capado no teto de 200 — nunca o tamanho da fatia do acervo.

O assunto é o **canônico**: é o mesmo valor que o filtro oferece e o mesmo que
o JurimetriaES mostra. O campo cru do tribunal mistura nível (traz "Estelionato
contra Idoso" ao lado de "Estelionato") e carrega entulho processual
("Contagem - Dias Úteis"); medido em habeas corpus, 267 valores crus contra 94
canônicos.

### Não são devolvidos

Dados de jurimetria, perfil decisório, teses, classificações, resumos gerados
por IA, nem as facetas do motor — entre elas o total por magistrado e por tese.
Não estão no contrato: a API não tem como devolvê-los.

Também não vem a **ementa** que o JurimetriaES exibe. Em 93% do acervo ela não
é a ementa do tribunal, e sim um documento montado que abre em "IDENTIFICAÇÃO"
e fecha em "JURISPRUDÊNCIA CITADA" — resumo do inteiro teor, que o contrato
veta. O que a API entrega é o texto do tribunal.

### Limites

- **200 resultados por pesquisa** (10 páginas de 20). Além disso, refine os
  filtros.
- **Tipo de recurso é obrigatório.** Uma pesquisa não cruza recursos.
- Assunto, comarca, câmara e magistrado aceitam **um valor cada**.
- Não há filtro por período na busca. A lista de "últimos acórdãos" usa uma
  janela de 7 dias fixada pelo servidor.

---

## 5. Endereços da API

Todos exigem a assinatura. O BFF cuida disso.

| método | rota | devolve |
|---|---|---|
| `POST` | `/busca` | resultados da pesquisa |
| `GET` | `/recentes/{recurso}` | os últimos acórdãos (7 dias) |
| `GET` | `/acordao/{id}` | um acórdão, com inteiro teor |
| `GET` | `/vocabulario?recurso={recurso}` | valores aceitos pelos filtros |

---

## 6. Onde mexer

```
index.html                       a busca: cabeçalho, filtros, resultados
acordao.html                     a página de um acórdão
assets/css/jurisprudencia.css    só os deltas em cima do Bootstrap
assets/js/api.js                 cliente da API + dados de demonstração
assets/js/jurisprudencia.js      a busca: cartões, erros, paginação
assets/js/acordao.js             a página do acórdão
assets/js/formato.js             texto, datas e grifo — usado pelas duas telas
assets/vendor/bootstrap.min.css  Bootstrap 5.3.3 vendorizado
bff/jurisprudencia.php           assina com HMAC e repassa
public/logos/                    JUES e OAB
```

| para mudar | mexa em |
|---|---|
| cor, espaçamento, tamanho | `assets/css/jurisprudencia.css` — variáveis no topo |
| texto de rótulo ou aviso | `index.html` e `assets/js/jurisprudencia.js` |
| endereço do BFF | a `<meta name="oabjus-bff">` no `<head>` das duas páginas |
| o que aparece no cartão | função `cartao()` em `assets/js/jurisprudencia.js` |
| a página do acórdão | `acordao.html` e `assets/js/acordao.js` |

**Ao embutir no template do portal**, nas duas páginas:

- remova `<link rel="stylesheet" href="assets/vendor/bootstrap.min.css">` — o
  portal já carrega Bootstrap 5.3.3, e duas cópias brigam entre si. Mantenha
  `assets/css/jurisprudencia.css`, que só traz o que o Bootstrap não dá;
- Font Awesome e as fontes Montserrat/Roboto o portal já carrega;
- os arquivos de `assets/` e `public/` são referenciados por **caminho
  relativo**. Se as páginas forem para uma subpasta, ou os arquivos mudam de
  lugar junto, ou os caminhos viram absolutos;
- o JavaScript é **módulo ES** (`<script type="module">`). Se o portal tiver
  CSP, `script-src` precisa admitir os arquivos de `assets/js/`.

---

## 7. Suporte

Dúvidas sobre a API, a chave ou o acervo: JurimetriaES.
