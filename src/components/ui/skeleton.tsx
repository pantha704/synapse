import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular";
}

export function Skeleton({ className, variant = "text" }: SkeletonProps) {
  const baseClasses = "animate-pulse bg-gray-200 rounded";

  const variantClasses = {
    text: "h-4",
    circular: "rounded-full",
    rectangular: "h-full w-full",
  };

  return <div className={cn(baseClasses, variantClasses[variant], className)} />;
}

export function NodeSkeleton() {
  return (
    <div className="w-72 bg-white rounded-xl border-2 border-gray-100 p-5 animate-pulse">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-gray-200" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-3 bg-gray-100 rounded w-1/2" />
        </div>
      </div>
      <div className="mt-4">
        <div className="h-2 bg-gray-100 rounded-full w-full" />
      </div>
    </div>
  );
}

export function RankingSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-2.5 p-2.5 bg-gray-50 rounded-lg animate-pulse">
          <div className="w-6 h-6 rounded-full bg-gray-200" />
          <div className="w-7 h-7 rounded-full bg-gray-200" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 bg-gray-200 rounded w-24" />
            <div className="h-1.5 bg-gray-100 rounded w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-xl border border-gray-200 p-4 animate-pulse">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-gray-200" />
        <div className="flex-1 space-y-1.5">
          <div className="h-4 bg-gray-200 rounded w-32" />
          <div className="h-3 bg-gray-100 rounded w-20" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="text-center">
            <div className="h-6 bg-gray-200 rounded w-8 mx-auto mb-1" />
            <div className="h-2 bg-gray-100 rounded w-12 mx-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function PathSkeleton() {
  return (
    <div className="space-y-32 py-8">
      {[1, 2, 3].map((i) => (
        <div key={i} className={`flex ${i % 2 === 0 ? "justify-start ml-32" : i % 3 === 0 ? "justify-end mr-32" : "justify-center"}`}>
          <NodeSkeleton />
        </div>
      ))}
    </div>
  );
}
