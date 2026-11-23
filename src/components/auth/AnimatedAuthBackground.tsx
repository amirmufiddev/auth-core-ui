import { useEffect, useRef } from "react";
import { useThemeStore } from "@/stores/useThemeStore";

function hexToRgb(color: string): [number, number, number] {
  const trimmed = color.trim();
  if (trimmed.startsWith("#")) {
    let hex = trimmed.slice(1);
    if (hex.length === 3) {
      hex = hex
        .split("")
        .map((c) => c + c)
        .join("");
    }
    const num = parseInt(hex, 16);
    if (!Number.isNaN(num)) {
      return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
    }
  }
  const match = trimmed.match(/rgba?\((\d+)[,\s]+(\d+)[,\s]+(\d+)/i);
  if (match) {
    return [Number(match[1]), Number(match[2]), Number(match[3])];
  }
  return [99, 102, 241];
}

function rgba(rgb: [number, number, number], alpha: number) {
  return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`;
}

/**
 * Full-bleed animated silk-ribbon mesh canvas synced live to the active
 * Tailwind v4 semantic color tokens (--primary, --tertiary, --chart-1, --chart-2, --chart-6).
 */
export function AnimatedAuthBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const colorTheme = useThemeStore((s) => s.colorTheme);
  const resolvedTheme = useThemeStore((s) => s.resolvedTheme);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const readThemePalette = () => {
      const style = getComputedStyle(document.documentElement);
      const primary = hexToRgb(
        style.getPropertyValue("--primary") || "#4f46e5",
      );
      const tertiary = hexToRgb(
        style.getPropertyValue("--tertiary") || "#0ea5e9",
      );
      const chart1 = hexToRgb(style.getPropertyValue("--chart-1") || "#6366f1");
      const chart2 = hexToRgb(style.getPropertyValue("--chart-2") || "#38bdf8");
      const chart6 = hexToRgb(style.getPropertyValue("--chart-6") || "#a855f7");
      return { primary, tertiary, chart1, chart2, chart6 };
    };

    let palette = readThemePalette();
    let width = 0;
    let height = 0;
    let rafId = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      palette = readThemePalette();
    };

    resize();
    window.addEventListener("resize", resize);

    const strandCount = 30;
    const segments = 64;

    const draw = (now: number) => {
      const t = now * 0.00045;
      const { primary, tertiary, chart1, chart2, chart6 } = palette;

      // Deep theme-tinted obsidian backdrop (harmonious with active palette)
      const bgGrad = ctx.createLinearGradient(0, 0, width, height);
      bgGrad.addColorStop(
        0,
        `rgb(${Math.round(primary[0] * 0.09 + 7)}, ${Math.round(
          primary[1] * 0.09 + 8,
        )}, ${Math.round(primary[2] * 0.12 + 14)})`,
      );
      bgGrad.addColorStop(
        0.55,
        `rgb(${Math.round(tertiary[0] * 0.06 + 6)}, ${Math.round(
          tertiary[1] * 0.06 + 8,
        )}, ${Math.round(tertiary[2] * 0.09 + 13)})`,
      );
      bgGrad.addColorStop(1, "#070910");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Subtle ambient radial bloom behind ribbon twist
      const bloom = ctx.createRadialGradient(
        width * 0.28,
        height * 0.62,
        20,
        width * 0.28,
        height * 0.62,
        Math.max(width, height) * 0.55,
      );
      bloom.addColorStop(0, rgba(primary, 0.22));
      bloom.addColorStop(0.5, rgba(tertiary, 0.09));
      bloom.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = bloom;
      ctx.fillRect(0, 0, width, height);

      // Silk-ribbon family of curves sweeping from bottom-left to top-right
      for (let i = 0; i < strandCount; i++) {
        const u = i / (strandCount - 1); // 0..1 across ribbon width
        const centerFactor = 1 - Math.abs(u - 0.5) * 2; // 0 at edges, 1 at spine

        const strokeGrad = ctx.createLinearGradient(
          0,
          height * 0.9,
          width * 0.85,
          height * 0.05,
        );
        const alpha = 0.08 + centerFactor * 0.48;
        strokeGrad.addColorStop(0, rgba(chart1, alpha * 0.65));
        strokeGrad.addColorStop(0.38, rgba(chart2, alpha * 1.15));
        strokeGrad.addColorStop(0.7, rgba(primary, alpha * 1.1));
        strokeGrad.addColorStop(1, rgba(chart6, alpha * 0.7));

        ctx.beginPath();
        ctx.strokeStyle = strokeGrad;
        ctx.lineWidth = 0.65 + centerFactor * 0.9;

        for (let s = 0; s <= segments; s++) {
          const p = s / segments; // 0..1 along curve
          // Base diagonal sweep from lower-left through mid-left to upper-mid-right
          const xBase = -width * 0.12 + p * width * 1.24;
          const yBase = height * (0.94 - p * 0.88);

          // Twist envelope that pinches near the focal point (~p=0.45) and fans out smoothly
          const spread =
            (Math.sin(p * Math.PI * 1.65 + t * 0.9) * 0.55 + 0.65) *
            Math.min(width, height) *
            0.22;
          const ribbonOffset = (u - 0.5) * spread;

          // Organic harmonic waves
          const waveY =
            Math.sin(p * Math.PI * 2.2 - t * 1.3 + u * 1.6) * (height * 0.14) +
            Math.cos(p * Math.PI * 3.1 + t * 0.85 - u * 1.1) * (height * 0.045);

          const waveX =
            Math.cos(p * Math.PI * 1.9 + t * 1.05 + u * 1.8) * (width * 0.055);

          const x = xBase + waveX + ribbonOffset * 0.45;
          const y = yBase + waveY + ribbonOffset;

          if (s === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }

        ctx.stroke();
      }

      rafId = window.requestAnimationFrame(draw);
    };

    rafId = window.requestAnimationFrame(draw);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
    };
  }, [colorTheme, resolvedTheme]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 h-full w-full"
    />
  );
}
