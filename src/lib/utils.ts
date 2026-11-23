import { clsx, type ClassValue } from "clsx";
import { format } from "date-fns";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const isLocationMatch = (
  targetLocation: string | null | undefined,
  locationName: string | null | undefined
) => {
  if (!targetLocation || !locationName) return false;
  return (
    locationName === targetLocation ||
    locationName.startsWith(`${targetLocation}/`)
  );
};

export const RGBToHex = (r: number, g: number, b: number) => {
  const componentToHex = (c: number) => {
    const hex = c.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };

  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
};

export function hslToHex(hsl: string) {
  if (!hsl) return "#000000";
  const normalized = hsl.replace(/^hsla?\(/, "").replace(")", "").trim();

  const [h, s, l] = normalized.split(/[\s,]+/).map((value) => {
    if (value.endsWith("%")) {
      return parseFloat(value.slice(0, -1));
    }
    return parseFloat(value);
  });

  if ([h, s, l].some((n) => Number.isNaN(n))) {
    return "#000000";
  }

  function hslToRgb(hue: number, sat: number, light: number) {
    hue /= 360;
    sat /= 100;
    light /= 100;

    let r: number;
    let g: number;
    let b: number;

    if (sat === 0) {
      r = g = b = light;
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };

      const q = light < 0.5 ? light * (1 + sat) : light + sat - light * sat;
      const p = 2 * light - q;
      r = hue2rgb(p, q, hue + 1 / 3);
      g = hue2rgb(p, q, hue);
      b = hue2rgb(p, q, hue - 1 / 3);
    }

    const rgbToHex = (value: number) => {
      const hex = Math.round(value * 255).toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    };

    return `#${rgbToHex(r)}${rgbToHex(g)}${rgbToHex(b)}`;
  }

  return hslToRgb(h, s, l);
}

export const hexToRGB = (hex: string, alpha = 1) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  if (alpha !== undefined) {
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return `rgb(${r}, ${g}, ${b})`;
};

export const formatTime = (time: string | number | Date) => {
  if (!time) return "";
  const date = new Date(time);
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

export function isObjectNotEmpty(obj: Record<string, unknown> | null) {
  if (typeof obj !== "object" || obj === null) {
    return false;
  }
  return Object.keys(obj).length > 0;
}

export const formatDate = (
  date: string | number | Date,
  pattern?: string
) => {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "-";
  if (pattern) return format(parsed, pattern);
  return parsed.toLocaleDateString("id-ID", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export function getWords(inputString: string) {
  const stringWithoutSpaces = inputString.replace(/\s/g, "");
  return stringWithoutSpaces.substring(0, 3);
}
