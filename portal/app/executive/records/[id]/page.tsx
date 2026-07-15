import ExecutiveRecordView from "@/components/executive/ExecutiveRecordView";

type ExecutiveRecordPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ExecutiveRecordPage({
  params,
}: ExecutiveRecordPageProps) {
  const { id } = await params;

  return (
    <main className="min-h-screen bg-[#F4F7FC] px-4 py-8 text-slate-950 sm:px-6 sm:py-12">
      <ExecutiveRecordView registrationId={id} />
    </main>
  );
}
