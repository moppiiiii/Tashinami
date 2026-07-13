import { Link } from "@tanstack/react-router";
import { Compass } from "lucide-react";

import { Button } from "@/components/common/button";
import { Chip } from "@/components/common/chip";

// 未一致 URL、または `notFound()` を throw したときの受け皿。
export function NotFoundComponent() {
  return (
    <main className="tashinami-lp grid min-h-dvh place-items-center px-6">
      <div className="animate-lp-rise w-full max-w-md text-center motion-reduce:animate-none">
        <Chip className="mx-auto mb-5 flex size-12 items-center justify-center rounded-full p-0">
          <Compass size={20} />
        </Chip>
        <p className="text-rice-dim mb-2 text-[0.68rem] font-bold tracking-[0.28em] uppercase">
          404
        </p>
        <h1 className="font-jp-serif text-2xl font-semibold md:text-3xl">
          ページが見つかりません
        </h1>
        <p className="text-rice-dim mx-auto mt-3 max-w-sm text-sm leading-relaxed">
          お探しのページは存在しないか、移動した可能性があります。
        </p>
        <div className="mt-8 flex justify-center">
          <Button asChild>
            <Link to="/" className="no-underline">
              トップへ
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
