
  # ちいさな学び

  This is a code bundle for ちいさな学び. The original project is available at https://www.figma.com/design/HWduIiS4ApeVrYbCh7fFKg/%E3%81%A1%E3%81%84%E3%81%95%E3%81%AA%E5%AD%A6%E3%81%B3.

  ## Running the code

Run `npm i` to install the dependencies.

## Clerk authentication setup

1. Copy `.env.local.example` to `.env.local` and replace the placeholder value with your Clerk publishable key.
2. Create a Clerk application via the dashboard and note the publishable key shown in the **API Keys** section.
3. Run `npm run dev` to start the development server. The app now requires authentication, so you will be redirected to Clerk's sign-in flow before seeing any page content.

## Supabase setup

1. Create a Supabase project and note the Project URLと `anon` API key (Settings → API)。
2. SQL editorで以下のDDLとRLSポリシーを実行し、`learning_logs` テーブルを作成:
   ```sql
   create table if not exists public.learning_logs (
     id uuid primary key default uuid_generate_v4(),
     user_id text not null,
     log_date date not null,
     content text not null,
     summary text,
     tags text[] default '{}',
     created_at timestamptz not null default now()
   );

   alter table public.learning_logs enable row level security;

   create policy "Users can manage own logs" on public.learning_logs
     for all using ((auth.jwt()->>'sub') = user_id)
     with check ((auth.jwt()->>'sub') = user_id);
   ```
3. ユーザーごとのカスタムタグを保存する `learning_tags` テーブルを追加:
   ```sql
   create table if not exists public.learning_tags (
     id uuid primary key default uuid_generate_v4(),
     user_id text not null,
     name text not null,
     created_at timestamptz not null default now(),
     unique(user_id, name)
   );

   alter table public.learning_tags enable row level security;

   create policy "Users can manage own tags" on public.learning_tags
     for all using ((auth.jwt()->>'sub') = user_id)
     with check ((auth.jwt()->>'sub') = user_id);
   ```
4. Clerkダッシュボードの **JWT Templates** で Supabase 向けテンプレートを作成し、`aud` を `supabase` に設定。
5. `.env.local` に `VITE_SUPABASE_URL` と `VITE_SUPABASE_ANON_KEY` を追記して値を設定。

# 1st PRD
https://chatgpt.com/share/69a299ea-b634-800e-9dc3-601f923990d1
