import React, { useState, useMemo, useEffect } from 'react';
import { 
  SearchFilters 
} from './components/SearchFilters';
import { 
  DecisionCard 
} from './components/DecisionCard';
import { 
  InteiroTeorView 
} from './components/InteiroTeorView';
import { 
  PartnershipHeader 
} from './components/PartnershipHeader';
import { 
  INITIAL_DECISIONS 
} from './data/jurisprudenceData';
import { 
  Decision, 
  FilterState 
} from './types';
import { 
  Scale, 
  FileSearch,
  Sun,
  Moon,
  ArrowRight
} from 'lucide-react';

const INITIAL_FILTERS: FilterState = {
  searchTerm: '',
  exactMatch: false,
  sourceInstance: 'Todas',
  jurisdiction: 'Todas',
  judgingBody: 'Todos',
  magistrate: 'Todos',
  legalClass: 'Todos',
  subject: 'Todos',
  defenseThesis: 'Todos',
  requestType: 'Todos',
  resultConcession: 'Todos',
  startDate: '',
  endDate: '',
  sortBy: 'newest',
  includeNotKnown: true,
  includePrejudiced: true,
  autoSearch: true,
};

export default function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [decisions] = useState<Decision[]>(INITIAL_DECISIONS);
  const [activeProcessId, setActiveProcessId] = useState<string | null>(() => {
    const hash = window.location.hash;
    if (hash.startsWith('#/processo/')) {
      return hash.replace('#/processo/', '');
    }
    return null;
  });

  // Listen to hash routing changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#/processo/')) {
        setActiveProcessId(hash.replace('#/processo/', ''));
      } else {
        setActiveProcessId(null);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleOpenProcess = (decision: Decision) => {
    window.location.hash = `#/processo/${decision.id}`;
    setActiveProcessId(decision.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToSearch = () => {
    window.location.hash = '';
    setActiveProcessId(null);
  };

  const selectedDecision = useMemo(() => {
    if (!activeProcessId) return null;
    return decisions.find(d => d.id === activeProcessId) || null;
  }, [activeProcessId, decisions]);

  // Handle filter changes
  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleResetFilters = () => {
    setFilters(INITIAL_FILTERS);
  };

  // Filtered decisions calculation
  const filteredDecisions = useMemo(() => {
    let result = decisions.filter(dec => {
      // Search term filter
      if (filters.searchTerm.trim() !== '') {
        const query = filters.searchTerm.toLowerCase().trim();
        const cleanQuery = query.replace(/\D/g, '');
        const cleanProcess = dec.processNumber.replace(/\D/g, '');

        const matchesCleanNumber = cleanQuery.length > 2 && cleanProcess.includes(cleanQuery);
        const matchesNumber = dec.processNumber.toLowerCase().includes(query);
        const matchesSubject = dec.subject.toLowerCase().includes(query);
        const matchesExcerpt = dec.excerpt.toLowerCase().includes(query);
        const matchesMagistrate = dec.magistrate.toLowerCase().includes(query);
        const matchesLegalClass = dec.legalClass.toLowerCase().includes(query);
        const matchesJurisdiction = dec.originJurisdiction.toLowerCase().includes(query);

        const isMatch = matchesCleanNumber || matchesNumber || matchesSubject || matchesExcerpt || matchesMagistrate || matchesLegalClass || matchesJurisdiction;
        if (!isMatch) return false;
      }

      // Jurisdiction / Comarca
      if (filters.jurisdiction !== 'Todas' && dec.originJurisdiction !== filters.jurisdiction) {
        return false;
      }

      // Subject
      if (filters.subject !== 'Todos' && dec.subject !== filters.subject) {
        return false;
      }

      // Câmara (1ª Câmara / 2ª Câmara)
      if (filters.judgingBody && filters.judgingBody !== 'Todos') {
        if (!dec.judgingBody.toLowerCase().includes(filters.judgingBody.toLowerCase())) {
          return false;
        }
      }

      return true;
    });

    // Sorting (newest first)
    result.sort((a, b) => b.rawDate.localeCompare(a.rawDate));

    return result;
  }, [decisions, filters]);

  // If on the Inteiro Teor route, render the dedicated InteiroTeorView page
  if (selectedDecision) {
    return (
      <InteiroTeorView
        decision={selectedDecision}
        onBack={handleBackToSearch}
        darkMode={darkMode}
      />
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-150 ${
      darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-950'
    }`}>
      {/* Minimalist Header */}
      <header className={`sticky top-0 z-30 transition-colors ${
        darkMode ? 'bg-slate-900 border-b border-slate-800' : 'bg-[#0c2f59] border-b border-[#082242] text-white shadow-md'
      }`}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Scale className="w-5 h-5 text-red-400 shrink-0" />
            <h1 className="font-extrabold text-base sm:text-lg tracking-tight text-white">
              Busca de jurisprudência criminal
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              title={darkMode ? 'Alternar para Modo Claro' : 'Alternar para Modo Escuro'}
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-4">
        
        {/* Top Header: Title & JUES x OAB-ES Partnership */}
        <PartnershipHeader darkMode={darkMode} />

        {/* Search & Minimal Filters */}
        <section aria-label="Filtros de Pesquisa">
          <SearchFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onResetFilters={handleResetFilters}
            onSearch={() => {}}
            darkMode={darkMode}
            totalResults={filteredDecisions.length}
          />
        </section>

        {/* Minimalist CTA with Strong Visual Contrast */}
        <section 
          aria-label="CTA Jurimetria" 
          className={`rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 transition-all shadow-md ${
            darkMode 
              ? 'bg-slate-900 border border-slate-800 text-white' 
              : 'bg-[#0c2f59] border border-[#082242] text-white'
          }`}
        >
          <div className="space-y-1">
            <h3 className="text-sm sm:text-base font-extrabold text-white">
              Quer saber como seu tribunal decide?
            </h3>
            <p className="text-xs sm:text-sm font-medium text-slate-200">
              Acesse a Jurimetria e descubra como o seu processo é julgado antes de entrar com o recurso
            </p>
          </div>
          <a
            href="https://jurimetriaes.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-bold shrink-0 bg-[#c5221f] hover:bg-red-700 text-white transition-all shadow-sm cursor-pointer"
          >
            <span>Acessar Jurimetria</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </section>

        {/* Results header */}
        <div className="flex items-center justify-between border-b-2 border-slate-300 dark:border-slate-800 pb-2 pt-1">
          <div className="text-xs sm:text-sm font-black flex items-center gap-1.5 flex-wrap">
            <span className={darkMode ? 'text-white' : 'text-[#0c2f59]'}>
              Resultados simples
            </span>
            <span className={darkMode ? 'text-slate-400' : 'text-[#0c2f59]'}>
              —
            </span>
            <span className={darkMode ? 'text-slate-200' : 'text-[#0c2f59]'}>
              ver mais em
            </span>
            <a
              href="https://jurimetriaes.com"
              target="_blank"
              rel="noopener noreferrer"
              className={`font-black underline underline-offset-2 transition-colors ${
                darkMode
                  ? 'text-red-400 hover:text-red-300'
                  : 'text-[#c5221f] hover:text-red-900'
              }`}
            >
              jurimetriaes.com
            </a>
          </div>
          <span className={`text-xs font-black ${darkMode ? 'text-slate-300' : 'text-[#0c2f59]'}`}>
            {filteredDecisions.length} {filteredDecisions.length === 1 ? 'decisão' : 'decisões'}
          </span>
        </div>

        {/* Compact & Simple Decisions List */}
        <section aria-label="Lista de Decisões" className="space-y-3">
          {filteredDecisions.length > 0 ? (
            filteredDecisions.map((decision) => (
              <DecisionCard
                key={decision.id}
                decision={decision}
                searchTerm={filters.searchTerm}
                darkMode={darkMode}
                onOpenFullText={handleOpenProcess}
              />
            ))
          ) : (
            <div className={`p-8 text-center rounded-xl border ${
              darkMode ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-white border-slate-300 text-slate-900'
            }`}>
              <FileSearch className="w-8 h-8 mx-auto text-slate-500 mb-2" />
              <p className="text-sm font-bold text-slate-950 dark:text-slate-100">
                Nenhuma decisão encontrada com os filtros selecionados
              </p>
              <button
                onClick={handleResetFilters}
                className="mt-3 px-4 py-2 rounded-lg text-xs font-bold bg-[#0c2f59] hover:bg-[#082242] text-white transition-colors cursor-pointer"
              >
                Limpar Filtros
              </button>
            </div>
          )}
        </section>

      </main>
    </div>
  );
}
