# Busca de Jurisprudência — protótipo OAB-ES

Página de pesquisa de jurisprudência criminal do TJES para o site da OAB-ES,
servida pelo acervo do **JurimetriaES**.

Abra `index.html` — ela roda em **modo demonstração**, com acórdãos fictícios,
enquanto o serviço não estiver conectado. Para falar com a API de verdade,
publique o BFF (abaixo) e abra a página com `?demo=0`.

## Por que HTML e CSS puros, e por que Bootstrap

A `oabes.org.br` roda **Bootstrap 5.3.3 + jQuery 3.6.0**, servidos do próprio
domínio com cache busting `?h=<md5>`, mais Font Awesome 5.12/4.7 e as fontes
Montserrat/Roboto do Google Fonts. O shell é
`<nav class="navbar navbar-expand-lg fixed-top">` — Bootstrap clássico.

Esta página usa exatamente isso, sem build. As cores saem do
`assets/css/styles.min.css` de produção deles:

| | valor | onde aparece no portal |
|---|---|---|
| navy | `#274364` | é o `--bs-dark` do portal e a cor do botão primário |
| navy escuro | `#1f3650` | estado ativo |
| vermelho | `#d02015` | vermelho institucional |

O Bootstrap vai **vendorizado** em `assets/vendor/`, como o portal já faz — a
página abre offline e não depende de CDN de terceiro. **Ao embutir no template
da OAB, remova essa linha**: o Bootstrap do portal já está carregado e uma
segunda cópia brigaria com a primeira.

## Como as peças se encaixam

```
navegador  ──►  bff/jurisprudencia.php   ──►  edge function oab-api  ──►  motor de busca
   │              (servidor da OAB)              (JurimetriaES)          (já existente)
   │              guarda a chave                 valida, traduz,
   │              assina com HMAC                projeta, registra
   └── nunca vê a chave
```

**Por que o BFF existe.** A autenticação é HMAC com chave secreta, e segredo não
mora em navegador. `Origin` e `Referer` não servem: são cabeçalhos que um `curl`
escolhe. Só com a assinatura feita no servidor da OAB é verdade que a API "só
funciona no site da OAB".

O BFF é PHP porque é o que o portal da OAB-ES já roda, e não usa nenhuma
dependência além do que vem com o PHP (`hash_hmac`, cURL).

## Publicar

1. Copie `index.html`, `assets/` e `bff/` para o servidor.
2. Defina as variáveis de ambiente do processo PHP — **nunca no código, nunca no
   Git**:

   | variável | valor |
   |---|---|
   | `OABJUS_URL` | `https://<projeto>.supabase.co/functions/v1/oab-api` |
   | `OABJUS_CHAVE` | o identificador da chave, fornecido pelo JurimetriaES |
   | `OABJUS_SEGREDO` | o segredo correspondente |

3. Confirme que `/bff/jurisprudencia.php` é **executado**, não servido como
   texto — um `.php` servido como arquivo entrega o código, não o resultado.
4. Em `assets/js/api.js`, ajuste `BASE` se o BFF não ficar em `/bff/`.

## Arquivos

```
index.html                      a página
assets/css/jurisprudencia.css   só os deltas em cima do Bootstrap
assets/js/api.js                cliente da API (+ modo demonstração)
assets/js/jurisprudencia.js     a tela, JavaScript de navegador
assets/vendor/bootstrap.min.css Bootstrap 5.3.3 vendorizado
bff/jurisprudencia.php          assina com HMAC e repassa
public/logos/                   JUES e OAB (fundos recortados)
```

O desenho vem do protótipo React que está na `main`; esta versão é a mesma tela
em HTML e CSS, sem passo de build.

## O que a página faz que um protótipo comum não faria

Três comportamentos existem por causa de como o motor de busca funciona de
verdade, e não por capricho:

- **Mostra quando a busca foi afrouxada.** Escolher um filtro pode fazer a lista
  **crescer** — a exigência da busca é calibrada pelos acórdãos que sobraram
  depois dos filtros, então remover os melhores baixa a régua. Medido no acervo:
  uma pesquisa que devolvia 8 acórdãos passou a devolver 16 ao escolher um
  magistrado, e os 16 casavam metade da pergunta. A página avisa em vez de
  deixar o advogado ler resultados achando que casam a pergunta inteira.
- **Grifa só o que o servidor disse ter usado.** A marcação vem do campo
  `radicais` da resposta. Adivinhar o alcance do stemmer no navegador já falhou
  duas vezes no aplicativo — "invasão de domicílio" não marcava "domiciliar".
- **Não exibe contagem nenhuma.** A API não devolve total, por decisão de
  produto. A navegação vive de `tem_mais`, e quando o teto de 200 resultados é
  atingido a página diz isso, em vez de fingir que a lista acabou.

Há um quarto, menor mas com o mesmo espírito: cerca de **3 em cada 10 acórdãos
não têm comarca registrada**, então filtrar por comarca esconde parte do acervo.
A página diz isso embaixo do formulário, para ninguém concluir que não existem
acórdãos daquela comarca.

## O que a API devolve

Por acórdão: número do processo, data de julgamento, magistrado, câmara,
assunto, resultado e a ementa inteira. O **inteiro teor** vem no endpoint de
detalhe, um acórdão por requisição.

Não são devolvidos — nem existem no contrato — dados de jurimetria, perfil
decisório, teses, classificações, resumos gerados por IA, nem qualquer contagem
ou estatística agregada.

## Limites

- **200 resultados por pesquisa** (10 páginas de 20). Além disso, refine os
  filtros.
- **Tipo de recurso é obrigatório**: uma pesquisa não cruza recursos. Sem ele, o
  motor assumiria habeas corpus em silêncio e esconderia cinco sextos do acervo.
- Os filtros de assunto, comarca, câmara e magistrado aceitam **um valor cada**.
- Não há filtro por período.
