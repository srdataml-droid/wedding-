-- Supabase grants new functions to signed-in users by default. This app has no signed-in
-- users, so only the anonymous role (the site, through its server) keeps these grants.
-- The remaining advisor warning, that anon can run security definer functions, is
-- intentional: each of these functions checks the couple's private token first.
revoke execute on function public.wedding_for_edit(text, text) from authenticated;
revoke execute on function public.update_wedding(text, text, jsonb) from authenticated;
revoke execute on function public.wedding_rsvps(text, text) from authenticated;
revoke execute on function public.delete_wedding(text, text) from authenticated;
