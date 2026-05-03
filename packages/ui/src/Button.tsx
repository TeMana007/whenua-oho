import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { KoruSpinner } from "./KoruSpinner";

export type ButtonVariant = "primary" | "secondary" | "accent" | "ghost";
export type ButtonSize   = "sm" | "md" | "lg";

interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  className?: string;
}

const containerVariants: Record<ButtonVariant, string> = {
  primary:   "bg-primary border-2 border-primary",
  secondary: "bg-secondary border-2 border-primary",
  accent:    "bg-accent border-2 border-accent",
  ghost:     "bg-transparent border-2 border-primary",
};

const labelVariants: Record<ButtonVariant, string> = {
  primary:   "text-secondary",
  secondary: "text-primary",
  accent:    "text-ink",
  ghost:     "text-primary",
};

const sizeStyles: Record<ButtonSize, { container: string; label: string }> = {
  sm: { container: "h-12 min-h-[48px] rounded-xl px-4",  label: "text-sm"  },
  md: { container: "h-14 min-h-[56px] rounded-2xl px-6", label: "text-base" },
  lg: { container: "h-16 min-h-[64px] rounded-2xl px-8", label: "text-lg"  },
};

export function Button({
  label,
  onPress,
  variant  = "primary",
  size     = "md",
  loading  = false,
  disabled = false,
  fullWidth = false,
  className = "",
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      className={[
        "flex-row items-center justify-center",
        containerVariants[variant],
        sizeStyles[size].container,
        fullWidth ? "w-full" : "self-start",
        isDisabled ? "opacity-50" : "active:opacity-80",
        className,
      ].join(" ")}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
    >
      {loading ? (
        <View className="flex-row items-center gap-2">
          <KoruSpinner size={20} color={variant === "primary" ? "#F5F0E8" : "#04342C"} />
          <Text className={["font-body-bold", sizeStyles[size].label, labelVariants[variant]].join(" ")}>
            {label}
          </Text>
        </View>
      ) : (
        <Text className={["font-body-bold", sizeStyles[size].label, labelVariants[variant]].join(" ")}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}
