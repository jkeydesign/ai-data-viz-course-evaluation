import { getDb } from "../../../db";
import { surveyResponses } from "../../../db/schema";

export async function POST(request: Request) {
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return Response.json({ error: "지원하지 않는 요청입니다." }, { status: 415 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "응답 형식을 확인해 주세요." }, { status: 400 });
  }

  const value = payload as { ratings?: unknown; helpful?: unknown; improve?: unknown };
  const ratings = value?.ratings;
  const helpful = value?.helpful;
  const improve = value?.improve;
  if (
    !Array.isArray(ratings) || ratings.length !== 8 ||
    !ratings.every((rating) => Number.isInteger(rating) && rating >= 1 && rating <= 5) ||
    typeof helpful !== "string" || helpful.length > 2000 ||
    typeof improve !== "string" || improve.length > 2000
  ) {
    return Response.json({ error: "문항 응답을 확인해 주세요." }, { status: 400 });
  }

  try {
    const db = getDb();
    await db.insert(surveyResponses).values({
      ratings: JSON.stringify(ratings),
      helpful: helpful.trim(),
      improve: improve.trim(),
    });
    return Response.json({ ok: true }, { status: 201 });
  } catch {
    return Response.json({ error: "응답을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요." }, { status: 503 });
  }
}
