/** Small Mamagist logo mark and warm line for the login and signup screens. */
export function AuthLogoMark() {
  return (
    <div
      aria-hidden
      className="grid h-14 w-14 place-items-center rounded-[16px] bg-primary text-primary-foreground"
    >
      <svg width="32" height="32" viewBox="0 0 512 512" fill="currentColor">
        <path d="M256 400 C 200 340 130 280 130 205 C 130 155 170 125 210 125 C 235 125 252 140 256 155 C 260 140 277 125 302 125 C 342 125 382 155 382 205 C 382 280 312 340 256 400 Z" />
      </svg>
    </div>
  );
}

/** One short warm line under the title on the login and signup screens. */
export function AuthWarmLine() {
  return (
    <p className="mt-2 text-base leading-relaxed text-foreground">
      Your pregnancy guide, week by week.
    </p>
  );
}
