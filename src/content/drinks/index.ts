import { beer } from "./beer";
import { cocktail } from "./cocktail";
import { sake } from "./sake";
import { shochu } from "./shochu";
import type { DrinkGuide } from "./types";
import { whisky } from "./whisky";
import { wine } from "./wine";

export type {
  DrinkGuide,
  Glass,
  Method,
  Step,
  StyleRow,
  Temperature,
} from "./types";

// 一覧に並ぶ順（棚に置く順）。categories.sort_order ではなくここが正本
// ——「その他」はガイドを持たないので、マスタと 1:1 ではない。
export const DRINK_GUIDES: DrinkGuide[] = [
  beer,
  wine,
  sake,
  shochu,
  whisky,
  cocktail,
];

export function getDrinkGuide(slug: string): DrinkGuide | undefined {
  return DRINK_GUIDES.find((guide) => guide.slug === slug);
}
