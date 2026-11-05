import { describe, expect, it } from "vitest";

import {
  getLegacyStickyNoteLabelId,
  migrateLegacyStickyNotes,
} from "@excalidraw/element";

import { restoreElements } from "../data/restore";

import type {
  ExcalidrawElement,
  ExcalidrawStickyNoteElement,
  ExcalidrawTextElement,
} from "@excalidraw/element/types";

const legacyNote = (overrides: Record<string, unknown> = {}) =>
  ({
    id: "note1",
    type: "stickynote",
    x: 100,
    y: 200,
    width: 200,
    height: 200,
    angle: 0,
    strokeColor: "#1e1e1e",
    backgroundColor: "#fff9b1",
    fillStyle: "solid",
    strokeWidth: 2,
    strokeStyle: "solid",
    roughness: 0,
    opacity: 100,
    groupIds: ["g1"],
    frameId: null,
    roundness: null,
    seed: 7,
    version: 5,
    versionNonce: 11,
    isDeleted: false,
    link: null,
    locked: false,
    updated: 1000,
    boundElements: null,
    index: "a0",
    text: "Ship it",
    originalText: "Ship it",
    fontSize: 16,
    fontFamily: 2,
    textAlign: "center",
    verticalAlign: "middle",
    lineHeight: 1.25,
    fontWeight: "bold",
    textDecoration: "underline",
    ...overrides,
  } as unknown as ExcalidrawElement);

const noteOf = (elements: readonly ExcalidrawElement[]) =>
  elements.find(
    (element) => element.type === "stickynote",
  ) as ExcalidrawStickyNoteElement;

const labelOf = (elements: readonly ExcalidrawElement[]) =>
  elements.find((element) => element.type === "text") as ExcalidrawTextElement;

describe("migrateLegacyStickyNotes", () => {
  it("returns the same array when there is nothing to migrate", () => {
    const elements = [noteOf(migrateLegacyStickyNotes([legacyNote()]))];
    expect(migrateLegacyStickyNotes(elements)).toBe(elements);
  });

  it("moves the note's text and styling onto a bound label", () => {
    const migrated = migrateLegacyStickyNotes([legacyNote()]);
    const note = noteOf(migrated);
    const label = labelOf(migrated);

    expect(migrated).toHaveLength(2);
    expect(migrated[0]).toBe(note);
    expect(note).not.toHaveProperty("text");
    expect(note).not.toHaveProperty("fontSize");
    expect(note.baseHeight).toBe(200);
    expect(note.boundElements).toEqual([{ type: "text", id: label.id }]);

    expect(label.originalText).toBe("Ship it");
    expect(label.containerId).toBe("note1");
    expect(label.baseFontSize).toBe(16);
    expect(label.fontFamily).toBe(2);
    expect(label.fontWeight).toBe("bold");
    expect(label.textDecoration).toBe("underline");
    expect(label.groupIds).toEqual(["g1"]);
  });

  it("keeps arrows already bound to the note", () => {
    const arrow = { type: "arrow", id: "arrow1" } as const;
    const note = noteOf(
      migrateLegacyStickyNotes([legacyNote({ boundElements: [arrow] })]),
    );
    expect(note.boundElements).toEqual([
      arrow,
      { type: "text", id: getLegacyStickyNoteLabelId("note1") },
    ]);
  });

  it("creates no label for an empty note, and keeps the note", () => {
    const migrated = migrateLegacyStickyNotes([
      legacyNote({ text: "", originalText: "" }),
    ]);
    expect(migrated).toHaveLength(1);
    expect(migrated[0].isDeleted).toBe(false);
    expect(migrated[0]).not.toHaveProperty("text");
  });

  it("produces identical labels on independent clients", () => {
    const [first, second] = [
      labelOf(migrateLegacyStickyNotes([legacyNote()])),
      labelOf(migrateLegacyStickyNotes([legacyNote()])),
    ];
    expect(first.id).toBe(second.id);
    expect(first.seed).toBe(second.seed);
    expect(first.version).toBe(second.version);
    expect(first.versionNonce).toBe(second.versionNonce);
  });

  it("does not add a second label when one already arrived", () => {
    const [note, label] = migrateLegacyStickyNotes([legacyNote()]);
    const migrated = migrateLegacyStickyNotes([
      legacyNote({ boundElements: note.boundElements }),
      label,
    ]);
    expect(migrated.filter((element) => element.type === "text")).toHaveLength(
      1,
    );
  });
});

describe("restoreElements with legacy notes", () => {
  it("restores a saved note with its text intact", () => {
    const restored = restoreElements([legacyNote()], null);
    const note = noteOf(restored);
    const label = labelOf(restored);

    expect(restored).toHaveLength(2);
    expect(label.originalText).toBe("Ship it");
    expect(label.containerId).toBe(note.id);
    expect(note.boundElements).toEqual([{ type: "text", id: label.id }]);
  });
});
