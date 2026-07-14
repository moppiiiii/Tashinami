// 章立ての演出はその年を初めて開いたときだけ流す。見たかどうかはブラウザに覚えさせる
// （DB に持つほどではない。端末が変わればもう一度見られてよい）。

const KEY = "tashinami:summary-seen";

export function hasSeenSummary(year: number): boolean {
  if (typeof window === "undefined") return true; // SSR では流さない（ハイドレーション後に判定する）
  try {
    return window.localStorage.getItem(`${KEY}:${year}`) === "1";
  } catch {
    // プライベートモード等で localStorage が使えない環境。演出を諦める側に倒す。
    return true;
  }
}

export function markSummarySeen(year: number): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(`${KEY}:${year}`, "1");
  } catch {
    // 覚えられなくても画面は進む。
  }
}
