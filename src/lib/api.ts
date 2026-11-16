import { NextResponse } from "next/server";

/**
 * Достаёт настоящую причину ошибки: drizzle оборачивает ошибку БД в
 * «Failed query: …» и прячет реальную причину в `cause` (например,
 * «character … has no equivalent in encoding "WIN1251"»).
 */
export function errText(e: unknown): string {
  const cause = (e as { cause?: unknown } | null)?.cause;
  const msg = cause instanceof Error && cause.message ? cause.message : e instanceof Error ? e.message : String(e);
  return msg.length > 300 ? `${msg.slice(0, 300)}…` : msg;
}

/**
 * Оборачивает handler API-роута: любая ошибка (включая недоступную базу)
 * превращается в аккуратный JSON со статусом 5xx вместо необработанного
 * исключения на каждый запрос.
 */
export function guard<A extends unknown[]>(fn: (...args: A) => Promise<Response>) {
  return async (...args: A): Promise<Response> => {
    try {
      return await fn(...args);
    } catch (e) {
      const msg = errText(e);
      const isDb = /ECONNREFUSED|ENOTFOUND|ETIMEDOUT|ECONNRESET|EPIPE|connection|password|authentication|57P|does not exist|terminated|timeout|encoding/i.test(
        msg,
      );
      console.error(`[api] ${isDb ? "база данных недоступна" : "ошибка запроса"}: ${msg}`);
      return NextResponse.json({ error: isDb ? "database_unavailable" : "server_error" }, { status: isDb ? 503 : 500 });
    }
  };
}
