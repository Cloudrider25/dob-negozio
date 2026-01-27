'use client'

type NavigatorHeaderProps = {
  activeView: 'navigator' | 'classic'
  onViewChange: (view: 'navigator' | 'classic') => void
}

export function ShopNavigatorHeader({ activeView, onViewChange }: NavigatorHeaderProps) {
  return (
    <div className="text-center mb-16">
      <h1 className="text-4xl md:text-5xl font-light text-text-primary mb-4 tracking-tight">
        Trova il prodotto giusto.{' '}
        <span className="inline-block relative">
          Inizia dal bisogno.
          <span className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-50" />
        </span>
      </h1>

      <p className="text-lg text-text-secondary max-w-2xl mx-auto mb-6">
        Seleziona esigenze, categorie e routine per arrivare al prodotto più adatto.
      </p>

      <div className="flex items-center justify-center gap-3">
        <button
          onClick={() => onViewChange('navigator')}
          className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg border transition-all duration-300 ${
            activeView === 'navigator'
              ? 'border-accent-cyan text-accent-cyan shadow-soft'
              : 'border-stroke text-text-secondary hover:text-text-primary'
          }`}
        >
          <span>Shop Navigator</span>
        </button>

        <button
          onClick={() => onViewChange('classic')}
          className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg border transition-all duration-300 group ${
            activeView === 'classic'
              ? 'border-accent-cyan text-accent-cyan shadow-soft'
              : 'border-stroke text-text-secondary hover:text-text-primary'
          }`}
        >
          <span>Shop Classico</span>
          {activeView !== 'classic' && (
            <span className="text-accent-cyan group-hover:translate-x-1 transition-transform duration-300">
              →
            </span>
          )}
        </button>
      </div>
    </div>
  )
}
