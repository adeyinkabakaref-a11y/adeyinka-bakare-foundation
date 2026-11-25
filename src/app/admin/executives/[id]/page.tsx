import { redirect } from "next/navigation";

// No separate detail view: the edit form is the detail page.
export default async function ExecutiveDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/admin/executives/${id}/edit`);
}
