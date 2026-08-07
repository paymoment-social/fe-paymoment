import { notFound } from "next/navigation";
import { PayMomentShell, sections, type ShellSection } from "@/modules/shell";

export function generateStaticParams() {
  return sections.filter((section) => section !== "for-you").map((section) => ({ section }));
}

export default async function SectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  if (!sections.includes(section as ShellSection) || section === "for-you") notFound();
  return <PayMomentShell section={section as ShellSection} />;
}
