import { Store } from "@tanstack/store";

import type { RevealResult } from "./record-reveal";

// /records/new で保存し、演出は着地先の /home で灯る。
// URL に載せる情報ではないので、遷移をまたぐ受け渡しだけを担う。
export const revealStore = new Store<RevealResult | null>(null);

export function announceReveal(result: RevealResult): void {
  revealStore.setState(() => result);
}

export function clearReveal(): void {
  revealStore.setState(() => null);
}
