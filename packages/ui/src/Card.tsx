import { View } from "react-native";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = "" }: CardProps) {
  return (
    <View className={`rounded-2xl bg-white shadow-sm p-4 ${className}`}>
      {children}
    </View>
  );
}
