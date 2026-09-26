-- The security advisor flags vendor_count() as callable by signed-in users. This app has no
-- signed-in users, so only the anonymous role (the page) keeps the grant. The remaining
-- advisor warning, that anon can call a security definer function, is intentional: the
-- function exposes only the count.
revoke execute on function public.vendor_count() from authenticated;
