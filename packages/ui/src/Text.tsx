import { Text as RNText, TextProps } from "react-native";

interface KoreroTextProps extends TextProps {
  variant?: "heading" | "body" | "caption";
}

export function Text({ variant = "body", className = "", ...props }: KoreroTextProps) {
  const variants = {
    heading: "text-2xl font-bold text-tangaroa-800",
    body: "text-base text-gray-700",
    caption: "text-sm text-gray-500",
  };

  return <RNText className={`${variants[variant]} ${className}`} {...props} />;
}
