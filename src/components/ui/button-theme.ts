export type ButtonKind = "main" | "card" | "hero"
export const resolveButtonKind = (kind?: ButtonKind | null): ButtonKind => kind ?? "main"

export const getInteractivePalette = (kind: ButtonKind) => {
  if (kind === "hero") {
    return {
      overlay: "color-mix(in srgb, var(--text-primary) 45%, var(--paper))",
      text: "var(--text-inverse)",
    }
  }

  if (kind === "card") {
    return {
      overlay: "color-mix(in srgb, var(--text-primary) 92%, var(--obsidian) 8%)",
      text: "var(--text-inverse)",
    }
  }

  return {
    overlay: "var(--text-primary)",
    text: "var(--text-inverse)",
  }
}
