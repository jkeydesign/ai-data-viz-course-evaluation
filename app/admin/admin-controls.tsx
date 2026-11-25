"use client";

import { useState } from "react";

export default function AdminControls() {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function resetResponses() {
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/admin/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: "RESET_ALL_RESPONSES" }),
      });
      const result = await response.json().catch(() => null) as { error?: unknown } | null;
      if (!response.ok) {
        throw new Error(typeof result?.error === "string" ? result.error : "데이터를 초기화하지 못했습니다.");
      }
      window.location.reload();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "데이터를 초기화하지 못했습니다.");
      setBusy(false);
    }
  }

  return <>
    <div className="admin-controls">
      <button className="admin-refresh" type="button" onClick={() => window.location.reload()}>새로고침</button>
      <button className="admin-reset" type="button" onClick={() => { setError(""); setConfirmOpen(true); }}>모든 데이터 초기화</button>
    </div>
    {confirmOpen && <div className="admin-modal-backdrop" role="presentation">
      <section className="admin-confirm-modal" role="alertdialog" aria-modal="true" aria-labelledby="reset-title" aria-describedby="reset-description">
        <span className="admin-eyebrow">DATA RESET</span>
        <h2 id="reset-title">모든 응답 데이터를 초기화할까요?</h2>
        <p id="reset-description">저장된 응답을 모두 영구 삭제합니다. 테스트 응답과 실제 응답이 함께 삭제되며, 삭제 후에는 복구할 수 없습니다.</p>
        {error && <p className="admin-reset-error" role="alert">{error}</p>}
        <div className="admin-confirm-actions">
          <button type="button" className="admin-cancel" onClick={() => setConfirmOpen(false)} disabled={busy}>취소</button>
          <button type="button" className="admin-confirm-delete" onClick={resetResponses} disabled={busy}>{busy ? "초기화 중…" : "모든 응답 삭제"}</button>
        </div>
      </section>
    </div>}
  </>;
}
