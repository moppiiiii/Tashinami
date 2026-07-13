import { Store } from "@tanstack/store";

import type { RevealResult } from "./record-reveal";

// 記録は /records/new で保存され、演出は着地先の /home で灯る。
// URL に載せる情報ではないので、遷移をまたぐ受け渡しだけを担う小さなストアに置く。
export const revealStore = new Store<RevealResult | null>(null);

export function announceReveal(result: RevealResult): void {
  revealStore.setState(() => result);
}

export function clearReveal(): void {
  revealStore.setState(() => null);
}
