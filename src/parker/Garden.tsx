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
          <ellipse cx="110" cy="142" rx="70" ry="12" fill="rgba(36,48,86,0.08)" />
          <path d="M70 120 H150 L140 148 H80 Z" fill="#e07a4c" />
          <path d="M78 120 H142 L138 100 H82 Z" fill="#f4a261" />
          <path d="M110 118 V70" stroke="#3a9d4e" strokeWidth="5" strokeLinecap="round" />
          {Array.from({ length: flowers }).map((_, index) => {
            const side = index % 2 === 0 ? -1 : 1;
            const y = 108 - index * 8;
            return (
              <g key={index} transform={`translate(${110 + side * 16} ${y})`}>
                <ellipse cx={side * 10} cy="0" rx="12" ry="6" fill="#7dce6a" transform={`rotate(${side * -30})`} />
                {index % 3 === 2 && <circle cx={side * 22} cy="-6" r="6" fill="#ff8fab" />}
              </g>
            );
          })}
          {growth.practices > 0 && <circle cx="110" cy="62" r="10" fill="#ffd166" />}
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
