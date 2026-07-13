import { useEffect, useId, useRef, useState } from "react";

// 銘柄・出会った場所のサジェストで共有する combobox の振る舞い（開閉・矢印キー・外側クリック）。
// 見た目と候補の作り方だけを呼び出し側に残す。
export function useSuggestBox<T>(
  options: T[],
  onPick: (option: T) => void,
): {
  rootRef: React.RefObject<HTMLDivElement | null>;
  listId: string;
  active: number;
  expanded: boolean;
  setActive: (index: number) => void;
  pick: (option: T) => void;
  /** input に展開する。onChange / onBlur は呼び出し側で足す。 */
  inputProps: {
    role: "combobox";
    "aria-expanded": boolean;
    "aria-controls": string;
    "aria-autocomplete": "list";
    "aria-activedescendant": string | undefined;
    autoComplete: "off";
    onFocus: () => void;
    onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  };
  /** 入力が変わったときに呼ぶ（開いて選択を外す）。 */
  onInput: () => void;
} {
  const [open, setOpen] = useState(false);
  // -1＝未選択。矢印キーで動かしたときだけ Enter で確定する
  // （新しい語を打ち切って Enter したときに候補へ化けないように）。
  const [active, setActive] = useState(-1);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  const expanded = open && options.length > 0;

  const pick = (option: T) => {
    onPick(option);
    setOpen(false);
    setActive(-1);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
      setActive((i) => Math.min(i + 1, options.length - 1));
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, -1));
      return;
    }
    if (e.key === "Enter" && expanded && active >= 0) {
      const option = options[active];
      if (option) {
        e.preventDefault(); // 候補の確定であって、フォームの送信ではない。
        pick(option);
      }
      return;
    }
    if (e.key === "Escape" && open) {
      e.preventDefault();
      setOpen(false);
      setActive(-1);
    }
  };

  return {
    rootRef,
    listId,
    active,
    expanded,
    setActive,
    pick,
    inputProps: {
      role: "combobox",
      "aria-expanded": expanded,
      "aria-controls": listId,
      "aria-autocomplete": "list",
      "aria-activedescendant": active >= 0 ? `${listId}-${active}` : undefined,
      autoComplete: "off",
      onFocus: () => setOpen(true),
      onKeyDown,
    },
    onInput: () => {
      setOpen(true);
      setActive(-1);
    },
  };
}
