import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatTimeAgo(date: Date | string) {
  const now = new Date();
  const then = new Date(date);
  const diff = now.getTime() - then.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return "just now";
}

export const POSITIONS = [
  "Goalkeeper",
  "Right Back",
  "Left Back",
  "Centre Back",
  "Defensive Midfielder",
  "Central Midfielder",
  "Attacking Midfielder",
  "Right Winger",
  "Left Winger",
  "Striker",
  "Second Striker",
];

export const DEAL_STATUS_LABELS: Record<string, string> = {
  pending: "Pending Review",
  in_negotiation: "In Negotiation",
  agreed: "Deal Agreed",
  completed: "Completed",
  rejected: "Rejected",
};

export const DEAL_STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  in_negotiation: "bg-blue-100 text-blue-800",
  agreed: "bg-green-100 text-green-800",
  completed: "bg-emerald-100 text-emerald-800",
  rejected: "bg-red-100 text-red-800",
};
