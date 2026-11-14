import SurveyForm from "./survey-form";

export default function Home() {
  return (
    <div className="page-shell">
      <header className="topline"><div className="brand"><span className="brand-mark" aria-hidden="true">↗</span><span>AI 데이터 시각화</span></div><div className="secure"><span aria-hidden="true">◉</span> 이름 선택 입력 · 약 3분</div></header>
      <section className="hero" aria-labelledby="title"><div className="eyebrow"><i /> COURSE FEEDBACK</div><h1 id="title">함께 만든 수업,<br />더 나은 다음 수업으로</h1><p className="intro">수업에서 경험한 이해도와 실습, 강의 운영에 대한 의견을 들려주세요. 여러분의 응답은 다음 수업을 개선하는 데 활용됩니다.</p><div className="privacy"><span className="pill">정답 없음</span><span className="pill">이름 선택 입력</span><span className="pill">성적과 무관</span></div></section>
      <SurveyForm />
      <footer className="foot">보내주신 의견은 향후 강의 내용과 실습 방식 개선에 활용합니다.</footer>
    </div>
  );
}
