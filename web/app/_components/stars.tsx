import type { Rating } from "@/lib/data";

export function Stars({ value }: { value: number }) {
  const full = Math.round(value);
  return (
    <span className="text-wine" aria-label={`${value.toFixed(1)} out of 5`}>
      {"★".repeat(full)}
      <span className="text-line">{"★".repeat(5 - full)}</span>
    </span>
  );
}

export function RatingLine({ rating }: { rating?: Rating }) {
  if (!rating || rating.count === 0) {
    return <span className="text-sm text-muted">No reviews yet</span>;
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-ink">
      <Stars value={rating.average} />
      <span className="font-medium">{rating.average.toFixed(1)}</span>
      <span className="text-muted">
        ({rating.count} {rating.count === 1 ? "review" : "reviews"})
      </span>
    </span>
  );
}
