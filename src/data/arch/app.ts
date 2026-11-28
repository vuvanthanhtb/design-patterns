/**
 * Copyright (c) 2026 vuvanthanhtb
 * SPDX-License-Identifier: MIT
 */

import type { ArchLesson } from "@/lib/arch/types";
import { E, ev, fail, N, req, res } from "./helpers";

export const appLessons: ArchLesson[] = [
  {
    slug: "layered",
    name: "Layered Architecture",
    viName: "Kiến trúc phân tầng",
    group: "app",
    intent:
      "Chia ứng dụng thành các tầng xếp chồng, mỗi tầng một trách nhiệm và chỉ gọi tầng ngay bên dưới.",
    analogy:
      "Nhà hàng: phục vụ nhận order (trình bày), bếp trưởng quyết định món (nghiệp vụ), thủ kho lấy nguyên liệu (dữ liệu). Phục vụ không bao giờ tự vào kho.",
    problem:
      "Code giao diện, quy tắc nghiệp vụ và câu lệnh SQL trộn lẫn trong cùng một hàm. Đổi CSDL hay đổi giao diện đều phải sửa khắp nơi, và không thể kiểm thử nghiệp vụ riêng.",
    solution:
      "Tách thành các tầng: `Presentation` nhận request, `Business` chứa quy tắc, `Persistence` truy cập dữ liệu. Phụ thuộc chỉ đi từ trên xuống, mỗi tầng giấu chi tiết của nó sau một interface.",
    participants: [
      {
        name: "OrderController",
        role: "Presentation — nhận HTTP, chuyển đổi dữ liệu vào/ra.",
      },
      {
        name: "OrderService, PricingService",
        role: "Business — quy tắc nghiệp vụ (đơn rỗng bị từ chối, tính giá).",
      },
      { name: "OrderRepository", role: "Persistence — đọc/ghi CSDL." },
      { name: "PostgreSQL", role: "Database — lưu trữ." },
    ],
    whenToUse: [
      "Ứng dụng CRUD / doanh nghiệp điển hình, đội mới bắt đầu.",
      "Cần cấu trúc dễ hiểu, dễ phân công theo tầng.",
    ],
    pros: [
      "Đơn giản, quen thuộc với hầu hết lập trình viên.",
      "Tách biệt trách nhiệm rõ ràng.",
      "Dễ thay một tầng (vd đổi giao diện).",
    ],
    cons: [
      "Nghiệp vụ vẫn phụ thuộc vào tầng dữ liệu bên dưới.",
      "Dễ thành “lasagna”: request phải đi qua nhiều tầng chỉ để chuyển tiếp.",
      "Thay đổi một tính năng thường chạm vào mọi tầng.",
    ],
    related: ["mvc", "hexagonal", "clean-architecture"],
    diagram: {
      width: 880,
      height: 440,
      zones: [
        { id: "z1", label: "Presentation", x: 220, y: 20, w: 640, h: 92 },
        { id: "z2", label: "Business", x: 220, y: 122, w: 640, h: 92 },
        { id: "z3", label: "Persistence", x: 220, y: 224, w: 640, h: 92 },
        { id: "z4", label: "Database", x: 220, y: 326, w: 640, h: 92 },
      ],
      nodes: [
        N("browser", "Trình duyệt", "client", 30, 38, { w: 150 }),
        N("ctrl", "OrderController", "service", 300, 38, { sub: "REST" }),
        N("pctrl", "ProductController", "service", 560, 38, { sub: "REST" }),
        N("svc", "OrderService", "service", 300, 140, {
          focal: true,
          sub: "quy tắc đặt hàng",
        }),
        N("price", "PricingService", "service", 560, 140, { sub: "tính giá" }),
        N("repo", "OrderRepository", "service", 300, 242, { sub: "SQL" }),
        N("db", "PostgreSQL", "db", 300, 344),
      ],
      edges: [
        E("e1", "browser", "ctrl"),
        E("e2", "ctrl", "svc"),
        E("e3", "pctrl", "price"),
        E("e4", "svc", "price"),
        E("e5", "svc", "repo"),
        E("e6", "repo", "db", "data"),
      ],
    },
    flow: [
      {
        title: "Vào tầng trình bày",
        text: "Request HTTP chỉ chạm tầng trên cùng. Controller không biết gì về SQL.",
        hops: [req("e1", "POST /orders")],
      },
      {
        title: "Xuống tầng nghiệp vụ",
        text: "Controller chuyển dữ liệu đã kiểm tra định dạng xuống `OrderService`.",
        hops: [req("e2", "placeOrder(items)")],
      },
      {
        title: "Nghiệp vụ phối hợp",
        text: "Các service cùng tầng có thể gọi nhau: tính giá trước khi lưu.",
        hops: [req("e4", "quote(items)"), res("e4", "60.000")],
      },
      {
        title: "Xuống tầng dữ liệu",
        text: "Chỉ `OrderRepository` biết câu lệnh SQL và CSDL cụ thể.",
        hops: [req("e5", "save(order)"), req("e6", "INSERT")],
      },
      {
        title: "Kết quả đi ngược lên",
        text: "Mỗi tầng trả kết quả cho tầng gọi nó — tầng trên không bao giờ “nhảy cóc” xuống CSDL.",
        hops: [
          res("e5", "order #1"),
          res("e2", "Order"),
          res("e1", "201 Created"),
        ],
      },
      {
        title: "Quy tắc nằm ở đúng tầng",
        text: "Đơn rỗng bị chặn ở tầng nghiệp vụ — không cần chạm tới CSDL.",
        hops: [
          req("e1", "POST []"),
          req("e2", "placeOrder([])"),
          fail("e2", "Đơn hàng rỗng", true),
          res("e1", "400"),
        ],
      },
    ],
  },
  {
    slug: "mvc",
    name: "Model–View–Controller",
    viName: "Mô hình – Giao diện – Điều khiển",
    group: "app",
    intent:
      "Tách ứng dụng có giao diện thành Model (dữ liệu), View (hiển thị) và Controller (xử lý thao tác).",
    analogy:
      "Sân khấu: kịch bản (Model) là nội dung, diễn viên trên sân khấu (View) thể hiện nó, đạo diễn (Controller) nghe khán giả yêu cầu rồi sửa kịch bản.",
    problem:
      "Một màn hình vừa vẽ giao diện, vừa xử lý click, vừa giữ dữ liệu. Thêm một cách hiển thị mới (mobile, web) là phải nhân bản cả logic.",
    solution:
      "`Model` giữ dữ liệu và phát thông báo khi thay đổi. `View` đăng ký nghe Model và chỉ vẽ lại. `Controller` nhận thao tác người dùng và cập nhật Model — không bao giờ vẽ trực tiếp.",
    participants: [
      {
        name: "TodoModel",
        role: "Model — dữ liệu, quy tắc, thông báo thay đổi.",
      },
      { name: "TodoView", role: "View — hiển thị, quan sát Model." },
      {
        name: "TodoController",
        role: "Controller — dịch thao tác thành lệnh cho Model.",
      },
    ],
    whenToUse: [
      "Ứng dụng có giao diện: web server-side, desktop, mobile.",
      "Cần nhiều View cho cùng dữ liệu.",
    ],
    pros: [
      "Tách giao diện khỏi dữ liệu.",
      "Nhiều View dùng chung một Model.",
      "Dễ kiểm thử Model độc lập.",
    ],
    cons: [
      "Controller dễ phình to (“fat controller”).",
      "Luồng cập nhật qua Observer khó theo dõi khi ứng dụng lớn.",
    ],
    related: ["layered", "event-driven"],
    diagram: {
      width: 880,
      height: 420,
      zones: [{ id: "z", label: "Ứng dụng", x: 300, y: 18, w: 560, h: 384 }],
      nodes: [
        N("user", "Người dùng", "client", 30, 182),
        N("ctrl", "TodoController", "service", 330, 50, { sub: "Controller" }),
        N("model", "TodoModel", "store", 650, 182, {
          sub: "Model",
          focal: true,
        }),
        N("view", "TodoView", "module", 330, 314, { sub: "View" }),
      ],
      edges: [
        E("e1", "user", "ctrl", "sync", {
          fromSide: "right",
          toSide: "left",
          via: 255,
        }),
        E("e2", "ctrl", "model", "sync", { fromSide: "right", toSide: "top" }),
        E("e3", "model", "view", "async", {
          fromSide: "bottom",
          toSide: "right",
        }),
        E("e4", "view", "user", "sync", { fromSide: "left", toSide: "bottom" }),
      ],
    },
    flow: [
      {
        title: "Người dùng thao tác",
        text: "Click “Thêm” đi tới Controller — không phải tới View.",
        hops: [req("e1", "add('Học MVC')")],
      },
      {
        title: "Controller cập nhật Model",
        text: "Controller dịch thao tác thành lệnh nghiệp vụ.",
        hops: [req("e2", "model.add()")],
      },
      {
        title: "Model phát thông báo",
        text: "Model không biết View là gì — chỉ báo “dữ liệu đã đổi” cho ai đăng ký.",
        hops: [ev("e3", "changed")],
      },
      {
        title: "View vẽ lại",
        text: "View đọc trạng thái mới từ Model và hiển thị.",
        hops: [req("e4", "render 1 việc")],
      },
      {
        title: "Dữ liệu không hợp lệ",
        text: "Controller chặn ô nhập rỗng; Model không đổi nên View cũng không vẽ lại.",
        hops: [req("e1", "add('   ')"), fail("e1", "bỏ qua", true)],
      },
    ],
  },
  {
    slug: "hexagonal",
    name: "Hexagonal (Ports & Adapters)",
    viName: "Kiến trúc lục giác",
    group: "app",
    intent:
      "Đặt nghiệp vụ ở lõi, giao tiếp với thế giới bên ngoài chỉ qua các port (interface); công nghệ cụ thể là adapter cắm vào port.",
    analogy:
      "Ổ cắm điện: thiết bị (lõi) có chuẩn ổ cắm (port). Cắm bộ sạc, máy phát hay pin dự phòng (adapter) đều được — thiết bị không cần biết điện đến từ đâu.",
    problem:
      "Nghiệp vụ gọi thẳng framework web, ORM và SDK thanh toán. Không thể chạy thử nghiệp vụ mà không dựng cả CSDL, và đổi nhà cung cấp thanh toán là đụng vào lõi.",
    solution:
      "Lõi định nghĩa `port vào` (use case) và `port ra` (repository, payment). Adapter vào (REST, CLI, test) gọi port vào; adapter ra (Postgres, Stripe) hiện thực port ra. Phụ thuộc luôn hướng vào lõi.",
    participants: [
      {
        name: "OrderService",
        role: "Lõi — hiện thực use case, chỉ biết port.",
      },
      { name: "PlaceOrderUseCase", role: "Port vào (driving)." },
      { name: "OrderRepositoryPort, PaymentPort", role: "Port ra (driven)." },
      {
        name: "RestAdapter, CliAdapter",
        role: "Adapter vào — cùng dùng một port.",
      },
      {
        name: "PostgresAdapter, StripeAdapter",
        role: "Adapter ra — có thể thay bằng bản giả khi test.",
      },
    ],
    whenToUse: [
      "Nghiệp vụ phức tạp cần kiểm thử độc lập với hạ tầng.",
      "Hệ thống có nhiều kênh vào (web, CLI, message) hoặc hay đổi nhà cung cấp.",
    ],
    pros: [
      "Lõi kiểm thử được không cần CSDL/mạng.",
      "Thay công nghệ chỉ bằng một adapter mới.",
      "Trì hoãn quyết định hạ tầng.",
    ],
    cons: [
      "Nhiều interface và lớp chuyển đổi hơn.",
      "Quá mức cần thiết với ứng dụng CRUD đơn giản.",
    ],
    related: ["clean-architecture", "layered"],
    diagram: {
      width: 880,
      height: 420,
      zones: [
        { id: "zin", label: "Adapter vào", x: 20, y: 20, w: 200, h: 380 },
        { id: "zcore", label: "Lõi (hexagon)", x: 280, y: 70, w: 320, h: 280 },
        { id: "zout", label: "Adapter ra", x: 660, y: 20, w: 200, h: 380 },
      ],
      nodes: [
        N("rest", "RestAdapter", "gateway", 45, 100, { sub: "HTTP" }),
        N("cli", "CliAdapter", "client", 45, 264, { sub: "dòng lệnh / test" }),
        N("core", "OrderService", "service", 365, 182, {
          focal: true,
          sub: "use case",
        }),
        N("dbA", "PostgresAdapter", "db", 685, 100),
        N("payA", "StripeAdapter", "external", 685, 264),
      ],
      edges: [
        E("e1", "rest", "core", "sync", { label: "port vào", via: 290 }),
        E("e2", "cli", "core", "sync", { via: 290 }),
        E("e3", "core", "dbA", "data", { label: "OrderRepoPort", via: 640 }),
        E("e4", "core", "payA", "sync", { label: "PaymentPort", via: 640 }),
      ],
    },
    flow: [
      {
        title: "Adapter vào gọi port",
        text: "REST adapter chuyển JSON thành lời gọi `placeOrder()` — lõi không thấy HTTP.",
        hops: [req("e1", "placeOrder(An, 250k)")],
      },
      {
        title: "Lõi gọi port ra",
        text: "Lõi chỉ biết `PaymentPort`; adapter Stripe làm phần còn lại.",
        hops: [req("e4", "charge()"), res("e4", "ok")],
      },
      {
        title: "Lưu qua port",
        text: "Đổi Postgres sang Mongo chỉ cần một adapter mới.",
        hops: [req("e3", "save()"), res("e3", "#1")],
      },
      {
        title: "Trả về qua adapter",
        text: "Adapter vào dịch kết quả thành phản hồi HTTP.",
        hops: [res("e1", "200 đơn #1")],
      },
      {
        title: "Adapter khác, cùng port",
        text: "CLI (hoặc test) gọi đúng port đó — không cần server web.",
        hops: [
          req("e2", "CLI Bình 90k"),
          req("e4", "charge()"),
          req("e3", "save()"),
          res("e2", "đơn #2"),
        ],
      },
      {
        title: "Quy tắc ở lõi",
        text: "Đơn quá lớn bị adapter thanh toán từ chối; lõi quyết định không lưu.",
        hops: [
          req("e2", "CLI Chi 5tr"),
          fail("e4", "từ chối", true),
          res("e2", "thanh toán bị từ chối"),
        ],
      },
    ],
  },
  {
    slug: "clean-architecture",
    name: "Clean Architecture",
    viName: "Kiến trúc sạch",
    group: "app",
    intent:
      "Tổ chức code thành các vòng đồng tâm; quy tắc phụ thuộc: mã nguồn chỉ được phụ thuộc vào vòng bên trong.",
    analogy:
      "Củ hành: lõi (quy tắc nghiệp vụ) được bọc bởi các lớp ngoài dễ thay (giao diện, CSDL, framework). Bóc lớp ngoài không làm hỏng lõi.",
    problem:
      "Framework và CSDL quyết định cấu trúc code; quy tắc nghiệp vụ quan trọng nhất lại phụ thuộc vào chi tiết dễ thay đổi nhất.",
    solution:
      "Bốn vòng: `Entities` (quy tắc cốt lõi), `Use cases` (điều phối), `Interface adapters` (controller, presenter, gateway), `Frameworks & drivers` (web, DB). Vòng trong định nghĩa interface; vòng ngoài hiện thực chúng (đảo ngược phụ thuộc).",
    participants: [
      {
        name: "Order",
        role: "Entity — quy tắc bất biến (số lượng > 0, tính tổng).",
      },
      {
        name: "PlaceOrderInteractor",
        role: "Use case — điều phối, định nghĩa OrderGateway và PlaceOrderOutput.",
      },
      {
        name: "OrderController, JsonPresenter",
        role: "Interface adapters — chuyển đổi dữ liệu.",
      },
      {
        name: "InMemoryDb / Web",
        role: "Frameworks & drivers — chi tiết có thể thay.",
      },
    ],
    whenToUse: [
      "Hệ thống sống lâu, nghiệp vụ phức tạp, framework có thể thay đổi.",
      "Cần kiểm thử use case hoàn toàn độc lập.",
    ],
    pros: [
      "Nghiệp vụ độc lập framework, UI, CSDL.",
      "Kiểm thử dễ dàng ở mọi vòng.",
      "Ranh giới rõ ràng cho đội lớn.",
    ],
    cons: [
      "Nhiều lớp và ánh xạ dữ liệu giữa các vòng.",
      "Đường cong học tập cao; dễ làm quá mức.",
    ],
    related: ["hexagonal", "layered"],
    diagram: {
      width: 880,
      height: 420,
      zones: [
        {
          id: "z4",
          label: "Frameworks & drivers",
          x: 20,
          y: 20,
          w: 200,
          h: 380,
        },
        {
          id: "z3",
          label: "Interface adapters",
          x: 230,
          y: 20,
          w: 200,
          h: 380,
        },
        { id: "z2", label: "Use cases", x: 440, y: 20, w: 200, h: 380 },
        { id: "z1", label: "Entities", x: 650, y: 20, w: 210, h: 380 },
      ],
      nodes: [
        N("web", "Web framework", "client", 40, 80, { w: 160 }),
        N("db", "Database", "db", 40, 290, { w: 160 }),
        N("ctrl", "OrderController", "gateway", 250, 80, { w: 160 }),
        N("pres", "JsonPresenter", "module", 250, 185, { w: 160 }),
        N("gw", "InMemoryDb", "service", 250, 290, {
          w: 160,
          sub: "hiện thực gateway",
        }),
        N("ia", "PlaceOrderInteractor", "service", 455, 80, {
          w: 170,
          focal: true,
        }),
        N("port", "OrderGateway", "module", 455, 290, {
          w: 170,
          sub: "«interface»",
        }),
        N("ent", "Order", "store", 680, 185, { sub: "entity" }),
      ],
      edges: [
        E("e1", "web", "ctrl"),
        E("e2", "ctrl", "ia"),
        E("e3", "ia", "ent", "sync", {
          fromSide: "right",
          toSide: "left",
          via: 652,
        }),
        E("e4", "ia", "port", "sync", {
          fromAt: 560,
          toAt: 560,
          label: "dùng",
        }),
        E("e5", "gw", "port", "control", { label: "hiện thực" }),
        E("e6", "gw", "db", "data"),
        E("e7", "ia", "pres", "sync", {
          fromSide: "bottom",
          toSide: "right",
          fromAt: 490,
        }),
      ],
    },
    flow: [
      {
        title: "Request từ vòng ngoài",
        text: "Framework web chỉ biết controller.",
        hops: [req("e1", "POST /orders")],
      },
      {
        title: "Vào use case",
        text: "Controller chuyển JSON thành input thuần của use case.",
        hops: [req("e2", "execute(input)")],
      },
      {
        title: "Quy tắc của entity",
        text: "Entity tự kiểm tra bất biến — số lượng phải > 0.",
        hops: [req("e3", "new Order()"), res("e3", "tổng 220.000")],
      },
      {
        title: "Đảo ngược phụ thuộc",
        text: "Use case gọi interface của chính nó; adapter ở vòng ngoài hiện thực interface đó rồi chạm tới DB.",
        hops: [req("e4", "save()"), res("e5", "→ impl"), req("e6", "INSERT")],
      },
      {
        title: "Trình bày kết quả",
        text: "Use case đẩy kết quả qua output port; presenter định dạng JSON.",
        hops: [req("e7", "present(ORD-1)")],
      },
      {
        title: "Vi phạm quy tắc",
        text: "Số lượng 0 bị entity chặn; presenter trả lỗi 422, DB không bị chạm tới.",
        hops: [
          req("e2", "qty = 0"),
          fail("e3", "Số lượng phải > 0", true),
          req("e7", "422"),
        ],
      },
    ],
  },
];
