import { Heart, Search } from "lucide-react";
import { type ReactNode, useMemo, useState } from "react";

import { Button } from "@/components/common/button";
import { Card } from "@/components/common/card";
import { Input } from "@/components/common/input";
import type { Category } from "@/schemas/categories";
import type { DrinkRecord } from "@/schemas/records";

import { RecordList } from "./record-list";

// /records の全件＋検索＋絞り込み。データは全件ロード済みなのでクライアント側で絞る。
export function RecordsBrowser({
  records,
  categories,
}: {
  records: DrinkRecord[];
  categories: Category[];
}) {
  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState<string>("all"); // "all" | id | "none"
  const [favOnly, setFavOnly] = useState(false);

  const presentCategories = useMemo(() => {
    const ids = new Set(
      records.map((r) => r.category?.id).filter((v): v is string => Boolean(v)),
    );
    return categories.filter((c) => ids.has(c.id));
  }, [records, categories]);
  const hasUncategorized = records.some((r) => !r.category);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return records.filter((r) => {
      if (categoryId === "none" && r.category) return false;
      if (categoryId !== "all" && categoryId !== "none") {
        if (r.category?.id !== categoryId) return false;
      }
      if (favOnly && !r.isFavorite) return false;
      if (q) {
        const hay =
          `${r.name} ${r.placeName ?? ""} ${r.memo ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [records, query, categoryId, favOnly]);

  if (records.length === 0) {
    return <RecordList records={records} categories={categories} />;
  }

  const reset = () => {
    setQuery("");
    setCategoryId("all");
    setFavOnly(false);
  };

  return (
    <div>
      <div className="mb-6 flex items-baseline justify-between gap-4">
        <h1 className="font-jp-serif text-2xl font-semibold md:text-3xl">
          これまでの一杯
        </h1>
        <span className="text-rice-dim text-sm tabular-nums">
          {filtered.length} / {records.length} 杯
        </span>
      </div>

      <div className="mb-6 space-y-3">
        <div className="relative">
          <Search
            size={16}
            className="text-rice-dim pointer-events-none absolute top-1/2 left-3 -translate-y-1/2"
          />
          <Input
            className="pl-9"
            placeholder="銘柄・場所・メモで探す"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="記録を検索"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <FilterChip
            active={categoryId === "all"}
            onClick={() => setCategoryId("all")}
          >
            すべて
          </FilterChip>
          {presentCategories.map((c) => (
            <FilterChip
              key={c.id}
              active={categoryId === c.id}
              onClick={() => setCategoryId(c.id)}
            >
              {c.name}
            </FilterChip>
          ))}
          {hasUncategorized ? (
            <FilterChip
              active={categoryId === "none"}
              onClick={() => setCategoryId("none")}
            >
              未分類
            </FilterChip>
          ) : null}
          <FilterChip active={favOnly} onClick={() => setFavOnly((v) => !v)}>
            <Heart size={12} fill={favOnly ? "currentColor" : "none"} />
            お気に入り
          </FilterChip>
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card className="px-6 py-12 text-center">
          <p className="font-jp-serif text-base font-semibold">
            条件に合う一杯がありません。
          </p>
          <Button
            variant="ghost"
            type="button"
            className="mt-4 text-sm"
            onClick={reset}
          >
            絞り込みを解除
          </Button>
        </Card>
      ) : (
        <RecordList records={filtered} categories={categories} />
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs transition-colors"
      style={
        active
          ? {
              color: "var(--amber-bright)",
              borderColor: "rgba(207, 146, 71, 0.5)",
              background: "rgba(207, 146, 71, 0.1)",
            }
          : { color: "var(--rice-dim)", borderColor: "var(--ink-line)" }
      }
    >
      {children}
    </button>
  );
}
