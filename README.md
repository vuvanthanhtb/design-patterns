# Học trực quan — Design Patterns, Kiến trúc & Machine Learning

Ba khoá học lập trình tương tác bằng **sơ đồ động**, viết bằng Next.js 16 + TypeScript.
Toàn bộ nội dung là dữ liệu ghi cứng trong mã nguồn (không gọi API), mọi trang được prerender tĩnh.

| #   | Khoá                                    | Bài | Ngôn ngữ code mẫu             | Biểu đồ động                                                   |
| --- | --------------------------------------- | --- | ----------------------------- | -------------------------------------------------------------- |
| 01  | `/patterns` — Design Patterns (GoF)     | 23  | TypeScript, Java              | Sơ đồ lớp UML + sơ đồ tuần tự chạy từng thông điệp             |
| 02  | `/architecture` — Architecture Patterns | 14  | TypeScript, Java              | Sơ đồ hệ thống: request, sự kiện, lỗi chạy qua từng thành phần |
| 03  | `/ml` — Machine Learning cơ bản         | 11  | Python (NumPy + scikit-learn) | Mô phỏng huấn luyện: đường hồi quy, vùng quyết định, cụm       |

Mỗi khoá có trang tổng quan (`/patterns`, `/architecture`, `/ml`) và trang cheatsheet tra cứu nhanh
(`/cheatsheet`, `/architecture/cheatsheet`, `/ml/cheatsheet`).

## Bắt đầu nhanh

Yêu cầu: Node.js ≥ 20.9 (khuyến nghị 24).

```bash
npm install
npm run dev               # http://localhost:3000
```

| Lệnh                      | Việc                                                                      |
| ------------------------- | ------------------------------------------------------------------------- |
| `npm run build` / `start` | Build production (119 trang tĩnh) và chạy                                 |
| `npm run lint`            | ESLint                                                                    |
| `npm run typecheck`       | Kiểm tra kiểu TypeScript                                                  |
| `npm run format`          | Định dạng toàn bộ mã nguồn bằng Prettier (`format:check` để chỉ kiểm tra) |
| `npm run verify:examples` | Chạy lại toàn bộ code mẫu và so với output đã lưu (xem bên dưới)          |

## Giao diện bài học

Phong cách _lesson player_ (lấy cảm hứng từ designed-to-scale.vercel.app), mặc định theme tối:
sidebar bên trái liệt kê 3 khoá học thành từng thẻ riêng, sân khấu sơ đồ ở giữa, panel kể chuyện
từng bước bên phải, stepper "Trong bài này" ở dưới.

- **2D / 3D**: mọi sơ đồ có bản 2D (mặc định mỗi khi vào bài) và bản 3D bật bằng công tắc trên sân khấu.
- **Phóng to**: nút ⤢ cạnh công tắc 2D/3D (phím `F`, `Esc` để thoát) ẩn sidebar, đưa cột lời giải
  xuống dưới để hình minh hoạ chiếm toàn bộ chiều rộng (cao hơn khoảng 45–90%).
- Sơ đồ UML và sơ đồ kiến trúc tự cắt lề trống hai bên để hình phóng to tối đa trong khung.
- Tiến độ học (bài đã xong) lưu trong `localStorage` của từng trình duyệt.
- Tôn trọng `prefers-reduced-motion`: tắt tự chạy, nội suy và tự xoay; có live region cho trình đọc màn hình.

Phím tắt: `←` `→` chuyển bước · `Space` tự chạy/tạm dừng · `R` phát lại · `Home` / `End` ·
`F` phóng to · `⌘K` tìm kiếm (gõ không dấu cũng được).
Deep-link tới một bước: `/patterns/observer?step=5`.

## Khoá 01 — Design Patterns (23 mẫu GoF)

Khởi tạo · Cấu trúc · Hành vi. Mỗi mẫu là một bài học:

1. **Vấn đề**: ví von đời thường và ý định của mẫu
2. **Cấu trúc**: sơ đồ lớp UML (6 loại quan hệ)
3. **Luồng chạy**: sơ đồ tuần tự **động**, từng thông điệp được phát theo bước, có token chạy dọc mũi tên
4. **Code**: TypeScript và Java cho cùng một kịch bản, kèm output thật
5. **Tổng kết**: ưu/nhược điểm, các mẫu liên quan

Bản 3D là **sa bàn UML isometric** (CSS 3D, không cần WebGL): mỗi lớp là một khối nổi trên sàn,
quan hệ vẽ dưới sàn, lớp trọng tâm được nâng cao; rê chuột lên khối để nhấc nó lên.

## Khoá 02 — Architecture Patterns (14 mẫu)

- Cấu trúc ứng dụng: Layered · MVC · Hexagonal · Clean Architecture.
- Hệ phân tán: Microservices · API Gateway · Event-Driven · Service Mesh / Sidecar · Serverless.
- Dữ liệu & vận hành: CQRS · Event Sourcing · Saga · Circuit Breaker · Strangler Fig.

Mỗi bài: Vấn đề → Cấu trúc → các bước **luồng chạy** → Code → Tổng kết.

- Gói tin chạy dọc đường nối theo CSS Motion Path, tô màu theo loại: gọi / trả về / sự kiện / lỗi / bù trừ.
  Thành phần có huy hiệu trạng thái như `OPEN`, `v3`, `75% mới`; thành phần sập hiện nhãn `✕ OFFLINE`.
- Code TypeScript + Java mô phỏng mạng và đồng hồ trong cùng một tiến trình, nên output luôn tất định.
- Bản 3D là sa bàn isometric: vùng, đường nối và gói tin nằm trên sàn; thành phần tham gia bước hiện tại
  được nhấc lên.

## Khoá 03 — Machine Learning cơ bản (11 bài)

Gradient Descent · Linear Regression · Logistic Regression · k-NN · Naive Bayes · Decision Tree ·
Random Forest · SVM · Perceptron & MLP · K-Means · PCA.

Mỗi bài: Vấn đề → Ý tưởng & công thức → **mô phỏng từng khung** → code Python → Tổng kết.

- Code Python cài đặt từ đầu bằng NumPy rồi đối chiếu với scikit-learn; output là kết quả chạy thật.
- Biểu đồ động được tính **lúc build** bằng bản TypeScript của từng thuật toán (`src/lib/ml/algorithms.ts`),
  viết theo đúng thứ tự phép tính của code NumPy nên ra cùng con số (w, b, loss, Gini, inertia…).
  Mọi nguồn ngẫu nhiên (bootstrap của Random Forest, trọng số khởi tạo MLP) được ghi cứng ở cả hai phía.
- Trình duyệt chỉ nhận khung hình đã tính sẵn; chuyển động bằng CSS transition (`transform`, `fill`).
- **Bản 3D** (Three.js / WebGL, `src/components/ml/Scene3D.tsx`) cho 9/11 bài: mặt phẳng 2D được nâng thành
  mặt cong có độ cao là đầu ra của mô hình. Ví dụ: mặt mất mát MSE(w, b) với viên bi Gradient Descent, tấm
  xác suất sigmoid, hai đồi Gauss của Naive Bayes, mặt bậc thang của cây/rừng, mặt phẳng quyết định SVM với
  hai tấm lề ±1, mặt yên ngựa của MLP trên XOR. Kéo để xoay, cuộn để phóng to. Mỗi khung 3D khớp 1:1 với
  khung 2D và được tính sẵn lúc build (`src/lib/ml/viz3d.ts`).
- Three.js (~520 KB) chỉ tải khi biểu đồ 3D xuất hiện lần đầu; trình duyệt không có WebGL tự dùng bản 2D.

## Kiểm chứng code mẫu

```bash
npm run verify:examples
```

Chạy lại 37 cặp ví dụ TypeScript + Java (23 Design Patterns + 14 Architecture) và 11 ví dụ Python,
rồi so với output đã lưu trong dữ liệu. Cần Node ≥ 22.18 (chạy trực tiếp file `.ts`), JDK ≥ 21 và
`python3` có `numpy` + `scikit-learn`; thiếu Java hoặc Python thì phần tương ứng được bỏ qua kèm cảnh báo.

## Cấu trúc mã nguồn

```
src/
  app/                              App Router: trang chủ, 3 khoá, cheatsheet, sitemap, robots, manifest
    <khoá>/[slug]/page.tsx          trang bài học (prerender bằng generateStaticParams)
    <khoá>/[slug]/og.png/route.tsx  ảnh chia sẻ của từng bài
  proxy.ts                          trả HTTP 404 thật cho slug không tồn tại
  data/
    creational.ts, structural.ts, behavioral.ts   Design Patterns: nội dung + toạ độ sơ đồ lớp
    sequences.ts                                  kịch bản sơ đồ tuần tự (4–6 bước/mẫu)
    code/<slug>.ts                                code TS + Java + output đã chạy thật
    arch/{app,distributed,data}.ts                Architecture: nội dung + sơ đồ + luồng chạy
    arch/code/<slug>.ts                           code TS + Java + output
    ml/lessons.ts, ml/code/<slug>.ts              Machine Learning: nội dung + code Python + output
    courses.ts                                    danh sách và thứ tự 3 khoá học
  lib/
    site.ts                         cấu hình SEO dùng chung (xem mục SEO)
    geometry.ts                     đo hộp UML, định tuyến đường vuông góc bo góc
    useLessonController.ts          điều khiển bước, tự chạy, phím tắt, deep-link, lưu tiến độ
    useWideStage.ts                 chế độ phóng to khung minh hoạ
    ml/{datasets,algorithms,viz,viz3d}.ts   dữ liệu, 11 thuật toán TS, dựng khung 2D/3D
  components/
    LessonPlayer.tsx, UmlDiagram.tsx, SequenceDiagram.tsx, UmlIsometric.tsx
    arch/   ArchDiagram (2D) · ArchIsometric (sa bàn 3D) · ArchLessonPlayer
    ml/     Plot (biểu đồ 2D) · Scene3D (WebGL) · MlLessonPlayer
scripts/verify-examples.mjs         chạy lại toàn bộ code mẫu
```

## Docker

```bash
docker compose up -d --build              # production → http://localhost:3000
PORT=8080 docker compose up -d --build    # đổi cổng
docker compose --profile dev up dev       # dev có hot reload → http://localhost:3001
docker compose down
```

- `Dockerfile` build 3 tầng (deps → builder → runner) trên `node:24-alpine` với `output: "standalone"`.
  Image chạy bằng user `nextjs` (uid 1001), không phải root, và có `HEALTHCHECK`.
- Service `web` được siết bảo mật: filesystem chỉ đọc (chỉ `.next/cache` và `.next/server/route-cache`
  là tmpfs ghi được), `cap_drop: ALL`, `no-new-privileges`.

## SEO

Đặt domain thật **lúc build**, vì các trang được prerender tĩnh nên URL tuyệt đối được ghi vào HTML khi build:

```bash
SITE_URL=https://your-domain.com npm run build
SITE_URL=https://your-domain.com docker compose up -d --build
```

- `src/lib/site.ts` là nguồn duy nhất: `pageMetadata()` sinh title, description, canonical, `hreflang`
  (vi-VN + x-default), Open Graph và Twitter **đồng bộ** cho mọi trang; `fitTitle()` giữ title ≤ 65 ký tự,
  `fitDescription()` giữ description ≤ 160 ký tự. Ngày cập nhật nội dung đặt ở `SITE.updated`
  (dùng cho `lastmod` của sitemap và `dateModified`).
- Ảnh chia sẻ 1200×630 sinh bằng code cho trang chủ, 3 trang tổng quan, 3 cheatsheet và từng bài
  (48 ảnh `/<khoá>/<slug>/og.png`, render sẵn lúc build, mỗi ảnh có `og:image:alt` riêng).
  Font JetBrains Mono có dấu tiếng Việt nằm trong `src/assets/fonts` (giấy phép OFL).
- `sitemap.xml` (55 URL, có `lastmod` và ảnh), `robots.txt`, `manifest.webmanifest`, `icon.svg`.
- JSON-LD schema.org:
  - Trang chủ: `WebSite` + `Organization` + danh sách khoá học.
  - 3 trang tổng quan: `Course` với `provider` là Organization.
  - Cheatsheet: `ItemList`.
  - Từng bài: `LearningResource` + `SoftwareSourceCode` cho code TypeScript / Java / Python.
  - Mọi trang con đều có `BreadcrumbList`.

## Giấy phép

MIT © vuvanthanhtb. Mỗi file mã nguồn có header `SPDX-License-Identifier: MIT`; xem [LICENSE](LICENSE).
