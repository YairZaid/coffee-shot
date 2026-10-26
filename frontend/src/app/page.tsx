import { getBeans, getShots } from "@/lib/api";
import { AddBeanLauncher } from "@/components/AddBeanLauncher";
import { QuickLogLauncher } from "@/components/QuickLogLauncher";
import { ShotRow } from "@/components/ShotRow";

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

  const shots = await getShots();
  const recentShots = shots.slice(0, 4);
  const beanById = new Map(beans.map((bean) => [bean.id, bean]));
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="flex flex-col gap-5 p-5">
      <header className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <div className="text-[12.5px] font-semibold text-text-muted">
            {today}
          </div>
          <h1 className="m-0 text-[28px] font-normal tracking-tight">Home</h1>
        </div>
        <QuickLogLauncher
          beans={beans}
          label="Log a shot"
          className="h-11 flex-none rounded-full bg-text px-5 text-[13.5px] font-semibold text-background"
        />
      </header>

      <section aria-labelledby="recent-h" className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <h2 id="recent-h" className="m-0 text-[15px] font-semibold">
            Recent shots
          </h2>
        </div>
        {recentShots.length > 0 ? (
          <div className="overflow-hidden rounded-xl bg-surface">
            {recentShots.map((shot) => (
              <ShotRow
                key={shot.id}
                shot={shot}
                bean={beanById.get(shot.bean_id)}
                beans={beans}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-1.5 rounded-xl bg-surface px-[18px] py-[22px]">
            <div className="text-[15px] font-semibold">No shots yet</div>
            <div className="text-[13.5px] leading-relaxed text-text-muted">
              Pull a shot, then log it here. Your saved shots will appear in
              this list.
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
