import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ACHIEVEMENTS } from "../constants";

const Stats: React.FC = () => {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        {/* SECTION HEADER */}
        <div className="text-center mb-16">
          <h2 className="font-heading text-4xl md:text-5xl font-bold mb-4 text-slate-900">
            Future Spark Progress
          </h2>
          <p className="text-slate-600 text-lg">
            Admissions growth over the years
          </p>
        </div>

        {/* CHART ONLY */}
        <div className="max-w-5xl mx-auto">
          <div className="bg-brand-dark rounded-[3rem] p-8 md:p-12 shadow-2xl h-[420px]">
            <h3 className="text-white font-bold mb-6 flex items-center gap-3">
              <span className="w-3 h-3 bg-brand-light rounded-full animate-pulse" />
              Admissions Growth
            </h3>

            <ResponsiveContainer width="100%" height="85%">
              <AreaChart data={ACHIEVEMENTS}>
                <defs>
                  <linearGradient
                    id="studentsGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#a079ff" stopOpacity={0.85} />
                    <stop offset="95%" stopColor="#a079ff" stopOpacity={0.05} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff15" />
                <XAxis
                  dataKey="year"
                  stroke="#cbd5f5"
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  stroke="#cbd5f5"
                  tick={{ fontSize: 12 }}
                  allowDecimals={false}
                  domain={[200, "dataMax"]}
                />

                <Tooltip
                  contentStyle={{
                    backgroundColor: "#240c67",
                    borderRadius: "14px",
                    border: "none",
                    color: "#ffffff",
                  }}
                  labelStyle={{ color: "#c7b8ff", fontWeight: 600 }}
                  itemStyle={{ color: "#a079ff", fontWeight: 600 }}
                  formatter={(value: any, name: any, props: any) => {
                    // Show 250+ for 2024 and 300+ for 2025 as requested
                    if (name === "students") {
                      const y = props?.payload?.year;
                      if (y === "2024" && Number(value) === 250) return ["250+", "Admissions"];
                      if (y === "2025" && Number(value) === 300) return ["300+", "Admissions"];
                      return [value, "Admissions"];
                    }
                    return [value, name];
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="students"
                  stroke="#a079ff"
                  strokeWidth={3}
                  fill="url(#studentsGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Stats;
