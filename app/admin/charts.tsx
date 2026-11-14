"use client";

import type { ReactNode } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Response = { ratings: number[] };

const items = [
  "설명 이해", "수업 속도", "한국어·용어", "자료·예제",
  "AI 활용", "데이터 분석", "시각적 표현", "피드백",
];
const ratingColors = ["#c75d50", "#e39a55", "#e8c15d", "#75a982", "#24634c"];
const chartMargin = { top: 6, right: 12, bottom: 0, left: 0 };

function getChartData(responses: Response[]) {
  const averages = items.map((label, index) => {
    const values = responses.map((response) => response.ratings[index]).filter((v) => v >= 1 && v <= 5);
    return { label, average: values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0, count: values.length };
  });
  const distribution = items.map((label, index) => {
    const row: Record<string, string | number> = { label };
    for (let rating = 1; rating <= 5; rating++) {
      row[`r${rating}`] = responses.reduce((sum, response) => sum + (response.ratings[index] === rating ? 1 : 0), 0);
    }
    return row;
  });
  const totals = [1, 2, 3, 4, 5].map((rating) => ({
    name: `${rating}점`,
    value: responses.reduce((sum, response) => sum + response.ratings.filter((value) => value === rating).length, 0),
  }));
  const domains = [
    { label: "이해·운영", indexes: [0, 1, 2] },
    { label: "자료·실습", indexes: [3] },
    { label: "AI 활용", indexes: [4] },
    { label: "데이터 분석", indexes: [5] },
    { label: "시각적 표현", indexes: [6] },
    { label: "피드백", indexes: [7] },
  ].map(({ label, indexes }) => {
    const values = indexes.flatMap((index) => responses.map((response) => response.ratings[index]).filter((v) => v >= 1 && v <= 5));
    return { subject: label, score: values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0 };
  });
  return { averages, distribution, totals, domains };
}

function EmptyChart({ children }: { children: ReactNode }) {
  return <div className="admin-chart-empty"><span aria-hidden="true">◌</span><p>{children}</p></div>;
}

export default function AdminCharts({ responses }: { responses: Response[] }) {
  const { averages, distribution, totals, domains } = getChartData(responses);
  const hasRatings = averages.some((item) => item.count > 0);
  const totalRatings = totals.reduce((sum, item) => sum + item.value, 0);

  return <section className="admin-charts" aria-label="강의평가 데이터 시각화">
    <article className="admin-chart-card admin-chart-radar">
      <div className="admin-chart-heading"><div><span className="admin-eyebrow">LEARNING OUTCOMES</span><h2>교육 영역별 성과</h2></div><span className="admin-chart-unit">평균 · 5점 만점</span></div>
      {hasRatings ? <div className="admin-chart-area radar-area"><ResponsiveContainer width="100%" height="100%"><RadarChart data={domains} outerRadius="72%" margin={{ top: 8, right: 22, bottom: 8, left: 22 }}>
        <PolarGrid stroke="#dce4dc" />
        <PolarAngleAxis dataKey="subject" tick={{ fill: "#59665e", fontSize: 11 }} />
        <PolarRadiusAxis domain={[0, 5]} tickCount={6} axisLine={false} tick={{ fill: "#859088", fontSize: 9 }} />
        <Radar name="평균 점수" dataKey="score" stroke="#1b654c" fill="#60a181" fillOpacity={0.28} strokeWidth={2.5} />
        <Tooltip formatter={(value) => [`${Number(value).toFixed(2)}점`, "평균"]} />
      </RadarChart></ResponsiveContainer></div> : <EmptyChart>응답이 등록되면 영역별 성과가 표시됩니다.</EmptyChart>}
      <p className="admin-chart-caption">AI 활용·분석·표현 역량과 수업 운영 영역을 한눈에 비교합니다.</p>
    </article>

    <article className="admin-chart-card admin-chart-average">
      <div className="admin-chart-heading"><div><span className="admin-eyebrow">QUESTION AVERAGE</span><h2>문항별 평균 점수</h2></div><span className="admin-chart-unit">낮은 점수부터</span></div>
      {hasRatings ? <div className="admin-chart-area average-area"><ResponsiveContainer width="100%" height="100%"><BarChart data={[...averages].reverse()} layout="vertical" margin={{ top: 4, right: 22, bottom: 0, left: 4 }}>
        <CartesianGrid stroke="#edf0ec" horizontal={false} />
        <XAxis type="number" domain={[0, 5]} ticks={[0, 1, 2, 3, 4, 5]} tick={{ fill: "#79847d", fontSize: 10 }} axisLine={false} tickLine={false} />
        <YAxis type="category" dataKey="label" width={82} tick={{ fill: "#56635b", fontSize: 10 }} axisLine={false} tickLine={false} />
        <ReferenceLine x={3.5} stroke="#c75d50" strokeDasharray="4 4" />
        <Tooltip formatter={(value) => [`${Number(value).toFixed(2)}점`, "평균"]} />
        <Bar dataKey="average" name="평균 점수" radius={[0, 7, 7, 0]} barSize={16}>
          {[...averages].reverse().map((entry) => <Cell key={entry.label} fill={entry.average < 3.5 ? "#c75d50" : entry.average >= 4 ? "#24634c" : "#d3ad56"} />)}
        </Bar>
      </BarChart></ResponsiveContainer></div> : <EmptyChart>평균 점수를 계산할 응답이 없습니다.</EmptyChart>}
      <p className="admin-chart-caption"><i className="chart-dot chart-dot-low" />3.5점 미만은 개선 검토가 필요한 항목입니다.</p>
    </article>

    <article className="admin-chart-card admin-chart-distribution">
      <div className="admin-chart-heading"><div><span className="admin-eyebrow">LIKERT DISTRIBUTION</span><h2>문항별 응답 분포</h2></div><span className="admin-chart-unit">응답 수</span></div>
      {hasRatings ? <><div className="admin-chart-area distribution-area"><ResponsiveContainer width="100%" height="100%"><BarChart data={distribution} layout="vertical" margin={{ top: 4, right: 12, bottom: 0, left: 4 }}>
        <CartesianGrid stroke="#edf0ec" horizontal={false} />
        <XAxis type="number" allowDecimals={false} tick={{ fill: "#79847d", fontSize: 10 }} axisLine={false} tickLine={false} />
        <YAxis type="category" dataKey="label" width={82} tick={{ fill: "#56635b", fontSize: 10 }} axisLine={false} tickLine={false} />
        <Tooltip />
        {[1, 2, 3, 4, 5].map((rating) => <Bar key={rating} dataKey={`r${rating}`} name={`${rating}점`} stackId="ratings" fill={ratingColors[rating - 1]} />)}
      </BarChart></ResponsiveContainer></div><div className="admin-rating-legend">{ratingColors.map((color, index) => <span key={color}><i style={{ background: color }} />{index + 1}점</span>)}</div></> : <EmptyChart>응답이 등록되면 점수 분포가 표시됩니다.</EmptyChart>}
      <p className="admin-chart-caption">각 문항에서 1점부터 5점까지 선택한 응답 수를 비교합니다.</p>
    </article>

    <article className="admin-chart-card admin-chart-donut">
      <div className="admin-chart-heading"><div><span className="admin-eyebrow">ALL RATINGS</span><h2>전체 점수 구성</h2></div><span className="admin-chart-unit">총 {totalRatings.toLocaleString("ko-KR")}개 평가</span></div>
      {totalRatings ? <div className="admin-donut-layout"><div className="admin-chart-area donut-area"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={totals} dataKey="value" nameKey="name" innerRadius="63%" outerRadius="88%" paddingAngle={2} stroke="#fff" strokeWidth={3}>{totals.map((entry, index) => <Cell key={entry.name} fill={ratingColors[index]} />)}</Pie><Tooltip formatter={(value) => [`${Number(value)}개`, "응답"]} /></PieChart></ResponsiveContainer><div className="admin-donut-center"><strong>{averages.reduce((sum, item) => sum + item.average * item.count, 0) / (averages.reduce((sum, item) => sum + item.count, 0) || 1) ? (averages.reduce((sum, item) => sum + item.average * item.count, 0) / averages.reduce((sum, item) => sum + item.count, 0)).toFixed(2) : "—"}</strong><span>평균 / 5점</span></div></div><div className="admin-donut-legend">{totals.map((item, index) => <div key={item.name}><span><i style={{ background: ratingColors[index] }} />{item.name}</span><strong>{item.value.toLocaleString("ko-KR")}<small>개</small></strong></div>)}</div></div> : <EmptyChart>응답이 등록되면 전체 점수 구성이 표시됩니다.</EmptyChart>}
      <p className="admin-chart-caption">8개 객관식 문항의 점수를 합산해 전체 만족도 분포를 보여줍니다.</p>
    </article>
  </section>;
}
