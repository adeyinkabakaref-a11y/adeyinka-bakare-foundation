import { format, formatDistanceToNow } from "date-fns";

export const EVENT_TIME_ZONE = "Africa/Lagos";
const EVENT_TZ_OFFSET = "+01:00";

export function formatDate(date: string | Date, formatStr: string = "PPP"): string {
 return format(new Date(date), formatStr);
}

export function formatDateTime(date: string | Date): string {
 return format(new Date(date), "PPP p");
}

export function formatRelativeTime(date: string | Date): string {
 return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function formatDateShort(date: string | Date): string {
 return format(new Date(date), "MMM d, yyyy");
}

export function toEventDateTimeLocal(value?: string | null): string {
 if (!value) return "";
 const parts = new Intl.DateTimeFormat("en-CA", {
 timeZone: EVENT_TIME_ZONE,
 year: "numeric",
 month: "2-digit",
 day: "2-digit",
 hour: "2-digit",
 minute: "2-digit",
 hourCycle: "h23",
 }).formatToParts(new Date(value));
 const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value;
 return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}

export function fromEventDateTimeLocal(value: string): string {
 if (!value) return "";
 const local = value.length === 16 ? `${value}:00` : value;
 return new Date(`${local}${EVENT_TZ_OFFSET}`).toISOString();
}

export function formatEventDate(
 value: string | Date,
 options: Intl.DateTimeFormatOptions = {
 weekday: "long",
 month: "long",
 day: "numeric",
 year: "numeric",
 }
): string {
 return new Intl.DateTimeFormat("en-US", { timeZone: EVENT_TIME_ZONE, ...options }).format(new Date(value));
}

export function formatEventTime(value: string | Date): string {
 return formatEventDate(value, { hour: "numeric", minute: "2-digit", hour12: true });
}

export function isEventUpcoming(value: string | Date): boolean {
 return new Date(value).getTime() >= Date.now();
}

export function isSameEventDay(first: string | Date, second: string | Date): boolean {
 const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "2-digit", day: "2-digit" };
 return formatEventDate(first, options) === formatEventDate(second, options);
}

export function formatEventCalendarStamp(value: string | Date): string {
 const parts = new Intl.DateTimeFormat("en-US", {
 timeZone: EVENT_TIME_ZONE,
 year: "numeric",
 month: "2-digit",
 day: "2-digit",
 hour: "2-digit",
 minute: "2-digit",
 second: "2-digit",
 hourCycle: "h23",
 }).formatToParts(new Date(value));
 const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value;
 return `${get("year")}${get("month")}${get("day")}T${get("hour")}${get("minute")}${get("second")}`;
}
