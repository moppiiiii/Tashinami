import { useId, useRef, useState } from "react";

import type { Method } from "@/content/drinks";

/** 作り方をタブで切り替える。1 画面に 1 手順だけ出し、比較はタブの行き来で行う。 */
export function MethodSteps({ methods }: { methods: Method[] }) {
  const [active, setActive] = useState(0);
  const tabsRef = useRef<HTMLDivElement>(null);
  const baseId = useId();
  const method = methods[active];

  // タブ内の移動は矢印キー。tabIndex は選択中の 1 つだけに置き、
  // Tab キーはタブ列を素通りして手順へ抜ける（WAI-ARIA の tabs パターン）。
  const onKeyDown = (event: React.KeyboardEvent) => {
    const step =
      event.key === "ArrowRight"
        ? 1
        : event.key === "ArrowLeft"
          ? -1
          : event.key === "Home"
            ? -active
            : event.key === "End"
              ? methods.length - 1 - active
              : 0;
    if (step === 0) return;

    event.preventDefault();
    const next = (active + step + methods.length) % methods.length;
    setActive(next);
    tabsRef.current?.querySelectorAll("button")[next]?.focus();
  };

  return (
    <>
      <div
        ref={tabsRef}
        role="tablist"
        aria-label="作り方"
        className="dg-tabs"
        onKeyDown={onKeyDown}
      >
        {methods.map((item, i) => (
          <button
            key={item.name}
            type="button"
            role="tab"
            id={`${baseId}-tab-${i}`}
            aria-selected={i === active}
            aria-controls={`${baseId}-panel-${i}`}
            tabIndex={i === active ? 0 : -1}
            className="dg-tab"
            onClick={() => setActive(i)}
          >
            {item.name}
          </button>
        ))}
      </div>

      <div
        role="tabpanel"
        id={`${baseId}-panel-${active}`}
        aria-labelledby={`${baseId}-tab-${active}`}
        tabIndex={0}
        className="dg-panel"
      >
        <p className="text-rice-dim mb-6 text-sm leading-relaxed">
          {method.note}
          {method.meta ? (
            <span className="dg-tab__meta">{method.meta}</span>
          ) : null}
        </p>

        <ol className="dg-steps">
          {method.steps.map((step, i) => (
            <li key={step.title} className="dg-step">
              <span className="dg-step__mark">{i + 1}</span>
              <div>
                <h3 className="font-jp-serif text-base font-semibold">
                  {step.title}
                </h3>
                <p className="text-rice-dim mt-1 text-sm leading-relaxed">
                  {step.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </>
  );
}
