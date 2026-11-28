/**
 * Copyright (c) 2026 vuvanthanhtb
 * SPDX-License-Identifier: MIT
 */

import type { ArchLesson } from "@/lib/arch/types";
import { comp, E, ev, fail, N, req, res } from "./helpers";

export const dataLessons: ArchLesson[] = [
  {
    slug: "cqrs",
    name: "CQRS",
    viName: "Tách lệnh và truy vấn",
    group: "data",
    intent:
      "Tách mô hình ghi (command) và mô hình đọc (query) thành hai phía riêng, mỗi phía tối ưu cho việc của nó.",
    analogy:
      "Thư viện: quầy nhận sách (ghi) kiểm tra kỹ và nhập kho chuẩn; bảng tra cứu (đọc) được in sẵn theo chủ đề để tìm nhanh, cập nhật sau khi nhập kho.",
    problem:
      "Một mô hình dữ liệu phải phục vụ cả ghi (cần chuẩn hoá, kiểm tra quy tắc) lẫn đọc (cần JOIN nhiều bảng cho dashboard). Truy vấn ngày càng chậm, còn mô hình ghi bị bẻ cong vì nhu cầu hiển thị.",
    solution:
      "Phía `command` nhận lệnh, kiểm tra quy tắc, ghi vào mô hình chuẩn hoá rồi phát sự kiện. `Projector` cập nhật các `read model` phi chuẩn hoá, sẵn sàng cho từng màn hình. Phía `query` chỉ đọc, không JOIN, không tính toán.",
    participants: [
      {
        name: "Command handler",
        role: "Nhận lệnh, kiểm tra quy tắc, ghi Write DB.",
      },
      { name: "Projector", role: "Nghe sự kiện, cập nhật read model." },
      { name: "Query handler", role: "Đọc read model đã tính sẵn." },
      {
        name: "Write DB / Read DB",
        role: "Có thể khác nhau cả công nghệ (SQL ↔ Elasticsearch).",
      },
    ],
    whenToUse: [
      "Tỉ lệ đọc/ghi chênh lệch lớn, cần mở rộng riêng.",
      "Màn hình đọc phức tạp khác xa mô hình nghiệp vụ.",
    ],
    pros: [
      "Tối ưu đọc và ghi độc lập.",
      "Read model đơn giản, nhanh.",
      "Mô hình ghi tập trung vào quy tắc.",
    ],
    cons: [
      "Nhất quán cuối cùng giữa hai phía.",
      "Nhiều thành phần hơn để vận hành.",
      "Quá mức với CRUD đơn giản.",
    ],
    related: ["event-sourcing", "event-driven"],
    diagram: {
      width: 880,
      height: 440,
      zones: [
        {
          id: "zc",
          label: "Phía ghi (command)",
          x: 220,
          y: 20,
          w: 440,
          h: 160,
        },
        { id: "zq", label: "Phía đọc (query)", x: 220, y: 260, w: 440, h: 160 },
      ],
      nodes: [
        N("client", "Client", "client", 20, 192, { w: 140 }),
        N("cmd", "Command handler", "service", 250, 72, {
          w: 170,
          focal: true,
        }),
        N("wdb", "Write DB", "db", 480, 72, { w: 150, sub: "chuẩn hoá" }),
        N("proj", "Projector", "function", 700, 192, { w: 150 }),
        N("qry", "Query handler", "service", 250, 312, { w: 170 }),
        N("rdb", "Read DB", "db", 480, 312, { w: 150, sub: "view sẵn" }),
      ],
      edges: [
        E("e1", "client", "cmd", "sync", {
          fromSide: "right",
          toSide: "left",
          fromAt: 208,
          via: 200,
        }),
        E("e2", "client", "qry", "sync", {
          fromSide: "right",
          toSide: "left",
          fromAt: 232,
          via: 200,
        }),
        E("e3", "cmd", "wdb", "data"),
        E("e4", "wdb", "proj", "async", { fromSide: "right", toSide: "top" }),
        E("e5", "proj", "rdb", "async", {
          fromSide: "bottom",
          toSide: "right",
        }),
        E("e6", "qry", "rdb", "data"),
      ],
    },
    flow: [
      {
        title: "Gửi lệnh",
        text: "Lệnh thay đổi trạng thái đi vào phía ghi.",
        hops: [req("e1", "PlaceOrder(An, 200k)")],
      },
      {
        title: "Kiểm tra & ghi",
        text: "Phía ghi giữ mô hình chuẩn hoá và mọi quy tắc nghiệp vụ.",
        hops: [req("e3", "INSERT order"), res("e1", "✓ đơn #1")],
      },
      {
        title: "Chiếu sang phía đọc",
        text: "Sự kiện được projector biến thành bản ghi “tổng chi tiêu theo khách” — tính sẵn.",
        hops: [ev("e4", "OrderPlaced"), ev("e5", "update view")],
        badges: { rdb: "trễ ~ms" },
      },
      {
        title: "Truy vấn nhanh",
        text: "Query chỉ đọc một bảng phẳng: không JOIN, không SUM.",
        hops: [
          req("e2", "top khách hàng"),
          req("e6", "SELECT"),
          res("e2", "An: 2 đơn / 650k"),
        ],
      },
      {
        title: "Lệnh sai bị chặn",
        text: "Phía ghi từ chối; không có sự kiện nên read model không đổi.",
        hops: [
          req("e1", "PlaceOrder(Chi, 0)"),
          fail("e1", "tổng phải > 0", true),
        ],
      },
    ],
  },
  {
    slug: "event-sourcing",
    name: "Event Sourcing",
    viName: "Lưu trữ theo sự kiện",
    group: "data",
    intent:
      "Lưu chuỗi sự kiện đã xảy ra thay vì lưu trạng thái hiện tại; trạng thái được dựng lại bằng cách phát lại sự kiện.",
    analogy:
      "Sổ kế toán: không ai tẩy xoá số dư — chỉ ghi thêm từng bút toán. Muốn biết số dư ngày bất kỳ, cộng các bút toán tới ngày đó.",
    problem:
      "Bảng chỉ lưu số dư hiện tại: mất hết lịch sử “vì sao”, không thể kiểm toán, không thể hỏi “số dư tuần trước là bao nhiêu?” hay tạo báo cáo mới từ dữ liệu cũ.",
    solution:
      "Mọi thay đổi là một sự kiện bất biến được `append` vào event store. Aggregate dựng lại trạng thái bằng cách `replay` sự kiện. Projection tạo bất kỳ read model nào — kể cả những cái nghĩ ra sau này.",
    participants: [
      {
        name: "Account (aggregate)",
        role: "Dựng trạng thái từ sự kiện, kiểm tra lệnh.",
      },
      { name: "Event store", role: "Chuỗi sự kiện chỉ-thêm, có phiên bản." },
      {
        name: "Projections",
        role: "Read model sinh ra từ sự kiện (số dư, nhật ký kiểm toán).",
      },
    ],
    whenToUse: [
      "Cần kiểm toán đầy đủ (tài chính, y tế).",
      "Nghiệp vụ hướng sự kiện, thường đi cùng CQRS.",
    ],
    pros: [
      "Lịch sử đầy đủ, kiểm toán tự nhiên.",
      "Du hành thời gian: trạng thái tại mọi thời điểm.",
      "Projection mới từ dữ liệu cũ.",
    ],
    cons: [
      "Phức tạp: version sự kiện, snapshot khi chuỗi dài.",
      "Truy vấn trạng thái cần projection.",
      "Không thể “sửa” sự kiện sai — phải bù bằng sự kiện mới.",
    ],
    related: ["cqrs", "event-driven", "saga"],
    diagram: {
      width: 880,
      height: 420,
      zones: [],
      nodes: [
        N("client", "Client", "client", 20, 182, { w: 140 }),
        N("agg", "Account", "service", 220, 182, {
          w: 160,
          focal: true,
          sub: "aggregate",
        }),
        N("store", "Event store", "store", 460, 182, {
          w: 170,
          sub: "append-only",
        }),
        N("bal", "Balance view", "db", 700, 70, { w: 160 }),
        N("audit", "Audit log", "db", 700, 294, { w: 160 }),
      ],
      edges: [
        E("e1", "client", "agg"),
        E("e2", "agg", "store", "data", {
          fromAt: 198,
          toAt: 198,
          label: "append",
        }),
        E("e3", "store", "agg", "data", {
          fromAt: 224,
          toAt: 224,
          label: "replay",
        }),
        E("e4", "store", "bal", "async", { via: 665 }),
        E("e5", "store", "audit", "async", { via: 665 }),
      ],
    },
    flow: [
      {
        title: "Ghi sự kiện, không ghi đè",
        text: "Nạp 500 trở thành sự kiện `Deposited(500)` được thêm vào cuối chuỗi.",
        hops: [req("e1", "Deposit 500"), req("e2", "append v2")],
        badges: { store: "v2" },
      },
      {
        title: "Dựng lại trạng thái",
        text: "Trước khi xử lý lệnh rút, aggregate phát lại chuỗi sự kiện để biết số dư.",
        hops: [
          req("e1", "Withdraw 200"),
          req("e3", "replay → 500"),
          req("e2", "append v3"),
        ],
        badges: { store: "v3" },
      },
      {
        title: "Quy tắc trên trạng thái dựng lại",
        text: "Rút 900 khi số dư 300 bị từ chối — không có sự kiện nào được ghi.",
        hops: [
          req("e1", "Withdraw 900"),
          req("e3", "replay → 300"),
          fail("e1", "từ chối", true),
        ],
        badges: { store: "v3" },
      },
      {
        title: "Projection",
        text: "Sự kiện được chiếu thành các view khác nhau.",
        hops: [ev("e4", "số dư 350"), ev("e5", "4 bút toán")],
        badges: { store: "v4" },
      },
      {
        title: "Du hành thời gian",
        text: "Phát lại tới v3 để biết số dư tại thời điểm đó — điều bảng “trạng thái hiện tại” không làm được.",
        hops: [req("e3", "replay tới v3 → 300")],
        badges: { store: "v4" },
      },
    ],
  },
  {
    slug: "saga",
    name: "Saga",
    viName: "Giao dịch phân tán",
    group: "data",
    intent:
      "Thực hiện một giao dịch trải qua nhiều service bằng chuỗi bước cục bộ; nếu một bước thất bại, chạy các bước bù trừ để hoàn tác.",
    analogy:
      "Đặt tour du lịch: đặt vé máy bay, khách sạn, xe. Khách sạn hết phòng thì huỷ vé máy bay đã đặt — mỗi bước có cách “hoàn lại” riêng.",
    problem:
      "Mỗi microservice có CSDL riêng nên không dùng được transaction ACID chung. Trừ tiền xong mà giữ hàng thất bại thì dữ liệu lệch nhau.",
    solution:
      "`Orchestrator` gọi lần lượt các bước; mỗi bước có hành động `bù trừ` tương ứng. Khi một bước thất bại, orchestrator chạy bù trừ theo thứ tự ngược lại, đưa hệ thống về trạng thái nhất quán.",
    participants: [
      { name: "Saga orchestrator", role: "Điều phối các bước và bù trừ." },
      {
        name: "order / payment / inventory / shipping",
        role: "Mỗi service thực hiện bước cục bộ và bù trừ của mình.",
      },
    ],
    whenToUse: [
      "Quy trình nghiệp vụ trải qua nhiều service có CSDL riêng.",
      "Chấp nhận nhất quán cuối cùng thay vì khoá phân tán.",
    ],
    pros: [
      "Nhất quán mà không cần distributed transaction (2PC).",
      "Mỗi service vẫn tự chủ dữ liệu.",
      "Luồng nghiệp vụ tường minh ở orchestrator.",
    ],
    cons: [
      "Phải thiết kế bù trừ cho từng bước.",
      "Trạng thái trung gian có thể bị nhìn thấy.",
      "Debug và kiểm thử phức tạp.",
    ],
    related: ["microservices", "event-driven", "event-sourcing"],
    diagram: {
      width: 880,
      height: 460,
      zones: [],
      nodes: [
        N("client", "Client", "client", 20, 202, { w: 140 }),
        N("orch", "Saga orchestrator", "service", 220, 202, {
          w: 170,
          focal: true,
        }),
        N("order", "order-svc", "service", 560, 30, { w: 200 }),
        N("pay", "payment-svc", "service", 560, 130, { w: 200 }),
        N("inv", "inventory-svc", "service", 560, 230, { w: 200 }),
        N("ship", "shipping-svc", "service", 560, 330, { w: 200 }),
      ],
      edges: [
        E("e1", "client", "orch"),
        E("e2", "orch", "order", "sync", { fromAt: 216, via: 470 }),
        E("e3", "orch", "pay", "sync", { fromAt: 226, via: 490 }),
        E("e4", "orch", "inv", "sync", { fromAt: 236, via: 530 }),
        E("e5", "orch", "ship", "sync", { fromAt: 246, via: 510 }),
      ],
    },
    flow: [
      {
        title: "Bắt đầu saga",
        text: "Một đơn hàng cần bốn service đồng ý.",
        hops: [req("e1", "PlaceOrder ORD-2")],
      },
      {
        title: "Các bước thành công",
        text: "Mỗi bước là một transaction cục bộ trong service của nó.",
        hops: [req("e2", "tạo đơn PENDING"), req("e3", "trừ 300.000")],
        badges: { order: "PENDING", pay: "-300k" },
      },
      {
        title: "Một bước thất bại",
        text: "Kho hết hàng — không thể rollback kiểu ACID vì hai bước trước đã commit.",
        hops: [fail("e4", "hết hàng")],
        badges: { order: "PENDING", pay: "-300k", inv: "0 áo" },
        down: ["inv"],
      },
      {
        title: "Bù trừ ngược chiều",
        text: "Orchestrator chạy hành động bù của các bước đã làm, theo thứ tự ngược lại.",
        hops: [comp("e3", "hoàn 300.000"), comp("e2", "huỷ đơn")],
        badges: { order: "CANCELLED", pay: "+300k" },
      },
      {
        title: "Nhất quán trở lại",
        text: "Không mất tiền, không treo đơn — hệ thống nhất quán dù không có transaction chung.",
        hops: [res("e1", "CANCELLED")],
        badges: { order: "CANCELLED" },
      },
    ],
  },
  {
    slug: "circuit-breaker",
    name: "Circuit Breaker",
    viName: "Cầu dao ngắt mạch",
    group: "data",
    intent:
      "Ngừng gọi một dịch vụ đang lỗi trong một khoảng thời gian, trả về phương án dự phòng ngay lập tức, rồi thử lại thận trọng.",
    analogy:
      "Cầu dao điện trong nhà: khi chập điện, cầu dao nhảy để bảo vệ cả hệ thống. Sau khi sửa, bật thử lại — nếu vẫn chập, nó lại nhảy.",
    problem:
      "Payment API bị treo. Mọi request vẫn chờ hết timeout, luồng xử lý bị chiếm hết, lỗi lan sang toàn bộ hệ thống (cascading failure) và làm dịch vụ kia càng khó hồi phục.",
    solution:
      "Bọc lời gọi bằng `CircuitBreaker` ba trạng thái: `CLOSED` (gọi bình thường, đếm lỗi) → quá ngưỡng thì `OPEN` (trả fallback ngay, không gọi) → hết thời gian chờ thì `HALF_OPEN` (cho thử một request: thành công thì đóng, thất bại thì mở lại).",
    participants: [
      {
        name: "CircuitBreaker",
        role: "Máy trạng thái CLOSED / OPEN / HALF_OPEN.",
      },
      { name: "Payment API", role: "Dịch vụ bên ngoài có thể lỗi." },
      {
        name: "Fallback",
        role: "Phương án dự phòng: xếp hàng xử lý sau, cache, giá trị mặc định.",
      },
    ],
    whenToUse: [
      "Gọi dịch vụ từ xa có thể chậm hoặc sập.",
      "Muốn ngăn lỗi dây chuyền giữa các service.",
    ],
    pros: [
      "Thất bại nhanh thay vì treo.",
      "Cho dịch vụ lỗi thời gian hồi phục.",
      "Trải nghiệm suy giảm có kiểm soát.",
    ],
    cons: [
      "Phải chọn ngưỡng và thời gian chờ hợp lý.",
      "Cần phương án fallback có nghĩa.",
      "Trạng thái breaker cần chia sẻ khi có nhiều instance.",
    ],
    related: ["service-mesh", "microservices"],
    diagram: {
      width: 880,
      height: 400,
      zones: [],
      nodes: [
        N("caller", "OrderService", "service", 20, 170, { w: 160 }),
        N("cb", "Circuit breaker", "proxy", 300, 170, { w: 190, focal: true }),
        N("remote", "Payment API", "external", 640, 170, { w: 200 }),
        N("fb", "Fallback", "cache", 310, 310, { w: 170, sub: "xếp hàng sau" }),
      ],
      edges: [
        E("e1", "caller", "cb"),
        E("e2", "cb", "remote"),
        E("e3", "cb", "fb", "sync", { fromAt: 395, toAt: 395 }),
      ],
    },
    flow: [
      {
        title: "CLOSED: gọi bình thường",
        text: "Mọi thứ ổn — request đi xuyên qua breaker.",
        hops: [req("e1", "pay()"), req("e2", "charge"), res("e2", "200")],
        badges: { cb: "CLOSED" },
      },
      {
        title: "Lỗi liên tiếp",
        text: "Payment chết: mỗi lỗi được đếm; tới ngưỡng 3 thì cầu dao nhảy sang OPEN.",
        hops: [
          req("e1", "pay()"),
          fail("e2", "timeout ×3"),
          req("e3", "fallback"),
        ],
        badges: { cb: "lỗi 3/3 → OPEN" },
        down: ["remote"],
      },
      {
        title: "OPEN: chặn ngay",
        text: "Không gọi Payment nữa — trả fallback tức thì, không chiếm luồng chờ timeout.",
        hops: [req("e1", "pay()"), req("e3", "fallback ngay")],
        badges: { cb: "OPEN" },
        down: ["remote"],
      },
      {
        title: "HALF_OPEN: thử thận trọng",
        text: "Hết thời gian chờ: cho một request đi thử. Vẫn lỗi → mở lại.",
        hops: [
          req("e1", "pay()"),
          fail("e2", "thử 1: lỗi"),
          req("e3", "fallback"),
        ],
        badges: { cb: "HALF_OPEN → OPEN" },
        down: ["remote"],
      },
      {
        title: "Hồi phục",
        text: "Lần thử sau thành công → CLOSED, lưu lượng trở lại bình thường.",
        hops: [req("e1", "pay()"), req("e2", "thử"), res("e2", "200")],
        badges: { cb: "HALF_OPEN → CLOSED" },
      },
    ],
  },
  {
    slug: "strangler-fig",
    name: "Strangler Fig",
    viName: "Thay thế dần hệ thống cũ",
    group: "data",
    intent:
      "Thay thế dần một hệ thống cũ bằng cách đặt một facade phía trước và chuyển từng route sang hệ mới, cho tới khi hệ cũ có thể tắt.",
    analogy:
      "Cây sung bóp cổ (strangler fig) mọc quanh cây chủ, lớn dần cho tới khi thay thế hoàn toàn — cây chủ vẫn đứng vững trong suốt quá trình đó.",
    problem:
      "Viết lại toàn bộ monolith một lần (big bang rewrite) rủi ro rất cao: mất nhiều tháng không phát hành được gì, và ngày chuyển đổi dễ thành thảm hoạ.",
    solution:
      "Đặt `facade` (proxy / API gateway) trước monolith. Lần lượt viết lại từng chức năng thành service mới và chuyển route tương ứng sang đó. Có sự cố thì chuyển route về lại hệ cũ. Khi không còn route nào, tắt monolith.",
    participants: [
      { name: "Strangler facade", role: "Định tuyến theo bảng “đã chuyển”." },
      { name: "Monolith (legacy)", role: "Vẫn phục vụ các route chưa chuyển." },
      { name: "order-svc, user-svc", role: "Hệ mới viết lại từng phần." },
    ],
    whenToUse: [
      "Hiện đại hoá hệ thống cũ đang chạy production.",
      "Không thể dừng phát triển tính năng để viết lại toàn bộ.",
    ],
    pros: [
      "Rủi ro thấp, chuyển đổi từng bước.",
      "Có giá trị sớm sau mỗi route.",
      "Rollback dễ dàng.",
    ],
    cons: [
      "Hai hệ thống cùng tồn tại trong thời gian dài.",
      "Facade có thể thành điểm nghẽn.",
      "Đồng bộ dữ liệu giữa cũ và mới phức tạp.",
    ],
    related: ["api-gateway", "microservices"],
    diagram: {
      width: 880,
      height: 420,
      zones: [{ id: "zn", label: "Hệ mới", x: 540, y: 235, w: 320, h: 165 }],
      nodes: [
        N("client", "Client", "client", 20, 182, { w: 140 }),
        N("facade", "Strangler facade", "proxy", 230, 182, {
          w: 180,
          focal: true,
        }),
        N("legacy", "Monolith (legacy)", "module", 560, 50, {
          w: 260,
          sub: "/orders /users /reports",
        }),
        N("order", "order-svc", "service", 560, 280, { w: 140 }),
        N("user", "user-svc", "service", 712, 280, { w: 140 }),
      ],
      edges: [
        E("e1", "client", "facade"),
        E("e2", "facade", "legacy", "sync", { fromAt: 196, via: 485 }),
        E("e3", "facade", "order", "sync", { fromAt: 226, via: 505 }),
        E("e4", "facade", "user", "sync", {
          fromSide: "bottom",
          toSide: "bottom",
          fromAt: 340,
          toAt: 782,
          points: [
            [340, 376],
            [782, 376],
          ],
        }),
      ],
    },
    flow: [
      {
        title: "Giai đoạn 0",
        text: "Facade đứng trước, nhưng mọi route vẫn vào monolith — người dùng không thấy khác biệt.",
        hops: [req("e1", "/orders/1"), req("e2", "/orders/1")],
        badges: { facade: "0% mới" },
        ghost: ["order", "user"],
      },
      {
        title: "Chuyển /orders",
        text: "order-svc viết lại xong; facade chuyển riêng route /orders sang hệ mới.",
        hops: [req("e1", "/orders/1"), req("e3", "/orders/1")],
        badges: { facade: "50% mới" },
        ghost: ["user"],
      },
      {
        title: "Chuyển /users",
        text: "Từng phần một; /reports vẫn ở monolith.",
        hops: [req("e4", "/users/7"), req("e2", "/reports/q3")],
        badges: { facade: "75% mới" },
      },
      {
        title: "Rollback an toàn",
        text: "user-svc gặp sự cố: chỉ cần đổi bảng định tuyến, /users quay về monolith.",
        hops: [req("e1", "/users/7"), req("e2", "/users/7")],
        badges: { facade: "50% mới" },
        down: ["user"],
      },
      {
        title: "Tắt hệ cũ",
        text: "Khi mọi route đã chuyển và ổn định, monolith được gỡ bỏ — không có “ngày big bang”.",
        hops: [req("e3", "/orders"), req("e4", "/users")],
        badges: { facade: "100% mới" },
        ghost: ["legacy"],
      },
    ],
  },
];
