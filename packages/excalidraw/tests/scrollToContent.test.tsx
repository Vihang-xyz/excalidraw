import React from "react";
import { vi } from "vitest";

import { resolvablePromise } from "@excalidraw/common";

import { Excalidraw } from "../index";

import { API } from "./helpers/api";
import { act, render } from "./test-utils";

import type { ExcalidrawImperativeAPI } from "../types";

describe("ExcalidrawAPI.scrollToContent", () => {
  let excalidrawAPI: ExcalidrawImperativeAPI;

  beforeEach(async () => {
    const apiPromise = resolvablePromise<ExcalidrawImperativeAPI>();
    await render(
      <Excalidraw onExcalidrawAPI={(api) => apiPromise.resolve(api as any)} />,
    );
    excalidrawAPI = await apiPromise;
  });

  it("centers the target without changing zoom or animating by default", () => {
    const setViewport = vi.spyOn(window.h.app.viewport, "setViewport");
    const element = API.createElement({ type: "rectangle" });
    act(() => API.setElements([element]));

    act(() => excalidrawAPI.scrollToContent(element));

    expect(setViewport).toHaveBeenCalledWith({
      target: element,
      fit: "none",
      animation: false,
      offsets: undefined,
    });
  });

  it("turns a zoom factor below 1 into viewport insets", () => {
    const setViewport = vi.spyOn(window.h.app.viewport, "setViewport");
    const element = API.createElement({ type: "rectangle" });
    act(() => API.setElements([element]));
    const { width, height } = window.h.state;

    act(() =>
      excalidrawAPI.scrollToContent(element, {
        fitToViewport: true,
        viewportZoomFactor: 0.8,
      }),
    );

    expect(setViewport).toHaveBeenCalledWith(
      expect.objectContaining({
        fit: "contain",
        offsets: {
          top: height * 0.1,
          right: width * 0.1,
          bottom: height * 0.1,
          left: width * 0.1,
        },
      }),
    );
  });

  it("maps fit and animation options, defaulting to the whole scene", () => {
    const setViewport = vi.spyOn(window.h.app.viewport, "setViewport");
    const element = API.createElement({ type: "rectangle" });
    act(() => API.setElements([element]));

    act(() =>
      excalidrawAPI.scrollToContent(undefined, {
        fitToViewport: true,
        animate: true,
        duration: 200,
      }),
    );

    expect(setViewport).toHaveBeenCalledWith(
      expect.objectContaining({
        target: [expect.objectContaining({ id: element.id })],
        fit: "contain",
        animation: { duration: 200 },
      }),
    );
  });
});
