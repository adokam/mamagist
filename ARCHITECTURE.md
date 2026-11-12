# Mamagist Architecture

## Folders
- `src/features/auth` - Sign up, sign in, sign out, session handling.
- `src/features/profile` - Public profile (profiles) and private profile (private_profiles).
- `src/features/pregnancy-calculator` - Due date, current week and trimester calculations.
- `src/features/daily-checklist` - Daily tasks and per-day completions.
- `src/features/ai-chat` - Ask Debby chat. Talks only to the debby-chat edge function.
- `src/features/notifications` - Push permission, subscriptions, reminder settings.
- `src/features/settings` - Language, timezone, reminders, legal links, account deletion.
- `src/features/community` - Phase 2 community. For now only the notify_list waiting list.
- `src/components` - Shared UI components; `ui/` holds base shadcn components.
- `src/components/BottomBar.tsx` - Shared bottom bar (Home, Debby, Community, Daily, Profile). Shown on pages under the `_tabs` layout route; /login and /signup have no bar.
- `src/legal` - Terms of use and privacy policy text.
- `src/config` - App-wide constants (`constants.ts`). No secrets.
- `src/integrations/supabase` - Generated Supabase client and database types. Do not edit by hand.
- `src/routes` - App pages (TanStack Router, file-based).
- `supabase/migrations` - Every database change, one SQL file per concern, applied in order.
- `supabase/functions` - Edge functions (debby-chat, send-daily-reminders). Not created yet.

## Tables (row level security is on for every table)
Every user_id / id that points to auth.users uses ON DELETE CASCADE: deleting an account deletes all her rows.
- `profiles` - Any signed-in user can read. Only the owner can insert or update.
- `private_profiles` - Only the owner can read, insert or update. Nobody else can read it. updated_at auto-updates.
- `user_roles` - Owner can read her own role. Only the service role can insert, update or delete.
- `daily_tasks` - Signed-in users can read active tasks. No app writes; edited in the Supabase dashboard.
- `task_completions` - Only the owner can read, insert and delete. One row per user, task and day.
- `chat_messages` - Owner can read. Only the service role can insert. Nobody can update or delete from the app.
- `chat_summaries` - Owner can read. Only the service role can write.
- `weekly_content` - Signed-in users can read (weeks 1 to 42). No app writes.
- `push_subscriptions` - Only the owner can read, insert and delete. Endpoint is unique.
- `notify_list` - Owner can insert and read her own rows. One row per user and topic.

Signup trigger `on_auth_user_created` (function `handle_new_user`, security definer, fixed search_path) creates a profiles, private_profiles and user_roles (role user) row for every new user.

Storage bucket `avatars`: 1 MB limit, image extensions only, users can only write inside a folder named with their own user id. Currently private (see report).

## How to continue without Lovable
1. Clone the GitHub repository and run `npm install`, then `npm run dev`.
2. Copy `.env.example` to `.env` and fill in the Supabase URL and anon (publishable) key from Supabase > Project Settings > API.
3. Apply database changes with the Supabase CLI: `supabase link --project-ref <ref>` then `supabase db push`. Add new changes as new files in `supabase/migrations`; never edit old ones.
4. Deploy edge functions with `supabase functions deploy <name>`; set secrets (e.g. the Groq key) with `supabase secrets set`.
5. Host the front end on Vercel: import the repository and add the same environment variables in Vercel.
6. `src/integrations/supabase/types.ts` can be regenerated with `supabase gen types typescript --project-id <ref>`.

## Design tokens
Defined in `src/styles.css` as CSS variables (light in `:root`, dark in `.dark`) and mapped to Tailwind tokens. Use the Tailwind classes (`bg-background`, `bg-card`, `text-foreground`, `bg-primary`, `bg-coral`, ...), never raw hex values.
- `background`: light cream #FFF8F0, dark #101A15
- `card`: light peach #FDE3D6, dark #243A2F
- `foreground` (text): light deep green #1F4D3A, dark cream #FFF8F0
- `primary` (buttons): light deep green #1F4D3A, dark peach #F8B79F
- `coral` #F28B6D: progress bars and small accents only, never text
- `shell`: plain background behind the 430px app column on big screens
- Font: Nunito (Google Fonts), falling back to system fonts. Corner radius token `--radius` is 1.25rem.
