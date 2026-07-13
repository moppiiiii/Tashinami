import { useSuspenseQuery } from "@tanstack/react-query";

import { AuthedHeader } from "@/components/layout/authed-header";
import { Header } from "@/components/layout/header";
import { userQueryOptions } from "@/server/auth";

// 公開だが、ログイン中でも読む画面（飲み方ガイド）のヘッダー。
// ログイン中はアプリのナビを出す（出さないと、ガイドがアプリからの行き止まりになる）。
// user は route の loader で ensure しておくこと（SSR で切り替わり済みの HTML を返すため）。
export function AdaptiveHeader() {
  const { data: user } = useSuspenseQuery(userQueryOptions());
  return user ? <AuthedHeader /> : <Header />;
}
