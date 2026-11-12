# Mamagist — Project Notes

## About the app
I am building Mamagist. It is a pregnancy companion app for Nigerian women. It covers week 1 of pregnancy through birth and breastfeeding. It is a PWA, so women install it on their phones. The main feature is an AI assistant called Debby, shown as "Ask Debby". A community for pregnant women comes in Phase 2. Pregnancy data is private health data. Treat privacy as the top rule.

## Stack
React front end built in Lovable. Supabase for login, database, storage, edge functions, and cron jobs. Groq API for Debby, called only from a Supabase edge function. Code lives on GitHub from day one. I host on Vercel first. The code must stay portable so another developer or AI can continue without Lovable.

## Rules for the whole project
1. Build one feature at a time. Only do what I ask in each prompt.
2. Never rebuild or restyle things that already work.
3. My credits are limited, so keep changes small.
4. Copy my design screenshots exactly when we reach the screens.
5. Keep secrets in environment variables only.
6. Update ARCHITECTURE.md after every feature.
7. Every database change goes in supabase/migrations. Every table needs row level security.
