import { useId } from "react";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import { BarChart4, LineChart as LineIcon, PieChart as PieIcon, Activity } from "lucide-react";

const PALETTE = [
  "#38bdf8",
  "#a855f7",
  "#34d399",
  "#f97316",
  "#f472b6",
  "#facc15",
  "#94a3b8",
  "#22d3ee",
];

const PALETTE_LIGHT = [
  "#C07A50",
  "#3B7EA1",
  "#6B8F71",
  "#B08968",
  "#8B7355",
  "#5C7C8A",
  "#C4A574",
  "#7D6E83",
];

function ChartShell({ title, children, tone, type }) {
  const light = tone === "light";
  
  const Icon = type === "pie" ? PieIcon : type === "line" ? LineIcon : type === "area" ? Activity : BarChart4;

  return (
    <motion.section
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={
        light
          ? "rounded-2xl border border-black/[0.08] bg-white p-4 shadow-sm ring-1 ring-black/[0.04]"
          : "rounded-2xl border border-white/10 bg-slate-950/60 p-4 shadow-glass ring-1 ring-white/5"
      }
    >
      <div
        className={`mb-3 flex items-center justify-between text-sm font-semibold ${light ? "text-journal-ink" : "text-slate-100"}`}
      >
        <div className="flex items-center gap-2">
          <Icon className={`h-4 w-4 ${light ? "text-journal-clay" : "text-sky-300"}`} />
          {title || "Visualization"}
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider opacity-40">{type}</span>
      </div>
      <div className="h-72 w-full">{children}</div>
    </motion.section>
  );
}

export function ChartCard({ chart, tone = "dark" }) {
  const gradIdBase = useId().replace(/:/g, "");
  const light = tone === "light";
  const axis = light ? "#7a746c" : "#94a3b8";
  const grid = light ? "#e5e2dc" : "#1e293b";
  const tooltipBg = light ? "#ffffff" : "#020617";
  const tooltipBorder = light ? "rgba(0,0,0,0.12)" : "rgba(148,163,184,0.35)";
  const tooltipColor = light ? "#1a1a1a" : "#e2e8f0";
  const pieStroke = light ? "#ffffff" : "#020617";

  if (!chart?.type || !chart?.data?.length) {
    return null;
  }

  const { type, data, title, meta } = chart;
  const palette = light ? PALETTE_LIGHT : PALETTE;

  if (type === "bar") {
    const xKey = meta?.xKey || "name";
    const yKey = meta?.yKey || "value";
    return (
      <ChartShell tone={tone} title={title} type="bar">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
            <defs>
              <linearGradient id={`${gradIdBase}-bar`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#C07A50" stopOpacity={light ? 0.95 : 0.9} />
                <stop
                  offset="100%"
                  stopColor={light ? "#8B6914" : "#6366f1"}
                  stopOpacity={light ? 0.35 : 0.35}
                />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
            <XAxis dataKey={xKey} tick={{ fill: axis, fontSize: 11 }} axisLine={{ stroke: grid }} />
            <YAxis tick={{ fill: axis, fontSize: 11 }} axisLine={{ stroke: grid }} />
            <Tooltip
              contentStyle={{
                backgroundColor: tooltipBg,
                borderRadius: 12,
                border: `1px solid ${tooltipBorder}`,
                color: tooltipColor,
              }}
            />
            <Bar 
              dataKey={yKey} 
              radius={[6, 6, 0, 0]} 
              fill={`url(#${gradIdBase}-bar)`} 
              isAnimationActive={true}
              animationDuration={1500}
              animationBegin={0}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartShell>
    );
  }

  if (type === "line") {
    const xKey = meta?.xKey || "name";
    const yKey = meta?.yKey || "value";
    return (
      <ChartShell tone={tone} title={title} type="line">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
            <XAxis dataKey={xKey} tick={{ fill: axis, fontSize: 11 }} axisLine={{ stroke: grid }} />
            <YAxis tick={{ fill: axis, fontSize: 11 }} axisLine={{ stroke: grid }} />
            <Tooltip
              contentStyle={{
                backgroundColor: tooltipBg,
                borderRadius: 12,
                border: `1px solid ${tooltipBorder}`,
                color: tooltipColor,
              }}
            />
            <Line
              type="monotone"
              dataKey={yKey}
              stroke={light ? "#C07A50" : "#38bdf8"}
              strokeWidth={3}
              dot={{ r: 4, fill: light ? "#C07A50" : "#38bdf8", strokeWidth: 2, stroke: light ? "#fff" : "#020617" }}
              activeDot={{ r: 6 }}
              isAnimationActive={true}
              animationDuration={1500}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartShell>
    );
  }

  if (type === "area") {
    const xKey = meta?.xKey || "name";
    const yKey = meta?.yKey || "value";
    return (
      <ChartShell tone={tone} title={title} type="area">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
            <defs>
              <linearGradient id={`${gradIdBase}-area`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={light ? "#C07A50" : "#38bdf8"} stopOpacity={0.3} />
                <stop offset="95%" stopColor={light ? "#C07A50" : "#38bdf8"} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
            <XAxis dataKey={xKey} tick={{ fill: axis, fontSize: 11 }} axisLine={{ stroke: grid }} />
            <YAxis tick={{ fill: axis, fontSize: 11 }} axisLine={{ stroke: grid }} />
            <Tooltip
              contentStyle={{
                backgroundColor: tooltipBg,
                borderRadius: 12,
                border: `1px solid ${tooltipBorder}`,
                color: tooltipColor,
              }}
            />
            <Area
              type="monotone"
              dataKey={yKey}
              stroke={light ? "#C07A50" : "#38bdf8"}
              strokeWidth={3}
              fillOpacity={1}
              fill={`url(#${gradIdBase}-area)`}
              isAnimationActive={true}
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartShell>
    );
  }

  if (type === "pie") {
    const nameKey = meta?.nameKey || "name";
    const valueKey = meta?.valueKey || "value";
    return (
      <ChartShell tone={tone} title={title} type="pie">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              contentStyle={{
                backgroundColor: tooltipBg,
                borderRadius: 12,
                border: `1px solid ${tooltipBorder}`,
                color: tooltipColor,
              }}
            />
            <Legend verticalAlign="bottom" height={36} wrapperStyle={{ color: light ? "#4a473f" : "#cbd5f5", fontSize: 11 }} />
            <Pie
              data={data}
              dataKey={valueKey}
              nameKey={nameKey}
              innerRadius={60}
              outerRadius={85}
              paddingAngle={4}
              stroke="none"
              isAnimationActive={true}
              animationDuration={1000}
            >
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={palette[index % palette.length]}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </ChartShell>
    );
  }

  return null;
}
