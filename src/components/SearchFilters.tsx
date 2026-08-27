import React from 'react';
import { Search, RotateCcw, Building2, CheckCircle2 } from 'lucide-react';
import { FilterState } from '../types';
import { JURISDICTIONS, SUBJECTS_LIST } from '../data/jurisprudenceData';

interface SearchFiltersProps {
  filters: FilterState;
  onFilterChange: (newFilters: Partial<FilterState>) => void;
  onResetFilters: () => void;
  onSearch: () => void;
  darkMode: boolean;
  totalResults: number;
}

export const SearchFilters: React.FC<SearchFiltersProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  onSearch,
  darkMode,
  totalResults,
}) => {
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch();
  };

  const currentCamara = filters.judgingBody || 'Todos';

  return (
    <div className={`rounded-xl border shadow-sm p-4 sm:p-5 transition-all ${
      darkMode 
        ? 'bg-slate-900 border-slate-800 text-slate-100' 
        : 'bg-white border-slate-300 text-slate-900'
    }`}>
      <form onSubmit={handleSearchSubmit} className="space-y-4">
        
        {/* Top Controls: Grau Automático & Seletor de Câmaras */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
          
          {/* Grau: 2º Grau PJe */}
          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Grau:
            </span>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-extrabold border ${
              darkMode
                ? 'bg-slate-950 border-slate-700 text-blue-400'
                : 'bg-blue-50 border-blue-200 text-[#0c2f59]'
            }`}>
              <CheckCircle2 className="w-3.5 h-3.5 text-[#0c2f59] dark:text-blue-400" />
              <span>2º Grau PJe</span>
            </span>
          </div>

          {/* Seletor de Troca: 1ª Câmara / 2ª Câmara */}
          <div className="flex items-center gap-1.5">
            <span className={`text-xs font-bold mr-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              <Building2 className="w-3.5 h-3.5 inline mr-1" />
              Câmara:
            </span>
            <div className={`inline-flex p-0.5 rounded-lg border ${
              darkMode ? 'bg-slate-950 border-slate-700' : 'bg-slate-100 border-slate-300'
            }`}>
              <button
                type="button"
                onClick={() => onFilterChange({ judgingBody: 'Todos' })}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                  currentCamara === 'Todos'
                    ? darkMode
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-[#0c2f59] text-white shadow-xs'
                    : darkMode
                    ? 'text-slate-300 hover:text-white'
                    : 'text-slate-700 hover:text-slate-950'
                }`}
              >
                Todas
              </button>

              <button
                type="button"
                onClick={() => onFilterChange({ judgingBody: '1ª Câmara' })}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                  currentCamara === '1ª Câmara' || currentCamara === '1ª Câmara Criminal'
                    ? darkMode
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-[#0c2f59] text-white shadow-xs'
                    : darkMode
                    ? 'text-slate-300 hover:text-white'
                    : 'text-slate-700 hover:text-slate-950'
                }`}
              >
                1ª Câmara
              </button>

              <button
                type="button"
                onClick={() => onFilterChange({ judgingBody: '2ª Câmara' })}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                  currentCamara === '2ª Câmara' || currentCamara === '2ª Câmara Criminal'
                    ? darkMode
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-[#0c2f59] text-white shadow-xs'
                    : darkMode
                    ? 'text-slate-300 hover:text-white'
                    : 'text-slate-700 hover:text-slate-950'
                }`}
              >
                2ª Câmara
              </button>
            </div>
          </div>

        </div>

        {/* Main search text input */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={filters.searchTerm}
              onChange={(e) => onFilterChange({ searchTerm: e.target.value })}
              placeholder="Buscar por número do processo (ex: 5014031), termo, desembargador ou assunto..."
              className={`w-full h-11 pl-4 pr-10 text-sm font-semibold rounded-lg border transition-all focus:outline-none focus:ring-2 ${
                darkMode
                  ? 'bg-slate-950 border-slate-700 text-white placeholder-slate-500 focus:border-[#c5221f] focus:ring-red-500/20'
                  : 'bg-white border-slate-400 text-slate-950 placeholder-slate-500 focus:border-[#0c2f59] focus:ring-[#0c2f59]/20'
              }`}
            />
            {filters.searchTerm && (
              <button
                type="button"
                onClick={() => onFilterChange({ searchTerm: '' })}
                className={`absolute right-3 top-1/2 -translate-y-1/2 font-bold text-lg cursor-pointer ${
                  darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                ×
              </button>
            )}
          </div>

          <button
            type="submit"
            className={`h-11 px-7 rounded-lg font-bold text-sm tracking-wide flex items-center justify-center gap-2 transition-all active:scale-95 shrink-0 cursor-pointer ${
              darkMode
                ? 'bg-[#c5221f] hover:bg-red-700 text-white shadow-sm'
                : 'bg-[#0c2f59] hover:bg-[#082242] text-white shadow-sm'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>BUSCAR</span>
          </button>
        </div>

        {/* Minimal Filters: Assunto and Comarca/Jurisdição */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          
          {/* 1. Assunto */}
          <div className="space-y-1">
            <label className={`text-xs font-bold block ${darkMode ? 'text-slate-200' : 'text-slate-900'}`}>
              Assunto
            </label>
            <select
              value={filters.subject}
              onChange={(e) => onFilterChange({ subject: e.target.value })}
              className={`w-full h-10 px-3 text-xs sm:text-sm font-semibold rounded-lg border transition-colors focus:outline-none focus:ring-1 ${
                darkMode
                  ? 'bg-slate-950 border-slate-700 text-slate-100 focus:border-[#c5221f]'
                  : 'bg-white border-slate-400 text-slate-950 focus:border-[#0c2f59]'
              }`}
            >
              {SUBJECTS_LIST.map((s) => (
                <option key={s} value={s} className={darkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-950'}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Jurisdição / Comarca */}
          <div className="space-y-1">
            <label className={`text-xs font-bold block ${darkMode ? 'text-slate-200' : 'text-slate-900'}`}>
              Jurisdição / Comarca
            </label>
            <select
              value={filters.jurisdiction}
              onChange={(e) => onFilterChange({ jurisdiction: e.target.value })}
              className={`w-full h-10 px-3 text-xs sm:text-sm font-semibold rounded-lg border transition-colors focus:outline-none focus:ring-1 ${
                darkMode
                  ? 'bg-slate-950 border-slate-700 text-slate-100 focus:border-[#c5221f]'
                  : 'bg-white border-slate-400 text-slate-950 focus:border-[#0c2f59]'
              }`}
            >
              {JURISDICTIONS.map((j) => (
                <option key={j} value={j} className={darkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-950'}>
                  {j}
                </option>
              ))}
            </select>
          </div>

        </div>

        {/* Action footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={onResetFilters}
            className={`text-xs font-bold px-3 py-1.5 rounded-md border transition-colors flex items-center gap-1.5 cursor-pointer ${
              darkMode
                ? 'border-slate-700 text-slate-200 hover:bg-slate-800'
                : 'border-slate-300 text-slate-800 hover:bg-slate-100 bg-white'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Limpar filtros</span>
          </button>

          <span className={`text-xs font-black ${
            darkMode ? 'text-slate-200' : 'text-slate-900'
          }`}>
            {totalResults} {totalResults === 1 ? 'decisão encontrada' : 'decisões encontradas'}
          </span>
        </div>

      </form>
    </div>
  );
};
