import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Weather Desk | 기상 관제 대시보드",
  description: "기상청 AWS 관측자료, 전국 기상특보, HSR 강수 레이더를 한 화면에서 확인하는 개인 기상 대시보드",
  other: { "codex-preview": "development" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko"><body>{children}</body></html>;
}
