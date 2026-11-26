// Short time-ago labels for community posts, like Facebook's "2h" and "3d".
// Pure function, no screen code.
export function timeAgo(isoDate: string, nowMs: number = Date.now()): string {
  const posted = new Date(isoDate).getTime();
  if (Number.isNaN(posted)) return "";
  const diffMs = Math.max(0, nowMs - posted);
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo`;
  return `${Math.floor(days / 365)}y`;
}
