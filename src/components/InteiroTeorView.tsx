import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Copy, Check, ExternalLink, Search, X } from 'lucide-react';
import { Decision } from '../types';

interface InteiroTeorViewProps {
  decision: Decision;
  onBack: () => void;
  darkMode?: boolean;
}

export const InteiroTeorView: React.FC<InteiroTeorViewProps> = ({
  decision,
  onBack,
}) => {
  const [activeTab, setActiveTab] = useState<'resumida' | 'original'>('original');
  const [copiedProcess, setCopiedProcess] = useState(false);
  const [copiedEmenta, setCopiedEmenta] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearch]);

  const handleCopyProcess = () => {
    navigator.clipboard.writeText(decision.processNumber);
    setCopiedProcess(true);
    setTimeout(() => setCopiedProcess(false), 1500);
  };

  const handleCopyEmenta = () => {
    navigator.clipboard.writeText(decision.fullText);
    setCopiedEmenta(true);
    setTimeout(() => setCopiedEmenta(false), 1500);
  };

  const handleOpenJues = () => {
    const cleanNumber = decision.processNumber.replace(/\D/g, '');
    const url = `https://sistemas.tjes.jus.br/consultaprocessual/consulta/${cleanNumber || ''}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const matchCount = searchTerm.trim()
    ? (decision.fullText.match(new RegExp(searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')) || []).length
    : 0;

  const renderHighlightedText = (text: string, query: string) => {
    if (!query.trim()) return text;
    try {
      const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
      const parts = text.split(regex);
      return parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="bg-amber-200 text-slate-950 font-bold px-0.5 rounded-xs">
            {part}
          </mark>
        ) : (
          part
        )
      );
    } catch {
      return text;
    }
  };

  const getResultBadgeStyle = () => {
    switch (decision.orderOfConcession) {
      case 'Concedida':
        return 'bg-emerald-50 border-emerald-500 text-emerald-800';
      case 'Não concedida':
        return 'bg-rose-50 border-rose-500 text-rose-800';
      case 'Concessão Parcial':
        return 'bg-amber-50 border-amber-500 text-amber-800';
      case 'Não conhecido':
        return 'bg-slate-100 border-slate-400 text-slate-800';
      default:
        return 'bg-purple-50 border-purple-500 text-purple-800';
    }
  };

  const resultBadgeText = decision.orderOfConcession;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans antialiased">
      {/* Top Bar Navigation */}
      <div className="border-b border-slate-200 bg-white sticky top-0 z-30 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm font-bold text-slate-700 hover:text-slate-950 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar</span>
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        
        {/* Header Card */}
        <header className="rounded-2xl border border-slate-300 bg-white p-6 sm:p-8 shadow-sm">
          {/* Top row: Process number with copy and metadata on left, Result badge on right */}
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-black font-mono tracking-tight text-slate-950">
                  {decision.processNumber}
                </h1>
                <button
                  onClick={handleCopyProcess}
                  title="Copiar número do processo"
                  className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  {copiedProcess ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
                </button>
              </div>
              
              <p className="text-xs sm:text-sm font-semibold mt-1 text-slate-500">
                {decision.decisionDate ? `${decision.decisionDate} · ` : ''}{decision.judgingBody}
              </p>
            </div>

            <span className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-bold border ${getResultBadgeStyle()}`}>
              {resultBadgeText}
            </span>
          </div>

          {/* Key-Values: Magistrado, Classe, Assunto */}
          <div className="pt-5 border-t border-slate-200 space-y-3.5 text-sm">
            <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-8">
              <span className="w-28 shrink-0 text-xs sm:text-sm font-semibold text-slate-500">
                Magistrado
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-extrabold uppercase text-slate-950 tracking-wide">
                  {decision.magistrate}
                </span>
                <span className="text-xs font-bold text-blue-600 hover:underline cursor-pointer flex items-center gap-0.5">
                  Ver perfil decisório →
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-8">
              <span className="w-28 shrink-0 text-xs sm:text-sm font-semibold text-slate-500">
                Classe
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold uppercase text-slate-900">
                  {decision.legalClass}
                </span>
                <span className="text-xs font-bold text-blue-600 hover:underline cursor-pointer flex items-center gap-0.5">
                  Ver jurimetria do recurso →
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-8">
              <span className="w-28 shrink-0 text-xs sm:text-sm font-semibold text-slate-500">
                Assunto
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-slate-900">
                  {decision.subject}
                </span>
                <span className="text-xs font-bold text-blue-600 hover:underline cursor-pointer flex items-center gap-0.5">
                  Ver jurimetria do assunto →
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* CTA Banner: JUES */}
        <div className="rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 via-sky-50 to-indigo-50 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900 leading-tight">
              Aprenda como cada desembargador decide antes de entrar com o recurso
            </h3>
            <p className="text-xs text-slate-600 mt-0.5 font-medium">
              Descubra padrões decisórios, teses acolhidas e jurimetria completa no JUES.
            </p>
          </div>

          <button
            onClick={handleOpenJues}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs sm:text-sm font-bold shadow-sm transition-colors shrink-0 cursor-pointer w-full sm:w-auto"
          >
            <span>Acessar JUES</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Ementa / Content Block with Tab Selector and Action Buttons at the Top */}
        <section aria-label="Conteúdo da Decisão" className="space-y-3">
          {/* Toolbar: Selector on the left, Actions on the right */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex p-1 bg-slate-200/80 rounded-xl border border-slate-300">
              <button
                onClick={() => setActiveTab('resumida')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'resumida'
                    ? 'bg-white text-blue-700 shadow-xs border border-slate-300'
                    : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                Resumida
              </button>
              <button
                onClick={() => setActiveTab('original')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'original'
                    ? 'bg-white text-slate-950 shadow-xs border border-slate-300'
                    : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                Original
              </button>
            </div>

            {/* Action buttons: Copiar Ementa + Buscar no texto + Ver no JUES */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleCopyEmenta}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-950 text-xs font-bold transition-colors shadow-xs cursor-pointer"
              >
                {copiedEmenta ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Copiada!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>Copiar ementa</span>
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  if (activeTab !== 'original') setActiveTab('original');
                  setShowSearch(!showSearch);
                }}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-colors shadow-xs cursor-pointer ${
                  showSearch
                    ? 'border-blue-300 bg-blue-50 text-blue-800'
                    : 'border-slate-300 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-950'
                }`}
              >
                <Search className="w-3.5 h-3.5 text-slate-500" />
                <span>Buscar no texto</span>
              </button>

              <button
                onClick={handleOpenJues}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-colors shadow-xs cursor-pointer"
              >
                <span>Ver no JUES</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Search Input Bar (when showSearch is active) */}
          {showSearch && activeTab === 'original' && (
            <div className="flex items-center gap-2 p-2 bg-slate-100 border border-slate-300 rounded-xl">
              <Search className="w-4 h-4 text-slate-500 ml-2 shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Digite para buscar termos na ementa..."
                className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
              {searchTerm && (
                <span className="text-xs font-bold px-2 py-1 rounded bg-slate-200 text-slate-700 shrink-0">
                  {matchCount} {matchCount === 1 ? 'ocorrência' : 'ocorrências'}
                </span>
              )}
              <button
                onClick={() => {
                  setSearchTerm('');
                  setShowSearch(false);
                }}
                title="Fechar busca"
                className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Content Card: Depends on active tab */}
          {activeTab === 'original' ? (
            /* Raw Text Card (Texto bruto em preto sobre branco) */
            <div className="rounded-2xl border border-slate-300 bg-white p-6 sm:p-8 shadow-sm">
              <pre className="font-sans text-xs sm:text-sm leading-relaxed text-slate-900 font-medium whitespace-pre-wrap selection:bg-blue-100">
                {renderHighlightedText(decision.fullText, searchTerm)}
              </pre>
            </div>
          ) : (
            /* Resumida Tab: CTA to open in JUES */
            <div className="rounded-2xl border border-slate-300 bg-white p-8 sm:p-12 shadow-sm text-center">
              <div className="max-w-md mx-auto space-y-5">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                  <ExternalLink className="w-7 h-7" />
                </div>

                <div className="space-y-2">
                  <h2 className="text-xl font-black text-slate-950">
                    Acessar Processo no JUES
                  </h2>
                  <p className="text-sm font-medium text-slate-600">
                    Acesse resumos, teses, jurimetria e muito mais informações para o seu caso no jurimetriaes.com
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleOpenJues}
                    className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-black text-sm text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 transition-colors shadow-md shadow-blue-600/20 cursor-pointer w-full sm:w-auto"
                  >
                    <span>Abrir no JUES</span>
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-slate-400 font-medium">
                  Processo nº {decision.processNumber}
                </p>
              </div>
            </div>
          )}
        </section>

      </div>
    </div>
  );
};

