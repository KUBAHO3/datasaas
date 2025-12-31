export default function ProfileLoading() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="h-9 w-48 bg-muted animate-pulse rounded-lg mb-2" />
        <div className="h-5 w-96 bg-muted animate-pulse rounded-lg" />
      </div>

      <div className="space-y-6">
        <div className="h-32 bg-muted animate-pulse rounded-lg" />
        <div className="h-20 bg-muted animate-pulse rounded-lg" />
        <div className="h-20 bg-muted animate-pulse rounded-lg" />
        <div className="h-20 bg-muted animate-pulse rounded-lg" />
      </div>
    </div>
  );
}
