import { Text as RNText, type TextProps as RNTextProps } from "react-native";

export type TextVariant =
  | "h1"       // Playfair Display 700, 36px
  | "h2"       // Playfair Display 700, 28px
  | "h3"       // Playfair Display 700, 22px
  | "subtitle" // DM Sans 500, 18px
  | "body"     // DM Sans 400, 16px
  | "small"    // DM Sans 400, 14px
  | "caption"  // DM Sans 400, 12px
  | "label";   // DM Sans 700, 13px uppercase

export type TextColor = "dark" | "light" | "primary" | "accent" | "success" | "warning" | "muted";

interface TextProps extends RNTextProps {
  variant?: TextVariant;
  color?: TextColor;
  /**
   * Pass te reo Māori strings here — macrons (ā ē ī ō ū) are preserved
   * by using DM Sans / Playfair Display which include all macron glyphs.
   */
  children: React.ReactNode;
  className?: string;
}

const variantClasses: Record<TextVariant, string> = {
  h1:       "font-heading text-4xl leading-tight",
  h2:       "font-heading text-3xl leading-tight",
  h3:       "font-heading text-2xl leading-snug",
  subtitle: "font-body-medium text-lg leading-snug",
  body:     "font-body text-base leading-relaxed",
  small:    "font-body text-sm leading-relaxed",
  caption:  "font-body text-xs leading-normal",
  label:    "font-body-bold text-[13px] uppercase tracking-wide leading-none",
};

const colorClasses: Record<TextColor, string> = {
  dark:    "text-ink",
  light:   "text-secondary",
  primary: "text-primary",
  accent:  "text-accent",
  success: "text-success",
  warning: "text-warning",
  muted:   "text-ink/50",
};

export function Text({
  variant = "body",
  color   = "dark",
  className = "",
  children,
  ...props
}: TextProps) {
  return (
    <RNText
      className={[variantClasses[variant], colorClasses[color], className].join(" ")}
      {...props}
    >
      {children}
    </RNText>
  );
}
