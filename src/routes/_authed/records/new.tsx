import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

import { RecordForm } from "@/components/records/record-form";
import { announceReveal } from "@/components/records/reveal-store";
import { categoriesQueryOptions } from "@/server/categories";
import { recordsQueryOptions } from "@/server/records";

// 一杯を記録する画面。保存したら /home へ着地し、そこで出会いのリヴィールが灯る。
// 初/再会の判定は RecordForm が追加前のキャッシュで行うので、records も prefetch する。
export const Route = createFileRoute("/_authed/records/new")({
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(categoriesQueryOptions()),
      context.queryClient.ensureQueryData(recordsQueryOptions()),
    ]),
  component: NewRecordPage,
});

function NewRecordPage() {
  const navigate = useNavigate();
  const { data: categories } = useSuspenseQuery(categoriesQueryOptions());

  return (
    <main className="tashinami-lp min-h-dvh">
      <div className="mx-auto w-full max-w-2xl px-6">
        <header className="py-6">
          <Link to="/records" className="lp-ghost text-sm no-underline">
            <ArrowLeft size={16} />
            記録一覧へ
          </Link>
        </header>

        <section className="lp-rise pb-16">
          <RecordForm
            categories={categories}
            onSuccess={(result) => {
              announceReveal(result);
              void navigate({ to: "/home" });
            }}
          />
        </section>
      </div>
    </main>
  );
}
