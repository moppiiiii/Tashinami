import { useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { Button } from "@/components/common/button";
import { DrinkImage } from "@/components/zukan/drink-image";
import { accentForSlug } from "@/components/zukan/encounters";
import { useSaveTopDrinks } from "@/hooks/use-save-top-drinks";
import { TOP_DRINKS_LIMIT } from "@/schemas/top-drinks";
import { topDrinksQueryOptions } from "@/server/top-drinks";

// 初回は「初めての出会い」、既知は「N杯目の再会」。
export type RevealResult = {
  key: string; // 正規化した銘柄キー（殿堂の席と突き合わせる）
  name: string;
  categoryName: string | null;
  categorySlug: string | null;
  isFirst: boolean;
  revisit: number; // 何杯目か（今回を含む）
  rating: number | null;
};

// ここから上の印象なら、殿堂に誘う。
// 「点を付ける」と「席を選ぶ」が別の行為だと、説明ではなく操作で伝える場所（docs/concept.md §5）。
const INVITE_FROM = 8.5;

export function RecordReveal({
  result,
  onClose,
}: {
  result: RevealResult | null;
  onClose: () => void;
}) {
  const { data: items } = useSuspenseQuery(topDrinksQueryOptions());
  const save = useSaveTopDrinks();
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!result) return;
    setAdded(false);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [result, onClose]);

  if (typeof document === "undefined" || !result) return null;

  const seat = items.findIndex((i) => i.key === result.key);
  const full = items.length >= TOP_DRINKS_LIMIT;
  const invited =
    seat < 0 && result.rating != null && result.rating >= INVITE_FROM;

  const enshrine = () => {
    save.mutate([...items, { key: result.key, name: result.name }]);
    setAdded(true);
  };

  const { isFirst } = result;
  const accent = accentForSlug(result.categorySlug);
  const kicker = isFirst ? "初めての出会い" : `${result.revisit}杯目の再会`;
  const copy = isFirst
    ? "あたらしい一杯が、図鑑にひとつ灯る。"
    : "またこの一杯を。図鑑はそのまま、記憶だけ静かに重なる。";

  return createPortal(
    <div
      className={`lp-scope lp-reveal-veil fixed inset-0 z-[60] flex items-center justify-center p-6 ${
        isFirst ? "" : "lp-reveal-veil--quiet"
      }`}
      role="dialog"
      aria-modal="true"
      aria-label="記録完了"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="max-w-md text-center">
        {/* 器：うしろで光の輪が一度だけ広がる（初回のみ） */}
        <div
          className="lp-reveal-item relative mb-7 flex items-end justify-center"
          style={{ animationDelay: "0.1s", color: accent }}
        >
          {isFirst ? (
            <span className="lp-reveal-halo pointer-events-none absolute top-1/2 left-1/2" />
          ) : null}
          {/* 絵そのものが灯りを持つので、drop-shadow は掛けない
              （不透明な正方形なので、四角い影になってしまう） */}
          <DrinkImage slug={result.categorySlug} size={140} eager />
        </div>

        <p
          className="lp-reveal-item text-xs font-semibold tracking-[0.42em] uppercase"
          style={{
            animationDelay: "0.28s",
            color: isFirst ? "var(--amber-bright)" : "var(--rice-dim)",
          }}
        >
          {kicker}
        </p>

        <h2
          className="lp-reveal-item font-jp-serif mt-5 text-3xl leading-tight font-semibold text-balance md:text-4xl"
          style={{ animationDelay: "0.46s" }}
        >
          {result.name}
        </h2>

        {result.categoryName ? (
          <p
            className="lp-reveal-item text-rice-dim mt-4 text-[0.68rem] font-bold tracking-[0.28em] uppercase"
            style={{ animationDelay: "0.62s" }}
          >
            {result.categoryName}
          </p>
        ) : null}

        <p
          className="lp-reveal-item font-jp-serif text-rice-dim mx-auto mt-6 max-w-xs text-base leading-loose font-semibold"
          style={{ animationDelay: "0.82s" }}
        >
          {copy}
        </p>

        {/* 殿堂への誘い。高い印象は「招待状」であって、席そのものではない。 */}
        <div
          className="lp-reveal-item mt-8 flex flex-col items-center gap-3"
          style={{ animationDelay: "1.05s" }}
        >
          {added ? (
            <p className="text-amber-bright font-jp-serif text-base font-semibold">
              殿堂 {items.length} 位に、席をひとつ。
            </p>
          ) : seat >= 0 ? (
            <p className="text-rice-dim text-sm">
              殿堂 {seat + 1} 位の一杯です。
            </p>
          ) : invited && !full ? (
            <>
              <p className="text-rice-dim text-sm">
                この一杯を、殿堂に置きますか。
              </p>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  autoFocus
                  disabled={save.isPending}
                  onClick={enshrine}
                >
                  殿堂に入れる
                </Button>
                <Button variant="ghost" type="button" onClick={onClose}>
                  今はやめる
                </Button>
              </div>
            </>
          ) : invited && full ? (
            <p className="text-rice-dim text-sm">
              殿堂は満席です。
              <Link
                to="/top10"
                className="text-amber-bright mx-1"
                onClick={onClose}
              >
                TOP10
              </Link>
              で入れ替えられます。
            </p>
          ) : null}

          {added || seat >= 0 || !invited || full ? (
            <Button
              variant="ghost"
              type="button"
              autoFocus={!invited || full || seat >= 0}
              onClick={onClose}
            >
              閉じる
            </Button>
          ) : null}
        </div>
      </div>
    </div>,
    document.body,
  );
}
