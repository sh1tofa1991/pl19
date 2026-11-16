# Polymarket: подозрительные ставки на киберспорт

Дашборд, который отслеживает матчи CS2 / Dota 2 на Polymarket, тянет сделки
(Data API), считает «сигналы» по потоку денег и ищет кошельки с подозрительно
высоким винрейтом.

## Быстрый старт

```bash
npm install
npm run dev
```

Больше ничего настраивать не нужно: если `DATABASE_URL` не задан, скрипт
`scripts/db.mjs` сам поднимает встроенный Postgres в `./.pgdata` (порт 5433),
создаёт базу `app_db` и накатывает схему (`drizzle-kit push`).

## Внешняя база данных (по желанию)

Если у тебя уже есть Postgres — создай `.env` (см. `.env.example`):

```bash
DATABASE_URL=postgresql://user:pass@host:5432/dbname
```

Схему накатывает командой:

```bash
npm run db:push
```

## Команды

| Команда              | Что делает                                        |
| -------------------- | ------------------------------------------------- |
| `npm run dev`        | dev-сервер + автоматический Postgres              |
| `npm run build`      | production-сборка (нужен доступный Postgres/env)  |
| `npm run db:push`    | накатывает схему из `src/db/schema.ts`            |
| `npm run db:studio`  | Drizzle Studio для просмотра данных               |
| `npm run typecheck`  | проверка типов TypeScript                         |

## Источники данных

Синхронизация (`src/lib/sync.ts`) ходит в публичные API Polymarket:

- `gamma-api.polymarket.com` — события и рынки (серии CS2 / Dota 2);
- `data-api.polymarket.com` — сделки и холдеры.

Синхронизация запускается в фоне при обращении к API и автоматически
повторяется; статус и последняя ошибка видны в ответе `/api/matches`
(блок `sync`) и на главной странице.
