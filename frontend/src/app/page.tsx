import { getBeans, getShots } from "@/lib/api";
import { AddBeanLauncher } from "@/components/AddBeanLauncher";
import { HomeActions } from "@/components/HomeActions";
import { ShotRow } from "@/components/ShotRow";
import { formatShortDate, formatLongDate } from "@/lib/format";

function HomeBlobs() {
  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-[100px] -right-[120px] h-[300px] w-[340px] opacity-80"
        style={{
          background: "#A9C977",
          borderRadius: "58% 42% 63% 37% / 45% 58% 42% 55%",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-[300px] -left-[90px] h-[190px] w-[200px] opacity-55"
        style={{
          background: "#F6B39E",
          borderRadius: "41% 59% 38% 62% / 55% 40% 60% 45%",
        }}
      />
    </>
  );
}

export default async function Home() {
  const beans = await getBeans();

  if (beans.length === 0) {
    return (
      <div className="relative flex flex-1 items-center justify-center overflow-hidden p-5">
        <HomeBlobs />
        <section className="relative flex max-w-[520px] flex-col items-start gap-3 rounded-xl bg-surface p-7">
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
  const now = new Date();

  return (
    <div className="relative flex-1 overflow-hidden">
      <HomeBlobs />
      <div className="relative flex flex-col gap-5 p-5">
        <header className="flex items-center justify-between gap-3 md:hidden">
          <span className="text-[15px] font-semibold">
            Coffee Shot Intelligence
          </span>
          <span className="whitespace-nowrap text-xs font-semibold text-text-muted">
            {formatShortDate(now)}
          </span>
        </header>
        <header className="hidden flex-col gap-0.5 md:flex">
          <div className="text-[12.5px] font-semibold text-text-muted">
            {formatLongDate(now)}
          </div>
          <h1 className="m-0 text-[28px] font-normal tracking-tight">Home</h1>
        </header>

        <HomeActions beans={beans} shots={shots} />

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
    </div>
  );
}
