import type { AnnualSummary } from "@/components/summary/annual";

// 章立て（リール）の 1 章。数字はひとつだけ置く（量の誇示にしないための縛り）。
export type Chapter = {
  key: string;
  label: string;
  /** 大きく灯す値。数字とは限らない（銘柄名・店名も来る）。 */
  figure: string;
  /** figure に添える単位。 */
  unit?: string;
  /** figure が日本語のときは明朝で組む（数字は Fraunces）。 */
  jp?: boolean;
  copy: string;
  note?: string;
  /** 差し色をカテゴリに寄せる章だけ持つ。 */
  categoryId?: string | null;
};

/**
 * サマリーから章を組む。データが無い章は落とす（空の章を出さない）。
 * 型（『余韻を追いかける』など）は章にせず、締めとして別に置く。
 */
export function buildChapters(summary: AnnualSummary): Chapter[] {
  const chapters: Chapter[] = [];

  if (summary.firstMeetings > 0) {
    chapters.push({
      key: "encounters",
      label: `${summary.year} · 一年の記録`,
      figure: String(summary.firstMeetings),
      unit: "種",
      copy: `この一年で、${summary.firstMeetings} の銘柄と初めて出会った。`,
      note:
        summary.revisits > 0
          ? `図鑑に灯った数。再会は ${summary.revisits} 杯。`
          : "図鑑に灯った数。",
    });
  }

  const [top, second] = summary.categories;
  if (top && top.categoryId) {
    chapters.push({
      key: "category",
      label: "いちばん多く選んだ",
      figure: String(top.percent),
      unit: "%",
      copy: `あなたの一年は、${top.name}でできていた。`,
      note: second ? `次いで ${second.name} ${second.percent}%` : undefined,
      categoryId: top.categoryId,
    });
  }

  if (summary.best) {
    chapters.push({
      key: "best",
      label: "いちばんの一杯",
      figure: summary.best.name,
      jp: true,
      copy: `${summary.best.rating} — 今年、いちばん高い点をつけた一杯。`,
      note: summary.best.placeName
        ? `出会った場所は ${summary.best.placeName}。`
        : undefined,
    });
  }

  if (summary.topPlace) {
    chapters.push({
      key: "place",
      label: "いちばん通った場所",
      figure: summary.topPlace.name,
      jp: true,
      copy: `${summary.topPlace.name}で、${summary.topPlace.count} 杯と出会った。`,
      note: `出会った場所は、全部で ${summary.placeCount} か所。`,
    });
  }

  return chapters;
}

// 章が少ない痩せた年に演出を流さないための下限。杯数の下限は「初日に開いて
// 演出が始まる」のを避けるための歯止め。
const MIN_CHAPTERS = 3;
const MIN_POURS = 3;

/** 開いた瞬間に自動で流してよいか（勝手に始まる演出なので、条件は厳しく）。 */
export function canPlayReel(summary: AnnualSummary): boolean {
  return (
    summary.pours >= MIN_POURS && buildChapters(summary).length >= MIN_CHAPTERS
  );
}

/** 手で再生してよいか。自分から押したのだから、章が 1 つでもあれば見せる。 */
export function hasChapters(summary: AnnualSummary): boolean {
  return buildChapters(summary).length > 0;
}
