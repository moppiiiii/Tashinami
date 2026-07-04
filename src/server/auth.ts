import type { User } from "@supabase/supabase-js";
import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { CredentialsSchema } from "@/schemas/auth";

// 認証は型安全クエリエンジン（appSchema）を通さず、素のクライアント（auth）で扱う。
// データアクセス用の $supabaseServer（getSession でセッション水和）は挟まず、素の
// クライアントに対して auth メソッドを 1 回だけ呼ぶ（認証操作を二重に走らせない）。
// 1 リソースと同じく fetch / mutation（どちらも serverFn）を 1 ファイルにまとめる。

/**
 * 現在のユーザーを取得する。
 * `getUser()` は Cookie のトークンを認証サーバーで検証するため、`getSession()` より安全。
 * 未ログインなら null。
 */
export const getUser = createServerFn().handler(
  async (): Promise<User | null> => {
    const $supabase = createSupabaseServerClient();
    const {
      data: { user },
    } = await $supabase.auth.getUser();
    return user ?? null;
  },
);

export const userQueryOptions = () =>
  queryOptions({
    queryKey: ["auth", "user"],
    queryFn: () => getUser(),
  });

export const signIn = createServerFn({ method: "POST" })
  .validator(CredentialsSchema)
  .handler(async ({ data }): Promise<User> => {
    const $supabase = createSupabaseServerClient();
    const { data: result, error } = await $supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });
    if (error) throw error;
    return result.user;
  });

export const signOut = createServerFn({ method: "POST" }).handler(async () => {
  const $supabase = createSupabaseServerClient();
  const { error } = await $supabase.auth.signOut();
  if (error) throw error;
});
