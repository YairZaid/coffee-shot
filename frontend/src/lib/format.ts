const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const MONTHS_LONG = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const WEEKDAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const WEEKDAYS_LONG = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
];

export function formatShortDate(d: Date = new Date()): string {
  return `${WEEKDAYS_SHORT[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

export function formatLongDate(d: Date = new Date()): string {
  return `${WEEKDAYS_LONG[d.getDay()]}, ${d.getDate()} ${MONTHS_LONG[d.getMonth()]}`;
}

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
