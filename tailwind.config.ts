import type { Config } from "tailwindcss";

export default {
  theme: {
    extend: {
      colors: {
        /** Main app sky; slightly more azure than the former #ECFAFF. */
        "whim-sky": "#E0F4FF",
        /** Home “great job today” — very light warm amber / sunset wash. */
        "whim-sunset": "#FFF5E8",
        /** Done-for-today night sky — slightly lighter deep blue. */
        "whim-night": "#153a56",
        "whim-night-mid": "#1f4a6b",
        "whim-night-top": "#2a5c82",
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
