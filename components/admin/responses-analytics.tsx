"use client";

import { Activity, BarChart3, CalendarDays, PieChart, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export type ResponseTrendPoint = {
  key: string;
  label: string;
  count: number;
};

export type ResponseFormSlice = {
  id: string;
  title: string;
  count: number;
};

type ResponsesAnalyticsProps = {
  total: number;
  unique: number;
  today: number;
  lastSevenDays: number;
  trend: ResponseTrendPoint[];
  forms: ResponseFormSlice[];
};

export function ResponsesAnalytics({
  total,
  unique,
  today,
  lastSevenDays,
  trend,
  forms,
}: ResponsesAnalyticsProps) {
  const maxTrend = Math.max(1, ...trend.map((point) => point.count));
  const maxForm = Math.max(1, ...forms.map((form) => form.count));
  const formTotal = forms.reduce((sum, form) => sum + form.count, 0);

  const stats = [
    { label: "Total responses", value: total, icon: BarChart3, tone: "bg-maroon-500" },
    { label: "Unique applicants", value: unique, icon: Users, tone: "bg-gold-500" },
    { label: "Last 7 days", value: lastSevenDays, icon: CalendarDays, tone: "bg-emerald-500" },
    { label: "Today", value: today, icon: Activity, tone: "bg-sky-500" },
  ];

  return (
    <div className="grid min-w-0 grid-cols-1 gap-3 sm:gap-4">
      <div className="grid min-w-0 grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="min-w-0 border-border shadow-sm">
              <CardContent className="min-w-0 p-3 sm:p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
                      {stat.label}
                    </p>
                    <p className="mt-1 text-xl font-bold text-foreground sm:text-2xl">{stat.value}</p>
                  </div>
                  <span className={`grid size-8 shrink-0 place-items-center rounded-xl text-white ${stat.tone}`}>
                    <Icon className="size-4" />
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:gap-4">
        <Card className="min-w-0 overflow-hidden border-border shadow-sm">
          <CardHeader className="flex min-w-0 flex-row items-center justify-between gap-2 space-y-0 p-4 pb-2">
            <CardTitle className="truncate text-sm font-semibold">Submissions trend</CardTitle>
            <Badge variant="outline" className="hidden text-[10px] sm:inline-flex">Last 14 days</Badge>
<Badge variant="outline" className="text-[10px] sm:hidden">14d</Badge>
          </CardHeader>
          <CardContent className="min-w-0 p-4 pt-2">
            <div className="flex h-32 items-end gap-1 sm:gap-2" role="img" aria-label="Daily response submissions">
              {trend.map((point) => (
                <div key={point.key} className="group flex h-full min-w-0 flex-1 flex-col justify-end gap-1">
                  <div className="relative flex h-full items-end">
                    <div
                      className="w-full rounded-t-md bg-gradient-to-t from-maroon-700 to-maroon-400 transition-all group-hover:from-maroon-600 group-hover:to-gold-400"
                      style={{ height: `${Math.max(point.count ? 8 : 2, (point.count / maxTrend) * 100)}%` }}
                      title={`${point.label}: ${point.count}`}
                    />
                  </div>
                  <span className="truncate text-center text-[9px] text-muted-foreground sm:hidden">{point.label.split(" ").at(-1)}</span><span className="hidden truncate text-center text-[10px] text-muted-foreground sm:inline">{point.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="min-w-0 overflow-hidden border-border shadow-sm">
          <CardHeader className="flex min-w-0 flex-row items-center justify-between gap-2 space-y-0 p-4 pb-2">
            <CardTitle className="truncate text-sm font-semibold">Responses by form</CardTitle>
            <PieChart className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="min-w-0 p-4 pt-2">
            {forms.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No form data yet.</p>
            ) : (
              <div className="space-y-2.5">
                {forms.map((form) => (
                  <div key={form.id} className="space-y-1">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="truncate font-medium text-foreground">{form.title}</span>
                      <span className="shrink-0 text-muted-foreground">
                        {form.count} · {formTotal ? Math.round((form.count / formTotal) * 100) : 0}%
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-maroon-700 to-gold-400"
                        style={{ width: `${(form.count / maxForm) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
