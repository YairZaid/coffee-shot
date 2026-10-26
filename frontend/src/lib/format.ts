const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export function formatWhen(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const time = `${pad(d.getHours())}:${pad(d.getMinutes())}`;

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  let day: string;
  if (d.toDateString() === now.toDateString()) {
    day = "Today";
  } else if (d.toDateString() === yesterday.toDateString()) {
    day = "Yesterday";
  } else {
    day = `${MONTHS[d.getMonth()]} ${d.getDate()}`;
  }
  return `${day} · ${time}`;
}
