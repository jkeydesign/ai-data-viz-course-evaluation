import { env } from "cloudflare:workers";
import { count, desc } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getDb } from "../../db";
import { surveyResponses } from "../../db/schema";
import { chatGPTSignInPath, getChatGPTUser } from "../chatgpt-auth";
import AdminDashboard, { type AdminResponse } from "./admin-dashboard";

export const dynamic = "force-dynamic";

function parseRatings(value: string): number[] {
  try {
    const parsed: unknown = JSON.parse(value);
    if (
      Array.isArray(parsed) && parsed.length === 8 &&
      parsed.every((rating) => Number.isInteger(rating) && rating >= 1 && rating <= 5)
    ) return parsed as number[];
  } catch {
    // Ignore malformed legacy rows in the dashboard.
  }
  return [];
}

export default async function AdminPage() {
  const user = await getChatGPTUser();
  if (!user) redirect(chatGPTSignInPath("/admin"));

  const adminEmail = env.ADMIN_EMAIL?.trim().toLowerCase();
  if (!adminEmail || user.email.trim().toLowerCase() !== adminEmail) {
    return <main className="admin-denied"><div className="admin-denied-card"><span className="admin-eyebrow">ADMIN ACCESS</span><h1>관리자 전용 페이지입니다</h1><p>이 계정에는 설문 응답을 볼 권한이 없습니다.</p><a href="/">설문 페이지로 돌아가기</a></div></main>;
  }

  const db = getDb();
  const [countRows, rows] = await Promise.all([
    db.select({ total: count() }).from(surveyResponses),
    db.select().from(surveyResponses).orderBy(desc(surveyResponses.createdAt)).limit(500),
  ]);
  const responses: AdminResponse[] = rows.map((row) => ({
    id: row.id,
    name: row.name,
    ratings: parseRatings(row.ratings),
    helpful: row.helpful,
    improve: row.improve,
    additional: row.additional,
    createdAt: row.createdAt,
  }));

  return <AdminDashboard totalResponses={Number(countRows[0]?.total ?? 0)} responses={responses} />;
}
