import { Decision } from '../types';

export const INITIAL_DECISIONS: Decision[] = [
  {
    id: 'dec-001',
    processNumber: '5014031-33.2026.8.08.0000',
    orderOfConcession: 'Não concedida',
    judgmentDate: '21/Ago/2026',
    rawDate: '2026-08-21',
    subject: 'Excesso de prazo para instrução / julgamento',
    legalClass: 'HABEAS CORPUS CRIMINAL',
    magistrate: 'RACHEL DURAO CORREIA LIMA',
    judgingBody: '1ª Câmara Criminal',
    originJurisdiction: 'Vitória',
    defenseTheses: [
      'excesso de prazo',
      'constrangimento ilegal',
      'ausência de contemporaneidade',
      'primariedade técnica',
      'medidas cautelares diversas'
    ],
    requestType: 'Revogação de prisão preventiva',
    excerpt: 'Habeas corpus impetrado em favor do paciente, denunciado pela suposta prática dos crimes previstos no art. 121, § 2º, incisos II, III e IV, do Código Penal, c/c art. 1º, inciso I, da Lei nº 8.072/89; art. 121, § 2º, incisos II, III e IV, c/c art. 14, inciso II, do Código Penal, por três vezes, c/c art. 1º, inciso I, da Lei nº 8.072/89. Alegação de excesso de prazo global na formação da culpa que não se sustenta diante da complexidade do feito, pluralidade de réus e necessidade de expedição de cartas precatórias para oitiva de testemunhas na comarca de origem.',
    paciente: 'Jonathan Lopes',
    juizoCoator: '1ª Vara Criminal da Comarca de Linhares',
    tribunal: 'TJES — 1ª Câmara Criminal',
    ementaTopics: [
      'Direito Processual Penal',
      'Habeas Corpus',
      'Homicídio qualificado',
      'Prisão preventiva',
      'Excesso de prazo',
      'Garantia da ordem pública',
      'Contemporaneidade'
    ],
    casoEmExame: [
      'Habeas corpus impetrado em favor de Jonathan Lopes, denunciado pela suposta prática dos crimes previstos no art. 121, § 2º, incisos II, III e IV, do Código Penal, c/c art. 1º, inciso I, da Lei nº 8.072/89; art. 121, § 2º, incisos II, III e IV, c/c art. 14, inciso II, do Código Penal, por três vezes, c/c art. 1º, inciso I, da Lei nº 8.072/89; e art. 16, § 1º, inciso IV, da Lei nº 10.826/03.',
      'O paciente encontra-se preso preventivamente desde agosto de 2022.',
      'A impetração sustenta constrangimento ilegal por excesso de prazo, ausência de fundamentação concreta da prisão preventiva e falta de contemporaneidade dos fundamentos cautelares, requerendo a revogação da custódia.',
      'A decisão de pronúncia foi proferida em 06/09/2024.'
    ],
    questaoEmDiscussao: [
      'Há três questões em discussão: (i) definir se a prisão preventiva configura constrangimento ilegal por excesso de prazo para submissão do paciente ao Tribunal do Júri;',
      '(ii) estabelecer se permanecem presentes os requisitos previstos no art. 312 do Código de Processo Penal para manutenção da custódia cautelar;',
      '(iii) determinar se há ausência de contemporaneidade apta a afastar a prisão preventiva.'
    ],
    razoesDecidir: [
      'O excesso de prazo na formação da culpa deve ser aferido segundo as peculiaridades do caso concreto, observados os princípios da razoabilidade e da proporcionalidade, não decorrendo de mera contagem matemática dos atos processuais.',
      'O processo apresenta regular andamento, considerada a pluralidade de réus, a existência de defensores distintos e os adiamentos do julgamento decorrentes de diligências requeridas pela defesa dos corréus, da impossibilidade de comparecimento do representante do Ministério Público por licença médica e da necessidade de observância ao prazo previsto no art. 479 do Código de Processo Penal.',
      'A redesignação da sessão do Tribunal do Júri para data próxima afasta a configuração de atraso injustificado imputável exclusivamente ao Poder Judiciário.',
      'A prisão preventiva encontra-se fundamentada na garantia da ordem pública, em razão da gravidade concreta dos delitos, praticados em concurso de agentes, mediante disparos de arma de fogo em estabelecimento comercial com resultado morte e múltiplas tentativas de homicídio.',
      'O modus operandi evidencia elevada periculosidade da conduta, pois os acusados, após serem retirados do estabelecimento, buscaram arma de fogo em veículo pertencente ao paciente e realizaram diversos disparos contra as vítimas.',
      'A persistência dos fundamentos cautelares afasta a alegação de ausência de contemporaneidade, uma vez que a contemporaneidade da prisão preventiva se refere à permanência dos motivos que justificam a medida, e não ao momento da prática delitiva.',
      'As medidas cautelares diversas da prisão mostram-se insuficientes para resguardar a ordem pública diante da gravidade concreta dos fatos.'
    ],
    dispositivoTese: {
      tese: [
        'O excesso de prazo na formação da culpa deve ser aferido à luz das peculiaridades do caso concreto, não resultando de critério exclusivamente matemático.',
        'O regular andamento do processo, a pluralidade de réus e as intercorrências processuais justificadas afastam a configuração de constrangimento ilegal por excesso de prazo.',
        'A gravidade concreta do homicídio qualificado consumado e tentado, praticado em concurso de agentes e com emprego de arma de fogo em local de grande circulação de pessoas, justifica a manutenção da prisão preventiva para garantia da ordem pública.',
        'A contemporaneidade da prisão preventiva relaciona-se à permanência dos fundamentos cautelares, sendo irrelevante o decurso do tempo quando subsiste o risco à ordem pública.',
        'As medidas cautelares diversas da prisão são inadequadas quando a gravidade concreta da conduta evidencia a necessidade da segregação cautelar.'
      ],
      dispositivosCitados: [
        'CF/1988, art. 5º, LXXVIII',
        'CPP, arts. 282, § 6º, 312 e 479',
        'CP, art. 121, § 2º, incisos II, III e IV; art. 14, II',
        'Lei nº 8.072/89, art. 1º, inciso I',
        'Lei nº 10.826/03, art. 16, § 1º, inciso IV'
      ],
      jurisprudenciaCitada: [
        'STJ, HC 707.047/AM, Rel. Min. Olindo Menezes (Desembargador Convocado do TRF da 1ª Região), Sexta Turma, j. 05.04.2022, DJe 07.04.2022',
        'STJ, HC 1.002.222/SC, Rel. Min. Sebastião Reis Júnior, Sexta Turma, j. 07.10.2025, DJEN 07.11.2025'
      ]
    },
    acordaoDetalhes: {
      decisao: 'À unanimidade, denegar a ordem, nos termos do voto da Relatora.',
      orgaoJulgadorVencedor: 'Gabinete Desª. RACHEL DURÃO CORREIA LIMA',
      composicao: 'Gabinete Desª. RACHEL DURÃO CORREIA LIMA - RACHEL DURAO CORREIA LIMA - Relator / Gabinete Des. LUIZ GUILHERME RISSO - LUIZ GUILHERME RISSO - Vogal / Gabinete Des. PEDRO VALLS FEU ROSA - PEDRO VALLS FEU ROSA - Vogal',
      votosVogais: [
        { desembargador: 'Gabinete Des. LUIZ GUILHERME RISSO - LUIZ GUILHERME RISSO (Vogal)', voto: 'Acompanhar' },
        { desembargador: 'Gabinete Des. PEDRO VALLS FEU ROSA - PEDRO VALLS FEU ROSA (Vogal)', voto: 'Acompanhar' }
      ]
    },
    fullText: `ESTADO DO ESPÍRITO SANTO
PODER JUDICIÁRIO

PROCESSO Nº 5014031-33.2026.8.08.0000

HABEAS CORPUS CRIMINAL (307)

PACIENTE: JONATHAN LOPES

COATOR: JUÍZO DA 1ª VARA CRIMINAL DA COMARCA DE LINHARES/ES

RELATOR(A): RACHEL DURAO CORREIA LIMA

EMENTA

DIREITO PROCESSUAL PENAL. HABEAS CORPUS. HOMICÍDIO QUALIFICADO CONSUMADO E TENTADO. POSSE DE ARMA DE FOGO DE USO RESTRITO. PRISÃO PREVENTIVA. EXCESSO DE PRAZO. INOCORRÊNCIA. GRAVIDADE CONCRETA DO DELITO. GARANTIA DA ORDEM PÚBLICA. CONTEMPORANEIDADE DOS FUNDAMENTOS. ORDEM DENEGADA.

I. CASO EM EXAME

1- Habeas corpus impetrado em favor de paciente denunciado pela suposta prática dos crimes previstos no art. 121, § 2º, incisos II, III e IV, do Código Penal, c/c art. 1º, inciso I, da Lei nº 8.072/89; art. 121, § 2º, incisos II, III e IV, c/c art. 14, II, do Código Penal, por três vezes, c/c art. 1º, inciso I, da Lei nº 8.072/89; e art. 16, § 1º, inciso IV, da Lei nº 10.826/03. A impetração sustenta constrangimento ilegal por excesso de prazo, ausência de fundamentação concreta da prisão preventiva e falta de contemporaneidade dos fundamentos cautelares, requerendo a revogação da custódia.

II. QUESTÃO EM DISCUSSÃO

2- Há três questões em discussão: (i) definir se a prisão preventiva configura constrangimento ilegal por excesso de prazo para submissão do paciente ao Tribunal do Júri; (ii) estabelecer se permanecem presentes os requisitos previstos no art. 312 do Código de Processo Penal para manutenção da custódia cautelar; e (iii) determinar se há ausência de contemporaneidade apta a afastar a prisão preventiva.

III. RAZÕES DE DECIDIR

3- O excesso de prazo na formação da culpa deve ser aferido segundo as peculiaridades do caso concreto, observados os princípios da razoabilidade e da proporcionalidade, não decorrendo de mera contagem matemática dos atos processuais.

4- O processo apresenta regular andamento, considerada a pluralidade de réus, a existência de defensores distintos e os adiamentos do julgamento decorrentes de diligências requeridas pela defesa dos corréus, da impossibilidade de comparecimento do representante do Ministério Público por licença médica e da necessidade de observância ao prazo previsto no art. 479 do Código de Processo Penal.

5- A redesignação da sessão do Tribunal do Júri para data próxima afasta a configuração de atraso injustificado imputável exclusivamente ao Poder Judiciário.

6- A prisão preventiva encontra-se fundamentada na garantia da ordem pública, em razão da gravidade concreta dos delitos, praticados em concurso de agentes, mediante disparos de arma de fogo em estabelecimento comercial com resultado morte e múltiplas tentativas de homicídio.

7- O modus operandi evidencia elevada periculosidade da conduta, pois os acusados, após serem retirados do estabelecimento, buscaram arma de fogo em veículo pertencente ao paciente e realizaram diversos disparos contra as vítimas.

8- A persistência dos fundamentos cautelares afasta a alegação de ausência de contemporaneidade, uma vez que a contemporaneidade da prisão preventiva se refere à permanência dos motivos que justificam a medida, e não ao momento da prática delitiva.

9- As medidas cautelares diversas da prisão mostram-se insuficientes para resguardar a ordem pública diante da gravidade concreta dos fatos.

IV. DISPOSITIVO E TESE

10- Ordem denegada.

Tese de julgamento:

1- O excesso de prazo na formação da culpa deve ser aferido à luz das peculiaridades do caso concreto, não resultando de critério exclusivamente matemático.

2- O regular andamento do processo, a pluralidade de réus e as intercorrências processuais justificadas afastam a configuração de constrangimento ilegal por excesso de prazo.

3- A gravidade concreta do homicídio qualificado consumado e tentado, praticado em concurso de agentes e com emprego de arma de fogo em local de grande circulação de pessoas, justifica a manutenção da prisão preventiva para garantia da ordem pública.

4- A contemporaneidade da prisão preventiva relaciona-se à permanência dos fundamentos cautelares, sendo irrelevante o decurso do tempo quando subsiste o risco à ordem pública.

5- As medidas cautelares diversas da prisão são inadequadas quando a gravidade concreta da conduta evidencia a necessidade da segregação cautelar.

Dispositivos relevantes citados: CF/1988, art. 5º, LXXVIII; CPP, arts. 282, § 6º, 312 e 479; CP, art. 121, § 2º, incisos II, III e IV; art. 14, II; Lei nº 8.072/89, art. 1º, inciso I; Lei nº 10.826/03, art. 16, § 1º, inciso IV.

Jurisprudência relevante citada: STJ, HC 707.047/AM, Rel. Min. Olindo Menezes (Desembargador Convocado do TRF da 1ª Região), Sexta Turma, j. 05.04.2022, DJe 07.04.2022; STJ, HC 1.002.222/SC, Rel. Min. Sebastião Reis Júnior, Sexta Turma, j. 07.10.2025, DJEN 07.11.2025.

ACÓRDÃO

Decisão: À unanimidade, denegar a ordem, nos termos do voto da Relatora.

Órgão julgador vencedor: Gabinete Desª. RACHEL DURÃO CORREIA LIMA

Composição de julgamento: Gabinete Desª. RACHEL DURÃO CORREIA LIMA - RACHEL DURAO CORREIA LIMA - Relator / Gabinete Des. LUIZ GUILHERME RISSO - LUIZ GUILHERME RISSO - Vogal / Gabinete Des. PEDRO VALLS FEU ROSA - PEDRO VALLS FEU ROSA - Vogal

VOTOS VOGAIS
Gabinete Des. LUIZ GUILHERME RISSO - LUIZ GUILHERME RISSO (Vogal)
Acompanhar

Gabinete Des. PEDRO VALLS FEU ROSA - PEDRO VALLS FEU ROSA (Vogal)
Acompanhar

RELATÓRIO

Cuidam os autos de pedido de Habeas Corpus impetrado em favor de JONATHAN LOPES, contra suposto ato coator praticado pelo JUIZ DE DIREITO DA 1ª VARA CRIMINAL DA COMARCA DE LINHARES nos autos nº 0002454-92.2022.8.08.0030 no qual o paciente foi denunciado pelos crimes do art. 121, §2º, incisos II, III e IV, do Código Penal, c/c art. 1º, inciso I, da Lei 8.072/89, do art. 121, §2º, incisos II, III e IV, c/c art. 14, inciso II, ambos do Código Penal, c/c art. 1º, inciso I, da Lei 8.072/89 (três vezes), e do art. 16, §1º, inciso IV, da Lei 10.826/03.

Sustenta o impetrante que o réu está preso preventivamente desde de agosto de 2022, existindo constrangimento ilegal pelo excesso de prazo, uma vez que a decisão de pronúncia foi proferida em 06/09/2024 e a sessão do júri designada para 01/04/2026 foi cancelada. Aduz ausência de fundamentação concreta e contemporaneidade para a manutenção da prisão. Assim, requer a imediata soltura do paciente.

Liminar indeferida (id. 20663501).

Informações prestadas pela autoridade coatora (id. 20776084).

Parecer da douta Procuradoria de Justiça opinando pela denegação da ordem (id. 20793190).

Eis o breve relatório. Inclua-se em pauta para julgamento.

VOTO VENCEDOR

Conforme relatado, trata-se de Habeas Corpus impetrado em favor de JONATHAN LOPES, contra suposto ato coator praticado pelo JUIZ DE DIREITO DA 1ª VARA CRIMINAL DA COMARCA DE LINHARES nos autos nº 0002454-92.2022.8.08.0030 no qual o paciente foi denunciado pelos crimes do art. 121, §2º, incisos II, III e IV, do Código Penal, c/c art. 1º, inciso I, da Lei 8.072/89, do art. 121, §2º, incisos II, III e IV, c/c art. 14, inciso II, ambos do Código Penal, c/c art. 1º, inciso I, da Lei 8.072/89 (três vezes), e do art. 16, §1º, inciso IV, da Lei 10.826/03.

Sustenta o impetrante que o réu está preso preventivamente desde de agosto de 2022, existindo constrangimento ilegal pelo excesso de prazo, uma vez que a decisão de pronúncia foi proferida em 06/09/2024 e a sessão do júri designada para 01/04/2026 foi cancelada. Aduz ausência de fundamentação concreta e contemporaneidade para a manutenção da prisão. Assim, requer a imediata soltura do paciente.

Liminar indeferida (id. 20663501).

Informações prestadas pela autoridade coatora (id. 20776084).

Parecer da douta Procuradoria de Justiça opinando pela denegação da ordem (id. 20793190).

Pois bem.

O entendimento do Superior Tribunal de Justiça, perfilhado por esta Corte, é firme no sentido de que “eventual constrangimento ilegal por excesso de prazo não resulta de mero critério matemático, mas de uma ponderação do julgador, observando os princípios da razoabilidade e proporcionalidade, à luz do disposto no art. 5º, LXXVIII, da Constituição, levando em consideração as peculiaridades do caso concreto, procurando evitar o retardamento injustificado da prestação jurisdicional” (STJ, HC 707.047/AM, Rel. Ministro OLINDO MENEZES (DESEMBARGADOR CONVOCADO DO TRF 1ª REGIÃO), SEXTA TURMA, julgado em 05/04/2022, DJe 07/04/2022).

Tendo em vista que o atraso injustificado apenas dará margem ao reconhecimento da ilegalidade da prisão se for atribuído exclusivamente à acusação ou ao Poder Judiciário, cabe à defesa trazer aos autos elementos suficientes a essa avaliação, com prova pré-constituída da ilegalidade invocada, tratando-se o habeas corpus de instrumento processual de via estreita, em que não se admite dilação probatória. Assim não fazendo, impede que órgão competente avalie a correção ou não do ato apontado como coator.

De qualquer sorte, ao compulsar os autos, não se verifica o flagrante excesso de prazo mencionado pela Impetrante, porquanto, analisando o andamento processual, observa-se que o processo tem sido regularmente impulsionado.

No caso em voga, trata-se de ação penal em face de três réus, com advogados distintos, sendo a denúncia oferecida e recebida em 06/09/2022 e a decisão de pronúncia proferida em 06/09/2024.

Vale destacar que a primeira sessão do júri designada para o dia 01/12/2025 foi cancelada em razão de diligências necessárias, como a localização da vítima Carlos Henrique, cuja oitiva em plenário foi solicitada pela defesa dos corréus.

Já a sessão do júri designada para hoje, dia 01/07/2026, teve que ser redesignada diante da impossibilidade de comparecimento do membro do Ministério Público, que encontra-se de licença médica.

Contudo, esse não foi o único motivo, eis que consta da decisão atacada que a defesa do corréu Cristiano juntou documentos às 23:56:10 do dia 26/06/2026, sexta-feira, após o término do expediente forense, o que inviabilizou a intimação do Ministério Público com a observância ao prazo do art. 479 do CPP.

Ademais, o júri já encontra-se redesignado para o dia 03/09/2026, não se vislumbrando excesso de prazo caracterizador de constrangimento ilegal.

Prosseguindo, o impetrante se insurge sobre a manutenção da prisão preventiva.

De acordo com a denúncia, no dia 10 de julho de 2022, os réus Cristiano e Jonathan foram expulsos da festa que ocorria na “Casa do Espeto”, na cidade de Linhares/ES, tendo o corréu Ademar se irritado com a situação e ameaçado os seguranças. Consta que os três réus foram até o carro de Jonathan buscar a arma de fogo e entregaram a Ademar, que retornou à “Casa do Espeto” armado, indo em direção aos seguranças, momento em que foi desarmado e imobilizado pela vítima Washington. Em seguida, Cristiano, juntamente com Jonathan, sacou a arma e efetuou diversos disparos contra as vítimas Rafael, Washington e Carlos Henrique. Os disparos atingiram Rafael no tórax, cujas lesões foram a causa de sua morte, e Luiz Felipe no braço direito, sendo este cliente que estava na festa no momento do tiroteio.

Diferente do que alega a defesa, a prisão preventiva do paciente encontra-se devidamente fundamentada apontando a presença dos requisitos do art. 312 do CPP.

A prisão preventiva foi mantida para garantia da ordem pública, considerando a gravidade concreta do delito e a ausência de modificação da situação fática.

Como visto, trata-se de crimes de homicídio consumado e tentado, praticados em concurso de agentes em um estabelecimento comercial do qual os réus Cristiano e Jonathan foram expulsos por estarem causando transtornos aos demais clientes. Consta dos autos que o corréu Ademar se irritou com a situação e saiu do estabelecimento a fim de "tirar satisfação" com os seguranças que tinham expulsado seus amigos. Em seguida, os três foram até o veículo do paciente e buscaram a arma de fogo que foi entregue a Ademar, responsável por efetuar os disparos. No entanto, Ademar foi imobilizado pelos seguranças, momento em que Cristiano, que estava do outro lado da rua observando toda a situação, juntamente com o paciente, sacou uma arma de fogo e efetuou diversos disparos em direção às vítimas.

Ora, o modus operandi revela a gravidade concreta do delito e justifica a manutenção da prisão.

Dessa forma, a custódia cautelar do paciente deve ser mantida, porque inalteradas as condições que a ensejaram, baseando-se sua segregação na necessidade, sobretudo, de se garantir a ordem pública.

Evidenciada a necessidade de custódia cautelar por força da gravidade concreta da conduta delituosa, não há que se falar em sua substituição por medidas cautelares diversas (art. 282, § 6º, do Código de Processo Penal).

Quanto à alegada ausência de contemporaneidade, saliento que, “a contemporaneidade da prisão preventiva refere-se aos motivos que a fundamentam, não ao momento da prática delitiva, sendo irrelevante o decurso do tempo se os motivos persistem” (HC n. 1.002.222/SC, relator Ministro Sebastião Reis Júnior, Sexta Turma, julgado em 7/10/2025, DJEN de 7/11/2025.). E, no caso, não há que se falar em ausência de contemporaneidade já que não houve alteração da situação fática, permanecendo o risco que a liberdade do réu representa à garantia da ordem pública.

Pelo exposto, DENEGO a ordem.

É como voto.`,
    sourceInstance: '2º Grau PJe',
    citedArticles: ['Art. 121, § 2º, CP', 'Art. 312, CPP', 'Art. 319, CPP', 'Lei 8.072/89'],
    dispositif: 'Ordem denegada por unanimidade.'
  },
  {
    id: 'dec-002',
    processNumber: '5008922-14.2026.8.08.0024',
    orderOfConcession: 'Concedida',
    judgmentDate: '18/Ago/2026',
    rawDate: '2026-08-18',
    subject: 'Ausência de fundamentação idônea no decreto preventivo',
    legalClass: 'HABEAS CORPUS CRIMINAL',
    magistrate: 'FERNANDO ZARDINI ANTONIO',
    judgingBody: '2ª Câmara Criminal',
    originJurisdiction: 'Vila Velha',
    defenseTheses: [
      'fundamentação genérica',
      'ausência de periculum libertatis',
      'desproporcionalidade da prisão',
      'condições pessoais favoráveis'
    ],
    requestType: 'Revogação de prisão preventiva',
    excerpt: 'Habeas corpus impetrado com pedido liminar. Prisão preventiva fundamentada unicamente na gravidade abstrata do delito de tráfico de drogas e menção genérica à garantia da ordem pública. Paciente primário, com residência fixa e ocupação lícita comprovadas nos autos. Ausência de elementos fáticos contemporâneos a indicar risco de reiteração criminosa ou embaraço à instrução criminal.',
    fullText: `ACÓRDÃO
HABEAS CORPUS CRIMINAL Nº 5008922-14.2026.8.08.0024
RELATOR: DESEMBARGADOR FERNANDO ZARDINI ANTONIO
ÓRGÃO JULGADOR: SEGUNDA CÂMARA CRIMINAL - TJES

EMENTA: HABEAS CORPUS. TRÁFICO DE DROGAS. PRISÃO PREVENTIVA. FUNDAMENTAÇÃO ABSTRATA. AUSÊNCIA DE ELEMENTOS CONCRETOS DEMONSTRADORES DO PERICULUM LIBERTATIS. MEDIDA EXCEPCIONAL. SUBSTITUIÇÃO POR CAUTELARES DIVERSAS DA PRISÃO (ART. 319, CPP). CONSTRANGIMENTO ILEGAL CONFIGURADO. ORDEM CONCEDIDA.

1. A jurisprudência pacífica dos Tribunais Superiores e desta Corte Estadual veda a decretação de prisão preventiva com base em motivação genérica, consubstanciada na gravidade abstrata do tipo penal.
2. Tratando-se de agente primário, com bons antecedentes, apreensão de quantidade moderada de entorpecentes desacompanhada de armamento ou indícios de integração em organização criminosa armada, revela-se adequada e suficiente a fixação de medidas cautelares alternativas.
3. Ordem concedida para deferir a liberdade provisória com imposição de comparecimento periódico em juízo e proibição de ausentar-se da comarca.`,
    sourceInstance: '2º Grau PJe',
    citedArticles: ['Art. 312, CPP', 'Art. 315, § 2º, CPP', 'Art. 319, I e IV, CPP'],
    dispositif: 'Ordem concedida para revogar a prisão preventiva, com imposição de medidas cautelares.'
  },
  {
    id: 'dec-003',
    processNumber: '5012390-48.2026.8.08.0048',
    orderOfConcession: 'Concessão Parcial',
    concessionNote: '282 parcial',
    judgmentDate: '15/Ago/2026',
    rawDate: '2026-08-15',
    subject: 'Prisão domiciliar para genitora de filhos menores de 12 anos',
    legalClass: 'HABEAS CORPUS CRIMINAL',
    magistrate: 'ROBSON LUIZ ALBANEZ',
    judgingBody: '1ª Câmara Criminal',
    originJurisdiction: 'Serra',
    defenseTheses: [
      'mãe com filho menor de 12 anos',
      'artigo 318-A do CPP',
      'HC Coletivo 143.641 STF',
      'vulnerabilidade familiar'
    ],
    requestType: 'Substituição por prisão domiciliar',
    excerpt: 'Impetração visando à substituição da custódia preventiva por prisão domiciliar em razão de a paciente ser genitora de duas crianças com idades de 3 e 6 anos, dependentes exclusivamente dos seus cuidados. Aplicação cogente do art. 318-A do CPP e das diretrizes do HC coletivo 143.641/SP do STF. Inexistência de crime cometido mediante violência ou grave ameaça à pessoa, nem contra os próprios descendentes.',
    fullText: `ACÓRDÃO
HABEAS CORPUS CRIMINAL Nº 5012390-48.2026.8.08.0048
RELATOR: DESEMBARGADOR ROBSON LUIZ ALBANEZ
ÓRGÃO JULGADOR: PRIMEIRA CÂMARA CRIMINAL - TJES

EMENTA: HABEAS CORPUS. CRIME DE ASSOCIAÇÃO PARA O TRÁFICO. MÃE DE CRIANÇAS MENORES DE 12 ANOS. REQUISITOS DO ART. 318-A DO CÓDIGO DE PROCESSO PENAL PREENCHIDOS. CONCESSÃO DA PRISÃO DOMICILIAR CUMULADA COM MONITORAÇÃO ELETRÔNICA. CONCESSÃO PARCIAL DA ORDEM.

1. Nos termos do art. 318-A do Código de Processo Penal, introduzido pela Lei nº 13.769/2018, a prisão preventiva imposta à mulher gestante ou que for mãe ou responsável por crianças ou pessoas com deficiência será substituída por prisão domiciliar, desde que não tenha cometido crime com violência ou grave ameaça à pessoa, nem contra seu filho ou dependente.
2. Comprovada a maternidade de crianças impúberes sem apoio paterno no lar, impõe-se a substituição do encarceramento intramuros pela prisão domiciliar, com monitoração eletrônica como medida fiscalizatória necessária.
3. Ordem parcialmente concedida.`,
    sourceInstance: '2º Grau PJe',
    citedArticles: ['Art. 318-A, CPP', 'Lei 13.769/18', 'HC 143.641/SP STF'],
    dispositif: 'Ordem parcialmente concedida para deferir a prisão domiciliar com tornozeleira eletrônica.'
  },
  {
    id: 'dec-004',
    processNumber: '0019482-66.2025.8.08.0011',
    orderOfConcession: 'Concedida',
    judgmentDate: '12/Ago/2026',
    rawDate: '2026-08-12',
    subject: 'Aposentadoria especial e laudo pericial inconclusivo - PPP',
    legalClass: 'APELAÇÃO CÍVEL',
    magistrate: 'ELISABETH LORDES',
    judgingBody: '3ª Câmara Cível',
    originJurisdiction: 'São Gabriel da Palha',
    defenseTheses: [
      'atividade especial insalubre',
      'laudo pericial ambiental',
      'exposição a agentes biológicos e químicos',
      'direito previdenciário municipal'
    ],
    requestType: 'Reconhecimento de tempo especial e concessão de benefício',
    excerpt: 'Apelação Cível em Ação Previdenciária ajuizada por servidor público municipal de São Gabriel da Palha (Agente Comunitário de Saúde / Vigilância Sanitária). Laudo pericial e Perfil Profissiográfico Previdenciário (PPP) atestando exposição habitual e permanente a agentes biológicos patogênicos nocivos à saúde sem fornecimento de EPI eficaz. Reforma da sentença para conceder a aposentadoria especial integral com pagamento dos retroativos.',
    fullText: `ACÓRDÃO
APELAÇÃO CÍVEL Nº 0019482-66.2025.8.08.0011
APELANTE: SERVIDOR PÚBLICO MUNICIPAL
APELADO: INSTITUTO DE PREVIDÊNCIA DOS SERVIDORES PÚBLICOS DE SÃO GABRIEL DA PALHA
RELATORA: DESEMBARGADORA ELISABETH LORDES
ÓRGÃO JULGADOR: TERCEIRA CÂMARA CÍVEL - TJES

EMENTA: DIREITO PREVIDENCIÁRIO E ADMINISTRATIVO. APELAÇÃO CÍVEL. SERVIDOR MUNICIPAL. AGENTE DE COMBATE A ENDEMIAS E VIGILÂNCIA SANITÁRIA. COMPROVAÇÃO DE ATIVIDADE ESPECIAL. LAUDO TÉCNICO DAS CONDIÇÕES AMBIENTAIS DE TRABALHO (LTCAT) E PPP. EXPOSIÇÃO HABITUAL E PERMANENTE A AGENTES BIOLÓGICOS E QUÍMICOS. DIREITO À APOSENTADORIA ESPECIAL RECONHECIDO. CONSECTÁRIOS LEGAIS. RECURSO PROVIDO.

1. Restando demonstrado pelo Perfil Profissiográfico Previdenciário (PPP) e pelo laudo pericial judicial que o autor exerceu suas atribuições sob condições especiais com contato direto e contínuo com agentes biológicos infecciosos, impõe-se a averbação do período especial.
2. Comprovado o implemento dos requisitos temporais e contributivos para a aposentadoria especial antes da vigência de reformas prejudiciais, faz jus o segurado ao benefício com proventos integrais e paridade.
3. Recurso de apelação conhecido e provido.`,
    sourceInstance: '2º Grau PJe',
    citedArticles: ['Art. 40, § 4º, III, CF/88', 'Súmula Vinculante 33 STF', 'Art. 57, Lei 8.213/91'],
    dispositif: 'Recurso conhecido e provido para conceder a aposentadoria especial.'
  },
  {
    id: 'dec-005',
    processNumber: '5003411-92.2026.8.08.0006',
    orderOfConcession: 'Não concedida',
    judgmentDate: '08/Ago/2026',
    rawDate: '2026-08-08',
    subject: 'Prisão preventiva - Reiteração criminosa e garantia da ordem pública',
    legalClass: 'HABEAS CORPUS CRIMINAL',
    magistrate: 'EWERTON SCHWAB PINTO JUNIOR',
    judgingBody: '1ª Câmara Criminal',
    originJurisdiction: 'Linhares',
    defenseTheses: [
      'presunção de inocência',
      'medidas do art. 319 CPP',
      'falta de contemporaneidade dos fatos'
    ],
    requestType: 'Revogação de prisão preventiva',
    excerpt: 'Habeas corpus com foco em alegação de constrangimento ilegal por prisão preventiva mantida em crime de roubo majorado por concurso de pessoas e emprego de arma de fogo. Histórico de reiteração delitiva com condenação anterior com trânsito em julgado. Risco concreto de reiteração delitiva que autoriza a custódia para garantia da ordem pública nos termos do art. 312 do Código de Processo Penal.',
    fullText: `ACÓRDÃO
HABEAS CORPUS CRIMINAL Nº 5003411-92.2026.8.08.0006
RELATOR: DESEMBARGADOR EWERTON SCHWAB PINTO JÚNIOR
ÓRGÃO JULGADOR: PRIMEIRA CÂMARA CRIMINAL - TJES

EMENTA: HABEAS CORPUS. ROUBO CIRCUNSTANCIADO. CONCURSO DE PESSOAS E EMPREGO DE ARMA DE FOGO. DECRETO DE PRISÃO PREVENTIVA MOTIVADO. REITERAÇÃO CRIMINOSA. PACIENTE REINCIDENTE ESPECÍFICO. GARANTIA DA ORDEM PÚBLICA. MEDIDAS CAUTELARES INSUFICIENTES. DENEGAÇÃO DA ORDEM.

1. A segregação cautelar mostra-se devidamente fundamentada quando demonstrada a periculosidade do paciente através do modus operandi empregado na execução do crime e de sua propensão à reiteração delitiva, aferida por certidão de antecedentes criminais.
2. Mostram-se inadequadas as medidas cautelares alternativas quando a segregação corporal for indispensável para afastar o agente do convívio social.
3. Ordem denegada.`,
    sourceInstance: '2º Grau PJe',
    citedArticles: ['Art. 157, § 2º, II e § 2º-A, I, CP', 'Art. 312, CPP'],
    dispositif: 'Ordem denegada por unanimidade.'
  },
  {
    id: 'dec-006',
    processNumber: '5019842-12.2026.8.08.0000',
    orderOfConcession: 'Não conhecido',
    concessionNote: 'Não conhecido',
    judgmentDate: '05/Ago/2026',
    rawDate: '2026-08-05',
    subject: 'Inadequação da via eleita - Supressão de instância',
    legalClass: 'HABEAS CORPUS CRIMINAL',
    magistrate: 'NAMYR CARLOS DE SOUZA FILHO',
    judgingBody: '2ª Câmara Criminal',
    originJurisdiction: 'Cachoeiro de Itapemirim',
    defenseTheses: [
      'supressão de instância',
      'inadequação da via eleita',
      'não conhecimento de matéria não apreciada'
    ],
    requestType: 'Trancamento de inquérito policial',
    excerpt: 'Impetração de habeas corpus pretendendo o trancamento de inquérito policial sob alegação de atipicidade material da conduta. Matéria que não foi submetida previamente à apreciação do juízo de primeiro grau, configurando indevida supressão de instância. Ausência de ilegalidade flagrante ou teratologia a autorizar a concessão de ordem de ofício.',
    fullText: `ACÓRDÃO
HABEAS CORPUS CRIMINAL Nº 5019842-12.2026.8.08.0000
RELATOR: DESEMBARGADOR NAMYR CARLOS DE SOUZA FILHO
ÓRGÃO JULGADOR: SEGUNDA CÂMARA CRIMINAL - TJES

EMENTA: HABEAS CORPUS. PEDIDO DE TRANCAMENTO DE INQUÉRITO POLICIAL. AUSÊNCIA DE PRÉVIA APRECIAÇÃO PELO JUÍZO A QUO. SUPRESSÃO DE INSTÂNCIA. INVIABILIDADE DO CONHECIMENTO. NÃO CONHECIMENTO DA ORDEM.

1. É inviável a análise originária por este Tribunal de matéria defensiva que não foi ventilada nem apreciada pelo magistrado de primeiro grau, sob pena de intolerável supressão de instância.
2. Inexistência de teratologia manifesta ou flagrante constrangimento ilegal que justifique atuação ex officio.
3. Habeas corpus não conhecido.`,
    sourceInstance: '2º Grau PJe',
    citedArticles: ['Art. 648, I, CPP', 'Art. 105, II, a, CF/88'],
    dispositif: 'Habeas corpus não conhecido.'
  },
  {
    id: 'dec-007',
    processNumber: '0034189-77.2025.8.08.0035',
    orderOfConcession: 'Concedida',
    judgmentDate: '01/Ago/2026',
    rawDate: '2026-08-01',
    subject: 'Dano moral por inclusão indevida em cadastro de inadimplentes - Serasa',
    legalClass: 'APELAÇÃO CÍVEL',
    magistrate: 'JORGE HENRIQUE VALLE DOS SANTOS',
    judgingBody: '1ª Câmara Cível',
    originJurisdiction: 'Vila Velha',
    defenseTheses: [
      'inscrição indevida no spc/serasa',
      'dano moral in re ipsa',
      'falha na prestação do serviço',
      'fraude praticada por terceiro'
    ],
    requestType: 'Indenização por danos morais e declaração de inexistência de débito',
    excerpt: 'Apelação cível em ação declaratória c/c indenizatória. Negativação indevida do nome do consumidor por débito oriundo de contratação fraudulenta por terceiro. Responsabilidade objetiva da instituição financeira com base na Súmula 479 do STJ. Dano moral in re ipsa configurado. Majoração do quantum indenizatório para R$ 10.000,00 em consonância com os parâmetros desta Câmara.',
    fullText: `ACÓRDÃO
APELAÇÃO CÍVEL Nº 0034189-77.2025.8.08.0035
APELANTE: CONSUMIDOR
APELADO: BANCO BRADESCO S.A.
RELATOR: DESEMBARGADOR JORGE HENRIQUE VALLE DOS SANTOS
ÓRGÃO JULGADOR: PRIMEIRA CÂMARA CÍVEL - TJES

EMENTA: DIREITO DO CONSUMIDOR E CIVIL. APELAÇÃO CÍVEL. INSCRIÇÃO INDEVIDA NOS ÓRGÃOS DE PROTEÇÃO AO CRÉDITO. FRAUDE PRATICADA POR TERCEIRO (FORTUITO INTERNO). SÚMULA 479 DO STJ. DANO MORAL IN RE IPSA. MAJORAÇÃO DO VALOR DA CONDENAÇÃO. RECURSO CONHECIDO E PROVIDO.

1. As instituições bancárias respondem objetivamente pelos danos causados por fraudes e delitos praticados por terceiros no âmbito de operações bancárias, porquanto configuram fortuito interno (Súmula 479 do Superior Tribunal de Justiça).
2. A indevida inscrição do nome do consumidor em cadastros restritivos de crédito gera dano moral in re ipsa, prescindindo de comprovação do prejuízo concreto.
3. Quantum indenizatório majorado para R$ 10.000,00 (dez mil reais), valor condizente com as funções punitivo-pedagógica e compensatória da reparação civil.
4. Recurso provido.`,
    sourceInstance: '2º Grau PJe',
    citedArticles: ['Art. 14, CDC', 'Art. 927, Parágrafo Único, CC', 'Súmula 479 STJ'],
    dispositif: 'Recurso conhecido e provido com majoração de honorários advocatícios.'
  },
  {
    id: 'dec-008',
    processNumber: '5001290-71.2026.8.08.0012',
    orderOfConcession: 'Prejudicado',
    concessionNote: 'Prejudicado',
    judgmentDate: '28/Jul/2026',
    rawDate: '2026-07-28',
    subject: 'Perda superveniente do objeto - Revogação da prisão pelo juízo a quo',
    legalClass: 'HABEAS CORPUS CRIMINAL',
    magistrate: 'RACHEL DURAO CORREIA LIMA',
    judgingBody: '1ª Câmara Criminal',
    originJurisdiction: 'Cariacica',
    defenseTheses: [
      'perda do objeto',
      'alvará de soltura expedido',
      'cessação da coação ilegal'
    ],
    requestType: 'Revogação de prisão preventiva',
    excerpt: 'Habeas corpus impetrado com o objetivo de obter a liberdade provisória. Informações prestadas pela autoridade apontada como coatora noticiando que em audiência de instrução e julgamento foi deferida a liberdade provisória ao paciente com expedição de alvará de soltura. Perda superveniente do interesse recursal. Writ julgado prejudicado nos termos do art. 659 do CPP.',
    fullText: `ACÓRDÃO
HABEAS CORPUS CRIMINAL Nº 5001290-71.2026.8.08.0012
RELATORA: DESEMBARGADORA RACHEL DURÃO CORREIA LIMA
ÓRGÃO JULGADOR: PRIMEIRA CÂMARA CRIMINAL - TJES

EMENTA: HABEAS CORPUS. PACIENTE COLOCADO EM LIBERDADE PELO JUÍZO DE PRIMEIRO GRAU. EXPEDIÇÃO DE ALVARÁ DE SOLTURA CUMPRIDO. CESSAÇÃO DO ALEGADO CONSTRANGIMENTO ILEGAL. PERDA DO OBJETO. PEDIDO PREJUDICADO. ART. 659 DO CPP.

1. Tendo o magistrado a quo revogado a segregação cautelar do paciente e expedido o respectivo alvará de soltura, resta esvaziado o objeto da impetração, impondo-se a extinção do feito sem julgamento de mérito nos moldes do art. 659 do Código de Processo Penal.
2. Ordem julgada prejudicada.`,
    sourceInstance: '2º Grau PJe',
    citedArticles: ['Art. 659, CPP'],
    dispositif: 'Habeas corpus julgado prejudicado diante da perda superveniente de objeto.'
  },
  {
    id: 'dec-009',
    processNumber: '5007743-88.2026.8.08.0021',
    orderOfConcession: 'Concedida',
    judgmentDate: '25/Jul/2026',
    rawDate: '2026-07-25',
    subject: 'Ilicitude da prova decorrente de invasão domiciliar sem mandado',
    legalClass: 'HABEAS CORPUS CRIMINAL',
    magistrate: 'FERNANDO ZARDINI ANTONIO',
    judgingBody: '2ª Câmara Criminal',
    originJurisdiction: 'Guarapari',
    defenseTheses: [
      'inviolabilidade de domicílio',
      'ausência de fundadas razões',
      'nulidade da busca domiciliar',
      'frutos da árvore envenenada'
    ],
    requestType: 'Trancamento da ação penal por prova ilícita',
    excerpt: 'Habeas corpus com pleito de nulidade das provas colhidas mediante ingresso forçado de policiais militares em domicílio sem mandado judicial, fundado apenas em denúncia anônima e atitude suspeita. Violação ao art. 5º, XI, da Constituição Federal e ao entendimento fixado pelo STJ no REsp 1.574.681/RS e STF no Tema 280 da Repercussão Geral. Ilicitude das provas e trancamento da ação penal.',
    fullText: `ACÓRDÃO
HABEAS CORPUS CRIMINAL Nº 5007743-88.2026.8.08.0021
RELATOR: DESEMBARGADOR FERNANDO ZARDINI ANTONIO
ÓRGÃO JULGADOR: SEGUNDA CÂMARA CRIMINAL - TJES

EMENTA: HABEAS CORPUS. TRÁFICO DE DROGAS. INGRESSO EM DOMICÍLIO SEM MANDADO JUDICIAL E SEM CONSENTIMENTO VÁLIDO. DENÚNCIA ANÔNIMA DESACOMPANHADA DE DILIGÊNCIAS PRÉVIAS. ILICITUDE DA PROVA OBTIDA. TEORIA DOS FRUTOS DA ÁRVORE ENVENENADA. CONCESSÃO DA ORDEM PARA TRANCAMENTO DA AÇÃO PENAL.

1. Conforme jurisprudência pacificada pelo STF (Tema 280 da Repercussão Geral) e pelo STJ, o ingresso forçado em domicílio sem mandado judicial exige a demonstração inequívoca de fundada suspeita prévia da ocorrência de flagrante delito.
2. A mera alegação de nervosismo ou denúncia apócrifa sem investigação preliminar não constitui justa causa a respaldar a violação do asilo inviolável do cidadão.
3. Declarada a nulidade das provas derivadas da busca domiciliar ilegítima, impõe-se o trancamento do processo criminal por ausência de justa causa.
4. Ordem concedida.`,
    sourceInstance: '2º Grau PJe',
    citedArticles: ['Art. 5º, XI, CF/88', 'Art. 157, CPP', 'Tema 280 STF'],
    dispositif: 'Ordem concedida para anular as provas e determinar o trancamento da ação penal.'
  },
  {
    id: 'dec-010',
    processNumber: '0028711-40.2025.8.08.0014',
    orderOfConcession: 'Concedida',
    judgmentDate: '20/Jul/2026',
    rawDate: '2026-07-20',
    subject: 'Fornecimento de medicamento de alto custo não incorporado pelo SUS',
    legalClass: 'AGRAVO DE INSTRUMENTO',
    magistrate: 'ROBSON LUIZ ALBANEZ',
    judgingBody: '2ª Câmara Cível',
    originJurisdiction: 'Colatina',
    defenseTheses: [
      'direito à saúde',
      'imprescritibilidade do tratamento',
      'cumprimento dos requisitos do Tema 106 do STJ',
      'relatório médico circunstanciado'
    ],
    requestType: 'Tutela provisória de urgência para fornecimento de fármaco',
    excerpt: 'Agravo de Instrumento interposto pelo Estado do Espírito Santo contra decisão que deferiu tutela de urgência obrigando o fornecimento de medicamento oncológico biológico não constante na RENAME. Demonstração pericial e laudo subscrito por médico assistente atestando imprescindibilidade do fármaco e ineficácia dos tratamentos padronizados pelo SUS. Incidência cumulativa dos critérios do Tema 106/STJ.',
    fullText: `ACÓRDÃO
AGRAVO DE INSTRUMENTO Nº 0028711-40.2025.8.08.0014
AGRAVANTE: ESTADO DO ESPÍRITO SANTO
AGRAVADO: PACIENTE ONCOLÓGICO
RELATOR: DESEMBARGADOR ROBSON LUIZ ALBANEZ
ÓRGÃO JULGADOR: SEGUNDA CÂMARA CÍVEL - TJES

EMENTA: DIREITO CONSTITUCIONAL E PROCESSUAL CIVIL. AGRAVO DE INSTRUMENTO. OBRIGAÇÃO DE FAZER. FORNECIMENTO DE MEDICAMENTO ONCOLÓGICO NÃO INCORPORADO EM ATOS NORMATIVOS DO SUS. TEMA 106 DO STJ. REQUISITOS PREENCHIDOS. MANUTENÇÃO DA TUTELA ANTECIPADA. RECURSO CONHECIDO E DESPROVIDO.

1. A concessão dos medicamentos não incorporados em atos normativos do SUS exige a presença cumulativa dos requisitos fixados no Tema 106/STJ: i) comprovação da imprescindibilidade ou necessidade do medicamento; ii) incapacidade financeira do requerente; iii) registro do medicamento na ANVISA.
2. Presente o laudo médico circunstanciado emitido por profissional vinculado ao SUS apontando a urgência do tratamento e a ineficácia dos fármacos fornecidos pela rede pública, deve ser mantida a decisão concessiva da tutela de urgência.
3. Recurso desprovido.`,
    sourceInstance: '2º Grau PJe',
    citedArticles: ['Art. 196, CF/88', 'Art. 300, CPC', 'Tema 106 STJ'],
    dispositif: 'Agravo de Instrumento conhecido e desprovido.'
  },
  {
    id: 'dec-011',
    processNumber: '5010044-77.2026.8.08.0024',
    orderOfConcession: 'Concessão Parcial',
    concessionNote: 'Parcial',
    judgmentDate: '16/Jul/2026',
    rawDate: '2026-07-16',
    subject: 'Readequação da pena e substituição por restritiva de direitos',
    legalClass: 'APELAÇÃO CRIMINAL',
    magistrate: 'RACHEL DURAO CORREIA LIMA',
    judgingBody: '1ª Câmara Criminal',
    originJurisdiction: 'Vitória',
    defenseTheses: [
      'dosimetria da pena',
      'afastamento de circunstâncias judiciais negativas',
      'substituição da pena privativa de liberdade',
      'regime aberto'
    ],
    requestType: 'Redução da pena-base e fixação de regime aberto',
    excerpt: 'Apelação criminal interposta pela defesa contra condenação por furto qualificado tentado. Magistrado sentenciante que exasperou indevidamente a pena-base valorando negativamente os motivos e consequências do crime com fundamentos inerentes ao próprio tipo penal. Redimensionamento da pena final e concessão parcial para fixar o regime aberto e substituir por prestação de serviços à comunidade.',
    fullText: `ACÓRDÃO
APELAÇÃO CRIMINAL Nº 5010044-77.2026.8.08.0024
RELATORA: DESEMBARGADORA RACHEL DURÃO CORREIA LIMA
ÓRGÃO JULGADOR: PRIMEIRA CÂMARA CRIMINAL - TJES

EMENTA: APELAÇÃO CRIMINAL. FURTO QUALIFICADO TENTADO. DOSIMETRIA DA PENA. PRIMEIRA FASE. CIRCUNSTÂNCIAS JUDICIAIS VALORADAS NEGATIVAMENTE DE FORMA INIDÔNEA. REDUÇÃO DA PENA-BASE AO MÍNIMO LEGAL. FIXAÇÃO DE REGIME ABERTO. SUBSTITUIÇÃO POR PENA RESTRITIVA DE DIREITOS. RECURSO PARCIALMENTE PROVIDO.

1. Elementos inerentes ao próprio tipo penal não podem servir de supedâneo para a exasperação da pena-base na primeira etapa da dosimetria penal.
2. Fixada a reprimenda em patamar inferior a quatro anos para réu primário e com circunstâncias favoráveis, é de rigor a fixação do regime inicial aberto e a substituição da pena privativa de liberdade por restritivas de direitos (art. 44, CP).
3. Recurso conhecido e parcialmente provido.`,
    sourceInstance: '2º Grau PJe',
    citedArticles: ['Art. 59, CP', 'Art. 44, CP', 'Art. 33, § 2º, c, CP'],
    dispositif: 'Recurso parcialmente provido para reduzir a pena e conceder a substituição.'
  },
  {
    id: 'dec-012',
    processNumber: '0015509-32.2025.8.08.0048',
    orderOfConcession: 'Não concedida',
    judgmentDate: '10/Jul/2026',
    rawDate: '2026-07-10',
    subject: 'Impossibilidade de revisão contratual sem onerosidade excessiva comprovada',
    legalClass: 'APELAÇÃO CÍVEL',
    magistrate: 'JORGE HENRIQUE VALLE DOS SANTOS',
    judgingBody: '1ª Câmara Cível',
    originJurisdiction: 'Serra',
    defenseTheses: [
      'pacta sunt servanda',
      'teoria da imprevisão',
      'legalidade da taxa de juros remuneratórios contratada'
    ],
    requestType: 'Revisão de cláusulas contratuais de financiamento de veículo',
    excerpt: 'Ação revisional de contrato de financiamento com garantia de alienação fiduciária. Alegação de juros abusivos e capitalização indevida. Taxa de juros praticada pela instituição financeira que se encontra dentro da média de mercado divulgada pelo Banco Central do Brasil para o período da contratação. Súmula 382 e 539 do STJ. Improcedência mantida.',
    fullText: `ACÓRDÃO
APELAÇÃO CÍVEL Nº 0015509-32.2025.8.08.0048
RELATOR: DESEMBARGADOR JORGE HENRIQUE VALLE DOS SANTOS
ÓRGÃO JULGADOR: PRIMEIRA CÂMARA CÍVEL - TJES

EMENTA: APELAÇÃO CÍVEL. AÇÃO REVISIONAL DE CONTRATO BANCÁRIO. FINANCIAMENTO DE VEÍCULO. JUROS REMUNERATÓRIOS. TAXA MÉDIA DE MERCADO DIVULGADA PELO BACEN. CAPITALIZAÇÃO MENSAL EXPRESSAMENTE PACTUADA. LEGALIDADE. SÚMULAS 539 E 541 DO STJ. RECURSO DESPROVIDO.

1. A estipulação de juros remuneratórios superiores a 12% ao ano, por si só, não indica abusividade (Súmula 382 do STJ), impondo-se a comprovação de que superam a média de mercado divulgada pelo BACEN.
2. É permitida a capitalização de juros com periodicidade inferior à anual em contratos celebrados com instituições financeiras após 31/03/2000, desde que expressamente pactuada.
3. Recurso conhecido e desprovido.`,
    sourceInstance: '2º Grau PJe',
    citedArticles: ['Súmula 382 STJ', 'Súmula 539 STJ', 'Art. 591, CC'],
    dispositif: 'Recurso de apelação conhecido e desprovido.'
  },
  {
    id: 'dec-013',
    processNumber: '5004419-58.2026.8.08.0024',
    orderOfConcession: 'Concedida',
    judgmentDate: '03/Jul/2026',
    rawDate: '2026-07-03',
    subject: 'Trancamento de termo circunstanciado por atipicidade da conduta de desacato',
    legalClass: 'HABEAS CORPUS CRIMINAL',
    magistrate: 'FERNANDO ZARDINI ANTONIO',
    judgingBody: '2ª Câmara Criminal',
    originJurisdiction: 'Vitória',
    defenseTheses: [
      'liberdade de expressão',
      'atipicidade material',
      'ausência de dolo de desacatar',
      'crítica à atuação de agente público'
    ],
    requestType: 'Trancamento de procedimento investigatório',
    excerpt: 'Habeas corpus com objetivo de trancar procedimento por suposto crime de desacato (art. 331 do CP). Manifestação crítica proferida por cidadão durante fiscalização de trânsito em tom de descontentamento com o serviço, desprovida de intenção deliberada de ofender a dignidade ou o prestígio da função pública. Atipicidade material e garantia constitucional da livre manifestação de pensamento.',
    fullText: `ACÓRDÃO
HABEAS CORPUS CRIMINAL Nº 5004419-58.2026.8.08.0024
RELATOR: DESEMBARGADOR FERNANDO ZARDINI ANTONIO
ÓRGÃO JULGADOR: SEGUNDA CÂMARA CRIMINAL - TJES

EMENTA: HABEAS CORPUS. DIREITO PENAL E PROCESSUAL PENAL. CRIME DE DESACATO (ART. 331 DO CP). DESABAFO E CRÍTICA VEEMENTE À PRESTAÇÃO DE SERVIÇO PÚBLICO. AUSÊNCIA DO ELEMENTO SUBJETIVO ESPECÍFICO (ANIMUS INJURIANDI VEL OFFENDENDI). ATIPICIDADE CONFIGURADA. CONCESSÃO DA ORDEM.

1. Para a configuração do delito de desacato, exige-se o dolo específico de ultrajar, desprestigiar ou menosprezar o funcionário no exercício de suas funções ou em razão delas.
2. A mera manifestação de desabafo ou inconformismo exacerbado, conquanto possa soar ríspida, não perfaz a tipicidade subjetiva do desacato penal.
3. Ordem concedida para determinar o trancamento do procedimento.`,
    sourceInstance: '2º Grau PJe',
    citedArticles: ['Art. 331, CP', 'Art. 5º, IV, CF/88', 'Art. 648, I, CPP'],
    dispositif: 'Ordem concedida para trancar o procedimento penal.'
  },
  {
    id: 'dec-014',
    processNumber: '0004921-63.2025.8.08.0011',
    orderOfConcession: 'Concedida',
    judgmentDate: '29/Jun/2026',
    rawDate: '2026-06-29',
    subject: 'Restabelecimento de benefício previdenciário por incapacidade temporária',
    legalClass: 'APELAÇÃO CÍVEL',
    magistrate: 'ELISABETH LORDES',
    judgingBody: '3ª Câmara Cível',
    originJurisdiction: 'São Gabriel da Palha',
    defenseTheses: [
      'incapacidade total e temporária',
      'perícia judicial oficial',
      'nexo causal com a atividade laborativa habitual',
      'retroatividade à cessação indevida'
    ],
    requestType: 'Restabelecimento de auxílio por incapacidade temporária (auxílio-doença)',
    excerpt: 'Apelação Cível em face de sentença de improcedência. Segurado portador de discopatia lombar degenerativa incapacitante para o labor habitual na agricultura e construção civil. Laudo pericial produzido em juízo que atestou a incapacidade temporária e necessidade de tratamento cirúrgico/fisioterápico continuado. Sentença reformada para determinar o restabelecimento imediato com pagamento de valores pretéritos corrigidos.',
    fullText: `ACÓRDÃO
APELAÇÃO CÍVEL Nº 0004921-63.2025.8.08.0011
APELANTE: TRABALHADOR RURAL
APELADO: INSTITUTO NACIONAL DO SEGURO SOCIAL - INSS
RELATORA: DESEMBARGADORA ELISABETH LORDES
ÓRGÃO JULGADOR: TERCEIRA CÂMARA CÍVEL - TJES

EMENTA: DIREITO PREVIDENCIÁRIO. APELAÇÃO CÍVEL. AUXÍLIO POR INCAPACIDADE TEMPORÁRIA (AUXÍLIO-DOENÇA). COMPROVAÇÃO DA QUALIDADE DE SEGURADO, CARÊNCIA E INCAPACIDADE LABORATIVA POR PERÍCIA MÉDICA JUDICIAL. CESSAÇÃO INDEVIDA NA ESFERA ADMINISTRATIVA. DIREITO AO RESTABELECIMENTO DESDE A DATA DA INDEVIDA INTERRUPÇÃO. RECURSO PROVIDO.

1. Comprovada a incapacidade laboral temporária para o desempenho da atividade habitual através de perícia médica judicial conclusiva e preenchidos os demais requisitos de carência e qualidade de segurado, é devido o benefício previdenciário.
2. O termo inicial do benefício deve ser fixado a contar do dia seguinte ao da indevida cessação administrativa (DCB), respeitada a prescrição quinquenal.
3. Apelação conhecida e provida.`,
    sourceInstance: '2º Grau PJe',
    citedArticles: ['Art. 59, Lei 8.213/91', 'Tema 905 STJ'],
    dispositif: 'Recurso provido para restabelecer o benefício previdenciário.'
  },
  {
    id: 'dec-015',
    processNumber: '5015520-41.2026.8.08.0000',
    orderOfConcession: 'Não concedida',
    judgmentDate: '22/Jun/2026',
    rawDate: '2026-06-22',
    subject: 'Organização criminosa armada e tráfico internacional de entorpecentes',
    legalClass: 'HABEAS CORPUS CRIMINAL',
    magistrate: 'ROBSON LUIZ ALBANEZ',
    judgingBody: '1ª Câmara Criminal',
    originJurisdiction: 'Vitória',
    defenseTheses: [
      'falta de individualização da conduta',
      'predicados pessoais favoráveis',
      'pandemia e medidas sanitárias'
    ],
    requestType: 'Revogação de prisão preventiva',
    excerpt: 'Habeas corpus em favor de acusado de liderar célula de organização criminosa armada no Estado do Espírito Santo. Apreensão de fuzis, pistolas e carregadores de uso restrito, além de grande volume de cocaína em depósito clandestino. Risco extremo à ordem e segurança pública que não pode ser debelado por medidas cautelares periféricas.',
    fullText: `ACÓRDÃO
HABEAS CORPUS CRIMINAL Nº 5015520-41.2026.8.08.0000
RELATOR: DESEMBARGADOR ROBSON LUIZ ALBANEZ
ÓRGÃO JULGADOR: PRIMEIRA CÂMARA CRIMINAL - TJES

EMENTA: HABEAS CORPUS. ORGANIZAÇÃO CRIMINOSA ARMADA. TRÁFICO ILÍCITO DE DROGAS E POSSE ILEGAL DE ARMAS DE FOGO DE USO RESTRITO. PRISÃO PREVENTIVA. GRAVIDADE CONCRETA EXTRAORDINÁRIA. PERICULOSIDADE DO AGENTE. IMPRESCINDIBILIDADE DA SEGREGAÇÃO PARA INTERRUPÇÃO DAS ATIVIDADES DO GRUPO CRIMINOSO. ORDEM DENEGADA.

1. A participação em organização criminosa armada e estruturada justifica a prisão preventiva para interromper a atuação da rede delituosa, consoante uníssona jurisprudência do STJ e do STF.
2. Condições pessoais favoráveis não têm o condão de afastar a constrição cautelar quando demonstrada sua extrema necessidade.
3. Ordem denegada.`,
    sourceInstance: '2º Grau PJe',
    citedArticles: ['Lei 12.850/13', 'Art. 312, CPP', 'Art. 33, Lei 11.343/06'],
    dispositif: 'Ordem denegada por unanimidade.'
  }
];

export const JURISDICTIONS = [
  'Todas',
  'Vitória',
  'Vila Velha',
  'Serra',
  'Cariacica',
  'Linhares',
  'São Gabriel da Palha',
  'Cachoeiro de Itapemirim',
  'Colatina',
  'Guarapari',
  'Aracruz',
  'São Mateus'
];

export const JUDGING_BODIES = [
  'Todos',
  '1ª Câmara Criminal',
  '2ª Câmara Criminal',
  '1ª Câmara Cível',
  '2ª Câmara Cível',
  '3ª Câmara Cível',
  '4ª Câmara Cível',
  'Turma Recursal dos Juizados Especiais',
  'Tribunal Pleno'
];

export const MAGISTRATES = [
  'Todos',
  'RACHEL DURAO CORREIA LIMA',
  'FERNANDO ZARDINI ANTONIO',
  'ROBSON LUIZ ALBANEZ',
  'ELISABETH LORDES',
  'EWERTON SCHWAB PINTO JUNIOR',
  'NAMYR CARLOS DE SOUZA FILHO',
  'JORGE HENRIQUE VALLE DOS SANTOS',
  'HEMAR PINTO',
  'SAMUEL MEIRA BRASIL JUNIOR'
];

export const LEGAL_CLASSES = [
  'Todos',
  'HABEAS CORPUS CRIMINAL',
  'APELAÇÃO CÍVEL',
  'APELAÇÃO CRIMINAL',
  'AGRAVO DE INSTRUMENTO',
  'RECURSO INOMINADO',
  'MANDADO DE SEGURANÇA'
];

export const SUBJECTS_LIST = [
  'Todos',
  'Excesso de prazo para instrução / julgamento',
  'Ausência de fundamentação idônea no decreto preventivo',
  'Prisão domiciliar para genitora de filhos menores de 12 anos',
  'Aposentadoria especial e laudo pericial inconclusivo - PPP',
  'Prisão preventiva - Reiteração criminosa e garantia da ordem pública',
  'Inadequação da via eleita - Supressão de instância',
  'Dano moral por inclusão indevida em cadastro de inadimplentes - Serasa',
  'Perda superveniente do objeto - Revogação da prisão pelo juízo a quo',
  'Ilicitude da prova decorrente de invasão domiciliar sem mandado',
  'Fornecimento de medicamento de alto custo não incorporado pelo SUS',
  'Readequação da pena e substituição por restritiva de direitos',
  'Impossibilidade de revisão contratual sem onerosidade excessiva comprovada',
  'Trancamento de termo circunstanciado por atipicidade da conduta de desacato',
  'Restabelecimento de benefício previdenciário por incapacidade temporária',
  'Organização criminosa armada e tráfico internacional de entorpecentes'
];

export const DEFENSE_THESES_LIST = [
  'Todos',
  'excesso de prazo',
  'constrangimento ilegal',
  'ausência de contemporaneidade',
  'fundamentação genérica',
  'ausência de periculum libertatis',
  'mãe com filho menor de 12 anos',
  'inviolabilidade de domicílio',
  'nulidade da busca domiciliar',
  'dano moral in re ipsa',
  'atividade especial insalubre',
  'revisão da dosimetria da pena',
  'direito à saúde / medicamento alto custo'
];
