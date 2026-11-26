# community
The community is PAUSED for now: /community shows the Notify me waiting
list, and the groups list, group pages and Create post page show it too.
Everything is kept behind the flag in `communityEnabled.ts` — set
`COMMUNITY_ENABLED` to `true` there to bring the feed back.

Phase 2 community for pregnant women. The foundation is the migration
`20261126090000`: groups, group members, posts, likes, comments, reports,
and the `community-images` photo bucket, all with row level security.

- The big feed at /community shows posts with no group, newest first.
- A post can be text only, photo only, or both. Everybody signed in can
  post, like and comment. A mother can only delete her own post.
- Groups live under /community/groups. The creator is the admin and can
  remove people from her group.
- Names in the feed come from the public `profiles.display_name` (first
  name only). Full names stay in `private_profiles`, which only the owner
  can read. When a mother posts for the first time, her first name is saved
  to her public profile so other mothers can see it.
- Stories, Share, Search and a Facebook-style profile page are deliberately
  not in this batch.
