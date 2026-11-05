import { useCallback, useEffect, useRef, useState } from "react";

import { newTextElement } from "@excalidraw/element";

import { t } from "../i18n";

import FullEmojiPicker from "./FullEmojiPicker";
import { IconButton } from "./IconButton";
import { CommentIcon, EmojiStickerIcon } from "./icons";

import type { AppClassProperties } from "../types";

const EMOJI_SIZE = 40;
const EMOJI_GAP = 8;

export const CommentPinToolButton = () => (
  <IconButton
    type="icon"
    icon={CommentIcon}
    aria-label={t("toolBar.comment")}
    title={t("toolBar.comment")}
    onClick={() => {
      window.dispatchEvent(
        new CustomEvent("excalidraw:startCreateCommentPin", {
          bubbles: true,
          detail: {},
        }),
      );
    }}
  />
);

export const EmojiStickerToolButton = ({
  app,
}: {
  app: AppClassProperties;
}) => {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);
  const anchorElRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const handleOpenPicker = (event: Event) => {
      const detail = (event as CustomEvent).detail as
        | { anchorEl?: HTMLElement }
        | undefined;
      anchorElRef.current = detail?.anchorEl ?? null;
      setIsPickerOpen((open) => !open);
    };
    window.addEventListener("excalidraw:openEmojiPicker", handleOpenPicker);
    return () =>
      window.removeEventListener(
        "excalidraw:openEmojiPicker",
        handleOpenPicker,
      );
  }, []);

  const handleSelect = useCallback(
    (emoji: string) => {
      setIsPickerOpen(false);
      const [selected] = app.scene.getSelectedElements(app.state);
      app.onInsertElements([
        newTextElement({
          x: selected ? selected.x + selected.width + EMOJI_GAP : 0,
          y: selected ? selected.y + selected.height - EMOJI_SIZE : 0,
          text: emoji,
          fontSize: EMOJI_SIZE,
          opacity: 100,
          customData: { isEmojiSticker: true },
        }),
      ]);
    },
    [app],
  );

  return (
    <>
      <div ref={buttonRef}>
        <IconButton
          type="icon"
          icon={EmojiStickerIcon}
          aria-label="Emoji sticker"
          title="Emoji sticker"
          onClick={() => setIsPickerOpen((open) => !open)}
        />
      </div>
      {isPickerOpen && (
        <FullEmojiPicker
          anchorEl={anchorElRef.current ?? buttonRef.current ?? undefined}
          onSelect={handleSelect}
          onClose={() => setIsPickerOpen(false)}
        />
      )}
    </>
  );
};
