"use client";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
  size?: "sm" | "md";
}

export default function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}: ButtonProps) {
  const base =
    "font-heading tracking-wide rounded border transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed";
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-5 py-2.5 text-base",
  };
  const variants = {
    primary:
      "bg-crimson-700 hover:bg-crimson-600 text-parchment-light border-gold-dark/50 hover:border-gold/70 shadow-md hover:shadow-crimson-700/30",
    secondary:
      "bg-crimson-950 hover:bg-crimson-900 text-parchment-dark hover:text-parchment-light border-gold-dark/30 hover:border-gold-dark/60",
    danger:
      "bg-crimson-900 hover:bg-crimson-800 text-crimson-300 border-crimson-700/50 hover:border-crimson-600/70",
  };

  return (
    <button
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
