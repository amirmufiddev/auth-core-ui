import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export interface AuthMascotProps {
  /** Floating pill label above mascot (e.g. "Masukkan OTP" or "Terverifikasi") */
  badgeText?: string;
  /** Triggers celebratory 360-degree Y-axis spin */
  verified?: boolean;
  size?: "md" | "lg";
}

/**
 * Interactive glossy 3D orb mascot with Framer Motion shared-element (`layoutId`)
 * flight across the split login panels, continuous idle float, pointer-reactive
 * 3D perspective tilt, and dynamic Tailwind theme colors (--primary / --tertiary / --chart-6).
 */
export function AuthMascot({
  badgeText,
  verified = false,
  size = "lg",
}: AuthMascotProps) {
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      const nx = (e.clientX / window.innerWidth - 0.5) * 2; // -1..1
      const ny = (e.clientY / window.innerHeight - 0.5) * 2; // -1..1
      setTilt({
        rotateX: Number((-ny * 10).toFixed(2)),
        rotateY: Number((nx * 12).toFixed(2)),
      });
    };
    window.addEventListener("mousemove", handleMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  const dimClass = size === "md" ? "size-24" : "size-28";

  return (
    <motion.div
      layoutId="authcore-mascot"
      transition={{
        type: "spring",
        stiffness: 180,
        damping: 24,
        mass: 0.9,
      }}
      className={`relative z-40 flex items-center justify-center select-none ${dimClass}`}
      style={{ perspective: 650 }}
    >
      {/* Floating Speech Pill Badge */}
      <AnimatePresence mode="wait">
        {badgeText && (
          <motion.div
            key={badgeText}
            initial={{ opacity: 0, y: 6, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.92 }}
            transition={{ duration: 0.22 }}
            className="absolute -top-5 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-full bg-foreground px-3.5 py-1 text-xs font-semibold text-background shadow-md"
          >
            {badgeText}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ambient radial theme glow behind orb */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -inset-3 rounded-full opacity-55 blur-xl"
        style={{
          background:
            "radial-gradient(closest-side, var(--primary), var(--tertiary), transparent)",
        }}
      />

      {/* Idle vertical float + 3D tilt + celebration spin */}
      <motion.div
        animate={{
          y: [0, -6, 0],
          rotateX: tilt.rotateX,
          rotateY: verified ? 360 : tilt.rotateY,
        }}
        transition={{
          y: {
            duration: 3.4,
            repeat: Infinity,
            ease: "easeInOut",
          },
          rotateX: { type: "spring", stiffness: 160, damping: 18 },
          rotateY: verified
            ? { duration: 0.85, ease: [0.22, 1, 0.36, 1] }
            : { type: "spring", stiffness: 160, damping: 18 },
        }}
        className="relative flex h-full w-full items-center justify-center"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Glossy 3D Iridescent Orb Sphere synced to Tailwind CSS theme tokens */}
        <div
          className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-full shadow-2xl ring-1 ring-white/30"
          style={{
            background:
              "radial-gradient(circle at 28% 24%, #ffffff 0%, color-mix(in srgb, var(--tertiary) 45%, #ffffff) 26%, color-mix(in srgb, var(--primary) 78%, #ffffff) 64%, color-mix(in srgb, var(--chart-6) 82%, #0f172a) 100%)",
          }}
        >
          {/* Top-left specular glass highlight */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-2.5 left-4 h-6 w-12 -rotate-18 rounded-full bg-white/55 blur-[2px]"
          />
          {/* Bottom-right rim bounce */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute right-2 bottom-2 h-8 w-8 rounded-full opacity-60 blur-md"
            style={{ backgroundColor: "var(--tertiary)" }}
          />

          {/* Cute expressive face */}
          <div className="relative z-10 flex flex-col items-center justify-center gap-1.5 pt-1">
            <div className="flex items-center gap-4">
              {/* Left eye */}
              <motion.span
                animate={{ scaleY: [1, 1, 0.12, 1, 1] }}
                transition={{
                  duration: 4.2,
                  repeat: Infinity,
                  times: [0, 0.45, 0.48, 0.52, 1],
                }}
                className="relative flex h-4 w-3 items-start justify-end rounded-full bg-slate-950 p-0.5 shadow-inner"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-white" />
              </motion.span>
              {/* Right eye */}
              <motion.span
                animate={{ scaleY: [1, 1, 0.12, 1, 1] }}
                transition={{
                  duration: 4.2,
                  repeat: Infinity,
                  times: [0, 0.45, 0.48, 0.52, 1],
                }}
                className="relative flex h-4 w-3 items-start justify-end rounded-full bg-slate-950 p-0.5 shadow-inner"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-white" />
              </motion.span>
            </div>
            {/* Cheeks + Smile */}
            <div className="flex items-center gap-2.5">
              <span className="h-1.5 w-2.5 rounded-full bg-rose-400/55 blur-[1px]" />
              <svg
                width="16"
                height="9"
                viewBox="0 0 16 9"
                fill="none"
                aria-hidden="true"
              >
                {verified ? (
                  <path
                    d="M2.5 2.5C4.2 6.8 11.8 6.8 13.5 2.5"
                    stroke="#0f172a"
                    strokeWidth="2.1"
                    strokeLinecap="round"
                  />
                ) : (
                  <path
                    d="M3.5 2.5C5.2 5.5 10.8 5.5 12.5 2.5"
                    stroke="#0f172a"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                )}
              </svg>
              <span className="h-1.5 w-2.5 rounded-full bg-rose-400/55 blur-[1px]" />
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
