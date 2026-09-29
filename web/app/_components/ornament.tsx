// A small gold divider, drawn as a diamond between two rules. Decorative only.
export function Ornament({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-3 text-gold ${className}`} aria-hidden="true">
      <span className="h-px w-12 bg-gold/50" />
      <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
        <path d="M6 0 12 6 6 12 0 6z" />
      </svg>
      <span className="h-px w-12 bg-gold/50" />
    </div>
  );
}

// A woven band that nods to aso-oke stripes. Decorative only.
export function WovenBand({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`h-2 w-full ${className}`}
      style={{
        // Uses the colour variables, so it follows a wedding website's design.
        backgroundImage:
          "repeating-linear-gradient(90deg, var(--color-wine) 0 14px, var(--color-gold) 14px 18px, var(--color-gold-soft) 18px 22px, var(--color-gold) 22px 26px)",
      }}
    />
  );
}
