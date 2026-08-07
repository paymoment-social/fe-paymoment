import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="mx-auto grid min-h-screen max-w-7xl grid-cols-1 gap-6 px-4 py-8 lg:grid-cols-[16rem_minmax(0,42rem)] xl:grid-cols-[16rem_minmax(0,42rem)_22rem]">
      <Skeleton className="hidden h-[38rem] rounded-xl lg:block" />
      <div className="space-y-4">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-36 rounded-xl" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
      <Skeleton className="hidden h-[28rem] rounded-xl xl:block" />
    </main>
  );
}
