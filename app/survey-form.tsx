"use client";

import { useMemo, useState } from "react";

const questions = [
  "교수자의 설명은 이해하기 쉬웠다.",
  "수업 진행 속도는 학습하기에 적절했다.",
  "수업에서 사용하는 한국어와 디자인 용어를 이해할 수 있었다.",
  "수업자료와 실습 예제는 학습에 도움이 되었다.",
  "수업을 통해 AI 도구를 활용하는 능력이 향상되었다.",
  "데이터에서 중요한 특징을 발견하는 능력이 향상되었다.",
  "데이터를 적절한 그래프와 디자인으로 표현하는 능력이 향상되었다.",
  "교수자의 피드백은 과제를 개선하는 데 도움이 되었다.",
];
const scale = ["전혀 그렇지 않다", "그렇지 않다", "보통이다", "그렇다", "매우 그렇다"];
const minimumCharacters = 20;

function countCharacters(value: string) {
  return Array.from(value).length;
}

export default function SurveyForm() {
  const [ratings, setRatings] = useState<(number | null)[]>(Array(8).fill(null));
  const [helpful, setHelpful] = useState("");
  const [improve, setImprove] = useState("");
  const [name, setName] = useState("");
  const [additional, setAdditional] = useState("");
  const [section02Attempted, setSection02Attempted] = useState(false);
  const [status, setStatus] = useState<{ kind: "ok" | "error"; message: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const answered = useMemo(() => ratings.filter((v) => v !== null).length, [ratings]);
  const helpfulCharacters = countCharacters(helpful);
  const improveCharacters = countCharacters(improve);
  const missingSection02 = [
    ...(helpfulCharacters < minimumCharacters ? ["도움이 된 내용"] : []),
    ...(improveCharacters < minimumCharacters ? ["개선 의견"] : []),
  ];

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSection02Attempted(true);
    if (missingSection02.length) {
      setStatus({ kind: "error", message: "02번의 두 답변을 각각 공백 포함 20자 이상 작성해 주세요." });
      const section = document.getElementById("section-02");
      section?.scrollIntoView({ behavior: "smooth", block: "center" });
      section?.focus({ preventScroll: true });
      return;
    }
    const missing = ratings.findIndex((v) => v === null);
    if (missing !== -1) {
      setStatus({ kind: "error", message: `${missing + 1}번 문항에 응답해 주세요.` });
      document.getElementById(`question-${missing + 1}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setBusy(true);
    setStatus(null);
    try {
      const response = await fetch("/api/responses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ratings, helpful: helpful.trim(), improve: improve.trim(), name: name.trim(), additional: additional.trim() }),
      });
      if (!response.ok) {
        const result = await response.json().catch(() => null) as { error?: unknown } | null;
        throw new Error(typeof result?.error === "string" ? result.error : "응답을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.");
      }
      setStatus({ kind: "ok", message: "응답이 제출되었습니다. 소중한 의견 감사합니다." });
      setRatings(Array(8).fill(null));
      setHelpful("");
      setImprove("");
      setName("");
      setAdditional("");
      setSection02Attempted(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      const message = error instanceof Error && error.message
        ? error.message
        : "응답을 저장하지 못했습니다. 연결 상태를 확인한 뒤 다시 제출해 주세요.";
      setStatus({ kind: "error", message });
    } finally {
      setBusy(false);
    }
  }

  return <form onSubmit={submit} noValidate>
    <div className="form-wrap"><main className="main">
      <section className="section" aria-labelledby="rating-title"><div className="section-head"><span className="num">01</span><div><h2 id="rating-title">수업 경험을 평가해 주세요</h2><p>각 문항에서 가장 가까운 답 하나를 선택해 주세요.</p></div></div>
        <div className="scale" aria-label="응답 척도">{scale.map((label, i) => <span key={label}><b>{i + 1}</b>{label}</span>)}</div>
        {questions.map((question, i) => <fieldset className="question" id={`question-${i + 1}`} key={question}><legend className="question-title"><span className="qno">{String(i + 1).padStart(2, "0")}</span><span>{question}</span></legend><div className="choices">{scale.map((label, j) => <div className="choice" key={label}><input type="radio" id={`q${i + 1}-${j + 1}`} name={`q${i + 1}`} checked={ratings[i] === j + 1} onChange={() => setRatings((prev) => prev.map((v, index) => index === i ? j + 1 : v))} /><label htmlFor={`q${i + 1}-${j + 1}`} title={label}><span className="value">{j + 1}</span><span>{label}</span></label></div>)}</div></fieldset>)}
      </section>
      <section id="section-02" tabIndex={-1} className={`section ${section02Attempted && missingSection02.length ? "section-invalid" : ""}`} aria-labelledby="open-title">
        <div className="section-head"><span className="num">02</span><div><h2 id="open-title">자유롭게 의견을 남겨 주세요</h2><p>두 답변 모두 필수입니다. 각 답변을 공백 포함 20자 이상 작성해 주세요.</p></div></div>
        <div className="language-guide" aria-label="02번 문항 안내">
          <p><strong>English</strong> Both answers are required. Write at least 20 characters, including spaces, for each answer.</p>
          <p><strong>Tiếng Việt</strong> Cả hai câu trả lời đều bắt buộc. Mỗi câu trả lời cần ít nhất 20 ký tự, tính cả khoảng trắng.</p>
          <p><strong>Монгол</strong> Хоёр хариулт хоёулаа заавал бөглөнө. Хариулт бүр зайг оруулаад 20-оос доошгүй тэмдэгттэй байна.</p>
          <p><strong>မြန်မာ</strong> အဖြေနှစ်ခုလုံး မဖြစ်မနေ ဖြေရပါမည်။ အဖြေတစ်ခုစီတွင် space ပါဝင်ပြီး စာလုံးရေ အနည်းဆုံး ၂၀ ရှိရပါမည်။</p>
        </div>
        {section02Attempted && missingSection02.length > 0 && <div className="section-warning" role="alert"><strong>02번 응답을 확인해 주세요.</strong><span>{missingSection02.join("과 ")} 답변을 각각 공백 포함 20자 이상 작성해야 제출할 수 있습니다.</span></div>}
        <div className="textarea-wrap"><label htmlFor="helpful">이번 수업에서 가장 도움이 되었던 내용이나 실습은 무엇인가?<span className="required">필수</span></label><p className="question-translation">English: What content or activity was most helpful in this class?<br />Tiếng Việt: Nội dung hoặc hoạt động nào trong buổi học này hữu ích nhất với bạn?<br />Монгол: Энэ хичээл дээр танд хамгийн их хэрэг болсон агуулга эсвэл дадлага юу байсан бэ?<br />မြန်မာ: ဒီသင်ခန်းစာမှာ ဘယ်အကြောင်းအရာ သို့မဟုတ် လက်တွေ့လေ့ကျင့်ခန်းက သင့်အတွက် အကျိုးအရှိဆုံး ဖြစ်ခဲ့သလဲ။</p><textarea id="helpful" required aria-invalid={section02Attempted && helpfulCharacters < minimumCharacters} aria-describedby="helpful-count" maxLength={2000} value={helpful} onChange={(e) => setHelpful(e.target.value)} placeholder="예: 데이터에서 특징을 찾고 그래프를 선택했던 실습이 도움이 되었어요." /><p id="helpful-count" className={`sentence-count ${helpfulCharacters >= minimumCharacters ? "met" : ""}`} aria-live="polite">{helpfulCharacters} / {minimumCharacters}자 · 공백 포함 {minimumCharacters}자 이상</p></div>
        <div className="textarea-wrap"><label htmlFor="improve">앞으로 수업에서 개선되거나 추가되었으면 하는 점은 무엇인가?<span className="required">필수</span></label><p className="question-translation">English: What would you like to improve or add to future classes?<br />Tiếng Việt: Bạn muốn cải thiện hoặc bổ sung điều gì cho các buổi học sau?<br />Монгол: Цаашдын хичээлд юуг сайжруулах эсвэл нэмэхийг хүсэж байна вэ?<br />မြန်မာ: နောက်လာမည့် သင်ခန်းစာများတွင် ဘာကို ပိုမိုကောင်းမွန်စေချင်သလဲ သို့မဟုတ် ဘာကို ထပ်ထည့်စေချင်သလဲ။</p><textarea id="improve" required aria-invalid={section02Attempted && improveCharacters < minimumCharacters} aria-describedby="improve-count" maxLength={2000} value={improve} onChange={(e) => setImprove(e.target.value)} placeholder="예: 한국어 용어 설명을 조금 더 천천히 해 주면 좋겠어요." /><p id="improve-count" className={`sentence-count ${improveCharacters >= minimumCharacters ? "met" : ""}`} aria-live="polite">{improveCharacters} / {minimumCharacters}자 · 공백 포함 {minimumCharacters}자 이상</p></div>
      </section>
      <section className="section" aria-labelledby="additional-title"><div className="section-head"><span className="num">03</span><div><h2 id="additional-title">추가 의견을 남겨 주세요</h2><p>이름과 의견은 모두 선택 항목입니다.</p></div></div>
        <div className="input-wrap"><label htmlFor="name">이름<span className="optional">선택</span></label><input id="name" type="text" maxLength={80} autoComplete="off" value={name} onChange={(e) => setName(e.target.value)} placeholder="이름을 입력하지 않아도 됩니다." /></div>
        <div className="textarea-wrap"><label htmlFor="additional">설문하면서 어려웠던 문제나 개선하고 싶은 것이 있다면 적어주세요.<span className="optional">선택</span></label><textarea id="additional" maxLength={2000} value={additional} onChange={(e) => setAdditional(e.target.value)} placeholder="설문을 진행하며 불편했던 점이나 바라는 점을 자유롭게 적어 주세요." /></div>
      </section>
      <div className="actions"><p className="consent">이름은 선택 항목입니다. 이름을 입력하면 이름과 응답이 함께 저장됩니다. 이름을 비워 두면 이름 없이 저장되며, 응답은 강의 성적에 영향을 주지 않습니다.</p><button className="submit" type="submit" disabled={busy}>{busy ? "제출 중…" : <>설문 제출하기 <span aria-hidden="true">→</span></>}</button></div>
      {status && <div className={`status show ${status.kind}`} role="status" aria-live="polite">{status.message}</div>}
    </main>
    <aside className="side" aria-label="설문 진행 상황"><h2>진행 상황</h2><div className="progress-label"><span>{answered} / 8 문항</span><span>{Math.round(answered / 8 * 100)}%</span></div><div className="track" role="progressbar" aria-label="객관식 응답 진행률" aria-valuemin={0} aria-valuemax={8} aria-valuenow={answered}><div className="bar" style={{ width: `${answered / 8 * 100}%` }} /></div><p className="side-note">객관식 8문항과 02번 서술 문항을 모두 작성해야 제출할 수 있습니다. 03번은 선택입니다.</p></aside>
    </div>
  </form>;
}
