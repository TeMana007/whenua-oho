import { Pressable, Text } from "react-native";

interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: "primary" | "secondary";
}

export function Button({ label, onPress, variant = "primary" }: ButtonProps) {
  const base = "rounded-xl px-6 py-3 items-center";
  const variants = {
    primary: `${base} bg-tangaroa-800`,
    secondary: `${base} bg-kowhai-400`,
  };

  return (
    <Pressable className={variants[variant]} onPress={onPress}>
      <Text className="text-white font-semibold text-base">{label}</Text>
    </Pressable>
  );
}
