/** Matches Tailwind `whim-night*` tokens; paints document + Safari UI. */
export const NIGHT_GRADIENT =
  "linear-gradient(to bottom, #2a5c82 0%, #1f4a6b 45%, #153a56 100%)";

export const THEME_SKY = "#D4E8E8";
export const THEME_NIGHT = "#153a56";
export const SUCCESS_EDGE_BG = "#1B6B1B";
export const THEME_SUCCESS = "#1B6B1B";

export function paintRootStack(
  nodes: HTMLElement[],
  opts: { solid: string; image: string | null },
) {
  for (const el of nodes) {
    el.style.setProperty("background-color", opts.solid, "important");
    if (opts.image) {
      el.style.setProperty("background-image", opts.image, "important");
      el.style.setProperty("background-repeat", "no-repeat", "important");
    } else {
      el.style.setProperty("background-image", "none", "important");
    }
  }
}

export function clearRootPaint(nodes: HTMLElement[]) {
  for (const el of nodes) {
    el.style.removeProperty("background-color");
    el.style.removeProperty("background-image");
    el.style.removeProperty("background-repeat");
  }
}
