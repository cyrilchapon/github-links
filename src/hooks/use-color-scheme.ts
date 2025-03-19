import { z } from "zod";
import { createUseZodLocalStorage } from "./use-zod-local-storage";
import { ColorScheme, configColorSchemes } from "@/lib/color-scheme";
import { useMediaQuery } from "usehooks-ts";
import { CORMA_COLOR_SCHEME_KEY } from "@/lib/storage-keys";
import { useEffect, useMemo } from "react";

export const useColorSchemeStorage = createUseZodLocalStorage(
  z.enum(configColorSchemes)
);

export const useSystemColorScheme = (): ColorScheme => {
  const isDark = useMediaQuery("(prefers-color-scheme: dark)");
  return isDark ? "dark" : "light";
};

export const useColorScheme = () => {
  const [configColorScheme] = useColorSchemeStorage(
    CORMA_COLOR_SCHEME_KEY,
    "system"
  );
  const systemColorScheme = useSystemColorScheme();

  const colorScheme = useMemo(
    () =>
      configColorScheme === "system" ? systemColorScheme : configColorScheme,
    [configColorScheme, systemColorScheme]
  );

  return colorScheme;
};

export const useColorSchemeClass = (
  rootElement: HTMLElement,
  colorScheme: ColorScheme
) => {
  useEffect(() => {
    rootElement.classList.remove("light", "dark");
    rootElement.classList.add(colorScheme);
  }, [rootElement, colorScheme]);
};
