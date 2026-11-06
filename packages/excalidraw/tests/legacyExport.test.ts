import { API } from "./helpers/api";
import { exportToBlob, exportToCanvas, exportToSvg } from "../scene/legacyExport";

const rectangle = () =>
  API.createElement({ type: "rectangle", x: 0, y: 0, width: 100, height: 50 });

describe("legacy export API", () => {
  it("exports the scene to a canvas using exportScale and padding", async () => {
    const canvas = await exportToCanvas({
      elements: [rectangle()],
      appState: { exportScale: 2, exportBackground: true },
      files: null,
      exportPadding: 10,
    });

    expect(canvas.width).toBe(240);
    expect(canvas.height).toBe(140);
  });

  it("exports the scene to an SVG element", async () => {
    const svg = await exportToSvg({
      elements: [rectangle()],
      appState: { exportBackground: false },
      files: null,
    });

    expect(svg.tagName.toLowerCase()).toBe("svg");
  });

  it("exports PNG by default and JPEG when asked", async () => {
    const elements = [rectangle()];

    await expect(exportToBlob({ elements, files: null })).resolves.toHaveProperty(
      "type",
      "image/png",
    );
    await expect(
      exportToBlob({ elements, files: null, mimeType: "image/jpeg" }),
    ).resolves.toHaveProperty("type", "image/jpeg");
  });
});
