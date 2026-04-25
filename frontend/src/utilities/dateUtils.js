export const formatDate = (date, locale = 'en-IN') =>
  new Date(date).toLocaleDateString(locale);

export const formatTime = (date) =>
  new Date(date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

export const formatDateTime = (date) =>
  `${formatDate(date)} ${formatTime(date)}`;

export const isToday = (date) =>
  new Date(date).toDateString() === new Date().toDateString();

// Converts a JS Date to "YYYY-MM-DDTHH:MM" for datetime-local inputs (local time, not UTC)
export const toDatetimeLocalString = (date) => {
  const d = new Date(date);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
