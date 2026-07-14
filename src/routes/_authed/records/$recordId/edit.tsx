import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/common/button";
import { Card } from "@/components/common/card";
import { RecordDeleteButton } from "@/components/records/record-delete-button";
import { RecordForm } from "@/components/records/record-form";
import { categoriesQueryOptions } from "@/server/categories";
import { recordsQueryOptions } from "@/server/records";

// 一杯を編集する画面。削除もここに置く（取り消せない操作はカードの上に出さない）。
export const Route = createFileRoute("/_authed/records/$recordId/edit")({
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(recordsQueryOptions()),
      context.queryClient.ensureQueryData(categoriesQueryOptions()),
    ]),
  component: EditRecordPage,
});

function EditRecordPage() {
  const { recordId } = Route.useParams();
  const navigate = useNavigate();
  const { data: records } = useSuspenseQuery(recordsQueryOptions());
  const { data: categories } = useSuspenseQuery(categoriesQueryOptions());

  const record = records.find((r) => r.id === recordId);

  return (
    <main className="tashinami-lp min-h-dvh">
      <div className="mx-auto w-full max-w-2xl px-6">
        <header className="py-6">
          <Button asChild variant="ghost">
            <Link to="/records" className="text-sm no-underline">
              <ArrowLeft size={16} />
              記録一覧へ
            </Link>
          </Button>
        </header>

        <section className="animate-lp-rise pb-16 motion-reduce:animate-none">
          {record ? (
            <>
              <RecordForm
                categories={categories}
                record={record}
                onUpdated={() => navigate({ to: "/records" })}
              />
              <div className="mt-8 flex justify-center">
                <RecordDeleteButton record={record} />
              </div>
            </>
          ) : (
            // 削除直後の戻る操作などで、この id はもう棚に無い。
            <Card className="px-6 py-14 text-center">
              <h1 className="font-jp-serif text-lg font-semibold">
                この一杯は棚にありません。
              </h1>
              <p className="text-rice-dim mt-2 text-sm leading-relaxed">
                すでに外されたか、URL が違っているようです。
              </p>
              <Button asChild variant="ghost">
                <Link
                  to="/records"
                  className="mt-6 inline-flex text-sm no-underline"
                >
                  記録一覧へ戻る
                </Link>
              </Button>
            </Card>
          )}
        </section>
      </div>
    </main>
  );
}
