import React, { useState } from 'react';
import { 
  Copy, 
  Check, 
  ExternalLink,
  BookOpen
} from 'lucide-react';
import { Decision } from '../types';

interface DecisionCardProps {
  decision: Decision;
  searchTerm?: string;
  darkMode: boolean;
  onOpenFullText: (decision: Decision) => void;
}

export const DecisionCard: React.FC<DecisionCardProps> = ({
  decision,
  searchTerm = '',
  darkMode,
  onOpenFullText,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyProcess = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(decision.processNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleOpenJues = () => {
    const cleanNumber = decision.processNumber.replace(/\D/g, '');
    const url = `https://sistemas.tjes.jus.br/consultaprocessual/consulta/${cleanNumber || ''}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const highlightText = (text: string, query: string) => {
    if (!query || query.trim() === '') return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return (
      <>
        {parts.map((part, i) => 
          part.toLowerCase() === query.toLowerCase() ? (
            <mark key={i} className="bg-yellow-300 dark:bg-yellow-500/40 text-slate-950 dark:text-yellow-100 font-bold px-1 rounded">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    );
  };

  // Ultra-clear contrast badge for merit/concession
  const getMeritBadge = () => {
    switch (decision.orderOfConcession) {
      case 'Concedida':
        return {
          bg: darkMode 
            ? 'bg-emerald-950/90 border-emerald-500 text-emerald-200' 
            : 'bg-emerald-100 border-emerald-600 text-emerald-950',
          label: 'Concedida'
        };
      case 'Não concedida':
        return {
          bg: darkMode 
            ? 'bg-rose-950/90 border-rose-500 text-rose-200' 
            : 'bg-rose-100 border-rose-600 text-rose-950',
          label: 'Não concedida'
        };
      case 'Concessão Parcial':
        return {
          bg: darkMode 
            ? 'bg-amber-950/90 border-amber-500 text-amber-200' 
            : 'bg-amber-100 border-amber-600 text-amber-950',
          label: 'Concessão Parcial'
        };
      case 'Não conhecido':
        return {
          bg: darkMode 
            ? 'bg-slate-800 border-slate-500 text-slate-100' 
            : 'bg-slate-200 border-slate-500 text-slate-900',
          label: 'Não conhecido'
        };
      case 'Prejudicado':
      default:
        return {
          bg: darkMode 
            ? 'bg-purple-950/90 border-purple-500 text-purple-200' 
            : 'bg-purple-100 border-purple-600 text-purple-950',
          label: 'Prejudicado'
        };
    }
  };

  const meritBadge = getMeritBadge();

  return (
    <div 
      className={`rounded-xl border p-4 sm:p-5 transition-all shadow-xs ${
        darkMode 
          ? 'bg-slate-900 border-slate-800 text-slate-100' 
          : 'bg-white border-slate-300 text-slate-900'
      }`}
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
        {/* Main Details strictly following the hierarchy:
            1. Número Mérito
            2. Tipo de recurso
            3. Assunto
            4. Trecho da ementa
            5. Desembargador
        */}
        <div className="space-y-2.5 flex-1 min-w-0">
          
          {/* Hierarquia 1: Número Mérito */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs sm:text-sm">
            {/* Process Number */}
            <button
              onClick={handleCopyProcess}
              title="Copiar número do processo"
              className={`font-mono font-bold flex items-center gap-1.5 cursor-pointer underline underline-offset-2 text-sm sm:text-base ${
                darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-[#0c2f59] hover:text-blue-800'
              }`}
            >
              <span>{highlightText(decision.processNumber, searchTerm)}</span>
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Copy className="w-3.5 h-3.5 opacity-70 hover:opacity-100" />
              )}
            </button>

            <span className={darkMode ? 'text-slate-600 font-bold' : 'text-slate-400 font-bold'}>•</span>

            {/* Mérito / Concessão */}
            <span className={`px-2.5 py-0.5 rounded font-bold text-xs border ${meritBadge.bg}`}>
              {meritBadge.label}
            </span>

            <span className={`hidden sm:inline ${darkMode ? 'text-slate-600 font-bold' : 'text-slate-400 font-bold'}`}>•</span>

            {/* Data de Julgamento */}
            <span className={`hidden sm:inline text-xs font-semibold ${
              darkMode ? 'text-slate-400' : 'text-slate-600'
            }`}>
              {decision.judgmentDate}
            </span>
          </div>

          {/* Hierarquia 2: Tipo de recurso */}
          <div className="text-xs sm:text-sm">
            <span className={`font-semibold mr-1.5 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Tipo de recurso:
            </span>
            <span className={`font-black uppercase tracking-wider ${
              darkMode ? 'text-slate-200' : 'text-[#0c2f59]'
            }`}>
              {decision.legalClass}
            </span>
          </div>

          {/* Hierarquia 3: Assunto */}
          <div className="text-sm sm:text-base leading-snug">
            <span className={`font-semibold mr-1.5 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Assunto:
            </span>
            <span className={`font-bold ${darkMode ? 'text-white' : 'text-slate-950'}`}>
              {highlightText(decision.subject, searchTerm)}
            </span>
          </div>

          {/* Hierarquia 4: Trecho da ementa */}
          <div className={`p-3 rounded-lg border text-xs sm:text-sm leading-relaxed ${
            darkMode 
              ? 'bg-slate-950/70 border-slate-800 text-slate-300' 
              : 'bg-slate-50 border-slate-200 text-slate-800'
          }`}>
            <span className={`font-bold block mb-1 text-xs uppercase tracking-wider ${
              darkMode ? 'text-blue-400' : 'text-[#0c2f59]'
            }`}>
              Trecho da ementa:
            </span>
            <p className="line-clamp-2 italic">
              "{highlightText(decision.excerpt, searchTerm)}"
            </p>
          </div>

          {/* Hierarquia 5: Desembargador */}
          <div className="text-xs sm:text-sm flex flex-wrap items-center gap-1.5 pt-0.5">
            <span className={`font-medium ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Desembargador(a):
            </span>
            <span className={`font-bold ${darkMode ? 'text-slate-200' : 'text-slate-950'}`}>
              Des. {decision.magistrate}
            </span>
            <span className={darkMode ? 'text-slate-600 font-bold' : 'text-slate-400 font-bold'}>•</span>
            <span className={`font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
              {decision.judgingBody}
            </span>
          </div>

        </div>

        {/* Action Buttons: 'Abrir no JUES' e 'Visualizar inteiro teor' */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0 pt-2 lg:pt-0">
          
          {/* Abrir no JUES */}
          <button
            onClick={handleOpenJues}
            className={`text-xs sm:text-sm font-bold px-3.5 py-2.5 rounded-lg border flex items-center gap-1.5 transition-all cursor-pointer ${
              darkMode
                ? 'border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-slate-200'
                : 'border-slate-300 bg-slate-50 hover:bg-slate-100 text-[#0c2f59]'
            }`}
          >
            <ExternalLink className="w-4 h-4 text-[#c5221f] shrink-0" />
            <span>Abrir no JUES</span>
          </button>

          {/* Visualizar inteiro teor */}
          <button
            onClick={() => onOpenFullText(decision)}
            className={`text-xs sm:text-sm font-bold px-4 py-2.5 rounded-lg flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ${
              darkMode
                ? 'bg-[#0c2f59] hover:bg-[#082242] text-white border border-blue-900'
                : 'bg-[#0c2f59] hover:bg-[#082242] text-white'
            }`}
          >
            <BookOpen className="w-4 h-4 shrink-0" />
            <span>Visualizar inteiro teor</span>
          </button>

        </div>

      </div>
    </div>
  );
};
