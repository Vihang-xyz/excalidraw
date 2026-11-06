import { MIME_TYPES, THEME } from "@excalidraw/common";

import type {
  ExcalidrawFrameLikeElement,
  NonDeleted,
  NonDeletedExcalidrawElement,
} from "@excalidraw/element/types";

import { exportScene } from "./export";

import type { ExportSceneData } from "./export";
import type { AppState, BinaryFiles } from "../types";

export type LegacyExportOptions = {
  elements: readonly NonDeletedExcalidrawElement[];
  appState?: Partial<AppState>;
  files?: BinaryFiles | null;
  exportPadding?: number;
  maxWidthOrHeight?: number;
  exportingFrame?: NonDeleted<ExcalidrawFrameLikeElement> | null;
};

const toExportArgs = ({
  elements,
  appState,
  files,
  exportPadding,
  maxWidthOrHeight,
  exportingFrame,
}: LegacyExportOptions) => ({
  data: {
    elements,
    appState: appState as ExportSceneData["appState"],
    files,
  },
  config: {
    padding: exportPadding,
    theme: appState?.exportWithDarkMode ? THEME.DARK : THEME.LIGHT,
    canvasBackgroundColor:
      appState?.exportBackground === false
        ? (false as const)
        : appState?.viewBackgroundColor,
    exportingFrame,
    ...(maxWidthOrHeight
      ? { maxWidthOrHeight }
      : { scale: appState?.exportScale }),
  },
});

export const exportToCanvas = (opts: LegacyExportOptions) =>
  exportScene({ type: "canvas", ...toExportArgs(opts) });

export const exportToSvg = (opts: LegacyExportOptions) =>
  exportScene({ type: "svg", ...toExportArgs(opts) });

export const exportToBlob = ({
  mimeType = MIME_TYPES.png,
  quality,
  ...opts
}: LegacyExportOptions & { mimeType?: string; quality?: number }) => {
  const { data, config } = toExportArgs(opts);
  return /image\/jpe?g/.test(mimeType)
    ? exportScene({ type: "jpeg", data, config: { ...config, quality } })
    : exportScene({
        type: "png",
        data,
        config: { ...config, embedScene: opts.appState?.exportEmbedScene },
      });
};
