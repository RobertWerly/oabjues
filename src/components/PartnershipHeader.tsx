import React, { useState } from 'react';

interface PartnershipHeaderProps {
  darkMode?: boolean;
}

export const PartnershipHeader: React.FC<PartnershipHeaderProps> = () => {
  // Candidate image paths for JUES logo
  const [juesSrcIndex, setJuesSrcIndex] = useState(0);
  const juesCandidates = [
    '/logos/jues.webp',
    '/logos/jues.png',
    '/logos/jues.jpg',
    '/logos/jues.jpeg',
    '/jues.webp',
    '/jues.png',
    '/logos/jues.svg'
  ];

  // Candidate image paths for OAB logo
  const [oabSrcIndex, setOabSrcIndex] = useState(0);
  const oabCandidates = [
    '/logos/oab.webp',
    '/logos/oab.png',
    '/logos/oab-es.webp',
    '/logos/oab-es.png',
    '/logos/oab.jpg',
    '/logos/oab-es.jpg',
    '/oab.webp',
    '/oab.png',
    '/logos/oab-es.svg'
  ];

  return (
    <div className="pt-2 pb-1 space-y-3">
      {/* Logos + Parceria Oficial */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2.5 shrink-0">
          {/* JUES exact image */}
          <img
            src={juesCandidates[juesSrcIndex]}
            alt="Logo JUES"
            className="h-8 sm:h-9 w-auto max-w-[120px] object-contain select-none rounded-sm"
            loading="eager"
            onError={() => {
              if (juesSrcIndex < juesCandidates.length - 1) {
                setJuesSrcIndex(prev => prev + 1);
              }
            }}
          />

          <span className="text-xs font-black text-slate-700 select-none">✕</span>

          {/* OAB exact image */}
          <img
            src={oabCandidates[oabSrcIndex]}
            alt="Logo OAB Espírito Santo"
            className="h-7 sm:h-8 w-auto max-w-[140px] object-contain select-none rounded-sm"
            loading="eager"
            onError={() => {
              if (oabSrcIndex < oabCandidates.length - 1) {
                setOabSrcIndex(prev => prev + 1);
              }
            }}
          />
        </div>

        <span className="text-xs font-bold uppercase tracking-wider text-slate-800 border-l-2 border-slate-400 pl-3">
          JUES x OAB — Parceria oficial
        </span>
      </div>

      {/* Main Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950">
          Busca de jurisprudência criminal
        </h1>
        
        {/* Base e propósito */}
        <p className="text-xs sm:text-sm text-slate-900 font-medium mt-1 leading-relaxed">
          Base oficial do Tribunal de Justiça do Espírito Santo (2º Grau PJe). Consulte acórdãos e decisões monocráticas com teses, jurimetria e filtros por magistrado, câmara e resultado.
        </p>
      </div>
    </div>
  );
};
