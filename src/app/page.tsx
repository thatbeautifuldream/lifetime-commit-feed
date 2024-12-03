import { CommitFeed } from "@/components/commit-feed";

export default function Page() {
  return (
    <main className="min-h-screen">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="shadow-sm">
        <CommitFeed />
      </div>
    </div>
  </main>
  );
}
