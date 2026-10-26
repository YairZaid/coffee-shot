import Link from "next/link";
import { getBeans, getBeanStats } from "@/lib/api";
import { beanLabel } from "@/lib/beans";
import { AddBeanLauncher } from "@/components/AddBeanLauncher";
import { QuickLogLauncher } from "@/components/QuickLogLauncher";

export default async function InsightsPage({
  searchParams,
}: {
  searchParams: Promise<{ bean?: string }>;
}) {
  const beans = await getBeans();

  if (beans.length === 0) {
    return (
      <div className="flex flex-col gap-4 p-5">
        <header>
          <h1 className="m-0 text-[26px] font-normal tracking-tight">
            Insights
          </h1>
          <div className="mt-0.5 text-[13px] text-text-muted">
            Averages from saved shots of one coffee
          </div>
        </header>
        <section className="flex flex-col items-start gap-2 rounded-xl bg-surface p-5">
          <div className="text-base font-semibold">Nothing to analyse yet</div>
          <div className="text-[13.5px] text-text-muted">
            Add a coffee and save a few shots to see averages.
          </div>
          <AddBeanLauncher
            label="Add coffee"
            className="mt-1 h-[46px] rounded-full bg-text px-5 text-sm font-semibold text-background"
          />
        </section>
      </div>
    );
  }

  const { bean } = await searchParams;
  const requestedId = bean ? Number(bean) : null;
  const selectedBean =
    beans.find((b) => b.id === requestedId) ?? beans[0];

  const stats = await getBeanStats(selectedBean.id);

  return (
    <div className="flex flex-col gap-4 p-5">
      <header>
        <h1 className="m-0 text-[26px] font-normal tracking-tight">
          Insights
        </h1>
        <div className="mt-0.5 text-[13px] text-text-muted">
          Averages from saved shots of one coffee
        </div>
      </header>

      <div className="flex flex-wrap gap-2">
        {beans.map((b) => (
          <Link
            key={b.id}
            href={`/insights?bean=${b.id}`}
            className={`flex h-11 items-center whitespace-nowrap rounded-full px-4 text-[13.5px] font-semibold ${
              b.id === selectedBean.id
                ? "bg-soft"
                : "border border-border bg-surface"
            }`}
          >
            {beanLabel(b, beans)}
          </Link>
        ))}
      </div>

      <section className="max-w-[640px] overflow-hidden rounded-xl bg-surface">
        <div className="bg-[#f0f3eb] px-[18px] py-4">
          <div className="text-[13px] text-text-muted">Showing data for</div>
          <div className="mt-1 text-[19px] font-semibold">
            {beanLabel(selectedBean, beans)}
          </div>
          <div className="mt-0.5 text-[13px] text-text-muted">
            {selectedBean.roaster} &middot; {selectedBean.origin}
          </div>
        </div>

        {stats.shot_count > 0 ? (
          <>
            <div className="flex items-baseline justify-between border-t border-border px-[18px] py-4">
              <span className="text-sm font-semibold">Shots</span>
              <span className="font-mono text-2xl font-light">
                {stats.shot_count}
              </span>
            </div>
            <div className="flex items-baseline justify-between border-t border-border px-[18px] py-4">
              <span className="text-sm font-semibold">Average rating</span>
              <span className="font-mono text-2xl font-light">
                {stats.avg_rating?.toFixed(1)}
                <span className="text-sm font-medium text-text-muted"> / 10</span>
              </span>
            </div>
            <div className="flex items-baseline justify-between border-t border-border px-[18px] py-4">
              <span className="text-sm font-semibold">Average brew ratio</span>
              <span className="font-mono text-2xl font-light">
                1:{stats.avg_ratio?.toFixed(1)}
              </span>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-start gap-2 border-t border-border px-[18px] py-[22px]">
            <div className="text-[15.5px] font-semibold">
              No saved shots for this coffee yet
            </div>
            <div className="text-[13.5px] leading-relaxed text-text-muted">
              Averages appear after your first saved shot.
            </div>
            <QuickLogLauncher
              beans={beans}
              label="Quick log this coffee"
              className="mt-1 h-[46px] rounded-full bg-text px-5 text-sm font-semibold text-background"
            />
          </div>
        )}
      </section>
    </div>
  );
}
