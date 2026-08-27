export type OrderOfConcession = 
  | 'Concedida'
  | 'Não concedida'
  | 'Concessão Parcial'
  | 'Não conhecido'
  | 'Prejudicado';

export type SourceInstance = 
  | '1º Grau PJe'
  | '2º Grau PJe'
  | '2º Grau Monocrático PJe'
  | '2º Grau - Físicos'
  | 'Turmas Recursais - Projudi';

export interface Decision {
  id: string;
  processNumber: string;
  orderOfConcession: OrderOfConcession;
  concessionNote?: string; // ex: '282 parcial'
  judgmentDate: string; // ex: '21/Ago/2026'
  rawDate: string; // ISO format for filtering
  subject: string; // ex: 'Excesso de prazo para instrução / julgamento'
  legalClass: string; // ex: 'HABEAS CORPUS CRIMINAL', 'APELAÇÃO CÍVEL'
  magistrate: string; // ex: 'RACHEL DURAO CORREIA LIMA'
  judgingBody: string; // ex: '1ª Câmara Criminal'
  originJurisdiction: string; // ex: 'Vitória', 'Vila Velha', 'Serra'
  defenseTheses: string[]; // ex: ['excesso de prazo', 'constrangimento ilegal', 'ausência de contemporaneidade']
  requestType: string; // ex: 'Revogação de prisão preventiva'
  excerpt: string; // Trecho do caso destacado
  fullText: string; // Inteiro teor do acórdão
  sourceInstance: SourceInstance;
  citedArticles?: string[];
  reportSummary?: string;
  dispositif?: string;
  isSaved?: boolean;
  paciente?: string;
  juizoCoator?: string;
  tribunal?: string;
  impetrante?: string;
  ementaTopics?: string[];
  casoEmExame?: string[];
  questaoEmDiscussao?: string[];
  razoesDecidir?: string[];
  dispositivoTese?: {
    tese?: string[];
    dispositivosCitados?: string[];
    jurisprudenciaCitada?: string[];
  };
  acordaoDetalhes?: {
    decisao?: string;
    orgaoJulgadorVencedor?: string;
    composicao?: string;
    votosVogais?: { desembargador: string; voto: string }[];
  };
  relatorioTexto?: string;
  votoVencedorTexto?: string;
}

export interface FilterState {
  searchTerm: string;
  exactMatch: boolean;
  sourceInstance: SourceInstance | 'Todas';
  jurisdiction: string;
  judgingBody: string;
  magistrate: string;
  legalClass: string;
  subject: string;
  defenseThesis: string;
  requestType: string;
  resultConcession: string; // 'Todos' | 'Só concedidos' | 'Não concedidos' | 'Parcial' | etc.
  startDate: string;
  endDate: string;
  sortBy: 'relevance' | 'newest' | 'oldest';
  includeNotKnown: boolean;
  includePrejudiced: boolean;
  autoSearch: boolean;
}

export interface JurimetriaMetrics {
  totalAcordaos: number;
  concedidos: number;
  concedidosParcial: number;
  naoConcedidos: number;
  foraDoMerito: number;
  taxaConcessao: number; // percentage
}
