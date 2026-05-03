interface ImageSlotProps {
  label: string;
  filename: string;
  className?: string;
  objectPosition?: string;
}

export default function ImageSlot({
  label,
  filename,
  className = "",
  objectPosition = "center",
}: ImageSlotProps) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/images/${filename}`}
        alt={label}
        className="absolute inset-0 w-full h-full object-cover"
        style={{ objectPosition }}
      />
    </div>
  );
}
