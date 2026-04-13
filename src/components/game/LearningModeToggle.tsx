interface LearningModeToggleProps {
  enabled: boolean;
  onToggle: () => void;
}

export default function LearningModeToggle({
  enabled,
  onToggle,
}: LearningModeToggleProps) {
  return (
    <button
      onClick={onToggle}
      className={`
        flex items-center gap-1.5 text-xs font-heading tracking-wider uppercase transition-colors
        ${
          enabled
            ? "text-gold-light"
            : "text-parchment-dark/60 hover:text-parchment-light"
        }
      `}
      aria-label={`Learning mode ${enabled ? "on" : "off"}`}
    >
      <span
        className={`
          inline-block w-7 h-3.5 rounded-full relative transition-colors
          ${enabled ? "bg-gold-dark" : "bg-parchment-dark/30"}
        `}
      >
        <span
          className={`
            absolute top-0.5 w-2.5 h-2.5 rounded-full transition-all
            ${
              enabled
                ? "right-0.5 bg-gold-light"
                : "left-0.5 bg-parchment-dark/50"
            }
          `}
        />
      </span>
      Learn
    </button>
  );
}
