# Design Patterns — 23 mẫu GoF

Khoá học tương tác bằng Next.js 16 + TypeScript. Giao diện theo phong cách _lesson player_
(lấy cảm hứng từ designed-to-scale.vercel.app): cây khoá học bên trái, sân khấu sơ đồ ở giữa,
panel kể chuyện từng bước bên phải, stepper "Trong bài này" ở dưới.

Mỗi mẫu là một bài học:

1. **Vấn đề** — ví von đời thường + ý định
2. **Cấu trúc** — sơ đồ lớp UML (6 loại quan hệ)
3. **Luồng chạy** — sơ đồ tuần tự **động**: từng thông điệp được phát theo bước, có token chạy dọc mũi tên
4. **Code** — TypeScript và Java cho cùng kịch bản, kèm output thật
5. **Tổng kết** — ưu/nhược, mẫu liên quan

```bash
npm install
npm run dev               # http://localhost:3000
npm run verify:examples   # (tuỳ chọn) chạy lại 23 ví dụ TS + Java, so với output đã lưu
```

Phím tắt trong bài học: `←` `→` chuyển bước · `Space` tự chạy/tạm dừng · `R` phát lại · `Home`/`End` ·
`⌘K` tìm kiếm (không dấu cũng được). Deep-link một bước: `/patterns/observer?step=5`.

## Docker

```bash
docker compose up -d --build              # production → http://localhost:3000
PORT=8080 docker compose up -d --build    # đổi cổng
docker compose --profile dev up dev       # dev có hot reload → http://localhost:3001
docker compose down
```

- `Dockerfile` build 3 tầng (deps → builder → runner) với `output: "standalone"`. Image chạy bằng
  user `nextjs` (uid 1001), không phải root, và có `HEALTHCHECK`.
- Service `web` được siết bảo mật: filesystem chỉ đọc (chỉ `.next/cache` và
  `.next/server/route-cache` là tmpfs ghi được), `cap_drop: ALL`, `no-new-privileges`.
- `src/proxy.ts` trả HTTP 404 thật cho slug không tồn tại (trang bài học stream nên mặc định luôn là 200).

## Dữ liệu

Toàn bộ dữ liệu là **hằng số trong mã nguồn — không gọi API**, mọi trang được prerender tĩnh:

```
src/data/
  creational.ts, structural.ts, behavioral.ts   nội dung + toạ độ sơ đồ lớp
  sequences.ts                                  kịch bản sơ đồ tuần tự (4–6 bước/mẫu)
  code/<slug>.ts                                code TS + Java + output đã chạy thật
```

Tiến độ học (bài đã xong) lưu trong `localStorage` của từng trình duyệt.

## Thành phần chính

- `components/LessonPlayer.tsx` — điều khiển bài học (bước, tự chạy bằng một chuỗi `setTimeout`,
  dừng khi tab ẩn, tôn trọng `prefers-reduced-motion`, live region cho trình đọc màn hình)
- `components/UmlDiagram.tsx` — vẽ sơ đồ lớp SVG, định tuyến đường vuông góc bo góc
- `components/SequenceDiagram.tsx` — vẽ sơ đồ tuần tự SVG: lifeline, call/return/async/create,
  self-message, fragment `loop`/`opt`; trạng thái đã chạy / đang chạy / chưa chạy
