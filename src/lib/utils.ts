import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(value: number, fractionDigits = 0) {
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
}

export function formatKg(value: number) {
  return `${formatNumber(value, 1)} kg`;
}

export function formatLiters(ml: number) {
  return `${formatNumber(ml / 1000, 2).replace(/0$/, "")} L`;
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function percentOf(value: number, target: number) {
  if (target <= 0) return 0;
  return clamp(Math.round((value / target) * 100), 0, 100);
}
