import { NextResponse } from "next/server";

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
      const msg = e instanceof Error ? e.message : String(e);
      const isDb = /ECONNREFUSED|ENOTFOUND|ETIMEDOUT|ECONNRESET|EPIPE|connection|password|authentication|57P|does not exist|terminated|timeout/i.test(
        msg,
      );
      console.error(`[api] ${isDb ? "база данных недоступна" : "ошибка запроса"}: ${msg}`);
      return NextResponse.json({ error: isDb ? "database_unavailable" : "server_error" }, { status: isDb ? 503 : 500 });
    }
  };
}
