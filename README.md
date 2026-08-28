# Busca de Jurisprudência — OAB/ES

Página de pesquisa de jurisprudência criminal do TJES para o site da OAB-ES,
servida pelo acervo do **JurimetriaES**.

**HTML, CSS e JavaScript de navegador. Sem build, sem `npm install`, sem passo
de compilação.** Copiou os arquivos para o servidor, está no ar.

> **Recebendo este repositório para publicar?** Comece por **[ENTREGA.md](ENTREGA.md)** —
> está tudo lá, em ordem.

---

## Ver funcionando agora

Abra `index.html` no navegador. Ela sobe em **modo demonstração**, com acórdãos
fictícios, e dá para clicar em tudo — buscar, filtrar, paginar, abrir inteiro
teor.

Precisa de um servidor local (o navegador bloqueia módulos em `file://`):

```
python3 -m http.server 8000
# depois abra http://localhost:8000
```

Para falar com a API de verdade: publique o BFF (abaixo) e abra com `?demo=0`.

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

5. Abra a página sem `?demo=0` na URL para conferir a interface, e com `?demo=0`
   para bater na API.

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
bff/jurisprudencia.php           assina com HMAC e repassa
public/logos/                    JUES e OAB, com fundo recortado
```

| se você quiser… | mexa em |
|---|---|
| trocar cor, espaçamento, tamanho | `assets/css/jurisprudencia.css` — as cores são variáveis no topo |
| mudar texto de rótulo ou aviso | `index.html` (formulário) e `assets/js/jurisprudencia.js` (mensagens) |
| mudar o endereço do BFF | a constante `BASE`, no topo de `assets/js/api.js` |
| mudar o que aparece no cartão | a função `cartao()` em `assets/js/jurisprudencia.js` |
| trocar os dados de demonstração | `DEMO_ITENS` no fim de `assets/js/api.js` |
| desligar o modo demonstração por padrão | a constante `DEMO`, em `assets/js/api.js` |

As cores vêm do CSS de produção da própria OAB-ES: `#274364` é o navy do portal
(o `--bs-dark` deles, e a cor do botão primário) e `#d02015` é o vermelho
institucional.

---

## O que a API devolve

Por acórdão: **número do processo, data de julgamento, magistrado, câmara,
assunto, resultado e a ementa inteira**. O **inteiro teor** vem no endpoint de
detalhe, um acórdão por requisição.

Não são devolvidos, e não existem no contrato: dados de jurimetria, perfil
decisório, teses, classificações, resumos gerados por IA, nem qualquer contagem
ou estatística agregada.

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
