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

Abra `http://localhost:8000`. Sem BFF configurado, use `?demo=1`: a página sobe com
acórdãos fictícios, e dá para clicar em tudo: buscar, filtrar por câmara,
assunto e comarca, abrir o inteiro teor, paginar.

Serve para avaliar a interface antes de qualquer configuração.

---

## 2. O que precisa ser feito para conectar

Três passos, todos do lado da OAB.

### 2.1 Publicar os arquivos

Copie para o servidor:

```
index.html
assets/
public/
bff/
```

### 2.2 Configurar a chave no BFF

O arquivo `bff/jurisprudencia.php` precisa de três variáveis de ambiente no
processo PHP — **nunca no código, nunca no Git**:

| variável | valor |
|---|---|
| `OABJUS_URL` | `https://<projeto>.supabase.co/functions/v1/oab-api` |
| `OABJUS_CHAVE` | o identificador da chave |
| `OABJUS_SEGREDO` | o segredo correspondente |

Os três valores chegam junto com a chave, por canal fechado. O molde está em
`bff/.env.example`.

Confirme que `/bff/jurisprudencia.php` é **executado**, e não servido como
texto: um `.php` entregue como arquivo mostra o código-fonte, e o código lê o
segredo.

### 2.3 Ligar o modo real

Em `assets/js/api.js`, mude a constante `DEMO` para sempre falso, ou acesse a
página normalmente para testar; `?demo=1` volta para os dados fictícios.

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
assunto, resultado e a ementa inteira**. O **inteiro teor** vem no endpoint de
detalhe, um acórdão por requisição.

Verificado contra o acervo em produção: as ementas que a API devolve são
**byte a byte** as mesmas que o JurimetriaES exibe, e na mesma ordem. Foram
comparados 30 acórdãos em 3 consultas distintas, item a item.

### Não são devolvidos

Dados de jurimetria, perfil decisório, teses, classificações, resumos gerados
por IA, contagens, estatísticas agregadas ou totais. Não estão no contrato: a
API não tem como devolvê-los.

### Limites

- **200 resultados por pesquisa** (10 páginas de 20). Além disso, refine os
  filtros.
- **Tipo de recurso é obrigatório.** Uma pesquisa não cruza recursos.
- Assunto, comarca, câmara e magistrado aceitam **um valor cada**.
- Não há filtro por período na busca. A lista de "últimas dos 7 dias" usa uma
  janela fixada pelo servidor.

---

## 5. Endereços da API

Todos exigem a assinatura. O BFF cuida disso.

| método | rota | devolve |
|---|---|---|
| `POST` | `/busca` | resultados da pesquisa |
| `GET` | `/recentes/{recurso}` | as últimas dos 7 dias |
| `GET` | `/acordao/{id}` | um acórdão, com inteiro teor |
| `GET` | `/vocabulario?recurso={recurso}` | valores aceitos pelos filtros |

---

## 6. Onde mexer

```
index.html                       a página inteira
assets/css/jurisprudencia.css    só os deltas em cima do Bootstrap
assets/js/api.js                 cliente da API + dados de demonstração
assets/js/jurisprudencia.js      a tela: cartões, erros, paginação
assets/vendor/bootstrap.min.css  Bootstrap 5.3.3 vendorizado
bff/jurisprudencia.php           assina com HMAC e repassa
public/logos/                    JUES e OAB
```

| para mudar | mexa em |
|---|---|
| cor, espaçamento, tamanho | `assets/css/jurisprudencia.css` — variáveis no topo |
| texto de rótulo ou aviso | `index.html` e `assets/js/jurisprudencia.js` |
| endereço do BFF | constante `BASE`, topo de `assets/js/api.js` |
| o que aparece no cartão | função `cartao()` em `assets/js/jurisprudencia.js` |

**Ao embutir no template do portal:** remova a linha
`<link rel="stylesheet" href="assets/vendor/bootstrap.min.css">`. O portal já
carrega Bootstrap 5.3.3, e duas cópias brigam entre si. Mantenha
`assets/css/jurisprudencia.css`.

---

## 7. Suporte

Dúvidas sobre a API, a chave ou o acervo: JurimetriaES.
