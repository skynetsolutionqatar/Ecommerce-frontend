"use client";

interface StarRatingInputProps {
  value: number;
  onChange: (rating: number) => void;
  size?: number;
  disabled?: boolean;
}

export default function StarRatingInput({
  value,
  onChange,
  size = 28,
  disabled = false,
}: StarRatingInputProps) {
  return (
    <div className="flex items-center gap-1" role="group" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={disabled}
          aria-label={`${star} star${star > 1 ? "s" : ""}`}
          onClick={() => onChange(star)}
          className="cursor-pointer border-0 bg-transparent p-0.5 transition-transform hover:scale-110 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill={star <= value ? "#F59E0B" : "none"}
            stroke={star <= value ? "#F59E0B" : "#D1D5DB"}
            strokeWidth="1.5"
          >
            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
          </svg>
        </button>
      ))}
    </div>
  );
}
