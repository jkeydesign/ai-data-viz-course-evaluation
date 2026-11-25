import { env } from "cloudflare:workers";
import { getDb } from "../../../../db";
import { surveyResponses } from "../../../../db/schema";
import { getChatGPTUser } from "../../../chatgpt-auth";

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin || origin !== new URL(request.url).origin) {
    return Response.json({ error: "허용되지 않은 요청입니다." }, { status: 403 });
  }

  if (!request.headers.get("content-type")?.includes("application/json")) {
    return Response.json({ error: "지원하지 않는 요청입니다." }, { status: 415 });
  }

  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "관리자 로그인이 필요합니다." }, { status: 401 });

  const adminEmail = env.ADMIN_EMAIL?.trim().toLowerCase();
  if (!adminEmail || user.email.trim().toLowerCase() !== adminEmail) {
    return Response.json({ error: "데이터 초기화 권한이 없습니다." }, { status: 403 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "확인 요청을 읽을 수 없습니다." }, { status: 400 });
  }
  if ((payload as { confirm?: unknown })?.confirm !== "RESET_ALL_RESPONSES") {
    return Response.json({ error: "초기화 확인이 필요합니다." }, { status: 400 });
  }

  try {
    await getDb().delete(surveyResponses);
    return Response.json({ ok: true }, { status: 200 });
  } catch {
    return Response.json({ error: "데이터 초기화에 실패했습니다. 잠시 후 다시 시도해 주세요." }, { status: 503 });
  }
}
