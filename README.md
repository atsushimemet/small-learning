
# ちいさな学び

This is a code bundle for ちいさな学び. The original project is available at https://www.figma.com/design/HWduIiS4ApeVrYbCh7fFKg/%E3%81%A1%E3%81%84%E3%81%95%E3%81%AA%E5%AD%A6%E3%81%B3.

## URL
- https://small-learning.com/

## Running the code

Run `npm i` to install the dependencies.

## Clerk authentication setup

1. Copy `.env.local.example` to `.env.local` and replace the placeholder value with your Clerk publishable key.
2. Create a Clerk application via the dashboard and note the publishable key shown in the **API Keys** section.
3. Run `npm run dev` to start the development server. The app now requires authentication, so you will be redirected to Clerk's sign-in flow before seeing any page content.

## Supabase setup

1. Create a Supabase project and note the Project URL と publishable key (Settings → API)。
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
5. `.env.local` に `VITE_SUPABASE_URL` と `VITE_SUPABASE_PUBLISHABLE_KEY` を追記して値を設定。

## Account deletion API (Clerk / Supabase cleanup)

アカウント削除では Supabase のログ／タグ／トリガーデータを消したあと、Clerk の管理 API（Secret Key が必要）からユーザーを削除します。ローカルでテストする際は、Vercel Functions をローカル起動して API を受け付ける必要があります。

1. [Vercel CLI](https://vercel.com/docs/cli) をインストールし、プロジェクトディレクトリで `vercel login` を実行。
2. 別ターミナルで `npm run dev:api` を実行すると、`http://localhost:3000/api/delete-account` に同じロジックの API が立ち上がります。
3. `.env.local` に以下の変数を追加して、フロントからローカル API を呼ぶようにします（`CLERK_SECRET_KEY` と `SUPABASE_SECRET_KEY` はサーバー側でのみ使用されます）。
 ```env
 CLERK_SECRET_KEY=sk_...
 VITE_DELETE_ACCOUNT_ENDPOINT=http://localhost:3000/api/delete-account
 CORS_ALLOW_ORIGIN=http://localhost:5173
 SUPABASE_SECRET_KEY=sb_secret_...
 ```
4. もう一つのターミナルで `npm run dev` を起動し、`/delete` ページで削除をテストします。

本番（Vercel デプロイ）では `VITE_DELETE_ACCOUNT_ENDPOINT` を未設定にしておけば自動で `/api/delete-account` が呼ばれます。`CORS_ALLOW_ORIGIN` には本番ドメイン（例：`https://app.example.com`）を設定してください。

# 1st PRD
https://chatgpt.com/share/69a299ea-b634-800e-9dc3-601f923990d1
