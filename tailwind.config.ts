import type { Config } from "tailwindcss";

export default {
  theme: {
    extend: {
      colors: {
        /** Main app sky; slightly more azure than the former #ECFAFF. */
        "whim-sky": "#E0F4FF",
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
