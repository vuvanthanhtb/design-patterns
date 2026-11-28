# Học trực quan — Design Patterns & Machine Learning

Ba khoá học tương tác bằng sơ đồ động:

| #   | Khoá                                    | Bài | Ngôn ngữ                      | Biểu đồ động                                                   |
| --- | --------------------------------------- | --- | ----------------------------- | -------------------------------------------------------------- |
| 01  | `/patterns` — Design Patterns           | 23  | TypeScript, Java              | Sơ đồ lớp UML + sơ đồ tuần tự chạy từng thông điệp             |
| 02  | `/architecture` — Architecture Patterns | 14  | TypeScript, Java              | Sơ đồ hệ thống: request, sự kiện, lỗi chạy qua từng thành phần |
| 03  | `/ml` — Machine Learning cơ bản         | 11  | Python (NumPy + scikit-learn) | Mô phỏng huấn luyện: đường hồi quy, vùng quyết định, cụm       |

Mọi sơ đồ có bản 2D (mặc định) và bản 3D (sa bàn isometric hoặc WebGL) bật bằng công tắc trên sân khấu.
Nút **phóng to** (phím `F`, `Esc` để thoát) ẩn sidebar và cột lời giải để hình minh hoạ chiếm toàn bộ chiều rộng.

## Khoá Architecture Patterns

Cấu trúc ứng dụng: Layered · MVC · Hexagonal · Clean Architecture.
Hệ phân tán: Microservices · API Gateway · Event-Driven · Service Mesh / Sidecar · Serverless.
Dữ liệu & vận hành: CQRS · Event Sourcing · Saga · Circuit Breaker · Strangler Fig.

- Mỗi bài: Vấn đề → Cấu trúc → các bước **luồng chạy** (gói tin chạy dọc đường nối theo CSS Motion Path,
  màu theo loại: gọi / trả về / sự kiện / lỗi / bù trừ; huy hiệu trạng thái như `OPEN`, `v3`, `75% mới`) → Code → Tổng kết.
- Code TypeScript + Java mô phỏng mạng và đồng hồ trong một tiến trình, nên output luôn tất định.

```
src/data/arch/{app,distributed,data}.ts   nội dung + sơ đồ + luồng chạy của 14 bài
src/data/arch/code/*.ts                   code TS + Java + output đã chạy thật
src/components/arch/                      ArchDiagram (2D) · ArchIsometric (sa bàn 3D) · ArchLessonPlayer
```

## Chế độ 3D

- **Biểu đồ ML 3D** (Three.js / WebGL, `src/components/ml/Scene3D.tsx`) cho 9/11 bài: mặt phẳng 2D được nâng
  thành mặt cong có độ cao là đầu ra của mô hình — mặt mất mát MSE(w, b) với viên bi Gradient Descent, tấm xác suất
  sigmoid, hai đồi Gauss của Naive Bayes, mặt bậc thang của cây/rừng, mặt phẳng quyết định SVM với hai tấm lề ±1,
  mặt yên ngựa của MLP trên XOR. Kéo để xoay, cuộn để phóng to; mỗi khung 3D khớp 1:1 với khung 2D
  và được tính sẵn lúc build (`src/lib/ml/viz3d.ts`).
- **Sa bàn UML isometric** (CSS 3D, `src/components/UmlIsometric.tsx`): mỗi lớp là một khối nổi trên sàn,
  quan hệ vẽ dưới sàn, lớp trọng tâm được nâng cao.
- Công tắc **2D / 3D** trên sân khấu. Mặc định luôn là 2D khi vào bài.
- Three.js (~520 KB) chỉ tải khi biểu đồ 3D xuất hiện lần đầu; trình duyệt không có WebGL tự dùng bản 2D.
  `prefers-reduced-motion` tắt nội suy và tự xoay.

## Khoá Machine Learning

Gradient Descent · Linear Regression · Logistic Regression · k-NN · Naive Bayes · Decision Tree ·
Random Forest · SVM · Perceptron & MLP · K-Means · PCA.

Mỗi bài: Vấn đề → Ý tưởng & công thức → **mô phỏng từng khung** → code Python → tổng kết.

- Code Python cài đặt từ đầu bằng NumPy rồi đối chiếu scikit-learn; output là kết quả chạy thật.
- Biểu đồ động được tính **lúc build** bằng bản TypeScript của từng thuật toán (`src/lib/ml/algorithms.ts`),
  viết theo đúng thứ tự phép tính của code NumPy nên ra cùng con số (w, b, loss, Gini, inertia…).
  Mọi nguồn ngẫu nhiên (bootstrap của Random Forest, trọng số khởi tạo MLP) được ghi cứng ở cả hai phía.
- Trình duyệt chỉ nhận khung hình đã tính sẵn; chuyển động bằng CSS transition (`transform`, `fill`).

```
src/lib/ml/datasets.ts     tập dữ liệu nhỏ, ghi cứng (dùng chung cho Python và biểu đồ)
src/lib/ml/algorithms.ts   11 thuật toán bằng TypeScript
src/lib/ml/viz.ts          dựng khung hình cho từng bài
src/data/ml/lessons.ts     nội dung bài học
src/data/ml/code/*.ts      code Python + output đã chạy thật
src/components/ml/         Plot (biểu đồ động) + MlLessonPlayer
```

---

# Khoá Design Patterns — 23 mẫu GoF

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
npm run verify:examples   # (tuỳ chọn) chạy lại 37 ví dụ TS + Java và 11 ví dụ Python, so với output đã lưu
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

## SEO

Đặt domain thật **lúc build** (các trang được prerender tĩnh nên URL tuyệt đối được ghi vào HTML khi build):

```bash
SITE_URL=https://your-domain.com npm run build
SITE_URL=https://your-domain.com docker compose up -d --build
```

- `src/lib/site.ts` là nguồn duy nhất: `pageMetadata()` sinh title, description, canonical, Open Graph và Twitter
  **đồng bộ** cho mọi trang; `fitTitle()` giữ title ≤ 65 ký tự, `fitDescription()` giữ description ≤ 160 ký tự.
  Ngày cập nhật nội dung ở `SITE.updated` (dùng cho sitemap `lastmod` và `dateModified`).
- Ảnh chia sẻ 1200×630 sinh bằng code cho trang chủ, 3 trang tổng quan, 3 cheatsheet và từng bài
  (48 ảnh `/<khoá>/<slug>/og.png`, render sẵn lúc build, mỗi ảnh có `og:image:alt` riêng),
  font JetBrains Mono có dấu tiếng Việt nằm trong `src/assets/fonts` (giấy phép OFL).
- `sitemap.xml` (55 URL, có `lastmod` và ảnh), `robots.txt`, `manifest.webmanifest`, `icon.svg`.
- JSON-LD schema.org: `WebSite` + `Organization` + danh sách khoá (trang chủ), `Course` với `provider` là
  Organization (3 trang tổng quan), `ItemList` (cheatsheet), `LearningResource` (từng bài) — mọi trang con đều có
  `BreadcrumbList`; mỗi bài thêm `SoftwareSourceCode` cho code TypeScript / Java / Python.
- `hreflang` vi-VN và x-default trên mọi trang.

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
