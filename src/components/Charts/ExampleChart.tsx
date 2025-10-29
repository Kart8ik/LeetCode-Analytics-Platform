"use client"

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

const chartData = [
  { month: "January", easy: 28, medium: 12 },
  { month: "February", easy: 35, medium: 18 },
  { month: "March", easy: 22, medium: 15 },
  { month: "April", easy: 18, medium: 24 },
  { month: "May", easy: 31, medium: 19 },
  { month: "June", easy: 26, medium: 22 },
]

const chartConfig = {
  easy: {
    label: "Easy",
    color: "hsl(var(--chart-1))",
  },
  medium: {
    label: "Medium",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

export function ExampleChart() {
  return (
    <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
      <BarChart accessibilityLayer data={chartData}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="month"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) => value.slice(0, 3)}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="easy" fill="var(--color-easy)" radius={4} />
        <Bar dataKey="medium" fill="var(--color-medium)" radius={4} />
      </BarChart>
    </ChartContainer>
  )
}
