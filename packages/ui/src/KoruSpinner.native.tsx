/**
 * KoruSpinner — React Native version (react-native-svg + Animated).
 * Picked up by Metro instead of KoruSpinner.tsx.
 */
import { useEffect, useRef } from "react";
import { Animated, Easing } from "react-native";
import Svg, { Path } from "react-native-svg";

const AnimatedSvg = Animated.createAnimatedComponent(Svg);

interface KoruSpinnerProps {
  size?: number;
  color?: string;
}

export function KoruSpinner({ size = 48, color = "#04342C" }: KoruSpinnerProps) {
  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    anim.start();
    return () => anim.stop();
  }, [rotation]);

  const spin = rotation.interpolate({
    inputRange:  [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <AnimatedSvg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      style={{ transform: [{ rotate: spin }] }}
      accessibilityLabel="Loading"
      accessibilityRole="progressbar"
    >
      {/* Outer arc */}
      <Path
        d="M 50 8
           C 74 8 92 28 92 52
           C 92 76 74 92 50 92
           C 28 92 10 76 10 58
           C 10 42 24 30 42 30"
        stroke={color}
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Mid spiral */}
      <Path
        d="M 42 30
           C 54 30 64 40 64 52
           C 64 62 56 68 47 65"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
        opacity={0.75}
      />
      {/* Inner koru curl */}
      <Path
        d="M 47 65
           C 39 62 34 54 37 47
           C 39 42 46 40 51 44"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        opacity={0.5}
      />
    </AnimatedSvg>
  );
}
