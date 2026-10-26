import Link from "next/link";
import { getBeans, getShots } from "@/lib/api";
import { ShotRow } from "@/components/ShotRow";
import { formatWhen } from "@/lib/format";
import { beanLabel } from "@/lib/beans";

const TABLE_COLS =
  "grid-cols-[1.6fr_1.2fr_0.8fr_0.8fr_0.7fr_0.7fr_0.7fr]";

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ bean?: string }>;
}) {
  const { bean } = await searchParams;
  const selectedBeanId = bean ? Number(bean) : null;

  const [beans, shots] = await Promise.all([getBeans(), getShots()]);
  const beanById = new Map(beans.map((b) => [b.id, b]));
  const filtered =
    selectedBeanId !== null
      ? shots.filter((s) => s.bean_id === selectedBeanId)
      : shots;

  return (
    <div className="flex flex-col gap-4 p-5">
      <header>
        <h1 className="m-0 text-[26px] font-normal tracking-tight">
          History
        </h1>
        <div className="mt-0.5 text-[13px] text-text-muted">
          Saved shots, newest first
        </div>
      </header>

      {beans.length > 0 ? (
        <div className="flex gap-2 overflow-x-auto pb-0.5">
          <Link
            href="/history"
            className={`flex h-11 flex-none items-center gap-1.5 whitespace-nowrap rounded-full px-4 text-[13.5px] font-semibold ${
              selectedBeanId === null
                ? "bg-soft"
                : "border border-border bg-surface"
            }`}
          >
            All coffees
            <span className="font-mono text-xs font-medium">
              {shots.length}
            </span>
          </Link>
          {beans.map((b) => (
            <Link
              key={b.id}
              href={`/history?bean=${b.id}`}
              className={`flex h-11 flex-none items-center gap-1.5 whitespace-nowrap rounded-full px-4 text-[13.5px] font-semibold ${
                selectedBeanId === b.id
                  ? "bg-soft"
                  : "border border-border bg-surface"
              }`}
            >
              {beanLabel(b, beans)}
              <span className="font-mono text-xs font-medium">
                {shots.filter((s) => s.bean_id === b.id).length}
              </span>
            </Link>
          ))}
        </div>
      ) : null}

      {shots.length === 0 ? (
        <section className="flex flex-col items-start gap-2 rounded-xl bg-surface p-5">
          <div className="text-base font-semibold">No shots yet</div>
          <div className="text-[13.5px] text-text-muted">
            Saved shots show up here. Log one from Home to get started.
          </div>
        </section>
      ) : filtered.length === 0 ? (
        <section className="flex flex-col items-start gap-2 rounded-xl bg-surface p-5">
          <div className="text-base font-semibold">
            No shots for{" "}
            {(() => {
              const selectedBean = beanById.get(selectedBeanId ?? -1);
              return selectedBean ? beanLabel(selectedBean, beans) : "this coffee";
            })()}
          </div>
          <div className="text-[13.5px] text-text-muted">
            Try another coffee, or show everything.
          </div>
          <Link
            href="/history"
            className="mt-1 flex h-11 items-center rounded-full border border-border bg-surface px-4 text-sm font-semibold"
          >
            Show all coffees
          </Link>
        </section>
      ) : (
        <>
          <div className="overflow-hidden rounded-xl bg-surface md:hidden">
            {filtered.map((shot) => (
              <ShotRow
                key={shot.id}
                shot={shot}
                bean={beanById.get(shot.bean_id)}
                beans={beans}
              />
            ))}
          </div>

          <div className="hidden overflow-hidden rounded-xl bg-surface md:block">
            <div
              className={`grid ${TABLE_COLS} gap-3 bg-[#f0f3eb] px-5 py-3 text-[13px] text-text-muted`}
            >
              <span>Coffee</span>
              <span>Date &amp; time</span>
              <span className="text-right">Dose</span>
              <span className="text-right">Yield</span>
              <span className="text-right">Ratio</span>
              <span className="text-right">Time</span>
              <span className="text-right">Rating</span>
            </div>
            {filtered.map((shot) => {
              const shotBean = beanById.get(shot.bean_id);
              return (
                <div
                  key={shot.id}
                  className={`grid h-[52px] ${TABLE_COLS} items-center gap-3 border-t border-border px-5 text-sm`}
                >
                  <span className="truncate font-semibold">
                    {shotBean ? beanLabel(shotBean, beans) : "Unknown coffee"}
                  </span>
                  <span className="text-[13px] text-text-muted">
                    {formatWhen(shot.created_at)}
                  </span>
                  <span className="text-right font-mono tabular-nums">
                    {shot.dose.toFixed(1)} g
                  </span>
                  <span className="text-right font-mono tabular-nums">
                    {shot.shot_yield.toFixed(1)} g
                  </span>
                  <span className="text-right font-mono font-semibold tabular-nums">
                    1:{shot.ratio.toFixed(1)}
                  </span>
                  <span className="text-right font-mono tabular-nums">
                    {shot.duration.toFixed(1)} s
                  </span>
                  <span className="text-right font-mono tabular-nums">
                    {shot.rating}/10
                  </span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
