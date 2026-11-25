import AdminCharts from "./charts";
import AdminControls from "./admin-controls";

export type AdminResponse = {
  id: number;
  name: string | null;
  ratings: number[];
  helpful: string;
  improve: string;
  additional: string;
  createdAt: string;
};

const questions = [
  "교수자의 설명은 이해하기 쉬웠다.",
  "수업 진행 속도는 학습하기에 적절했다.",
  "한국어와 디자인 용어를 이해할 수 있었다.",
  "수업자료와 실습 예제가 도움이 되었다.",
  "AI 도구 활용 능력이 향상되었다.",
  "데이터의 중요한 특징을 발견하는 능력이 향상되었다.",
  "그래프와 디자인으로 표현하는 능력이 향상되었다.",
  "교수자 피드백이 과제 개선에 도움이 되었다.",
];

function summarize(responses: AdminResponse[], index: number) {
  const values = responses.map((response) => response.ratings[index]).filter((value) => value >= 1 && value <= 5);
  const distribution = [1, 2, 3, 4, 5].map((rating) => values.filter((value) => value === rating).length);
  return {
    count: values.length,
    average: values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0,
    distribution,
  };
}

function averageFor(responses: AdminResponse[], indexes: number[]) {
  const values = indexes.flatMap((index) => responses.map((response) => response.ratings[index]))
    .filter((value) => value >= 1 && value <= 5);
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
}

function displayDate(value: string) {
  const normalized = value.includes("T") ? value : `${value.replace(" ", "T")}Z`;
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("ko-KR", { dateStyle: "medium" }).format(date);
}

export default function AdminDashboard({ totalResponses, responses }: { totalResponses: number; responses: AdminResponse[] }) {
  const overall = averageFor(responses, [0, 1, 2, 3, 4, 5, 6, 7]);
  const learning = averageFor(responses, [4, 5, 6]);
  const teaching = averageFor(responses, [0, 1, 2, 3, 7]);
  const lowItems = questions.map((question, index) => ({ question, index, ...summarize(responses, index) }))
    .filter((item) => item.count && item.average < 3.5)
    .sort((a, b) => a.average - b.average);
  const comments = [
    { title: "도움이 된 내용", field: "helpful" as const },
    { title: "개선 제안", field: "improve" as const },
    { title: "어려움과 추가 의견", field: "additional" as const },
  ];

  return <main className="admin-page">
    <header className="admin-header"><div><span className="admin-eyebrow">AI DATA VISUALIZATION · ADMIN</span><h1>강의평가 대시보드</h1><p>학생 응답을 바탕으로 교육 성과와 개선이 필요한 지점을 확인합니다.</p></div><div className="admin-header-actions"><AdminControls /><a className="admin-back" href="/">설문 보기 ↗</a></div></header>

    <section className="admin-summary" aria-label="핵심 지표">
      <article className="admin-summary-card"><span>총 응답</span><strong>{totalResponses.toLocaleString("ko-KR")}</strong><small>건</small></article>
      <article className="admin-summary-card"><span>전체 평균</span><strong>{overall ? overall.toFixed(2) : "—"}</strong><small>/ 5점</small></article>
      <article className="admin-summary-card"><span>학습 성과 평균</span><strong>{learning ? learning.toFixed(2) : "—"}</strong><small>AI · 데이터 · 시각화</small></article>
      <article className="admin-summary-card"><span>수업 운영 평균</span><strong>{teaching ? teaching.toFixed(2) : "—"}</strong><small>설명 · 속도 · 자료 · 피드백</small></article>
    </section>

    {totalResponses > responses.length && <p className="admin-sample-note">문항별 분석과 의견은 최근 {responses.length}건 기준입니다.</p>}
    <AdminCharts responses={responses} />

    <section className="admin-panel admin-issues"><div className="admin-panel-heading"><div><span className="admin-eyebrow">AREAS TO REVIEW</span><h2>개선 우선 항목</h2></div><p>평균 3.5점 미만 문항을 우선 확인합니다.</p></div>
      {lowItems.length ? <div className="admin-low-list">{lowItems.map((item) => <div className="admin-low-item" key={item.index}><span>{String(item.index + 1).padStart(2, "0")}. {item.question}</span><strong>{item.average.toFixed(2)}<small>/ 5</small></strong></div>)}</div> : <p className="admin-empty">{totalResponses ? "현재 평균 3.5점 미만인 문항이 없습니다." : "응답이 쌓이면 낮은 평가 항목이 여기에 표시됩니다."}</p>}
    </section>

    <section className="admin-panel admin-comments"><div className="admin-panel-heading"><div><span className="admin-eyebrow">STUDENT VOICE</span><h2>주관식 의견</h2></div><p>이름을 입력한 응답은 관리자에게만 표시됩니다.</p></div>
      <div className="admin-comment-grid">{comments.map((group) => {
        const entries = responses.filter((response) => response[group.field].trim());
        return <article className="admin-comment-group" key={group.field}><h3>{group.title}<span>{entries.length}</span></h3>
          {entries.length ? <ul>{entries.map((response) => <li key={`${group.field}-${response.id}`}><div className="admin-comment-meta"><strong>{response.name?.trim() || "이름 미입력"}</strong><time>{displayDate(response.createdAt)}</time></div><p>{response[group.field]}</p></li>)}</ul> : <p className="admin-empty">아직 등록된 의견이 없습니다.</p>}
        </article>;
      })}</div>
    </section>
    <footer className="admin-footer">최근 응답 {responses.length.toLocaleString("ko-KR")}건 · 응답 데이터는 관리자에게만 표시됩니다.</footer>
  </main>;
}
