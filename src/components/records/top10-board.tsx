import { Link } from "@tanstack/react-router";
import {
  ArrowUp,
  ChevronDown,
  ChevronUp,
  Heart,
  Plus,
  Trophy,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/common/button";
import { Card } from "@/components/common/card";
import { Chip } from "@/components/common/chip";
import { DrinkImage } from "@/components/zukan/drink-image";
import { useSaveTopDrinks } from "@/hooks/use-save-top-drinks";
import { formatJstDate } from "@/lib/date";
import type { Category } from "@/schemas/categories";
import type { DrinkRecord } from "@/schemas/records";
import { TOP_DRINKS_LIMIT, type TopDrinkItem } from "@/schemas/top-drinks";

import { buildRanking, type Ranked } from "./rankings";
import { ScoreMeter } from "./score-meter";

const CANDIDATE_LIMIT = 8;

// 殿堂（TOP10）。順位は計算しない ── 本人が選んで並べる。
// 評価は「候補の推薦順」としてだけ効く（rankings.ts）。責任が重ならないようにする。
export function Top10Board({
  records,
  categories,
  items,
}: {
  records: DrinkRecord[];
  categories: Category[];
  items: TopDrinkItem[];
}) {
  const save = useSaveTopDrinks();
  // 満席のとき、どの席と入れ替えるかを選んでいる最中の候補。
  const [replacing, setReplacing] = useState<TopDrinkItem | null>(null);

  const ranked = useMemo(() => buildRanking(records), [records]);
  const byKey = useMemo(() => {
    const map = new Map<string, Ranked>();
    for (const r of ranked) map.set(r.key, r);
    return map;
  }, [ranked]);

  const slugById = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of categories) map.set(c.id, c.slug);
    return map;
  }, [categories]);

  const chosen = new Set(items.map((i) => i.key));
  const candidates = ranked
    .filter((r) => !chosen.has(r.key))
    .slice(0, CANDIDATE_LIMIT);

  const full = items.length >= TOP_DRINKS_LIMIT;

  const commit = (next: TopDrinkItem[]) => {
    setReplacing(null);
    save.mutate(next);
  };

  const add = (r: Ranked) => {
    if (full) {
      setReplacing({ key: r.key, name: r.name });
      return;
    }
    commit([...items, { key: r.key, name: r.name }]);
  };

  const replaceAt = (index: number) => {
    if (!replacing) return;
    commit(items.map((item, i) => (i === index ? replacing : item)));
  };

  const remove = (key: string) => commit(items.filter((i) => i.key !== key));

  const move = (index: number, to: number) => {
    if (to < 0 || to >= items.length) return;
    const next = [...items];
    const [moved] = next.splice(index, 1);
    if (!moved) return;
    next.splice(to, 0, moved);
    commit(next);
  };

  const slugOf = (r?: Ranked) =>
    (r?.categoryId && slugById.get(r.categoryId)) || null;

  return (
    <>
      {replacing ? (
        <Card className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 border-[rgba(207,146,71,0.42)] p-4">
          <p className="flex-1 text-sm">
            席は 10 まで。
            <span className="text-amber-bright mx-1">{replacing.name}</span>
            を、どれと入れ替えますか。
          </p>
          <Button variant="ghost" onClick={() => setReplacing(null)}>
            やめる
          </Button>
        </Card>
      ) : null}

      {items.length === 0 ? (
        <EmptyBoard hasCandidates={candidates.length > 0} />
      ) : (
        <ol className="mt-8 flex flex-col gap-2">
          {items.map((item, i) => {
            const r = byKey.get(item.key);
            return (
              <Seat
                key={item.key}
                rank={i + 1}
                item={item}
                ranked={r}
                slug={slugOf(r)}
                replacing={replacing != null}
                onReplace={() => replaceAt(i)}
                onUp={() => move(i, i - 1)}
                onTop={() => move(i, 0)}
                onDown={() => move(i, i + 1)}
                onRemove={() => remove(item.key)}
                isFirst={i === 0}
                isLast={i === items.length - 1}
              />
            );
          })}
        </ol>
      )}

      {candidates.length > 0 ? (
        <section className="mt-12">
          <div className="mb-4 flex items-baseline gap-3 border-b border-[color:var(--ink-line)] pb-3">
            <span className="text-rice-dim text-[0.68rem] font-bold tracking-[0.28em] uppercase">
              Candidates
            </span>
            <h2 className="font-jp-serif text-xl font-semibold">候補</h2>
            <span className="text-rice-dim ml-auto text-xs">
              評価は「その夜の一杯」の点。殿堂に置くのは「銘柄」の席。
            </span>
          </div>

          <ul className="flex flex-col gap-2">
            {candidates.map((r) => (
              <Candidate
                key={r.key}
                ranked={r}
                slug={slugOf(r)}
                full={full}
                onAdd={() => add(r)}
              />
            ))}
          </ul>
        </section>
      ) : null}
    </>
  );
}

// 殿堂の 1 席。記録が消えても席は残るので、ranked が無い場合も名前だけで描く。
function Seat({
  rank,
  item,
  ranked,
  slug,
  replacing,
  onReplace,
  onUp,
  onTop,
  onDown,
  onRemove,
  isFirst,
  isLast,
}: {
  rank: number;
  item: TopDrinkItem;
  ranked?: Ranked;
  slug: string | null;
  replacing: boolean;
  onReplace: () => void;
  onUp: () => void;
  onTop: () => void;
  onDown: () => void;
  onRemove: () => void;
  isFirst: boolean;
  isLast: boolean;
}) {
  return (
    <Card
      as="li"
      className={`flex items-center gap-3 px-4 py-3 ${
        isFirst ? "border-[rgba(207,146,71,0.42)]" : ""
      }`}
    >
      <span
        className={`font-latin w-7 shrink-0 text-center font-bold tabular-nums ${
          isFirst ? "text-amber text-2xl" : "text-rice-dim text-lg"
        }`}
      >
        {rank}
      </span>

      <DrinkImage slug={slug} size={isFirst ? 52 : 38} glow={isFirst} />

      <div className="min-w-0 flex-1">
        <p className="font-jp-serif truncate font-semibold">
          {ranked?.name ?? item.name}
          {ranked?.isFavorite ? (
            <Heart
              size={11}
              fill="currentColor"
              className="text-amber-bright ml-1.5 inline align-middle"
              aria-label="お気に入り"
            />
          ) : null}
        </p>
        {ranked ? (
          <p className="text-rice-dim truncate text-xs">
            {ranked.categoryName ?? "未分類"} ・ 最高 {ranked.score.toFixed(1)}{" "}
            ・ {formatJstDate(ranked.bestAt)}
            {ranked.placeName ? ` ・ ${ranked.placeName}` : ""}
          </p>
        ) : (
          <p className="text-rice-dim truncate text-xs">記録はもうありません</p>
        )}
      </div>

      {replacing ? (
        <Button onClick={onReplace} className="shrink-0 text-xs">
          ここと入れ替える
        </Button>
      ) : (
        <div className="flex shrink-0 items-center gap-0.5">
          <IconButton
            label={`${rank} 位を 1 位へ`}
            onClick={onTop}
            disabled={isFirst}
          >
            <ArrowUp size={14} />
          </IconButton>
          <IconButton
            label={`${rank} 位を上へ`}
            onClick={onUp}
            disabled={isFirst}
          >
            <ChevronUp size={16} />
          </IconButton>
          <IconButton
            label={`${rank} 位を下へ`}
            onClick={onDown}
            disabled={isLast}
          >
            <ChevronDown size={16} />
          </IconButton>
          <IconButton label={`${item.name} を殿堂から外す`} onClick={onRemove}>
            <X size={14} />
          </IconButton>
        </div>
      )}
    </Card>
  );
}

function Candidate({
  ranked,
  slug,
  full,
  onAdd,
}: {
  ranked: Ranked;
  slug: string | null;
  full: boolean;
  onAdd: () => void;
}) {
  return (
    <Card as="li" className="flex items-center gap-4 px-4 py-3">
      <DrinkImage slug={slug} size={38} glow={false} />

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm">{ranked.name}</p>
        <p className="text-rice-dim truncate text-xs">
          {ranked.categoryName ?? "未分類"}
          {ranked.count > 1 ? ` ・ ${ranked.count}杯` : ""}
        </p>
      </div>

      <div className="hidden w-32 shrink-0 items-center gap-2 sm:flex">
        <ScoreMeter rating={ranked.score} />
      </div>

      <Button variant="ghost" onClick={onAdd} className="shrink-0 text-xs">
        {full ? "入れ替える" : "殿堂へ"}
      </Button>
    </Card>
  );
}

function IconButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="text-rice-dim hover:text-amber-bright focus-visible:outline-amber-bright rounded-md p-1.5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-25"
    >
      {children}
    </button>
  );
}

function EmptyBoard({ hasCandidates }: { hasCandidates: boolean }) {
  return (
    <Card className="mt-8 flex flex-col items-center px-6 py-16 text-center">
      <Chip className="mb-5 flex size-14 items-center justify-center rounded-full p-0">
        <Trophy size={22} />
      </Chip>
      <h2 className="font-jp-serif text-lg font-semibold">
        殿堂は、まだ空席です。
      </h2>
      <p className="text-rice-dim mt-2 max-w-sm text-sm leading-relaxed">
        {hasCandidates
          ? "下の候補から選んでください。評価が高い順に並んでいますが、どれを入れるかはあなたが決めます。"
          : "記録に評価を付けると、候補がここに挙がります。"}
      </p>
      {hasCandidates ? null : (
        <div className="mt-6">
          <Button asChild>
            <Link to="/records/new" className="no-underline">
              <Plus size={18} />
              一杯を記録する
            </Link>
          </Button>
        </div>
      )}
    </Card>
  );
}
