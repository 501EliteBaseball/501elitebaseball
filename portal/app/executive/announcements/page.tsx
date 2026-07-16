import AnnouncementManager from "@/components/announcements/AnnouncementManager";

export const dynamic = "force-dynamic";

export default function ExecutiveAnnouncementsPage() {
  return (
    <main className="min-h-screen bg-[#F4F7FC] px-4 py-8 text-slate-950 sm:px-6 sm:py-12">
      <AnnouncementManager />
    </main>
  );
}
