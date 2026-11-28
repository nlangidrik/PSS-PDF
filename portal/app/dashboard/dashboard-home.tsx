export default function DashboardHome({
  editorUrl,
  name,
  email,
}: {
  editorUrl: string;
  name: string;
  email: string;
}) {
  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-[#003366] dark:text-white">BytePaper</h1>
        <p className="mt-2 text-muted-foreground">
          {name} · {email}
        </p>
      </div>
      <a
        href={editorUrl}
        className="inline-flex h-14 items-center justify-center rounded-lg bg-[#003366] px-8 text-lg font-semibold text-white hover:bg-[#004080]"
      >
        Open PDF Editor
      </a>
    </div>
  );
}
