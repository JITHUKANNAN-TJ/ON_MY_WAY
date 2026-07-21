interface AvatarProps {
  name: string;
  size?: "sm" | "md" | "lg";
}

const sizes = { sm: "w-8 h-8 text-xs", md: "w-10 h-10 text-sm", lg: "w-14 h-14 text-lg" };

const colors = [
  "bg-primary/20 text-primary",
  "bg-secondary/20 text-secondary",
  "bg-warning/20 text-warning",
  "bg-[#8B5CF6]/20 text-[#8B5CF6]",
  "bg-[#EC4899]/20 text-[#EC4899]",
  "bg-[#F97316]/20 text-[#F97316]",
];

function hashColor(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % colors.length;
}

export function Avatar({ name, size = "md" }: AvatarProps) {
  const initial = name.charAt(0).toUpperCase();
  const color = colors[hashColor(name)];

  return (
    <div
      className={`${sizes[size]} ${color} rounded-full flex items-center justify-center font-semibold shrink-0`}
    >
      {initial}
    </div>
  );
}
