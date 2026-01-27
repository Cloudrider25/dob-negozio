'use client'

import { GlassCard } from './GlassCard'

type NavigatorHeaderProps = {
  activeView: 'navigator' | 'listino' | 'consulenza'
  onViewChange: (view: 'navigator' | 'listino' | 'consulenza') => void
}

export function NavigatorHeader({ activeView, onViewChange }: NavigatorHeaderProps) {
  return (
    <div className="text-center mb-16">
      <h1 className="text-4xl md:text-5xl font-light text-text-primary mb-4">
        Scegli il risultato.{' '}
        <span className="inline-block relative">
          Al resto pensiamo noi.
          <span className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-50" />
        </span>
      </h1>

      <p className="text-lg text-text-secondary max-w-2xl mx-auto mb-6">
        Seleziona l&apos;area, definisci l&apos;obiettivo, scopri il trattamento più adatto.
      </p>

      <div className="flex items-center justify-center gap-3">
        {/* Service Navigator - Default/Active */}
        <button
          onClick={() => onViewChange('navigator')}
          className="group inline-flex"
        >
          <GlassCard
            variant="pill"
            className={`transition-all duration-300 ${
              activeView === 'navigator' ? 'shadow-soft ring-1 ring-accent-cyan/40' : 'ring-1 ring-transparent'
            }`}
            paddingClassName="flex items-center gap-2 px-6 py-3"
          >
            <span
              className={`${
                activeView === 'navigator'
                  ? 'text-accent-cyan'
                  : 'text-text-secondary group-hover:text-text-primary'
              }`}
            >
              Service Navigator
            </span>
          </GlassCard>
        </button>

        {/* Listino Tradizionale */}
        <button
          onClick={() => onViewChange('listino')}
          className="group inline-flex"
        >
          <GlassCard
            variant="pill"
            className={`transition-all duration-300 ${
              activeView === 'listino' ? 'shadow-soft ring-1 ring-accent-cyan/40' : 'ring-1 ring-transparent'
            }`}
            paddingClassName="flex items-center gap-2 px-6 py-3"
          >
            <span
              className={`${
                activeView === 'listino' ? 'text-accent-cyan' : 'text-text-secondary group-hover:text-text-primary'
              }`}
            >
              Listino Tradizionale
            </span>
            {activeView !== 'listino' && (
              <span className="text-accent-cyan group-hover:translate-x-1 transition-transform duration-300">
                →
              </span>
            )}
          </GlassCard>
        </button>

        {/* Skin Analyzer */}
        <button
          onClick={() => onViewChange('consulenza')}
          className="group inline-flex"
        >
          <GlassCard
            variant="pill"
            className={`transition-all duration-300 ${
              activeView === 'consulenza' ? 'shadow-soft ring-1 ring-accent-cyan/40' : 'ring-1 ring-transparent'
            }`}
            paddingClassName="flex items-center gap-2 px-6 py-3"
          >
            <span
              className={`${
                activeView === 'consulenza'
                  ? 'text-accent-cyan'
                  : 'text-text-secondary group-hover:text-text-primary'
              }`}
            >
              Skin Analyzer (Derma Test) & Consulenza
            </span>
            {activeView !== 'consulenza' && (
              <span className="text-accent-cyan group-hover:translate-x-1 transition-transform duration-300">
                →
              </span>
            )}
          </GlassCard>
        </button>
      </div>
    </div>
  )
}
