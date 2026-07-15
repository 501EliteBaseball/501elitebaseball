-- 501 Elite OS: administrator registration operations.
-- Enables deliberate dashboard deletion while preserving private document controls.

drop policy if exists "Admins can delete registrations" on public.registrations;
create policy "Admins can delete registrations"
on public.registrations
for delete
to authenticated
using (public.is_active_organization_member(array['admin']));

drop policy if exists "Admins can delete stored registration documents" on storage.objects;
create policy "Admins can delete stored registration documents"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'registration-documents'
  and public.is_active_organization_member(array['admin'])
  and public.can_view_registration_documents()
);

grant delete on public.registrations to authenticated;
