import { useEffect, useId, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export interface AuthMascotProps {
  /** Floating pill label above mascot (e.g. "Masukkan OTP" or "Terverifikasi") */
  badgeText?: string;
  /** Triggers celebratory 360-degree Y-axis spin */
  verified?: boolean;
  size?: "md" | "lg";
}

/**
 * Interactive glossy 3D Shield Mascot with Framer Motion shared-element (`layoutId`)
 * flight across the split login panels, continuous idle float, pointer-reactive
 * 3D perspective tilt, and dynamic Tailwind theme colors (--primary / --tertiary / --chart-6).
 */
export function AuthMascot({
  badgeText,
  verified = false,
  size = "lg",
}: AuthMascotProps) {
  const uid = useId().replace(/:/g, "");
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

  const dimClass = size === "md" ? "h-26 w-24" : "h-30 w-28";

  const bodyGradId = `shield-body-${uid}`;
  const rimGradId = `shield-rim-${uid}`;
  const glossGradId = `shield-gloss-${uid}`;
  const bounceGradId = `shield-bounce-${uid}`;
  const shadowFilterId = `shield-shadow-${uid}`;

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
            className="absolute -top-6 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-full bg-foreground px-3.5 py-1 text-xs font-semibold text-background shadow-md"
          >
            {badgeText}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ambient radial theme glow behind shield */}
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
        <svg
          viewBox="0 0 120 132"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-full w-full overflow-visible drop-shadow-[0_14px_24px_rgba(15,23,42,0.35)]"
          aria-label="AuthCore Shield Mascot"
        >
          <defs>
            {/* Main glossy 3D shield fill synced to active Tailwind tokens */}
            <radialGradient
              id={bodyGradId}
              cx="32%"
              cy="22%"
              r="82%"
              fx="28%"
              fy="18%"
            >
              <stop offset="0%" stopColor="#ffffff" />
              <stop
                offset="24%"
                stopColor="color-mix(in srgb, var(--tertiary) 42%, #ffffff)"
              />
              <stop
                offset="64%"
                stopColor="color-mix(in srgb, var(--primary) 78%, #ffffff)"
              />
              <stop
                offset="100%"
                stopColor="color-mix(in srgb, var(--chart-6) 78%, #0f172a)"
              />
            </radialGradient>

            {/* Crisp specular bevel edge */}
            <linearGradient id={rimGradId} x1="18" y1="8" x2="104" y2="122" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.92" />
              <stop offset="45%" stopColor="#ffffff" stopOpacity="0.32" />
              <stop offset="100%" stopColor="var(--tertiary)" stopOpacity="0.65" />
            </linearGradient>

            {/* Top-left curved glass highlight */}
            <linearGradient id={glossGradId} x1="20" y1="16" x2="62" y2="62" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.72" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>

            {/* Bottom-right ambient bounce */}
            <radialGradient id={bounceGradId} cx="78%" cy="78%" r="42%">
              <stop offset="0%" stopColor="var(--tertiary)" stopOpacity="0.55" />
              <stop offset="100%" stopColor="var(--tertiary)" stopOpacity="0" />
            </radialGradient>

            <filter id={shadowFilterId} x="-15%" y="-15%" width="130%" height="130%">
              <feGaussianBlur stdDeviation="2.5" />
            </filter>
          </defs>

          {/* Outer Shield Silhouette */}
          <path
            d="M60 6C62.8 6 88.5 16.2 103.2 21.4C106.8 22.7 109.2 26.1 109.2 30V63.5C109.2 92.6 86.4 114.2 63.5 124.8C61.3 125.8 58.7 125.8 56.5 124.8C33.6 114.2 10.8 92.6 10.8 63.5V30C10.8 26.1 13.2 22.7 16.8 21.4C31.5 16.2 57.2 6 60 6Z"
            fill={`url(#${bodyGradId})`}
            stroke={`url(#${rimGradId})`}
            strokeWidth="2.5"
          />

          {/* Subtle center ridge (echoes AuthCore split shield identity) */}
          <path
            d="M60 12V119"
            stroke="#ffffff"
            strokeOpacity="0.14"
            strokeWidth="1.5"
            strokeLinecap="round"
          />

          {/* Bottom-right bounce light */}
          <path
            d="M60 6C62.8 6 88.5 16.2 103.2 21.4C106.8 22.7 109.2 26.1 109.2 30V63.5C109.2 92.6 86.4 114.2 63.5 124.8C61.3 125.8 58.7 125.8 56.5 124.8C33.6 114.2 10.8 92.6 10.8 63.5V30C10.8 26.1 13.2 22.7 16.8 21.4C31.5 16.2 57.2 6 60 6Z"
            fill={`url(#${bounceGradId})`}
          />

          {/* Top-left glossy reflection */}
          <path
            d="M21 31.5C21 28.8 22.8 26.4 25.3 25.4C35.8 21.3 48.5 16.4 55.8 13.8C58.2 12.9 60.4 15.2 59.3 17.5C52.6 31.5 39.2 43.2 24.4 48.2C22.4 48.9 21 47.4 21 45.3V31.5Z"
            fill={`url(#${glossGradId})`}
          />

          {/* Cute expressive face centered on shield */}
          <g transform="translate(0, 4)">
            {/* Left Eye */}
            <motion.g
              style={{ transformOrigin: "44px 61px" }}
              animate={{ scaleY: [1, 1, 0.12, 1, 1] }}
              transition={{
                duration: 4.2,
                repeat: Infinity,
                times: [0, 0.45, 0.48, 0.52, 1],
              }}
            >
              <rect x="38" y="52" width="12" height="17" rx="6" fill="#0f172a" />
              <circle cx="46.2" cy="56.8" r="2.6" fill="#ffffff" />
              <circle cx="42.2" cy="63.5" r="1.1" fill="#ffffff" fillOpacity="0.65" />
            </motion.g>

            {/* Right Eye */}
            <motion.g
              style={{ transformOrigin: "76px 61px" }}
              animate={{ scaleY: [1, 1, 0.12, 1, 1] }}
              transition={{
                duration: 4.2,
                repeat: Infinity,
                times: [0, 0.45, 0.48, 0.52, 1],
              }}
            >
              <rect x="70" y="52" width="12" height="17" rx="6" fill="#0f172a" />
              <circle cx="78.2" cy="56.8" r="2.6" fill="#ffffff" />
              <circle cx="74.2" cy="63.5" r="1.1" fill="#ffffff" fillOpacity="0.65" />
            </motion.g>

            {/* Soft Rosy Cheeks */}
            <ellipse
              cx="33"
              cy="73.5"
              rx="6"
              ry="3.2"
              fill="#fb7185"
              fillOpacity="0.52"
              filter={`url(#${shadowFilterId})`}
            />
            <ellipse
              cx="87"
              cy="73.5"
              rx="6"
              ry="3.2"
              fill="#fb7185"
              fillOpacity="0.52"
              filter={`url(#${shadowFilterId})`}
            />

            {/* Expressive Smile */}
            {verified ? (
              <path
                d="M50 72.5C53 79.5 67 79.5 70 72.5"
                stroke="#0f172a"
                strokeWidth="2.8"
                strokeLinecap="round"
              />
            ) : (
              <path
                d="M53.5 73C56.2 77.2 63.8 77.2 66.5 73"
                stroke="#0f172a"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            )}
          </g>
        </svg>
      </motion.div>
    </motion.div>
  );
}
