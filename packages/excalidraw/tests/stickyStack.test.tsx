import React from "react";

import { Excalidraw } from "../index";

import { API } from "./helpers/api";
import { Pointer } from "./helpers/ui";
import { act, render } from "./test-utils";

const { h } = window;
const mouse = new Pointer("mouse");
const GROUP_ID = "sstack_1";

describe("sticky stack dispenser", () => {
  beforeEach(async () => {
    await render(<Excalidraw />);
    mouse.reset();
  });

  const createStack = () => {
    const notes = [0, 10].map((offset, index) =>
      API.createElement({
        type: "stickynote",
        id: `stack-${index}`,
        x: 100 + offset,
        y: 100 + offset,
        width: 200,
        height: 200,
        groupIds: [GROUP_ID],
      }),
    );
    act(() => API.setElements(notes));
    return notes;
  };

  const dragFromStack = () => {
    mouse.moveTo(200, 200);
    mouse.down();
    mouse.moveTo(210, 210);
    mouse.moveTo(520, 520);
    mouse.up();
  };

  it("leaves the stack in place and drags out a standalone note", () => {
    const stack = createStack();
    const before = stack.map(({ x, y }) => ({ x, y }));

    dragFromStack();

    const notes = h.elements.filter((el) => el.type === "stickynote");
    expect(notes).toHaveLength(3);

    const dispensed = notes.find((el) => !el.id.startsWith("stack-"))!;
    expect(dispensed.groupIds).toEqual([]);
    expect(dispensed.x).toBeGreaterThan(300);

    const stackAfter = notes.filter((el) => el.id.startsWith("stack-"));
    expect(stackAfter.map(({ x, y }) => ({ x, y }))).toEqual(before);
    expect(h.state.selectedElementIds).toEqual({ [dispensed.id]: true });
  });

  it("takes the label along with a note that has text", () => {
    const [bottom, top] = createStack();
    const label = API.createElement({
      type: "text",
      text: "hello",
      containerId: top.id,
      groupIds: [GROUP_ID],
    });
    API.updateElement(top, { boundElements: [{ type: "text", id: label.id }] });
    act(() => API.setElements([bottom, top, label]));

    dragFromStack();

    const dispensed = h.elements.find(
      (el) => el.type === "stickynote" && !el.id.startsWith("stack-"),
    )!;
    const dispensedLabel = h.elements.find(
      (el) => el.type === "text" && el.containerId === dispensed.id,
    );

    expect(dispensedLabel).toBeDefined();
    expect(dispensed.boundElements).toEqual([
      { type: "text", id: dispensedLabel!.id },
    ]);
  });
});
