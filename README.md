# Mamagist

This is the start of a new project. Read all of it first. Then build only Step 1, listed at the bottom.



ABOUT THE APP

I am building Mamagist. It is a pregnancy companion app for Nigerian women. It covers week 1 of pregnancy through birth and breastfeeding. It is a PWA, so women install it on their phones. The main feature is an AI assistant called Debby, shown as "Ask Debby". A community for pregnant women comes in Phase 2. Pregnancy data is private health data. Treat privacy as the top rule.



STACK

React front end built in Lovable. Supabase for login, database, storage, edge functions, and cron jobs. Groq API for Debby, called only from a Supabase edge function. Code lives on GitHub from day one. I host on Vercel first. The code must stay portable so another developer or AI can continue without Lovable.



RULES FOR THE WHOLE PROJECT

1. Build one feature at a time. Only do what I ask in each prompt.

2. Never rebuild or restyle things that already work.

3. My credits are limited, so keep changes small.

4. Copy my design screenshots exactly when we reach the screens.

5. Keep secrets in environment variables only.

6. Update ARCHITECTURE.md after every feature.

7. Every database change goes in supabase/migrations. Every table needs row level security.



SAVE THESE NOTES

Save the "About the app", "Stack", and "Rules" sections above in docs/PROJECT_NOTES.md. Also save them in Project Knowledge if you can.



STEP 1: BACKEND AND FOLDERS ONLY

Do not build any screens, forms, bottom bar, or styling. Leave the front end as it is. The screenshots are attached only so you know the app. We use them in a later step.



If Supabase or GitHub is not connected yet, stop and tell me exactly where to click. Then wait.



1. Folders

Create these folders. Put a short README.md in each that says what belongs there:

src/features/auth

src/features/profile

src/features/pregnancy-calculator

src/features/daily-checklist

src/features/ai-chat

src/features/notifications

src/features/settings

src/features/community

src/components

src/legal

src/config

supabase/functions

supabase/migrations



2. Config file

Create src/config/constants.ts with these named values and no logic: DAILY_MESSAGE_CAP, GROQ_MODEL_NAME, MAX_PREGNANCY_WEEKS (44), PREGNANCY_DAYS (280). Add a clear TODO on the first two.



3. Environment

Create .env.example with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY. No real keys in code.



4. Database

Write every change as a file in supabase/migrations. Use one file per concern. Turn on row level security on every table.



Tables:



profiles: id (uuid, references auth.users, primary key), username, avatar_url, bio, created_at. Any signed-in user can read. Only the owner can insert or update.



private_profiles: id (uuid, references auth.users, primary key), full_name, terms_accepted_at, privacy_accepted_at, last_period_date, due_date, stage (pregnant, new_mother, breastfeeding), first_baby (boolean), state, baby_birth_date, timezone (default Africa/Lagos), language, reminders_enabled (boolean), reminder_time, created_at, updated_at. Only the owner can read, insert, or update. Nobody else can read it.



user_roles: user_id, role (user, moderator, admin). Default role is user. Users can read their own role. Users can never insert, update, or delete it. Only the service role can change roles.



daily_tasks: id, title, stage, trimester (nullable), min_week (nullable), max_week (nullable), sort_order, is_active, created_at. Any signed-in user can read active tasks. Users cannot write. I will edit this table in the Supabase dashboard.



task_completions: id, user_id, task_id, completed_on (date), created_at. Unique on user_id, task_id, completed_on. Only the owner can read, insert, and delete.



chat_messages: id, user_id, role (user or assistant), content, safety_triggered (boolean, default false), created_at. Owner can read. Only the service role can insert. Users cannot update or delete.



chat_summaries: user_id (primary key), summary, updated_at. Owner can read. Only the service role can write.



weekly_content: id, week (1 to 42), title, body, tip, source_name, source_url, reviewed_by, reviewed_at, created_at. Any signed-in user can read. Users cannot write.



push_subscriptions: id, user_id, endpoint, p256dh, auth, created_at. Unique on endpoint. Only the owner can read, insert, and delete.



notify_list: id, user_id, topic (default community), created_at. Unique on user_id, topic. Owner can insert and read their own rows.



Add indexes on every user_id column, on task_completions (user_id, completed_on), and on chat_messages (user_id, created_at).



Add a trigger that runs when a new user signs up. It creates a row in profiles, a row in private_profiles, and a row in user_roles with role user. Use a security definer function with a fixed search_path.



5. Storage

Create a bucket called avatars. Anyone can read. A user can only upload, update, or delete files inside a folder named with her own user id. Limit file size to 1 MB. Allow only image types.



6. Edge function folders

Create supabase/functions/debby-chat and supabase/functions/send-daily-reminders. Put only a README.md in each that says what the function will do. Write no code in them yet.



7. ARCHITECTURE.md

Create it at the project root. Explain each folder in one or two lines. Add a table list with one line per table and its access rule. Add a section called "How to continue without Lovable". Add a section called "Design tokens" and leave it as "Added in the next step."



WHEN DONE

Reply with a short checklist of what you built. Then list every table and confirm row level security is on for each one. Do not add anything extra.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/5e9f0d88-94ad-42d5-a049-116ca86926eb).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
