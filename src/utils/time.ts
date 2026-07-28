/**
 * Formats duration seconds into readable time (M:SS).
 */
export function formatDuration(secs?: number): string {
  if (secs === undefined || secs === null || isNaN(secs) || secs <= 0) {
    return '0:00';
  }
  const mins = Math.floor(secs / 60);
  const remainingSecs = Math.floor(secs % 60);
  return `${mins}:${remainingSecs.toString().padStart(2, '0')}`;
}
