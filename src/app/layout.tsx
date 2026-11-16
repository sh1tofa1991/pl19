import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Suspense } from "react";
import "./globals.css";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "Esports Fix Monitor — аномальные ставки на Polymarket (CS2 / Dota 2)",
  description:
    "Мониторинг аномальных денежных потоков и кошельков на Polymarket по матчам CS2 и Dota 2: скоринг подозрительных ставок, история сигналов, анализ кошельков.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru">
      <body className="min-h-screen bg-[#0a0a10] text-slate-200 antialiased">
        <Suspense fallback={<div className="h-14 border-b border-[#23232f]" />}>
          <Header />
        </Suspense>
        <main className="mx-auto max-w-[1500px] px-4 py-4">{children}</main>
        <footer className="mx-auto max-w-[1500px] px-4 pb-6 text-[11px] text-slate-500">
          Высокий скор означает концентрированные односторонние деньги, а не доказательство договорного матча. Данные: Polymarket Gamma/Data API. Обновление каждые 5–6 с.
        </footer>
      </body>
    </html>
  );
}
