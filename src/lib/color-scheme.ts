
export const colorSchemes = ["dark", "light"] as const;
export type ColorScheme = (typeof colorSchemes)[number];

export const configColorSchemes = [...colorSchemes, "system"] as const;
export type ConfigColorSchme = (typeof configColorSchemes)[number];
