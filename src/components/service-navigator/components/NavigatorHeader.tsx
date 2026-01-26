'use client'

type NavigatorHeaderProps = {
  activeView: "navigator" | "listino" | "consulenza";
  onViewChange: (view: "navigator" | "listino" | "consulenza") => void;
};

export function NavigatorHeader({ activeView, onViewChange }: NavigatorHeaderProps) {
  return (
    <div className="text-center mb-16">
      <h1 className="text-4xl md:text-5xl font-light text-text-primary mb-4 tracking-tight">
        Scegli il risultato.{" "}
        <span className="inline-block relative">
          Al resto pensiamo noi.
          <span className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-50" />
        </span>
      </h1>

      <p className="text-lg text-text-secondary max-w-2xl mx-auto mb-6">
        Seleziona l&apos;area, definisci l&apos;obiettivo, scopri il trattamento più
        adatto.
      </p>

      <div className="flex items-center justify-center gap-3">
        {/* Service Navigator - Default/Active */}
        <button
          onClick={() => onViewChange("navigator")}
          className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg border transition-all duration-300 ${
            activeView === "navigator"
              ? "border-accent-cyan text-accent-cyan shadow-soft"
              : "border-stroke text-text-secondary hover:text-text-primary"
          }`}
        >
          <span>Service Navigator</span>
        </button>

        {/* Listino Tradizionale */}
        <button
          onClick={() => onViewChange("listino")}
          className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg border transition-all duration-300 group ${
            activeView === "listino"
              ? "border-accent-cyan text-accent-cyan shadow-soft"
              : "border-stroke text-text-secondary hover:text-text-primary"
          }`}
        >
          <span>Listino Tradizionale</span>
          {activeView !== "listino" && (
            <span className="text-accent-cyan group-hover:translate-x-1 transition-transform duration-300">
              →
            </span>
          )}
        </button>

        {/* Skin Analyzer */}
        <button
          onClick={() => onViewChange("consulenza")}
          className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg border transition-all duration-300 group ${
            activeView === "consulenza"
              ? "border-accent-cyan text-accent-cyan shadow-soft"
              : "border-stroke text-text-secondary hover:text-text-primary"
          }`}
        >
          <span>Skin Analyzer (Derma Test) & Consulenza</span>
          {activeView !== "consulenza" && (
            <span className="text-accent-cyan group-hover:translate-x-1 transition-transform duration-300">
              →
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
