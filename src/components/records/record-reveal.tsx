import { useEffect } from "react";
import { createPortal } from "react-dom";

import { DrinkImage } from "@/components/zukan/drink-image";
import { accentForSlug } from "@/components/zukan/encounters";

// 保存の一瞬に灯す演出の中身。初回は「初めての出会い」、既知は「N杯目の再会」。
export type RevealResult = {
  name: string;
  categoryName: string | null;
  categorySlug: string | null;
  isFirst: boolean;
  revisit: number; // 何杯目か（今回を含む）
};

export function RecordReveal({
  result,
  onClose,
}: {
  result: RevealResult | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!result) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [result, onClose]);

  if (typeof document === "undefined" || !result) return null;

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
          className="lp-reveal-item lp-serif mt-5 text-3xl leading-tight text-balance md:text-4xl"
          style={{ animationDelay: "0.46s" }}
        >
          {result.name}
        </h2>

        {result.categoryName ? (
          <p
            className="lp-reveal-item lp-eyebrow mt-4"
            style={{ animationDelay: "0.62s" }}
          >
            {result.categoryName}
          </p>
        ) : null}

        <p
          className="lp-reveal-item lp-serif lp-dim mx-auto mt-6 max-w-xs text-base leading-loose"
          style={{ animationDelay: "0.82s" }}
        >
          {copy}
        </p>

        <div
          className="lp-reveal-item mt-8"
          style={{ animationDelay: "1.05s" }}
        >
          <button
            type="button"
            autoFocus
            onClick={onClose}
            className="lp-ghost"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
