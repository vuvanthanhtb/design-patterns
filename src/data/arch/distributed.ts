/**
 * Copyright (c) 2026 vuvanthanhtb
 * SPDX-License-Identifier: MIT
 */

import type { ArchLesson } from "@/lib/arch/types";
import { E, ev, fail, N, req, res } from "./helpers";

export const distributedLessons: ArchLesson[] = [
  {
    slug: "microservices",
    name: "Microservices",
    viName: "Kiến trúc vi dịch vụ",
    group: "distributed",
    intent:
      "Chia hệ thống thành nhiều service nhỏ, triển khai độc lập, mỗi service sở hữu dữ liệu riêng và giao tiếp qua API.",
    analogy:
      "Khu ẩm thực thay vì một bếp lớn: mỗi quầy (phở, cà phê, bánh) có bếp, kho và nhân viên riêng. Một quầy đóng cửa, các quầy khác vẫn bán.",
    problem:
      "Monolith lớn: mọi đội sửa chung một codebase, triển khai một lần cho tất cả, một module chậm kéo sập cả hệ thống, không thể mở rộng riêng phần chịu tải cao.",
    solution:
      "Tách theo năng lực nghiệp vụ (bounded context): `order`, `inventory`, `payment`. Mỗi service có CSDL riêng — không service nào đọc thẳng bảng của service khác — và chỉ giao tiếp qua API hoặc sự kiện.",
    participants: [
      {
        name: "Order service",
        role: "Điều phối đặt hàng, CSDL đơn hàng riêng.",
      },
      { name: "Inventory service", role: "Quản lý tồn kho, CSDL riêng." },
      { name: "Payment service", role: "Thu tiền, sổ cái riêng." },
    ],
    whenToUse: [
      "Hệ thống lớn, nhiều đội cần triển khai độc lập.",
      "Các phần có yêu cầu mở rộng / công nghệ khác nhau.",
    ],
    pros: [
      "Triển khai, mở rộng độc lập từng service.",
      "Cô lập lỗi.",
      "Mỗi đội tự chủ công nghệ và lịch phát hành.",
    ],
    cons: [
      "Độ phức tạp vận hành cao: mạng, giám sát, tracing.",
      "Giao dịch xuyên service khó (cần Saga).",
      "Chi phí lớn với hệ thống nhỏ — thường nên bắt đầu bằng monolith tốt.",
    ],
    related: ["api-gateway", "event-driven", "saga", "service-mesh"],
    diagram: {
      width: 880,
      height: 440,
      zones: [
        { id: "zo", label: "Order service", x: 225, y: 150, w: 200, h: 270 },
        { id: "zi", label: "Inventory service", x: 480, y: 20, w: 380, h: 110 },
        { id: "zp", label: "Payment service", x: 480, y: 310, w: 380, h: 110 },
      ],
      nodes: [
        N("client", "Client", "client", 20, 192, { w: 140 }),
        N("order", "order-svc", "service", 250, 192, { focal: true }),
        N("orderDb", "orders DB", "db", 250, 340),
        N("inv", "inventory-svc", "service", 500, 52),
        N("invDb", "stock DB", "db", 700, 52, { w: 140 }),
        N("pay", "payment-svc", "service", 500, 342),
        N("payDb", "ledger DB", "db", 700, 342, { w: 140 }),
      ],
      edges: [
        E("e1", "client", "order"),
        E("e2", "order", "inv", "sync", { via: 455 }),
        E("e3", "order", "pay", "sync", { via: 455 }),
        E("e4", "order", "orderDb", "data"),
        E("e5", "inv", "invDb", "data"),
        E("e6", "pay", "payDb", "data"),
      ],
    },
    flow: [
      {
        title: "Một request, nhiều service",
        text: "Client gọi order-svc; order-svc điều phối các service khác qua API.",
        hops: [req("e1", "POST /orders SKU-1")],
      },
      {
        title: "Giữ hàng",
        text: "Order không đọc bảng tồn kho — nó hỏi inventory-svc, và chỉ inventory chạm vào CSDL của mình.",
        hops: [req("e2", "reserve(SKU-1)"), req("e5", "UPDATE stock")],
      },
      {
        title: "Thu tiền",
        text: "Payment có sổ cái riêng.",
        hops: [
          req("e3", "charge(150k)"),
          req("e6", "INSERT ledger"),
          res("e3", "TX-1"),
        ],
      },
      {
        title: "Lưu đơn",
        text: "Mỗi service chỉ lưu phần dữ liệu thuộc về nó.",
        hops: [req("e4", "INSERT order"), res("e1", "201 đơn #1")],
      },
      {
        title: "Lỗi được cô lập",
        text: "Hết hàng: inventory trả lỗi, order phản hồi 409 — payment không bị gọi.",
        hops: [
          req("e1", "POST /orders SKU-2"),
          req("e2", "reserve(SKU-2)"),
          fail("e2", "hết hàng", true),
          res("e1", "409"),
        ],
        badges: { inv: "SKU-2: 0" },
      },
    ],
  },
  {
    slug: "api-gateway",
    name: "API Gateway",
    viName: "Cổng API",
    group: "distributed",
    intent:
      "Đặt một điểm vào duy nhất trước các service: định tuyến, xác thực, giới hạn tần suất và gộp kết quả cho client.",
    analogy:
      "Quầy lễ tân khách sạn: khách không đi gõ cửa từng phòng ban. Lễ tân kiểm tra thẻ phòng, chuyển yêu cầu đúng nơi và trả lời gọn một lần.",
    problem:
      "Ứng dụng mobile phải gọi 3 service cho một màn hình, mỗi service tự làm xác thực, CORS, rate limit. Đổi địa chỉ service là phải phát hành lại app.",
    solution:
      "API Gateway nhận mọi request từ ngoài: kiểm tra token tập trung, chặn client vượt hạn mức, định tuyến tới service nội bộ và gộp (aggregate) nhiều phản hồi thành một.",
    participants: [
      {
        name: "API Gateway",
        role: "Điểm vào duy nhất: auth, rate limit, routing, aggregation.",
      },
      { name: "Web / Mobile", role: "Client — chỉ biết địa chỉ gateway." },
      {
        name: "user / order / product",
        role: "Service nội bộ, không lộ ra internet.",
      },
    ],
    whenToUse: [
      "Có nhiều service phía sau và nhiều loại client.",
      "Cần xử lý cross-cutting (auth, quota, logging) ở một chỗ.",
    ],
    pros: [
      "Client đơn giản, ít round-trip.",
      "Bảo mật & chính sách tập trung.",
      "Ẩn cấu trúc nội bộ, dễ tái cấu trúc service.",
    ],
    cons: [
      "Thêm một bước mạng.",
      "Có thể thành điểm nghẽn / điểm lỗi duy nhất nếu không nhân bản.",
      "Dễ bị nhồi logic nghiệp vụ.",
    ],
    related: ["microservices", "service-mesh", "strangler-fig"],
    diagram: {
      width: 880,
      height: 440,
      zones: [
        { id: "zn", label: "Mạng nội bộ", x: 600, y: 20, w: 260, h: 400 },
      ],
      nodes: [
        N("web", "Web app", "client", 20, 110, { w: 140 }),
        N("mobile", "Mobile app", "client", 20, 274, { w: 140 }),
        N("gw", "API Gateway", "gateway", 300, 192, {
          w: 170,
          focal: true,
          sub: "auth · quota · route",
        }),
        N("user", "user-svc", "service", 640, 60, { w: 180 }),
        N("order", "order-svc", "service", 640, 192, { w: 180 }),
        N("product", "product-svc", "service", 640, 324, { w: 180 }),
      ],
      edges: [
        E("e1", "web", "gw", "sync", { via: 230, toAt: 208 }),
        E("e2", "mobile", "gw", "sync", { via: 230, toAt: 232 }),
        E("e3", "gw", "user", "sync", { fromAt: 206, via: 540 }),
        E("e4", "gw", "order", "sync", { fromAt: 220, toAt: 220 }),
        E("e5", "gw", "product", "sync", { fromAt: 234, via: 540 }),
      ],
    },
    flow: [
      {
        title: "Một điểm vào",
        text: "App gọi gateway kèm token; gateway xác thực tập trung.",
        hops: [req("e2", "GET /home + token")],
        badges: { gw: "✓ JWT" },
      },
      {
        title: "Định tuyến & fan-out",
        text: "Một màn hình cần dữ liệu từ ba service — gateway gọi song song.",
        hops: [req("e3", "user"), req("e4", "orders"), req("e5", "products")],
        badges: { gw: "✓ JWT" },
      },
      {
        title: "Gộp kết quả",
        text: "Ba phản hồi được ghép thành một JSON.",
        hops: [res("e3", "{name}"), res("e4", "[2 đơn]"), res("e5", "[3 sp]")],
      },
      {
        title: "Một phản hồi cho client",
        text: "Client chỉ tốn một round-trip thay vì ba.",
        hops: [res("e2", "200 JSON gộp")],
      },
      {
        title: "Chặn từ cửa",
        text: "Request thiếu token bị trả về ngay — service nội bộ không phải xử lý.",
        hops: [req("e1", "GET /home"), fail("e1", "401", true)],
        badges: { gw: "✗ token" },
      },
      {
        title: "Giới hạn tần suất",
        text: "Web vượt hạn mức 2 request → 429, bảo vệ hệ thống phía sau.",
        hops: [req("e1", "GET /home (lần 3)"), fail("e1", "429", true)],
        badges: { gw: "web: 3/2" },
      },
    ],
  },
  {
    slug: "event-driven",
    name: "Event-Driven (Pub/Sub)",
    viName: "Kiến trúc hướng sự kiện",
    group: "distributed",
    intent:
      "Các thành phần giao tiếp bằng cách phát và đăng ký sự kiện qua broker, không gọi trực tiếp nhau.",
    analogy:
      "Bảng tin công ty: phòng kinh doanh dán thông báo “có đơn mới”. Kho, kế toán, CSKH tự đọc và tự làm phần việc của mình — kinh doanh không cần biết ai đọc.",
    problem:
      "Order service gọi lần lượt email, kho, thống kê… Thêm một bên quan tâm là phải sửa order; một bên chậm hoặc sập làm đặt hàng thất bại.",
    solution:
      "Order chỉ `publish` sự kiện `OrderPlaced` lên broker. Mỗi subscriber có hàng đợi riêng, xử lý bất đồng bộ. Broker lưu bền vững nên subscriber offline sẽ nhận lại khi quay về; subscriber mới có thể phát lại lịch sử.",
    participants: [
      {
        name: "Order service",
        role: "Publisher — phát sự kiện, không biết ai nghe.",
      },
      {
        name: "Message broker",
        role: "Lưu sự kiện, phân phối tới từng hàng đợi (Kafka, RabbitMQ…).",
      },
      { name: "email / inventory / analytics", role: "Subscriber độc lập." },
    ],
    whenToUse: [
      "Nhiều bên cần phản ứng với cùng một sự việc.",
      "Cần tách rời thời gian (bên nhận có thể chậm / offline).",
    ],
    pros: [
      "Ghép nối lỏng, dễ thêm subscriber.",
      "Chịu lỗi: sự kiện chờ trong hàng đợi.",
      "Mở rộng tốt, xử lý song song.",
    ],
    cons: [
      "Nhất quán cuối cùng (eventual consistency).",
      "Khó theo dõi luồng end-to-end, cần tracing.",
      "Phải xử lý trùng lặp / sai thứ tự sự kiện.",
    ],
    related: ["cqrs", "event-sourcing", "microservices", "saga"],
    diagram: {
      width: 880,
      height: 440,
      zones: [
        { id: "zs", label: "Subscribers", x: 620, y: 20, w: 240, h: 400 },
      ],
      nodes: [
        N("order", "order-svc", "service", 30, 192, { sub: "publisher" }),
        N("broker", "Message broker", "queue", 320, 192, {
          w: 170,
          focal: true,
          sub: "topic: orders",
        }),
        N("email", "email-svc", "service", 650, 52, { w: 180 }),
        N("inv", "inventory-svc", "service", 650, 192, { w: 180 }),
        N("ana", "analytics-svc", "service", 650, 332, { w: 180 }),
      ],
      edges: [
        E("e1", "order", "broker", "async"),
        E("e2", "broker", "email", "async", { fromAt: 206, via: 560 }),
        E("e3", "broker", "inv", "async", { fromAt: 220, toAt: 220 }),
        E("e4", "broker", "ana", "async", { fromAt: 234, via: 560 }),
      ],
    },
    flow: [
      {
        title: "Phát sự kiện",
        text: "Order chỉ nói “đã có đơn mới” rồi tiếp tục công việc — không chờ ai.",
        hops: [ev("e1", "OrderPlaced #1")],
        ghost: ["ana"],
      },
      {
        title: "Phân phối",
        text: "Broker giao sự kiện tới hàng đợi của từng subscriber.",
        hops: [ev("e2", "#1"), ev("e3", "#1")],
        ghost: ["ana"],
      },
      {
        title: "Subscriber offline",
        text: "Inventory đang bảo trì: sự kiện #2 nằm chờ trong hàng đợi — đặt hàng không hề bị ảnh hưởng.",
        hops: [ev("e1", "OrderPlaced #2"), ev("e2", "#2")],
        down: ["inv"],
        ghost: ["ana"],
        badges: { broker: "chờ: 1" },
      },
      {
        title: "Tự phục hồi",
        text: "Inventory quay lại và nhận đúng sự kiện bị lỡ.",
        hops: [ev("e3", "#2")],
        ghost: ["ana"],
      },
      {
        title: "Thêm subscriber mới",
        text: "Analytics đăng ký sau và phát lại toàn bộ lịch sử — không sửa một dòng code của order.",
        hops: [ev("e4", "replay #1, #2")],
        badges: { ana: "mới" },
      },
    ],
  },
  {
    slug: "service-mesh",
    name: "Service Mesh / Sidecar",
    viName: "Lưới dịch vụ",
    group: "distributed",
    intent:
      "Đưa các việc về mạng (retry, mTLS, timeout, metrics) ra khỏi code ứng dụng vào một proxy sidecar chạy cạnh mỗi service.",
    analogy:
      "Mỗi nhà ngoại giao có một thư ký riêng lo dịch thuật, bảo mật thư từ và ghi biên bản. Nhà ngoại giao chỉ tập trung vào nội dung đàm phán.",
    problem:
      "Mỗi service tự viết logic retry, mã hoá, đo lường — bằng nhiều ngôn ngữ, không đồng nhất. Thay đổi chính sách mạng phải sửa và triển khai lại mọi service.",
    solution:
      "Mỗi pod có một `sidecar proxy` (vd Envoy) chặn mọi lưu lượng vào/ra. `Control plane` đẩy cấu hình tập trung (retry, mTLS, định tuyến) xuống mọi sidecar. Ứng dụng chỉ gọi localhost như bình thường.",
    participants: [
      {
        name: "Control plane",
        role: "Cấu hình và cấp chứng chỉ cho mọi sidecar (Istio, Linkerd).",
      },
      {
        name: "Sidecar proxy",
        role: "Data plane — retry, mTLS, timeout, metrics.",
      },
      { name: "order-app, payment-app", role: "Ứng dụng chỉ chứa nghiệp vụ." },
      { name: "Telemetry", role: "Thu metrics, traces từ sidecar." },
    ],
    whenToUse: [
      "Nhiều service, nhiều ngôn ngữ, cần chính sách mạng đồng nhất.",
      "Yêu cầu zero-trust (mTLS) và quan sát chi tiết.",
    ],
    pros: [
      "Code ứng dụng gọn, không lặp logic mạng.",
      "Chính sách đồng nhất, đổi không cần deploy lại app.",
      "Quan sát và bảo mật mặc định.",
    ],
    cons: [
      "Thêm độ trễ và tài nguyên cho mỗi pod.",
      "Vận hành control plane phức tạp.",
      "Khó debug khi proxy hành xử sai.",
    ],
    related: ["microservices", "circuit-breaker", "api-gateway"],
    diagram: {
      width: 880,
      height: 440,
      zones: [
        { id: "za", label: "Pod order", x: 20, y: 150, w: 400, h: 130 },
        { id: "zb", label: "Pod payment", x: 460, y: 150, w: 400, h: 130 },
      ],
      nodes: [
        N("ctrl", "Control plane", "module", 330, 24, {
          w: 220,
          sub: "cấu hình · chứng chỉ",
        }),
        N("app", "order-app", "service", 40, 196),
        N("sa", "sidecar", "proxy", 245, 196, { focal: true, sub: "Envoy" }),
        N("sb", "sidecar", "proxy", 485, 196, { sub: "Envoy" }),
        N("pay", "payment-app", "service", 690, 196),
        N("tel", "Telemetry", "store", 330, 356, {
          w: 220,
          sub: "metrics · traces",
        }),
      ],
      edges: [
        E("e1", "ctrl", "sa", "control", { fromAt: 390, via: 130 }),
        E("e2", "ctrl", "sb", "control", { fromAt: 490, via: 130 }),
        E("e3", "app", "sa", "sync", { label: "localhost" }),
        E("e4", "sa", "sb", "sync", { label: "mTLS" }),
        E("e5", "sb", "pay", "sync"),
        E("e6", "sa", "tel", "control", { fromAt: 320, toAt: 400, via: 320 }),
        E("e7", "sb", "tel", "control", { fromAt: 560, toAt: 480, via: 320 }),
      ],
    },
    flow: [
      {
        title: "Cấu hình tập trung",
        text: "Control plane đẩy chính sách xuống mọi sidecar — không cần deploy lại ứng dụng.",
        hops: [req("e1", "retries=2, mTLS"), req("e2", "retries=2, mTLS")],
      },
      {
        title: "App gọi localhost",
        text: "Ứng dụng tưởng mình gọi HTTP bình thường; sidecar chặn lại.",
        hops: [req("e3", "http://payment")],
      },
      {
        title: "Lỗi mạng",
        text: "Lần gửi đầu bị rớt — sidecar tự thử lại, ứng dụng không hề biết.",
        hops: [fail("e4", "lần 1: lỗi")],
        badges: { sa: "retry 1/2" },
      },
      {
        title: "Thử lại có mã hoá",
        text: "Hai sidecar xác thực lẫn nhau bằng chứng chỉ mTLS.",
        hops: [req("e4", "lần 2 (mTLS)"), req("e5", "150000đ")],
        badges: { sa: "retry 1/2" },
      },
      {
        title: "Phản hồi + đo lường",
        text: "Kết quả trở về; sidecar gửi metrics, trace cho telemetry.",
        hops: [
          res("e5", "200"),
          res("e4", "200"),
          res("e3", "200 đã thu"),
          req("e6", "2 req, 1 retry"),
        ],
      },
    ],
  },
  {
    slug: "serverless",
    name: "Serverless (FaaS)",
    viName: "Kiến trúc phi máy chủ",
    group: "distributed",
    intent:
      "Viết logic thành các hàm nhỏ được nền tảng tự chạy khi có sự kiện, tự mở rộng và chỉ tính tiền theo lần thực thi.",
    analogy:
      "Gọi taxi thay vì mua xe: không lo bảo dưỡng, không tốn tiền khi không đi; nhưng đôi khi phải chờ xe tới (cold start).",
    problem:
      "Duy trì máy chủ chạy 24/7 cho những tác vụ chỉ xảy ra thỉnh thoảng (resize ảnh, webhook); phải tự lo mở rộng khi tải tăng đột biến.",
    solution:
      "Mỗi tác vụ là một hàm (λ) gắn với một trigger: HTTP, file upload, hàng đợi, lịch. Nền tảng tạo instance khi có sự kiện, scale theo tải và về 0 khi rảnh.",
    participants: [
      {
        name: "λ createOrder, λ resizeImage",
        role: "Hàm không trạng thái, chạy theo sự kiện.",
      },
      { name: "API Gateway", role: "Trigger HTTP." },
      { name: "S3 bucket", role: "Trigger sự kiện file." },
      {
        name: "DynamoDB, S3",
        role: "Dịch vụ lưu trữ được quản lý — trạng thái nằm ở đây.",
      },
    ],
    whenToUse: [
      "Tải không đều, nhiều thời gian rảnh.",
      "Tác vụ theo sự kiện: webhook, xử lý file, cron.",
    ],
    pros: [
      "Không quản lý máy chủ.",
      "Tự mở rộng, tính tiền theo lần chạy.",
      "Triển khai từng hàm nhanh.",
    ],
    cons: [
      "Cold start làm tăng độ trễ.",
      "Giới hạn thời gian chạy, khó với tác vụ dài.",
      "Phụ thuộc nhà cung cấp, khó chạy thử cục bộ.",
    ],
    related: ["event-driven", "api-gateway"],
    diagram: {
      width: 880,
      height: 400,
      zones: [
        {
          id: "zp",
          label: "Nền tảng serverless",
          x: 200,
          y: 20,
          w: 660,
          h: 360,
        },
      ],
      nodes: [
        N("client", "Client", "client", 20, 80, { w: 140 }),
        N("apigw", "API Gateway", "gateway", 225, 80, { w: 160 }),
        N("fn1", "λ createOrder", "function", 450, 80, { w: 170, focal: true }),
        N("db", "DynamoDB", "db", 690, 80, { w: 150 }),
        N("bucket", "S3 uploads", "store", 225, 270, { w: 160 }),
        N("fn2", "λ resizeImage", "function", 450, 270, { w: 170 }),
        N("out", "S3 thumbs", "store", 690, 270, { w: 150 }),
      ],
      edges: [
        E("e1", "client", "apigw"),
        E("e2", "apigw", "fn1"),
        E("e3", "fn1", "db", "data"),
        E("e4", "bucket", "fn2", "async", { label: "ObjectCreated" }),
        E("e5", "fn2", "out", "data"),
      ],
    },
    flow: [
      {
        title: "Request đầu tiên",
        text: "Chưa có instance nào: nền tảng khởi tạo hàm — cold start.",
        hops: [req("e1", "POST /orders"), req("e2", "invoke")],
        badges: { fn1: "cold 312ms" },
      },
      {
        title: "Hàm không trạng thái",
        text: "Dữ liệu được ghi vào dịch vụ lưu trữ; instance có thể biến mất bất cứ lúc nào.",
        hops: [req("e3", "put"), res("e2", "ok"), res("e1", "201 đơn #1")],
        badges: { fn1: "cold 312ms" },
      },
      {
        title: "Request kế tiếp",
        text: "Instance còn “ấm” nên chạy ngay.",
        hops: [
          req("e1", "POST /orders"),
          req("e2", "invoke"),
          req("e3", "put"),
        ],
        badges: { fn1: "warm 12ms" },
      },
      {
        title: "Trigger từ sự kiện",
        text: "Upload ảnh tự kích hoạt một hàm khác — không có server nào đứng chờ.",
        hops: [ev("e4", "ao.png"), req("e5", "thumbs/ao.png")],
        badges: { fn2: "cold 312ms" },
      },
      {
        title: "Về 0 khi rảnh",
        text: "Sau một giờ không có request, mọi instance bị thu hồi — không tốn tiền.",
        hops: [],
        badges: { fn1: "0 instance", fn2: "0 instance" },
      },
    ],
  },
];
