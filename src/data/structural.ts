/**
 * Copyright (c) 2026 vuvanthanhtb
 * SPDX-License-Identifier: MIT
 */

import type { PatternMeta } from "./meta";

export const structural: PatternMeta[] = [
  {
    slug: "adapter",
    name: "Adapter",
    viName: "Bộ chuyển đổi",
    category: "structural",
    intent:
      "Cho phép các đối tượng có interface không tương thích làm việc được với nhau bằng cách bọc một đối tượng trong lớp chuyển đổi.",
    analogy:
      "Đi du lịch Mỹ với sạc điện chân tròn: bạn cần một đầu chuyển đổi ổ cắm. Ổ cắm và sạc đều giữ nguyên — chỉ thêm lớp ở giữa.",
    problem:
      "Hệ thống thanh toán của bạn làm việc với interface `PaymentProcessor.pay(amountVnd)`. Thư viện Stripe bên thứ ba lại có `charge(cents, currency)` — không thể sửa thư viện, cũng không muốn sửa code nghiệp vụ.",
    solution:
      "Tạo `StripeAdapter` hiện thực interface mà client mong đợi, bên trong giữ một tham chiếu tới `StripeApi` và dịch mỗi lời gọi sang định dạng mà Stripe hiểu.",
    participants: [
      {
        name: "PaymentProcessor",
        role: "Target — interface mà client đang dùng.",
      },
      {
        name: "StripeApi",
        role: "Adaptee — lớp hữu ích nhưng interface không tương thích.",
      },
      {
        name: "StripeAdapter",
        role: "Adapter — hiện thực Target, chuyển lời gọi sang Adaptee.",
      },
      { name: "Checkout", role: "Client — chỉ biết Target." },
    ],
    whenToUse: [
      "Muốn dùng một lớp có sẵn nhưng interface của nó không khớp với phần còn lại.",
      "Tích hợp thư viện bên thứ ba, legacy code hoặc API ngoài.",
      "Tái sử dụng nhiều lớp con thiếu cùng một chức năng mà không thể thêm vào lớp cha.",
    ],
    pros: [
      "Single Responsibility: tách việc chuyển đổi dữ liệu khỏi nghiệp vụ.",
      "Open/Closed: thêm adapter mới mà không sửa client.",
    ],
    cons: [
      "Tăng số lượng lớp; đôi khi sửa trực tiếp service cho khớp lại đơn giản hơn.",
    ],
    related: ["bridge", "decorator", "proxy", "facade"],
    diagram: {
      width: 880,
      classes: [
        {
          id: "client",
          name: "Checkout",
          kind: "client",
          x: 40,
          y: 56,
          w: 180,
          ops: ["+ submit(): string"],
        },
        {
          id: "target",
          name: "PaymentProcessor",
          kind: "interface",
          focal: true,
          x: 300,
          y: 40,
          w: 260,
          ops: ["+ pay(amountVnd: number): string"],
        },
        {
          id: "adapter",
          name: "StripeAdapter",
          x: 300,
          y: 220,
          w: 260,
          attrs: ["- stripe: StripeApi"],
          ops: ["+ pay(amountVnd: number): string"],
        },
        {
          id: "adaptee",
          name: "StripeApi",
          x: 640,
          y: 240,
          w: 220,
          ops: ["+ charge(cents, currency): object"],
        },
      ],
      relations: [
        {
          from: "client",
          to: "target",
          kind: "depend",
          fromAt: 96,
          toAt: 96,
          label: "uses",
        },
        { from: "adapter", to: "target", kind: "realize", accent: true },
        {
          from: "adapter",
          to: "adaptee",
          kind: "assoc",
          fromAt: 280,
          toAt: 280,
          label: "wraps",
        },
      ],
      notes: [
        {
          x: 300,
          y: 384,
          w: 260,
          text: ["Adapter dịch: VND → cents USD"],
          attach: "adapter",
        },
      ],
    },
  },
  {
    slug: "bridge",
    name: "Bridge",
    viName: "Cầu nối",
    category: "structural",
    intent:
      "Tách một lớp lớn (hoặc nhóm lớp liên quan chặt chẽ) thành hai hệ phân cấp — abstraction và implementation — có thể phát triển độc lập.",
    analogy:
      "Điều khiển từ xa và thiết bị: một chiếc remote nâng cao có thể điều khiển cả TV lẫn radio; một TV có thể dùng remote cơ bản hay nâng cao.",
    problem:
      "Mở rộng theo hai chiều (loại remote × loại thiết bị) bằng kế thừa sẽ bùng nổ số lớp: `BasicTvRemote`, `AdvancedTvRemote`, `BasicRadioRemote`…",
    solution:
      "Chuyển từ kế thừa sang hợp thành: remote giữ tham chiếu tới một `Device`. Hai hệ phân cấp nối với nhau qua tham chiếu này — chính là ‘cây cầu’.",
    participants: [
      {
        name: "RemoteControl",
        role: "Abstraction — logic điều khiển cấp cao, uỷ quyền cho implementation.",
      },
      {
        name: "AdvancedRemote",
        role: "RefinedAbstraction — biến thể mở rộng của abstraction.",
      },
      {
        name: "Device",
        role: "Implementation — interface chung cho mọi thiết bị.",
      },
      {
        name: "Tv, Radio",
        role: "ConcreteImplementation — mã riêng của từng nền tảng.",
      },
    ],
    whenToUse: [
      "Muốn chia một lớp nguyên khối có nhiều biến thể chức năng.",
      "Cần mở rộng lớp theo nhiều chiều độc lập (trực giao).",
      "Muốn đổi implementation lúc runtime.",
    ],
    pros: [
      "Tạo lớp/ứng dụng độc lập nền tảng.",
      "Client chỉ làm việc với abstraction cấp cao.",
      "Open/Closed và Single Responsibility cho cả hai phía.",
    ],
    cons: [
      "Có thể làm code phức tạp hơn nếu áp dụng cho lớp vốn đã gắn kết chặt.",
    ],
    related: ["adapter", "abstract-factory", "strategy"],
    diagram: {
      width: 880,
      classes: [
        {
          id: "remote",
          name: "RemoteControl",
          x: 40,
          y: 40,
          w: 240,
          attrs: ["# device: Device"],
          ops: ["+ togglePower(): string", "+ volumeUp(): string"],
        },
        {
          id: "adv",
          name: "AdvancedRemote",
          x: 40,
          y: 260,
          w: 240,
          ops: ["+ mute(): string"],
        },
        {
          id: "device",
          name: "Device",
          kind: "interface",
          focal: true,
          x: 500,
          y: 40,
          w: 260,
          ops: [
            "+ isEnabled(): boolean",
            "+ enable(): void",
            "+ disable(): void",
            "+ setVolume(v: number): void",
          ],
        },
        { id: "tv", name: "Tv", x: 440, y: 260, w: 160 },
        { id: "radio", name: "Radio", x: 660, y: 260, w: 160 },
      ],
      relations: [
        { from: "adv", to: "remote", kind: "inherit" },
        {
          from: "remote",
          to: "device",
          kind: "aggregate",
          fromAt: 100,
          toAt: 100,
          label: "bridge",
          accent: true,
        },
        { from: "tv", to: "device", kind: "realize" },
        { from: "radio", to: "device", kind: "realize" },
      ],
      notes: [
        {
          x: 40,
          y: 380,
          w: 340,
          text: [
            "Hai hệ phân cấp phát triển độc lập,",
            "nối nhau bằng tham chiếu device",
          ],
        },
      ],
    },
  },
  {
    slug: "composite",
    name: "Composite",
    viName: "Đối tượng tổng hợp",
    category: "structural",
    intent:
      "Gộp các đối tượng thành cấu trúc cây và cho phép client xử lý đối tượng đơn lẻ lẫn nhóm đối tượng theo cùng một cách.",
    analogy:
      "Quân đội: tư lệnh ra lệnh cho sư đoàn, sư đoàn ra lệnh cho trung đoàn… cho tới từng người lính. Mệnh lệnh truyền xuống mà không cần biết bên dưới là một người hay cả đơn vị.",
    problem:
      "Tính tổng dung lượng một thư mục chứa file và thư mục con lồng nhau. Nếu phải kiểm tra từng phần tử là file hay thư mục rồi xử lý riêng, code sẽ rối và khó mở rộng.",
    solution:
      "File và Folder cùng hiện thực interface `FileSystemNode` có `getSize()`. File trả về kích thước của nó; Folder duyệt các con và cộng dồn — đệ quy tự nhiên theo cây.",
    participants: [
      {
        name: "FileSystemNode",
        role: "Component — interface chung cho lá và nhánh.",
      },
      { name: "File", role: "Leaf — phần tử cơ bản, không có con." },
      {
        name: "Folder",
        role: "Composite — chứa các con và uỷ quyền công việc cho chúng.",
      },
      {
        name: "Client",
        role: "Làm việc với mọi phần tử qua interface Component.",
      },
    ],
    whenToUse: [
      "Mô hình dữ liệu có dạng cây (menu, cây thư mục, cây DOM, sơ đồ tổ chức).",
      "Muốn client xử lý đồng nhất phần tử đơn và phần tử phức hợp.",
    ],
    pros: [
      "Làm việc với cấu trúc cây phức tạp dễ dàng nhờ đa hình và đệ quy.",
      "Open/Closed: thêm loại phần tử mới mà không phá code cũ.",
    ],
    cons: [
      "Khó tạo interface chung cho các lớp có chức năng quá khác nhau — dễ thành ‘quá tổng quát’.",
    ],
    related: ["iterator", "visitor", "decorator", "builder"],
    diagram: {
      width: 880,
      classes: [
        { id: "client", name: "Client", kind: "client", x: 40, y: 80, w: 160 },
        {
          id: "node",
          name: "FileSystemNode",
          kind: "interface",
          focal: true,
          x: 300,
          y: 40,
          w: 260,
          ops: [
            "+ getName(): string",
            "+ getSize(): number",
            "+ print(indent: string): string",
          ],
        },
        {
          id: "file",
          name: "File",
          x: 140,
          y: 260,
          w: 220,
          attrs: ["- size: number"],
          ops: ["+ getSize(): number"],
        },
        {
          id: "folder",
          name: "Folder",
          x: 500,
          y: 260,
          w: 260,
          attrs: ["- children: FileSystemNode[]"],
          ops: ["+ add(node): this", "+ getSize(): number"],
        },
      ],
      relations: [
        { from: "client", to: "node", kind: "depend", fromAt: 100, toAt: 100 },
        { from: "file", to: "node", kind: "realize", via: 220 },
        { from: "folder", to: "node", kind: "realize", via: 220 },
        {
          from: "folder",
          to: "node",
          kind: "compose",
          fromSide: "right",
          toSide: "right",
          fromAt: 320,
          toAt: 100,
          points: [
            [820, 320],
            [820, 100],
          ],
          label: "children",
          toMult: "0..*",
          accent: true,
        },
      ],
      notes: [
        {
          x: 500,
          y: 444,
          w: 300,
          text: ["Folder.getSize() = tổng size các con", "(đệ quy theo cây)"],
          attach: "folder",
        },
      ],
    },
  },
  {
    slug: "decorator",
    name: "Decorator",
    viName: "Người trang trí",
    category: "structural",
    intent:
      "Gắn thêm hành vi mới cho đối tượng một cách động bằng cách bọc nó trong các đối tượng wrapper có cùng interface.",
    analogy:
      "Mặc áo: trời lạnh khoác thêm áo len, mưa thì thêm áo mưa. Mỗi lớp áo ‘mở rộng’ khả năng của bạn mà không thay đổi con người bạn.",
    problem:
      "Thư viện thông báo ban đầu chỉ gửi email. Người dùng muốn thêm SMS, Slack, và mọi tổ hợp của chúng — tạo lớp con cho từng tổ hợp sẽ bùng nổ số lớp.",
    solution:
      "Tạo `NotifierDecorator` cũng hiện thực `Notifier` và giữ một `wrappee: Notifier`. Mỗi decorator gọi wrappee rồi thêm hành vi của nó. Các decorator có thể xếp chồng theo bất kỳ thứ tự nào.",
    participants: [
      {
        name: "Notifier",
        role: "Component — interface chung cho đối tượng gốc và wrapper.",
      },
      { name: "EmailNotifier", role: "ConcreteComponent — hành vi cơ bản." },
      {
        name: "NotifierDecorator",
        role: "BaseDecorator — giữ tham chiếu wrappee và uỷ quyền mọi thao tác.",
      },
      {
        name: "SmsDecorator, SlackDecorator",
        role: "ConcreteDecorator — thêm hành vi trước/sau khi gọi wrappee.",
      },
    ],
    whenToUse: [
      "Cần thêm hành vi cho đối tượng lúc runtime mà không sửa code dùng nó.",
      "Không thể (hoặc không hợp lý) mở rộng bằng kế thừa — ví dụ lớp `final`.",
      "Middleware: logging, nén, mã hoá, cache xếp chồng lên nhau.",
    ],
    pros: [
      "Mở rộng hành vi mà không tạo lớp con.",
      "Thêm/bớt trách nhiệm lúc runtime, kết hợp nhiều decorator.",
      "Single Responsibility: mỗi decorator một việc.",
    ],
    cons: [
      "Khó gỡ một wrapper cụ thể ra khỏi chồng wrapper.",
      "Hành vi có thể phụ thuộc vào thứ tự xếp chồng.",
    ],
    related: ["adapter", "proxy", "composite", "chain-of-responsibility"],
    diagram: {
      width: 880,
      classes: [
        { id: "client", name: "Client", kind: "client", x: 40, y: 64, w: 160 },
        {
          id: "notifier",
          name: "Notifier",
          kind: "interface",
          focal: true,
          x: 300,
          y: 40,
          w: 260,
          ops: ["+ send(msg: string): string"],
        },
        {
          id: "email",
          name: "EmailNotifier",
          x: 80,
          y: 220,
          w: 200,
          ops: ["+ send(msg): string"],
        },
        {
          id: "base",
          name: "NotifierDecorator",
          kind: "abstract",
          x: 380,
          y: 220,
          w: 260,
          attrs: ["# wrappee: Notifier"],
          ops: ["+ send(msg): string"],
        },
        {
          id: "sms",
          name: "SmsDecorator",
          x: 300,
          y: 420,
          w: 180,
          ops: ["+ send(msg): string"],
        },
        {
          id: "slack",
          name: "SlackDecorator",
          x: 540,
          y: 420,
          w: 180,
          ops: ["+ send(msg): string"],
        },
      ],
      relations: [
        {
          from: "client",
          to: "notifier",
          kind: "depend",
          fromAt: 84,
          toAt: 84,
        },
        { from: "email", to: "notifier", kind: "realize", via: 184 },
        { from: "base", to: "notifier", kind: "realize", via: 184 },
        {
          from: "base",
          to: "notifier",
          kind: "aggregate",
          fromSide: "right",
          toSide: "right",
          fromAt: 284,
          toAt: 84,
          points: [
            [720, 284],
            [720, 84],
          ],
          label: "wraps",
          accent: true,
        },
        { from: "sms", to: "base", kind: "inherit", via: 384 },
        { from: "slack", to: "base", kind: "inherit", via: 384 },
      ],
    },
  },
  {
    slug: "facade",
    name: "Facade",
    viName: "Mặt tiền",
    category: "structural",
    intent:
      "Cung cấp một interface đơn giản cho một hệ thống con phức tạp (thư viện, framework, tập hợp nhiều lớp).",
    analogy:
      "Gọi điện đặt hàng: tổng đài viên là ‘mặt tiền’ của cả kho, thanh toán, vận chuyển. Bạn chỉ nói ‘tôi muốn mua X’.",
    problem:
      "Để chuyển đổi một video, code của bạn phải khởi tạo và điều phối hàng loạt đối tượng của thư viện: đọc file, chọn codec, đọc bitrate, trộn audio… theo đúng thứ tự.",
    solution:
      "Tạo `VideoConverter` với một phương thức `convert(file, format)`. Facade biết cách điều phối hệ thống con; client chỉ gọi một dòng.",
    participants: [
      {
        name: "VideoConverter",
        role: "Facade — điểm truy cập đơn giản, điều phối hệ thống con.",
      },
      {
        name: "VideoFile, CodecFactory, BitrateReader, AudioMixer",
        role: "Subsystem — các lớp phức tạp, không biết đến facade.",
      },
      {
        name: "Client",
        role: "Chỉ dùng facade thay vì gọi trực tiếp hệ thống con.",
      },
    ],
    whenToUse: [
      "Cần interface gọn cho một hệ thống con phức tạp.",
      "Muốn chia hệ thống thành các tầng — mỗi tầng có một facade làm điểm vào.",
    ],
    pros: [
      "Cô lập code khỏi độ phức tạp của hệ thống con.",
      "Giảm coupling giữa client và thư viện.",
    ],
    cons: [
      "Facade có thể phình to thành ‘god object’ gắn với mọi lớp trong ứng dụng.",
    ],
    related: ["adapter", "mediator", "singleton", "abstract-factory"],
    diagram: {
      width: 880,
      classes: [
        { id: "client", name: "Client", kind: "client", x: 40, y: 190, w: 160 },
        {
          id: "facade",
          name: "VideoConverter",
          focal: true,
          x: 280,
          y: 170,
          w: 240,
          ops: ["+ convert(file, format): string"],
        },
        {
          id: "vf",
          name: "VideoFile",
          x: 640,
          y: 20,
          w: 200,
          ops: ["+ constructor(name)"],
        },
        {
          id: "cf",
          name: "CodecFactory",
          x: 640,
          y: 120,
          w: 200,
          ops: ["+ extract(file): Codec"],
        },
        {
          id: "br",
          name: "BitrateReader",
          x: 640,
          y: 220,
          w: 200,
          ops: ["+ convert(buf, codec)"],
        },
        {
          id: "am",
          name: "AudioMixer",
          x: 640,
          y: 320,
          w: 200,
          ops: ["+ fix(result): string"],
        },
      ],
      relations: [
        {
          from: "client",
          to: "facade",
          kind: "depend",
          fromAt: 210,
          toAt: 210,
          label: "convert",
          accent: true,
        },
        {
          from: "facade",
          to: "vf",
          kind: "depend",
          fromSide: "right",
          toSide: "left",
          fromAt: 182,
          toAt: 60,
          via: 568,
        },
        {
          from: "facade",
          to: "cf",
          kind: "depend",
          fromSide: "right",
          toSide: "left",
          fromAt: 202,
          toAt: 160,
          via: 584,
        },
        {
          from: "facade",
          to: "br",
          kind: "depend",
          fromSide: "right",
          toSide: "left",
          fromAt: 222,
          toAt: 260,
          via: 616,
        },
        {
          from: "facade",
          to: "am",
          kind: "depend",
          fromSide: "right",
          toSide: "left",
          fromAt: 242,
          toAt: 360,
          via: 600,
        },
      ],
      notes: [
        {
          x: 280,
          y: 300,
          w: 240,
          text: ["Hệ thống con phức tạp nằm", "sau một phương thức duy nhất"],
          attach: "facade",
        },
      ],
    },
  },
  {
    slug: "flyweight",
    name: "Flyweight",
    viName: "Hạng ruồi",
    category: "structural",
    intent:
      "Tiết kiệm bộ nhớ bằng cách chia sẻ phần trạng thái chung giữa nhiều đối tượng thay vì mỗi đối tượng giữ một bản riêng.",
    analogy:
      "Khu rừng một triệu cây chỉ có vài loài. Thay vì mỗi cây lưu ảnh texture riêng, các cây cùng loài trỏ tới một ‘phiếu loài’ chung.",
    problem:
      "Game vẽ một triệu cây; mỗi đối tượng `Tree` giữ tên loài, màu, texture (nặng) cùng toạ độ x, y. RAM cạn kiệt dù phần lớn dữ liệu trùng lặp.",
    solution:
      "Tách trạng thái nội tại (intrinsic: tên, màu, texture — dùng chung) vào `TreeType` bất biến. `Tree` chỉ giữ trạng thái ngoại lai (extrinsic: x, y) và tham chiếu tới flyweight. `TreeFactory` cache để tái sử dụng.",
    participants: [
      { name: "TreeType", role: "Flyweight — trạng thái chung, bất biến." },
      {
        name: "Tree",
        role: "Context — trạng thái riêng + tham chiếu flyweight.",
      },
      {
        name: "TreeFactory",
        role: "FlyweightFactory — quản lý pool, trả flyweight có sẵn hoặc tạo mới.",
      },
      { name: "Forest", role: "Client — tạo và vẽ các cây." },
    ],
    whenToUse: [
      "Ứng dụng tạo số lượng rất lớn đối tượng tương tự nhau làm cạn RAM.",
      "Các đối tượng chứa nhiều trạng thái trùng lặp có thể tách ra và chia sẻ.",
    ],
    pros: ["Tiết kiệm đáng kể bộ nhớ khi có rất nhiều đối tượng giống nhau."],
    cons: [
      "Có thể đánh đổi RAM lấy CPU (tính lại trạng thái ngoại lai mỗi lần).",
      "Code phức tạp hơn, khó hiểu với thành viên mới.",
    ],
    related: ["composite", "singleton", "state", "strategy"],
    diagram: {
      width: 880,
      classes: [
        {
          id: "factory",
          name: "TreeFactory",
          x: 40,
          y: 40,
          w: 240,
          attrs: ["- static types: Map"],
          ops: ["+ static getType(n, c, t): TreeType"],
        },
        {
          id: "type",
          name: "TreeType",
          focal: true,
          x: 380,
          y: 40,
          w: 240,
          attrs: ["- name: string", "- color: string", "- texture: string"],
          ops: ["+ draw(x, y): string"],
        },
        {
          id: "forest",
          name: "Forest",
          x: 40,
          y: 300,
          w: 240,
          attrs: ["- trees: Tree[]"],
          ops: ["+ plantTree(x, y, n, c, t)"],
        },
        {
          id: "tree",
          name: "Tree",
          x: 380,
          y: 280,
          w: 240,
          attrs: ["- x: number", "- y: number", "- type: TreeType"],
          ops: ["+ draw(): string"],
        },
      ],
      relations: [
        {
          from: "factory",
          to: "type",
          kind: "aggregate",
          fromAt: 100,
          toAt: 100,
          toMult: "0..*",
        },
        {
          from: "tree",
          to: "type",
          kind: "assoc",
          accent: true,
          fromMult: "*",
          toMult: "1",
        },
        {
          from: "forest",
          to: "tree",
          kind: "compose",
          fromAt: 360,
          toAt: 360,
          toMult: "0..*",
        },
        { from: "forest", to: "factory", kind: "depend", label: "getType" },
      ],
      notes: [
        {
          x: 660,
          y: 64,
          w: 200,
          text: ["Intrinsic — dùng chung", "giữa hàng nghìn cây"],
          attach: "type",
        },
        {
          x: 660,
          y: 324,
          w: 200,
          text: ["Extrinsic — x, y riêng", "của từng cây"],
          attach: "tree",
        },
      ],
    },
  },
  {
    slug: "proxy",
    name: "Proxy",
    viName: "Đại diện",
    category: "structural",
    intent:
      "Cung cấp một đối tượng thay thế (placeholder) để kiểm soát truy cập tới đối tượng gốc — cho phép làm gì đó trước hoặc sau khi yêu cầu tới được đối tượng gốc.",
    analogy:
      "Thẻ tín dụng là proxy của tài khoản ngân hàng: cùng ‘interface’ thanh toán, nhưng thêm kiểm tra hạn mức, OTP, ghi log.",
    problem:
      "Dịch vụ video bên thứ ba rất chậm, và ứng dụng gọi lặp lại cùng một video nhiều lần. Bạn không sửa được thư viện, cũng không muốn rải code cache khắp client.",
    solution:
      "Tạo `CachedVideoProxy` hiện thực cùng interface `VideoService`. Proxy giữ tham chiếu tới dịch vụ thật và trả kết quả từ cache nếu có; client không nhận ra sự khác biệt.",
    participants: [
      {
        name: "VideoService",
        role: "Subject — interface chung của proxy và đối tượng thật.",
      },
      {
        name: "YouTubeService",
        role: "RealSubject — logic nghiệp vụ thật (chậm/đắt).",
      },
      {
        name: "CachedVideoProxy",
        role: "Proxy — giữ tham chiếu tới RealSubject, thêm cache/lazy-init/kiểm soát.",
      },
    ],
    whenToUse: [
      "Virtual proxy: khởi tạo lười một đối tượng nặng.",
      "Protection proxy: kiểm tra quyền truy cập.",
      "Remote proxy, logging proxy, caching proxy.",
    ],
    pros: [
      "Kiểm soát đối tượng gốc mà client không biết.",
      "Quản lý vòng đời đối tượng gốc; hoạt động cả khi đối tượng gốc chưa sẵn sàng.",
      "Open/Closed: thêm proxy mới không sửa service hay client.",
    ],
    cons: ["Thêm lớp trung gian, phản hồi có thể chậm hơn một chút."],
    related: ["adapter", "decorator", "facade"],
    diagram: {
      width: 880,
      classes: [
        { id: "client", name: "Client", kind: "client", x: 40, y: 64, w: 160 },
        {
          id: "subject",
          name: "VideoService",
          kind: "interface",
          focal: true,
          x: 300,
          y: 40,
          w: 260,
          ops: ["+ getVideo(id: string): string"],
        },
        {
          id: "real",
          name: "YouTubeService",
          x: 120,
          y: 220,
          w: 240,
          ops: ["+ getVideo(id: string): string"],
        },
        {
          id: "proxy",
          name: "CachedVideoProxy",
          x: 500,
          y: 220,
          w: 280,
          attrs: ["- service: YouTubeService", "- cache: Map<string, string>"],
          ops: ["+ getVideo(id: string): string"],
        },
      ],
      relations: [
        { from: "client", to: "subject", kind: "depend", fromAt: 84, toAt: 84 },
        { from: "real", to: "subject", kind: "realize", via: 184 },
        { from: "proxy", to: "subject", kind: "realize", via: 184 },
        {
          from: "proxy",
          to: "real",
          kind: "assoc",
          fromAt: 260,
          toAt: 260,
          label: "delegates",
          accent: true,
        },
      ],
      notes: [
        {
          x: 500,
          y: 404,
          w: 280,
          text: ["Kiểm soát truy cập: cache,", "lazy-init, log, phân quyền…"],
          attach: "proxy",
        },
      ],
    },
  },
];
