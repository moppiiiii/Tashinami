import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { Button } from "@/components/common/button";
import type { AnnualSummary } from "@/components/summary/annual";
import { buildChapters } from "@/components/summary/chapters";
import { accentForSlug } from "@/components/zukan/encounters";
import type { Category } from "@/schemas/categories";

/**
 * 年次サマリーの章立て。一年を 1 画面ずつ送り、最後に年鑑へ着地する。
 * その年を初めて開いたときだけ流す（呼び出し側が判断する）。
 */
export function AnnualReel({
  summary,
  categories,
  onDone,
}: {
  summary: AnnualSummary;
  categories: Category[];
  onDone: () => void;
}) {
  const chapters = buildChapters(summary);
  const reelRef = useRef<HTMLDivElement>(null);
  // 最後の章まで送ったか。着地のボタンは、そこまで読んでから出す。
  const [ended, setEnded] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onDone();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onDone]);

  useEffect(() => {
    const reel = reelRef.current;
    if (!reel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          entry.target.classList.toggle(
            "sm-chapter--lit",
            entry.intersectionRatio > 0.55,
          );
          if (
            entry.intersectionRatio > 0.55 &&
            entry.target.hasAttribute("data-last")
          ) {
            setEnded(true);
          }
        }
      },
      { root: reel, threshold: [0, 0.55, 1] },
    );

    for (const section of reel.querySelectorAll(".sm-chapter")) {
      observer.observe(section);
    }
    return () => observer.disconnect();
  }, []);

  if (typeof document === "undefined") return null;

  const accentOf = (categoryId?: string | null) =>
    accentForSlug(
      categoryId ? categories.find((c) => c.id === categoryId)?.slug : null,
    );

  return createPortal(
    <div
      className="lp-scope lp-reveal-veil fixed inset-0 z-[60]"
      role="dialog"
      aria-modal="true"
      aria-label={`${summary.year} 年のサマリー`}
    >
      <button type="button" className="sm-skip" onClick={onDone}>
        とばす
      </button>

      <div ref={reelRef} className="sm-reel">
        {chapters.map((chapter) => (
          <section key={chapter.key} className="sm-chapter">
            <div className="sm-chapter__inner">
              <p className="sm-chapter__label">{chapter.label}</p>
              <p
                className={`sm-figure ${chapter.jp ? "sm-figure--jp" : ""}`}
                style={{ color: accentOf(chapter.categoryId) }}
              >
                {chapter.figure}
                {chapter.unit ? <small>{chapter.unit}</small> : null}
              </p>
              <p className="sm-chapter__copy">{chapter.copy}</p>
              {chapter.note ? (
                <p className="sm-chapter__note">{chapter.note}</p>
              ) : null}
            </div>
          </section>
        ))}

        {/* 締め。数字ではなく、一年につけた名前で終える。 */}
        <section className="sm-chapter" data-last>
          <div className="sm-chapter__inner">
            <p className="sm-chapter__label">今年のひと言</p>
            {summary.type ? (
              <>
                <p className="sm-chapter__copy sm-chapter__copy--large">
                  {summary.type.note}
                </p>
                <span className="sm-type">
                  あなたは <b>『{summary.type.name}』</b> タイプ
                </span>
              </>
            ) : (
              <p className="sm-chapter__copy sm-chapter__copy--large">
                この一年の、静かな積み重ね。
              </p>
            )}

            <div className="mt-10">
              <Button type="button" autoFocus onClick={onDone}>
                {summary.year} 年の年鑑へ
              </Button>
            </div>
          </div>
        </section>
      </div>

      {!ended ? (
        <p className="sm-hint" aria-hidden="true">
          ↓ スクロール
        </p>
      ) : null}
    </div>,
    document.body,
  );
}
