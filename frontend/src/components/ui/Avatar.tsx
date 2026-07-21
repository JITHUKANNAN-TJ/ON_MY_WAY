interface AvatarProps {
  name: string;
  size?: "sm" | "md" | "lg";
}

const sizes = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-14 h-14 text-lg",
};

const colors = [
  "from-emerald-400 to-emerald-600",
  "from-sky-400 to-blue-600",
  "from-violet-400 to-purple-600",
  "from-rose-400 to-pink-600",
  "from-amber-400 to-orange-600",
  "from-cyan-400 to-teal-600",
  "from-fuchsia-400 to-pink-600",
  "from-lime-400 to-green-600",
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
  const gradient = colors[hashColor(name)];

  return (
    <div
      className={`${sizes[size]} bg-gradient-to-br ${gradient} rounded-full flex items-center justify-center font-bold text-white shrink-0 shadow-lg`}
    >
      {initial}
    </div>
  );
}
