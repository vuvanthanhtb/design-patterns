import type { PatternMeta } from "./meta";

export const creational: PatternMeta[] = [
  {
    slug: "factory-method",
    name: "Factory Method",
    viName: "Phương thức nhà máy",
    category: "creational",
    intent:
      "Định nghĩa một interface để tạo đối tượng, nhưng để lớp con quyết định lớp cụ thể nào được khởi tạo.",
    analogy:
      "Một công ty logistics có quy trình giao hàng chung; chi nhánh đường bộ dùng xe tải, chi nhánh đường biển dùng tàu. Quy trình không đổi — chỉ phương tiện do chi nhánh tự chọn.",
    problem:
      "Code nghiệp vụ gọi trực tiếp `new Truck()` ở khắp nơi. Khi cần thêm `Ship`, bạn phải sửa mọi chỗ khởi tạo và chèn thêm if/else theo loại phương tiện.",
    solution:
      "Thay lời gọi `new` bằng một phương thức trừu tượng `createTransport()`. Lớp cha chỉ làm việc với interface `Transport`; mỗi lớp con override phương thức này để trả về sản phẩm cụ thể.",
    participants: [
      {
        name: "Transport",
        role: "Product — interface chung cho mọi sản phẩm.",
      },
      { name: "Truck, Ship", role: "ConcreteProduct — các hiện thực cụ thể." },
      {
        name: "Logistics",
        role: "Creator — khai báo factory method và chứa logic nghiệp vụ dùng sản phẩm.",
      },
      {
        name: "RoadLogistics, SeaLogistics",
        role: "ConcreteCreator — override factory method để trả về sản phẩm cụ thể.",
      },
    ],
    whenToUse: [
      "Không biết trước chính xác loại đối tượng mà code sẽ làm việc cùng.",
      "Muốn cho người dùng thư viện/framework mở rộng các thành phần nội bộ.",
      "Muốn tái sử dụng đối tượng có sẵn thay vì luôn tạo mới (factory method có thể trả về từ cache).",
    ],
    pros: [
      "Tách rời creator khỏi sản phẩm cụ thể (loose coupling).",
      "Single Responsibility: logic tạo đối tượng nằm một chỗ.",
      "Open/Closed: thêm sản phẩm mới mà không sửa code cũ.",
    ],
    cons: [
      "Số lượng lớp con tăng lên — mỗi sản phẩm cần một creator tương ứng.",
    ],
    related: ["abstract-factory", "template-method", "prototype"],
    diagram: {
      width: 880,
      classes: [
        {
          id: "creator",
          name: "Logistics",
          kind: "abstract",
          x: 80,
          y: 40,
          w: 240,
          ops: ["# createTransport(): Transport", "+ planDelivery(): string"],
        },
        {
          id: "product",
          name: "Transport",
          kind: "interface",
          focal: true,
          x: 520,
          y: 40,
          w: 240,
          ops: ["+ deliver(): string"],
        },
        {
          id: "road",
          name: "RoadLogistics",
          x: 20,
          y: 240,
          w: 200,
          ops: ["# createTransport(): Transport"],
        },
        {
          id: "sea",
          name: "SeaLogistics",
          x: 240,
          y: 240,
          w: 200,
          ops: ["# createTransport(): Transport"],
        },
        {
          id: "truck",
          name: "Truck",
          x: 500,
          y: 240,
          w: 140,
          ops: ["+ deliver(): string"],
        },
        {
          id: "ship",
          name: "Ship",
          x: 680,
          y: 240,
          w: 140,
          ops: ["+ deliver(): string"],
        },
      ],
      relations: [
        { from: "road", to: "creator", kind: "inherit" },
        { from: "sea", to: "creator", kind: "inherit" },
        { from: "truck", to: "product", kind: "realize", accent: true },
        { from: "ship", to: "product", kind: "realize", accent: true },
        {
          from: "creator",
          to: "product",
          kind: "depend",
          fromAt: 100,
          toAt: 100,
          label: "creates",
        },
      ],
      notes: [
        {
          x: 20,
          y: 364,
          w: 260,
          text: ["Lớp con quyết định tạo Truck", "thay cho lớp cha"],
          attach: "road",
        },
      ],
    },
  },
  {
    slug: "abstract-factory",
    name: "Abstract Factory",
    viName: "Nhà máy trừu tượng",
    category: "creational",
    intent:
      "Cung cấp interface để tạo ra các họ đối tượng liên quan với nhau mà không cần chỉ định lớp cụ thể.",
    analogy:
      "Một cửa hàng nội thất bán theo bộ: bộ Victorian gồm ghế + sofa + bàn cùng phong cách. Bạn chọn ‘nhà máy’ Victorian là chắc chắn mọi món đều đồng bộ.",
    problem:
      "Ứng dụng phải chạy trên Windows và macOS. Nếu khởi tạo trực tiếp `WinButton` cạnh `MacCheckbox`, giao diện sẽ lẫn lộn phong cách và code đầy điều kiện theo hệ điều hành.",
    solution:
      "Khai báo interface cho từng loại sản phẩm (`Button`, `Checkbox`) và một `GUIFactory` có phương thức tạo từng loại. Mỗi họ sản phẩm có một factory cụ thể; client chỉ nhận factory qua interface.",
    participants: [
      {
        name: "GUIFactory",
        role: "AbstractFactory — khai báo các phương thức tạo cho từng sản phẩm.",
      },
      {
        name: "WinFactory, MacFactory",
        role: "ConcreteFactory — tạo ra một họ sản phẩm đồng bộ.",
      },
      {
        name: "Button, Checkbox",
        role: "AbstractProduct — interface cho từng loại sản phẩm.",
      },
      {
        name: "WinButton, MacButton…",
        role: "ConcreteProduct — sản phẩm cụ thể thuộc từng họ.",
      },
      {
        name: "Application",
        role: "Client — chỉ làm việc qua các interface trừu tượng.",
      },
    ],
    whenToUse: [
      "Code cần làm việc với nhiều họ sản phẩm liên quan, nhưng không muốn phụ thuộc vào lớp cụ thể.",
      "Cần đảm bảo các sản phẩm được tạo ra luôn tương thích với nhau.",
      "Một lớp có nhiều factory method lẫn lộn làm mờ trách nhiệm chính của nó.",
    ],
    pros: [
      "Các sản phẩm từ cùng một factory luôn tương thích.",
      "Tránh ràng buộc chặt giữa client và sản phẩm cụ thể.",
      "Open/Closed: thêm họ sản phẩm mới mà không sửa client.",
    ],
    cons: [
      "Thêm một loại sản phẩm mới buộc phải sửa interface factory và mọi factory cụ thể.",
    ],
    related: ["factory-method", "builder", "singleton"],
    diagram: {
      width: 920,
      classes: [
        {
          id: "app",
          name: "Application",
          kind: "client",
          x: 40,
          y: 40,
          w: 200,
          attrs: ["- factory: GUIFactory"],
          ops: ["+ paint(): string"],
        },
        {
          id: "gui",
          name: "GUIFactory",
          kind: "interface",
          focal: true,
          x: 340,
          y: 40,
          w: 240,
          ops: ["+ createButton(): Button", "+ createCheckbox(): Checkbox"],
        },
        { id: "win", name: "WinFactory", x: 680, y: 40, w: 200 },
        { id: "mac", name: "MacFactory", x: 680, y: 108, w: 200 },
        {
          id: "button",
          name: "Button",
          kind: "interface",
          x: 200,
          y: 220,
          w: 200,
          ops: ["+ render(): string"],
        },
        {
          id: "checkbox",
          name: "Checkbox",
          kind: "interface",
          x: 520,
          y: 220,
          w: 200,
          ops: ["+ render(): string"],
        },
        { id: "wb", name: "WinButton", x: 140, y: 380, w: 140 },
        { id: "mb", name: "MacButton", x: 320, y: 380, w: 140 },
        { id: "wc", name: "WinCheckbox", x: 500, y: 380, w: 140 },
        { id: "mc", name: "MacCheckbox", x: 680, y: 380, w: 140 },
      ],
      relations: [
        {
          from: "win",
          to: "gui",
          kind: "realize",
          fromSide: "left",
          toSide: "right",
          fromAt: 60,
          toAt: 60,
          accent: true,
        },
        {
          from: "mac",
          to: "gui",
          kind: "realize",
          fromSide: "left",
          toSide: "right",
          fromAt: 128,
          toAt: 128,
          accent: true,
        },
        {
          from: "app",
          to: "gui",
          kind: "assoc",
          fromAt: 100,
          toAt: 100,
          toMult: "1",
        },
        {
          from: "gui",
          to: "button",
          kind: "depend",
          fromAt: 420,
          via: 184,
          label: "creates",
        },
        {
          from: "gui",
          to: "checkbox",
          kind: "depend",
          fromAt: 500,
          via: 184,
          label: "creates",
        },
        { from: "wb", to: "button", kind: "realize", via: 344 },
        { from: "mb", to: "button", kind: "realize", via: 344 },
        { from: "wc", to: "checkbox", kind: "realize", via: 344 },
        { from: "mc", to: "checkbox", kind: "realize", via: 344 },
      ],
      notes: [
        {
          x: 140,
          y: 452,
          w: 680,
          text: [
            "WinFactory chỉ tạo Win*, MacFactory chỉ tạo Mac* — các sản phẩm luôn cùng một họ",
          ],
        },
      ],
    },
  },
  {
    slug: "builder",
    name: "Builder",
    viName: "Người xây dựng",
    category: "creational",
    intent:
      "Tách quá trình xây dựng một đối tượng phức tạp thành từng bước, để cùng một quy trình có thể tạo ra nhiều biểu diễn khác nhau.",
    analogy:
      "Xây nhà: đổ móng, dựng tường, lợp mái, làm hồ bơi… Kỹ sư trưởng (Director) biết thứ tự; đội thi công (Builder) quyết định dùng gỗ hay đá.",
    problem:
      "Lớp `House` có constructor với hàng chục tham số tuỳ chọn (`new House(4, 2, true, false, null, …)`), hoặc bùng nổ số lớp con cho mỗi tổ hợp cấu hình.",
    solution:
      "Đưa code xây dựng ra khỏi lớp sản phẩm, vào các đối tượng builder với từng bước riêng (`buildWalls`, `buildRoof`…). Director (tuỳ chọn) gói các chuỗi bước thường dùng thành công thức.",
    participants: [
      {
        name: "HouseBuilder",
        role: "Builder — interface khai báo các bước xây dựng.",
      },
      {
        name: "WoodHouseBuilder",
        role: "ConcreteBuilder — hiện thực các bước và giữ sản phẩm đang xây.",
      },
      { name: "House", role: "Product — đối tượng kết quả." },
      {
        name: "Director",
        role: "Định nghĩa thứ tự gọi các bước để tạo cấu hình phổ biến.",
      },
      {
        name: "Client",
        role: "Tạo builder, gắn vào director và lấy kết quả từ builder.",
      },
    ],
    whenToUse: [
      "Tránh ‘telescoping constructor’ — constructor có quá nhiều tham số tuỳ chọn.",
      "Cần tạo nhiều biểu diễn khác nhau của cùng một sản phẩm (nhà gỗ, nhà đá).",
      "Xây dựng cấu trúc phức tạp như cây Composite, câu truy vấn SQL, HTTP request.",
    ],
    pros: [
      "Xây dựng đối tượng từng bước, có thể trì hoãn hoặc đệ quy các bước.",
      "Tái sử dụng cùng code xây dựng cho nhiều biểu diễn.",
      "Single Responsibility: tách logic xây dựng phức tạp khỏi nghiệp vụ.",
    ],
    cons: ["Tăng độ phức tạp tổng thể vì phải tạo thêm nhiều lớp mới."],
    related: ["abstract-factory", "composite"],
    diagram: {
      width: 880,
      classes: [
        {
          id: "director",
          name: "Director",
          x: 40,
          y: 40,
          w: 220,
          attrs: ["- builder: HouseBuilder"],
          ops: ["+ buildMinimal(): void", "+ buildLuxury(): void"],
        },
        {
          id: "builder",
          name: "HouseBuilder",
          kind: "interface",
          focal: true,
          x: 340,
          y: 40,
          w: 240,
          ops: [
            "+ reset(): void",
            "+ buildWalls(): this",
            "+ buildRoof(): this",
            "+ buildPool(): this",
          ],
        },
        {
          id: "wood",
          name: "WoodHouseBuilder",
          x: 340,
          y: 260,
          w: 240,
          attrs: ["- house: House"],
          ops: ["+ getResult(): House"],
        },
        {
          id: "house",
          name: "House",
          x: 680,
          y: 260,
          w: 180,
          attrs: ["+ parts: string[]"],
          ops: ["+ describe(): string"],
        },
        { id: "client", name: "Client", kind: "client", x: 50, y: 300, w: 200 },
      ],
      relations: [
        {
          from: "director",
          to: "builder",
          kind: "aggregate",
          fromAt: 100,
          toAt: 100,
          toMult: "1",
        },
        { from: "wood", to: "builder", kind: "realize", accent: true },
        {
          from: "wood",
          to: "house",
          kind: "assoc",
          fromAt: 320,
          toAt: 320,
          label: "builds",
        },
        { from: "client", to: "director", kind: "depend", label: "configures" },
        { from: "client", to: "wood", kind: "depend", label: "creates" },
      ],
    },
  },
  {
    slug: "prototype",
    name: "Prototype",
    viName: "Nguyên mẫu",
    category: "creational",
    intent:
      "Tạo đối tượng mới bằng cách sao chép (clone) một đối tượng có sẵn, thay vì phụ thuộc vào lớp cụ thể của nó.",
    analogy:
      "Phân bào: tế bào tự nhân đôi chính nó. Bạn không cần biết ‘công thức’ tạo tế bào — chỉ cần tế bào gốc.",
    problem:
      "Muốn sao chép một đối tượng, bạn phải biết lớp cụ thể của nó và đọc được cả các field private. Code bị phụ thuộc vào lớp, trong khi bạn thường chỉ có trong tay một interface.",
    solution:
      "Giao việc sao chép cho chính đối tượng: mọi prototype hiện thực phương thức `clone()`. Một registry có thể lưu sẵn các mẫu được cấu hình trước để clone khi cần.",
    participants: [
      { name: "Shape", role: "Prototype — khai báo phương thức clone()." },
      {
        name: "Circle, Rectangle",
        role: "ConcretePrototype — tự sao chép chính mình (kể cả field private).",
      },
      {
        name: "ShapeRegistry",
        role: "Prototype registry — lưu các mẫu dùng thường xuyên.",
      },
      {
        name: "Client",
        role: "Tạo bản sao bằng clone() mà không biết lớp cụ thể.",
      },
    ],
    whenToUse: [
      "Code không nên phụ thuộc vào lớp cụ thể của đối tượng cần sao chép.",
      "Muốn giảm số lớp con chỉ khác nhau ở cách khởi tạo — thay bằng các mẫu đã cấu hình sẵn.",
      "Khởi tạo tốn kém (đọc DB, parse file) — clone rẻ hơn tạo mới.",
    ],
    pros: [
      "Clone đối tượng mà không ràng buộc vào lớp cụ thể.",
      "Loại bỏ code khởi tạo lặp lại.",
      "Tạo đối tượng phức tạp thuận tiện hơn.",
    ],
    cons: [
      "Clone đối tượng có tham chiếu vòng (circular reference) khá rắc rối.",
    ],
    related: ["factory-method", "memento", "composite"],
    diagram: {
      width: 880,
      classes: [
        { id: "client", name: "Client", kind: "client", x: 40, y: 80, w: 180 },
        {
          id: "shape",
          name: "Shape",
          kind: "abstract",
          focal: true,
          x: 300,
          y: 40,
          w: 240,
          attrs: ["+ x: number", "+ y: number", "+ color: string"],
          ops: ["+ clone(): Shape"],
        },
        {
          id: "registry",
          name: "ShapeRegistry",
          x: 620,
          y: 40,
          w: 240,
          attrs: ["- items: Map<string, Shape>"],
          ops: ["+ add(key, s: Shape): void", "+ get(key): Shape"],
        },
        {
          id: "circle",
          name: "Circle",
          x: 180,
          y: 280,
          w: 200,
          attrs: ["+ radius: number"],
          ops: ["+ clone(): Circle"],
        },
        {
          id: "rect",
          name: "Rectangle",
          x: 460,
          y: 280,
          w: 200,
          attrs: ["+ width: number", "+ height: number"],
          ops: ["+ clone(): Rectangle"],
        },
      ],
      relations: [
        { from: "circle", to: "shape", kind: "inherit", accent: true },
        { from: "rect", to: "shape", kind: "inherit", accent: true },
        {
          from: "registry",
          to: "shape",
          kind: "aggregate",
          fromAt: 100,
          toAt: 100,
        },
        {
          from: "client",
          to: "shape",
          kind: "depend",
          fromAt: 100,
          toAt: 100,
          label: "clone()",
        },
      ],
      notes: [
        {
          x: 180,
          y: 452,
          w: 480,
          text: [
            "clone() sao chép chính nó — client không cần biết lớp cụ thể",
          ],
        },
      ],
    },
  },
  {
    slug: "singleton",
    name: "Singleton",
    viName: "Đơn thể",
    category: "creational",
    intent:
      "Đảm bảo một lớp chỉ có duy nhất một instance và cung cấp một điểm truy cập toàn cục tới instance đó.",
    analogy:
      "Mỗi quốc gia chỉ có một chính phủ chính thức. Dù ai hỏi ‘chính phủ là ai?’, câu trả lời luôn trỏ về cùng một chủ thể.",
    problem:
      "Nhiều phần của chương trình cần dùng chung một tài nguyên (kết nối DB, cấu hình, logger). Tạo nhiều instance gây lãng phí hoặc trạng thái không nhất quán.",
    solution:
      "Đặt constructor là `private` để chặn `new`, và cung cấp phương thức tĩnh `getInstance()` — lần đầu tạo instance, các lần sau trả về instance đã lưu.",
    participants: [
      {
        name: "Database",
        role: "Singleton — giữ instance tĩnh duy nhất và phương thức getInstance().",
      },
      {
        name: "ServiceA, ServiceB",
        role: "Client — luôn lấy instance qua getInstance().",
      },
    ],
    whenToUse: [
      "Một lớp chỉ nên có đúng một instance dùng chung (DB pool, config, cache).",
      "Cần kiểm soát chặt hơn biến toàn cục — không ai ghi đè được instance.",
    ],
    pros: [
      "Chắc chắn chỉ có một instance.",
      "Điểm truy cập toàn cục, khởi tạo lười (lazy) khi cần lần đầu.",
    ],
    cons: [
      "Vi phạm Single Responsibility (vừa quản lý vòng đời, vừa làm nghiệp vụ).",
      "Che giấu phụ thuộc, khó unit test và khó mock.",
      "Cần xử lý cẩn thận trong môi trường đa luồng.",
    ],
    related: ["facade", "flyweight", "abstract-factory"],
    diagram: {
      width: 880,
      classes: [
        { id: "a", name: "ServiceA", kind: "client", x: 40, y: 80, w: 160 },
        { id: "b", name: "ServiceB", kind: "client", x: 40, y: 180, w: 160 },
        {
          id: "db",
          name: "Database",
          focal: true,
          x: 300,
          y: 60,
          w: 280,
          attrs: ["- static instance: Database", "- queries: number"],
          ops: [
            "- constructor()",
            "+ static getInstance(): Database",
            "+ query(sql: string): string",
          ],
        },
      ],
      relations: [
        {
          from: "a",
          to: "db",
          kind: "depend",
          fromAt: 100,
          toAt: 100,
          label: "getInstance()",
        },
        {
          from: "b",
          to: "db",
          kind: "depend",
          fromAt: 200,
          toAt: 200,
          label: "getInstance()",
        },
        {
          from: "db",
          to: "db",
          kind: "assoc",
          fromSide: "right",
          toSide: "right",
          fromAt: 104,
          toAt: 144,
          points: [
            [640, 104],
            [640, 144],
          ],
          accent: true,
          toMult: "1",
        },
      ],
      notes: [
        {
          x: 640,
          y: 180,
          w: 220,
          text: [
            "Constructor private:",
            "mọi nơi dùng chung",
            "một instance duy nhất",
          ],
          attach: "db",
        },
      ],
    },
  },
];
