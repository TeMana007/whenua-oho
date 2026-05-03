/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary:   "#04342C",
        secondary: "#F5F0E8",
        accent:    "#C8A951",
        success:   "#2D7A4F",
        warning:   "#E07B39",
        ink:       "#1A1A1A",
      },
      fontFamily: {
        // Font family names match the @expo-google-fonts variant names
        heading:       ["PlayfairDisplay_700Bold"],
        "heading-regular": ["PlayfairDisplay_400Regular"],
        body:          ["DMSans_400Regular"],
        "body-medium": ["DMSans_500Medium"],
        "body-bold":   ["DMSans_700Bold"],
      },
    },
  },
  plugins: [],
};
