import type { Config } from "tailwindcss";

export default {
  theme: {
    extend: {
      colors: {
        /** Main app sky; slightly more azure than the former #ECFAFF. */
        "whim-sky": "#E0F4FF",
        /** Home “great job today” — very light warm amber / sunset wash. */
        "whim-sunset": "#FFF5E8",
        /** Done-for-today night sky (deep blue from whim-sky family). */
        "whim-night": "#0c2238",
        "whim-night-mid": "#132f4a",
        "whim-night-top": "#1a3d5c",
      },
      fontFamily: {
        sans: [
          "var(--font-sans)",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
        serif: [
          "var(--font-serif)",
          "ui-serif",
          "Georgia",
          "Cambria",
          "Times New Roman",
          "Times",
          "serif",
        ],
      },
    },
  },
} satisfies Config;
