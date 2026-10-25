import { getBeans } from "@/lib/api";
import { AddBeanLauncher } from "@/components/AddBeanLauncher";

export default async function Home() {
  const beans = await getBeans();

  if (beans.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-5">
        <section className="flex max-w-[520px] flex-col items-start gap-3 rounded-xl bg-surface p-7">
          <h2 className="m-0 text-xl font-medium">Add your first coffee</h2>
          <p className="m-0 text-sm leading-relaxed text-text-muted">
            Log the beans you&apos;re pulling shots with, then start recording
            shots against them.
          </p>
          <AddBeanLauncher
            label="Add coffee"
            className="h-[52px] rounded-full bg-text px-5 text-sm font-semibold text-background"
          />
        </section>
      </div>
    );
  }

  return (
    <div className="p-5">
      <h1 className="text-2xl font-semibold">Home</h1>
      <p className="text-text-muted">
        {beans.length} coffee{beans.length === 1 ? "" : "s"} logged.
      </p>
    </div>
  );
}
