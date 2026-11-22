/**
 * Initials avatar.
 *
 * The roster used to render `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`
 * — the query string carried every student's email address to a third-party CDN
 * on every page view, and a broken CDN meant broken faces across the dashboard.
 * Initials are rendered locally: no request, no leak, nothing to fail.
 */

const HUES = [258, 200, 160, 32, 0, 290, 220, 130];

function hash(value: string) {
  let h = 0;
  for (let i = 0; i < value.length; i++) h = (h * 31 + value.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function initials(name: string | null | undefined) {
  const clean = (name ?? "").trim();
  if (!clean) return "?";
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function InitialsAvatar({
  name,
  seed,
  className = "size-10",
  textClassName = "text-xs",
}: {
  name: string | null | undefined;
  /** stable value to pick a colour with — an id, never an email */
  seed: string;
  className?: string;
  textClassName?: string;
}) {
  const hue = HUES[hash(seed) % HUES.length];
  return (
    <span
      aria-hidden="true"
      className={`grid shrink-0 place-items-center rounded-full font-semibold text-white/90 ${className} ${textClassName}`}
      style={{ backgroundColor: `hsl(${hue} 55% 32%)` }}
    >
      {initials(name)}
    </span>
  );
}
