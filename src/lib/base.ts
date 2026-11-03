export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://rogeriobie2016-ship-it.github.io";

/** Caminho de arquivo em /public considerando o basePath do GitHub Pages. */
export const asset = (caminho: string) => `${BASE_PATH}${caminho}`;

/** URL absoluta, usada em compartilhamento e calendário. */
export const urlAbsoluta = (caminho: string) => `${SITE_URL}${BASE_PATH}${caminho}`;
