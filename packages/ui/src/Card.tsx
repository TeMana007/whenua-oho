import { View, type ViewProps } from "react-native";

interface CardProps extends ViewProps {
  children: React.ReactNode;
  variant?: "default" | "elevated" | "outlined";
  className?: string;
}

const variantClasses = {
  default:  "bg-white rounded-2xl p-4",
  elevated: "bg-white rounded-2xl p-4 shadow-md",
  outlined: "bg-white rounded-2xl p-4 border border-secondary",
};

export function Card({ children, variant = "default", className = "", ...props }: CardProps) {
  return (
    <View className={[variantClasses[variant], className].join(" ")} {...props}>
      {children}
    </View>
  );
}
