import { createFileRoute, redirect } from "@tanstack/react-router";
import * as z from "zod";

import { LoginForm } from "@/components/auth/login-form";
import { userQueryOptions } from "@/server/auth";

// ガードから渡ってくる遷移先。未指定ならホーム（/ は公開 LP のため）。
const SearchSchema = z.object({
  redirect: z.string().optional().catch(undefined),
});

export const Route = createFileRoute("/login")({
  validateSearch: SearchSchema,
  beforeLoad: async ({ context, search }) => {
    // すでにログイン済みなら遷移先へ飛ばす（ログイン画面を見せない）。
    // 内部パスへは必ず `to`（クライアント内遷移）で飛ばす。`href` は document 遷移になり、
    // サーバー/クライアントで user 判定が一瞬でも食い違うと /login ⇄ /home の
    // ハードナビ無限ループ（＝画面が固まる）を招く。
    const user = await context.queryClient.ensureQueryData(userQueryOptions());
    if (user) {
      throw redirect({ to: search.redirect ?? "/home" });
    }
  },
  component: LoginPage,
});

// route は薄く保つ。search を読んでフォーム（components/auth/）へ渡すだけ。
function LoginPage() {
  const { redirect: redirectTo } = Route.useSearch();
  return <LoginForm redirectTo={redirectTo} />;
}
