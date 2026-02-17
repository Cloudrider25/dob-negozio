export type ButtonKind = "main" | "card" | "hero"
export const resolveButtonKind = (kind?: ButtonKind | null): ButtonKind => kind ?? "main"

export const getButtonBasePalette = (kind: ButtonKind) => {
  if (kind === "hero") {
    return {
      bg: "transparent",
      text: "var(--text-inverse)",
      border: "color-mix(in srgb, var(--text-inverse) 55%, transparent)",
    }
  }

  if (kind === "card") {
    return {
      bg: "var(--page-bg)",
      text: "var(--text-primary)",
      border: "transparent",
    }
  }

  return {
    bg: "transparent",
    text: "var(--text-primary)",
    border: "var(--text-primary)",
  }
}

export const getButtonStatePalette = (kind: ButtonKind) => {
  if (kind === "hero") {
    return {
      hoverBg: "color-mix(in srgb, var(--text-inverse) 26%, transparent)",
      hoverText: "var(--text-inverse)",
      hoverBorder: "color-mix(in srgb, var(--text-inverse) 70%, transparent)",
      activeBg: "color-mix(in srgb, var(--text-inverse) 38%, transparent)",
      activeText: "var(--text-inverse)",
      activeBorder: "color-mix(in srgb, var(--text-inverse) 82%, transparent)",
      focusRing: "color-mix(in srgb, var(--text-inverse) 45%, transparent)",
      focusOffset: "var(--bg)",
    }
  }

  if (kind === "card") {
    return {
      hoverBg: "color-mix(in srgb, var(--text-primary) 92%, var(--obsidian) 8%)",
      hoverText: "var(--text-inverse)",
      hoverBorder: "transparent",
      activeBg: "color-mix(in srgb, var(--text-primary) 96%, var(--obsidian) 4%)",
      activeText: "var(--text-inverse)",
      activeBorder: "transparent",
      focusRing: "color-mix(in srgb, var(--text-primary) 38%, transparent)",
      focusOffset: "var(--bg)",
    }
  }

  return {
    hoverBg: "var(--text-primary)",
    hoverText: "var(--text-inverse)",
    hoverBorder: "var(--text-primary)",
    activeBg: "color-mix(in srgb, var(--text-primary) 88%, var(--obsidian) 12%)",
    activeText: "var(--text-inverse)",
    activeBorder: "color-mix(in srgb, var(--text-primary) 88%, var(--obsidian) 12%)",
    focusRing: "color-mix(in srgb, var(--text-primary) 35%, transparent)",
    focusOffset: "var(--bg)",
  }
}

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
