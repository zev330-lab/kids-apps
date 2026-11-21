import { loadGrowth, storageEvents } from "../lib/storage";
import { useSync } from "../components/useSync";

export function Garden({ compact = false }: { compact?: boolean }) {
  const growth = useSync(loadGrowth, storageEvents.growthEvent);
  const flowers = Math.min(7, growth.practices);
  const tryLabel = growth.tries === 1 ? "1 try" : `${growth.tries} tries`;
  const practiceLabel =
    growth.practices === 1 ? "1 time we practiced" : `${growth.practices} times we practiced`;

  return (
    <section className={compact ? "garden compact" : "garden"} aria-label="Growing garden">
      <div className="garden-art" aria-hidden="true">
        <svg viewBox="0 0 220 160">
          <rect x="70" y="118" width="80" height="28" rx="4" fill="#8a3a12" />
          <rect x="78" y="108" width="64" height="16" rx="3" fill="#e07a3c" />
          <rect x="104" y="70" width="12" height="42" fill="#1fbf55" />
          {Array.from({ length: flowers }).map((_, index) => {
            const side = index % 2 === 0 ? -1 : 1;
            const y = 100 - index * 8;
            return (
              <g key={index}>
                <rect x={110 + side * 18} y={y} width="16" height="10" rx="2" fill="#39e06e" />
                {index % 3 === 2 && <rect x={110 + side * 28} y={y - 8} width="10" height="10" fill="#ff4d8d" />}
              </g>
            );
          })}
          {growth.practices > 0 && <rect x="100" y="54" width="20" height="20" rx="3" fill="#ffe14a" />}
        </svg>
      </div>
      <div>
        <h2>Your growing garden</h2>
        {growth.tries === 0 ? (
          <p>The garden is ready. The first try is a big one.</p>
        ) : (
          <p>
            {tryLabel}. {practiceLabel}.
          </p>
        )}
        <p className="garden-line">Trying and getting better matters more than being good at it.</p>
      </div>
    </section>
  );
}
