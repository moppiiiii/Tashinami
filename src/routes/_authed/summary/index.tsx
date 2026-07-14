import { createFileRoute, redirect } from "@tanstack/react-router";

import { yearsWithRecords } from "@/components/summary/annual";
import { jstNow } from "@/lib/date";
import { recordsQueryOptions } from "@/server/records";

// /summary は年を持たない。記録のある最新年（無ければ今年）へ送る。
export const Route = createFileRoute("/_authed/summary/")({
  loader: async ({ context }) => {
    const records = await context.queryClient.ensureQueryData(
      recordsQueryOptions(),
    );
    const year = yearsWithRecords(records)[0] ?? jstNow().getUTCFullYear();
    throw redirect({ to: "/summary/$year", params: { year: String(year) } });
  },
});
