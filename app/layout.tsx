import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI 데이터 시각화 강의평가",
  description: "AI 데이터 시각화 수업의 이해도, 실습 효과, 강의 운영에 관한 익명 설문입니다.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko"><body>{children}</body></html>;
}
