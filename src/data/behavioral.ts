import type { PatternMeta } from "./meta";

export const behavioral: PatternMeta[] = [
  {
    slug: "chain-of-responsibility",
    name: "Chain of Responsibility",
    viName: "Chuỗi trách nhiệm",
    category: "behavioral",
    intent:
      "Chuyển yêu cầu dọc theo một chuỗi handler. Mỗi handler quyết định xử lý yêu cầu hoặc chuyển tiếp cho handler kế tiếp.",
    analogy:
      "Gọi tổng đài hỗ trợ: robot trả lời trước, không giải quyết được thì chuyển nhân viên, rồi tới kỹ sư. Mỗi tầng chỉ xử lý phần mình có thể.",
    problem:
      "Một API request phải qua xác thực, giới hạn tần suất, kiểm tra dữ liệu… Nhồi tất cả vào một hàm với chuỗi if lồng nhau khiến code khó đọc, khó sắp xếp lại và khó tái sử dụng.",
    solution:
      "Biến mỗi bước kiểm tra thành một handler độc lập có tham chiếu `next`. Client lắp các handler thành chuỗi và gửi yêu cầu vào đầu chuỗi.",
    participants: [
      { name: "Handler", role: "Interface chung, khai báo handle() và setNext()." },
      { name: "BaseHandler", role: "Lớp cơ sở chứa logic chuyển tiếp mặc định cho next." },
      { name: "AuthHandler, RateLimitHandler, ValidationHandler", role: "ConcreteHandler — xử lý hoặc chuyển tiếp." },
      { name: "Client", role: "Lắp ráp chuỗi và gửi yêu cầu." },
    ],
    whenToUse: [
      "Cần xử lý nhiều loại yêu cầu theo nhiều cách, nhưng chưa biết trước loại nào.",
      "Phải thực thi nhiều handler theo thứ tự xác định (middleware pipeline).",
      "Tập handler và thứ tự của chúng cần thay đổi lúc runtime.",
    ],
    pros: [
      "Kiểm soát thứ tự xử lý.",
      "Single Responsibility: tách lớp gọi và lớp xử lý.",
      "Open/Closed: thêm handler mới không sửa code cũ.",
    ],
    cons: ["Một số yêu cầu có thể đi hết chuỗi mà không được xử lý."],
    related: ["command", "mediator", "observer", "decorator", "composite"],
    diagram: {
      width: 880,
      classes: [
        { id: "client", name: "Client", kind: "client", x: 40, y: 60, w: 160 },
        { id: "handler", name: "Handler", kind: "interface", focal: true, x: 300, y: 40, w: 260, ops: ["+ setNext(h: Handler): Handler", "+ handle(req: Request): string"] },
        { id: "base", name: "BaseHandler", kind: "abstract", x: 300, y: 220, w: 260, attrs: ["- next: Handler | null"], ops: ["+ setNext(h: Handler): Handler", "+ handle(req: Request): string"] },
        { id: "auth", name: "AuthHandler", x: 100, y: 440, w: 180, ops: ["+ handle(req): string"] },
        { id: "rate", name: "RateLimitHandler", x: 340, y: 440, w: 180, ops: ["+ handle(req): string"] },
        { id: "valid", name: "ValidationHandler", x: 580, y: 440, w: 200, ops: ["+ handle(req): string"] },
      ],
      relations: [
        { from: "client", to: "handler", kind: "depend", fromAt: 80, toAt: 80 },
        { from: "base", to: "handler", kind: "realize" },
        { from: "base", to: "handler", kind: "assoc", fromSide: "right", toSide: "right", fromAt: 268, toAt: 88, points: [[640, 268], [640, 88]], label: "next", toMult: "0..1", accent: true },
        { from: "auth", to: "base", kind: "inherit", via: 404 },
        { from: "rate", to: "base", kind: "inherit", via: 404 },
        { from: "valid", to: "base", kind: "inherit", via: 404 },
      ],
    },
  },
  {
    slug: "command",
    name: "Command",
    viName: "Mệnh lệnh",
    category: "behavioral",
    intent:
      "Đóng gói một yêu cầu thành một đối tượng độc lập chứa mọi thông tin về yêu cầu đó — cho phép truyền, xếp hàng, ghi log và hoàn tác (undo).",
    analogy:
      "Gọi món ở nhà hàng: phục vụ ghi order lên giấy và đặt vào hàng chờ của bếp. Phiếu order chính là ‘command’ — bếp nấu theo phiếu, không cần biết ai gọi.",
    problem:
      "Nút toolbar, phím tắt và menu ngữ cảnh đều gọi cùng một thao tác chỉnh sửa. Code nghiệp vụ bị nhân bản trong các lớp UI, và không có cách nào để undo.",
    solution:
      "Mỗi thao tác là một lớp command có `execute()` và `undo()`, giữ tham chiếu tới receiver (Editor). UI (invoker) chỉ gọi `execute()` và đẩy command vào lịch sử để hoàn tác.",
    participants: [
      { name: "Command", role: "Interface khai báo execute()/undo()." },
      { name: "InsertTextCommand, DeleteTextCommand", role: "ConcreteCommand — gọi receiver và lưu trạng thái để undo." },
      { name: "Editor", role: "Receiver — chứa logic nghiệp vụ thật." },
      { name: "Toolbar", role: "Invoker — kích hoạt command và giữ lịch sử." },
      { name: "Client", role: "Tạo command và gắn receiver." },
    ],
    whenToUse: [
      "Muốn tham số hoá đối tượng bằng thao tác (callback hướng đối tượng).",
      "Cần xếp hàng, lên lịch, hoặc thực thi thao tác từ xa.",
      "Cần undo/redo.",
    ],
    pros: [
      "Tách lớp gọi thao tác khỏi lớp thực hiện thao tác.",
      "Hỗ trợ undo/redo, trì hoãn thực thi, gộp command (macro).",
      "Open/Closed: thêm command mới không sửa code cũ.",
    ],
    cons: ["Thêm một tầng trung gian giữa sender và receiver, code phức tạp hơn."],
    related: ["chain-of-responsibility", "memento", "strategy", "observer"],
    diagram: {
      width: 880,
      classes: [
        { id: "invoker", name: "Toolbar", x: 40, y: 40, w: 220, attrs: ["- history: Command[]"], ops: ["+ click(cmd: Command): void", "+ undoLast(): void"] },
        { id: "command", name: "Command", kind: "interface", focal: true, x: 320, y: 40, w: 220, ops: ["+ execute(): void", "+ undo(): void"] },
        { id: "client", name: "Client", kind: "client", x: 640, y: 64, w: 180 },
        { id: "insert", name: "InsertTextCommand", x: 200, y: 240, w: 220, attrs: ["- editor: Editor", "- text: string"], ops: ["+ execute(): void", "+ undo(): void"] },
        { id: "delete", name: "DeleteTextCommand", x: 460, y: 240, w: 220, attrs: ["- editor: Editor", "- deleted: string"], ops: ["+ execute(): void", "+ undo(): void"] },
        { id: "editor", name: "Editor", x: 300, y: 480, w: 260, attrs: ["+ content: string"], ops: ["+ insert(t: string): void", "+ deleteLast(n: number): string"] },
      ],
      relations: [
        { from: "invoker", to: "command", kind: "aggregate", fromAt: 92, toAt: 92, toMult: "*" },
        { from: "client", to: "command", kind: "depend", fromAt: 84, toAt: 84, label: "creates" },
        { from: "insert", to: "command", kind: "realize", via: 200, accent: true },
        { from: "delete", to: "command", kind: "realize", via: 200, accent: true },
        { from: "insert", to: "editor", kind: "assoc", via: 440 },
        { from: "delete", to: "editor", kind: "assoc", via: 440 },
      ],
    },
  },
  {
    slug: "interpreter",
    name: "Interpreter",
    viName: "Thông dịch",
    category: "behavioral",
    intent:
      "Với một ngôn ngữ, định nghĩa biểu diễn cho ngữ pháp của nó cùng một bộ thông dịch dùng biểu diễn đó để diễn giải các câu trong ngôn ngữ.",
    analogy:
      "Bản nhạc là một ‘ngôn ngữ’: mỗi nốt là ký hiệu kết thúc (terminal), mỗi ô nhịp là tổ hợp các nốt. Nhạc công ‘thông dịch’ bản nhạc thành âm thanh.",
    problem:
      "Ứng dụng cần tính các biểu thức do người dùng nhập như `x + 2 * y`. Viết bằng chuỗi if/regex nhanh chóng trở nên mong manh khi ngữ pháp mở rộng.",
    solution:
      "Mỗi quy tắc ngữ pháp là một lớp: biểu thức terminal (`NumberExpr`, `VariableExpr`) và non-terminal (`AddExpr`, `MultiplyExpr`) chứa các biểu thức con. Cây cú pháp tự đánh giá bằng `interpret(ctx)` đệ quy.",
    participants: [
      { name: "Expression", role: "AbstractExpression — khai báo interpret(ctx)." },
      { name: "NumberExpr, VariableExpr", role: "TerminalExpression — lá của cây cú pháp." },
      { name: "AddExpr, MultiplyExpr", role: "NonterminalExpression — chứa biểu thức con." },
      { name: "Context", role: "Thông tin toàn cục (giá trị biến)." },
    ],
    whenToUse: [
      "Ngữ pháp đơn giản và hiệu năng không phải ưu tiên hàng đầu.",
      "DSL nhỏ: biểu thức lọc, quy tắc nghiệp vụ, công thức tính.",
    ],
    pros: ["Dễ thay đổi và mở rộng ngữ pháp.", "Mỗi quy tắc là một lớp nhỏ, dễ hiện thực."],
    cons: ["Ngữ pháp phức tạp sẽ sinh ra quá nhiều lớp — nên dùng parser generator."],
    related: ["composite", "iterator", "visitor"],
    diagram: {
      width: 980,
      classes: [
        { id: "ctx", name: "Context", x: 40, y: 40, w: 220, attrs: ["- vars: Map<string, number>"], ops: ["+ lookup(name): number"] },
        { id: "expr", name: "Expression", kind: "interface", focal: true, x: 340, y: 40, w: 280, ops: ["+ interpret(ctx: Context): number"] },
        { id: "num", name: "NumberExpr", x: 40, y: 220, w: 180, attrs: ["- value: number"], ops: ["+ interpret(ctx): number"] },
        { id: "var", name: "VariableExpr", x: 250, y: 220, w: 180, attrs: ["- name: string"], ops: ["+ interpret(ctx): number"] },
        { id: "add", name: "AddExpr", x: 460, y: 220, w: 200, attrs: ["- left: Expression", "- right: Expression"], ops: ["+ interpret(ctx): number"] },
        { id: "mul", name: "MultiplyExpr", x: 690, y: 220, w: 200, attrs: ["- left: Expression", "- right: Expression"], ops: ["+ interpret(ctx): number"] },
      ],
      relations: [
        { from: "expr", to: "ctx", kind: "depend", fromAt: 84, toAt: 84, label: "reads" },
        { from: "num", to: "expr", kind: "realize", via: 184 },
        { from: "var", to: "expr", kind: "realize", via: 184 },
        { from: "add", to: "expr", kind: "realize", via: 184 },
        { from: "mul", to: "expr", kind: "realize", via: 184 },
        { from: "mul", to: "expr", kind: "compose", fromSide: "right", toSide: "right", fromAt: 260, toAt: 100, points: [[920, 260], [920, 100]], toMult: "2", accent: true },
        { from: "add", to: "expr", kind: "compose", fromSide: "bottom", toSide: "right", fromAt: 560, toAt: 72, points: [[560, 392], [944, 392], [944, 72]], toMult: "2", accent: true },
      ],
      notes: [{ x: 40, y: 380, w: 340, text: ["(x + 2) * y  →  cây cú pháp", "interpret() đệ quy từ gốc xuống lá"] }],
    },
  },
  {
    slug: "iterator",
    name: "Iterator",
    viName: "Bộ duyệt",
    category: "behavioral",
    intent:
      "Cho phép duyệt tuần tự các phần tử của một tập hợp mà không làm lộ cấu trúc bên dưới (list, cây, đồ thị…).",
    analogy:
      "Tham quan một thành phố: bạn có thể đi theo app bản đồ, theo hướng dẫn viên, hay tự đi. Thành phố không đổi — chỉ ‘cách duyệt’ thay đổi.",
    problem:
      "Tập hợp có thể là mảng, cây hay đồ thị. Nếu client tự viết vòng lặp phụ thuộc vào cấu trúc bên trong, mỗi khi đổi cấu trúc hoặc thêm cách duyệt mới là phải sửa client.",
    solution:
      "Đưa logic duyệt ra một đối tượng iterator riêng với `hasNext()` / `next()`. Collection chỉ cần cung cấp `createIterator()`. Trong TypeScript, có thể hiện thực luôn giao thức `Symbol.iterator` để dùng `for…of`.",
    participants: [
      { name: "Iterator<T>", role: "Interface khai báo các thao tác duyệt." },
      { name: "PlaylistIterator", role: "ConcreteIterator — giữ vị trí hiện tại, thuật toán duyệt cụ thể." },
      { name: "IterableCollection<T>", role: "Interface khai báo phương thức tạo iterator." },
      { name: "Playlist", role: "ConcreteCollection — trả về iterator phù hợp." },
    ],
    whenToUse: [
      "Tập hợp có cấu trúc phức tạp, muốn che giấu khỏi client.",
      "Muốn giảm trùng lặp code duyệt trong ứng dụng.",
      "Cần duyệt nhiều cấu trúc khác nhau theo cùng một cách.",
    ],
    pros: [
      "Single Responsibility: tách thuật toán duyệt khỏi collection.",
      "Có thể duyệt song song nhiều iterator trên cùng collection.",
      "Có thể tạm dừng và tiếp tục duyệt.",
    ],
    cons: ["Quá mức cần thiết với collection đơn giản; đôi khi kém hiệu quả hơn duyệt trực tiếp."],
    related: ["composite", "factory-method", "memento", "visitor"],
    diagram: {
      width: 880,
      classes: [
        { id: "it", name: "Iterator<T>", kind: "interface", focal: true, x: 40, y: 40, w: 220, ops: ["+ hasNext(): boolean", "+ next(): T"] },
        { id: "coll", name: "IterableCollection<T>", kind: "interface", x: 500, y: 40, w: 260, ops: ["+ createIterator(): Iterator<T>"] },
        { id: "pit", name: "PlaylistIterator", x: 40, y: 240, w: 220, attrs: ["- playlist: Playlist", "- index: number"], ops: ["+ hasNext(): boolean", "+ next(): Song"] },
        { id: "pl", name: "Playlist", x: 500, y: 240, w: 260, attrs: ["- songs: Song[]"], ops: ["+ add(s: Song): this", "+ createIterator(): Iterator<Song>"] },
      ],
      relations: [
        { from: "coll", to: "it", kind: "depend", fromAt: 84, toAt: 84, label: "returns" },
        { from: "pit", to: "it", kind: "realize", accent: true },
        { from: "pl", to: "coll", kind: "realize" },
        { from: "pl", to: "pit", kind: "depend", fromAt: 300, toAt: 300, label: "creates" },
        { from: "pit", to: "pl", kind: "assoc", fromSide: "right", toSide: "left", fromAt: 356, toAt: 356 },
      ],
      notes: [{ x: 280, y: 148, w: 200, text: ["Client chỉ biết hai", "interface phía trên"] }],
    },
  },
  {
    slug: "mediator",
    name: "Mediator",
    viName: "Người trung gian",
    category: "behavioral",
    intent:
      "Giảm sự phụ thuộc chằng chịt giữa các đối tượng bằng cách buộc chúng giao tiếp qua một đối tượng trung gian.",
    analogy:
      "Phi công không nói chuyện trực tiếp với nhau để quyết định ai hạ cánh trước — mọi liên lạc đều qua đài kiểm soát không lưu.",
    problem:
      "Trong form đăng nhập, checkbox ‘dùng tài khoản khách’ ẩn ô mật khẩu, nút submit kiểm tra ô username… Các component gọi nhau trực tiếp nên không thể tái sử dụng ở form khác.",
    solution:
      "Các component chỉ báo sự kiện cho mediator (`dialog.notify(this, 'check')`). `AuthDialog` biết tất cả component và quyết định phản ứng. Component chỉ phụ thuộc vào interface `Mediator`.",
    participants: [
      { name: "Mediator", role: "Interface với phương thức notify(sender, event)." },
      { name: "AuthDialog", role: "ConcreteMediator — giữ tham chiếu các component và điều phối." },
      { name: "Component", role: "Lớp cơ sở giữ tham chiếu tới mediator." },
      { name: "Checkbox, TextBox, Button", role: "ConcreteComponent — không biết đến nhau." },
    ],
    whenToUse: [
      "Khó thay đổi các lớp vì chúng gắn chặt với hàng loạt lớp khác.",
      "Không thể tái sử dụng component ở chỗ khác vì nó phụ thuộc quá nhiều.",
      "Đang tạo vô số lớp con chỉ để tái sử dụng hành vi trong ngữ cảnh khác.",
    ],
    pros: [
      "Single Responsibility: gom giao tiếp vào một chỗ.",
      "Open/Closed: thêm mediator mới không sửa component.",
      "Giảm coupling, tái sử dụng component dễ hơn.",
    ],
    cons: ["Mediator có thể tiến hoá thành ‘god object’."],
    related: ["facade", "observer", "chain-of-responsibility", "command"],
    diagram: {
      width: 880,
      classes: [
        { id: "mediator", name: "Mediator", kind: "interface", focal: true, x: 320, y: 40, w: 240, ops: ["+ notify(sender, event): void"] },
        { id: "dialog", name: "AuthDialog", x: 320, y: 200, w: 240, attrs: ["- guest: Checkbox", "- password: TextBox", "- submit: Button"], ops: ["+ notify(sender, event): void"] },
        { id: "comp", name: "Component", kind: "abstract", x: 320, y: 440, w: 240, attrs: ["# dialog: Mediator"], ops: ["+ emit(event): void"] },
        { id: "cb", name: "Checkbox", x: 140, y: 660, w: 160 },
        { id: "tb", name: "TextBox", x: 360, y: 660, w: 160 },
        { id: "bt", name: "Button", x: 580, y: 660, w: 160 },
      ],
      relations: [
        { from: "dialog", to: "mediator", kind: "realize" },
        { from: "dialog", to: "comp", kind: "aggregate", toMult: "*" },
        { from: "comp", to: "mediator", kind: "assoc", fromSide: "left", toSide: "left", fromAt: 500, toAt: 84, points: [[260, 500], [260, 84]], label: "dialog", accent: true },
        { from: "cb", to: "comp", kind: "inherit", via: 620 },
        { from: "tb", to: "comp", kind: "inherit", via: 620 },
        { from: "bt", to: "comp", kind: "inherit", via: 620 },
      ],
      notes: [{ x: 620, y: 240, w: 240, text: ["Component không gọi nhau", "trực tiếp — mọi thứ qua", "mediator"], attach: "dialog" }],
    },
  },
  {
    slug: "memento",
    name: "Memento",
    viName: "Vật lưu niệm",
    category: "behavioral",
    intent:
      "Lưu và khôi phục trạng thái trước đó của một đối tượng mà không làm lộ chi tiết hiện thực của nó.",
    analogy:
      "Save game: trước trận đánh trùm, bạn lưu lại. Thua thì load lại đúng thời điểm đó — game không cần cho bạn xem cấu trúc file save.",
    problem:
      "Muốn làm undo cho trình soạn thảo, bạn phải chụp lại trạng thái. Nhưng nếu lớp bên ngoài đọc trực tiếp các field private của Editor, bạn phá vỡ đóng gói và mọi thay đổi field đều kéo theo sửa code chụp.",
    solution:
      "Chính Editor (originator) tạo snapshot của mình — một đối tượng bất biến mà chỉ Editor hiểu nội dung. `History` (caretaker) chỉ giữ danh sách snapshot, không đọc bên trong.",
    participants: [
      { name: "Editor", role: "Originator — tạo snapshot trạng thái và khôi phục từ snapshot." },
      { name: "Snapshot", role: "Memento — đối tượng giá trị bất biến lưu trạng thái." },
      { name: "History", role: "Caretaker — biết ‘khi nào’ và ‘tại sao’ chụp, giữ ngăn xếp snapshot." },
    ],
    whenToUse: [
      "Cần tạo snapshot trạng thái để khôi phục (undo, transaction rollback).",
      "Truy cập trực tiếp vào field của đối tượng sẽ vi phạm đóng gói.",
    ],
    pros: [
      "Snapshot trạng thái mà không vi phạm đóng gói.",
      "Đơn giản hoá originator — caretaker giữ lịch sử.",
    ],
    cons: [
      "Tốn RAM nếu tạo snapshot quá thường xuyên.",
      "Caretaker phải theo dõi vòng đời của originator để dọn snapshot cũ.",
    ],
    related: ["command", "iterator", "prototype"],
    diagram: {
      width: 880,
      classes: [
        { id: "editor", name: "Editor", focal: true, x: 40, y: 40, w: 240, attrs: ["- content: string", "- cursor: number"], ops: ["+ type(text: string): void", "+ save(): Snapshot", "+ restore(s: Snapshot): void"] },
        { id: "snap", name: "Snapshot", x: 360, y: 60, w: 220, attrs: ["- readonly content: string", "- readonly cursor: number"], ops: ["+ getDate(): Date"] },
        { id: "history", name: "History", x: 360, y: 300, w: 220, attrs: ["- stack: Snapshot[]"], ops: ["+ backup(): void", "+ undo(): void"] },
      ],
      relations: [
        { from: "editor", to: "snap", kind: "depend", fromAt: 100, toAt: 100, label: "creates", accent: true },
        { from: "history", to: "snap", kind: "aggregate", toMult: "0..*" },
        { from: "history", to: "editor", kind: "assoc", fromSide: "left", toSide: "bottom", fromAt: 380, label: "originator" },
      ],
      notes: [{ x: 640, y: 84, w: 220, text: ["Snapshot bất biến — chỉ", "Editor đọc được nội dung"], attach: "snap" }],
    },
  },
  {
    slug: "observer",
    name: "Observer",
    viName: "Người quan sát",
    category: "behavioral",
    intent:
      "Định nghĩa cơ chế đăng ký để thông báo cho nhiều đối tượng về bất kỳ sự kiện nào xảy ra với đối tượng mà chúng đang theo dõi.",
    analogy:
      "Đăng ký nhận báo: toà soạn gửi số mới tới mọi người đăng ký ngay khi phát hành. Bạn không cần ngày nào cũng ra sạp hỏi.",
    problem:
      "Nhiều phần của ứng dụng cần biết khi có tin mới. Nếu chúng liên tục hỏi (polling) thì lãng phí; nếu publisher gửi cho tất cả mọi người thì làm phiền những ai không quan tâm.",
    solution:
      "Publisher giữ danh sách subscriber cùng các phương thức `subscribe` / `unsubscribe`. Khi có sự kiện, nó lặp qua danh sách và gọi `update()` trên từng subscriber qua một interface chung.",
    participants: [
      { name: "NewsAgency", role: "Publisher — giữ danh sách subscriber, phát sự kiện." },
      { name: "Subscriber", role: "Interface với phương thức update()." },
      { name: "EmailSubscriber, MobileApp", role: "ConcreteSubscriber — phản ứng với thông báo." },
    ],
    whenToUse: [
      "Thay đổi trạng thái của một đối tượng cần kéo theo thay đổi ở các đối tượng khác, mà tập đối tượng đó không biết trước hoặc thay đổi động.",
      "Hệ thống sự kiện UI, pub/sub, reactive store.",
    ],
    pros: [
      "Open/Closed: thêm subscriber mới không sửa publisher.",
      "Thiết lập quan hệ giữa các đối tượng lúc runtime.",
    ],
    cons: ["Subscriber được thông báo theo thứ tự không xác định; dễ rò rỉ bộ nhớ nếu quên unsubscribe."],
    related: ["mediator", "chain-of-responsibility", "command"],
    diagram: {
      width: 880,
      classes: [
        { id: "pub", name: "NewsAgency", x: 40, y: 40, w: 260, attrs: ["- subscribers: Subscriber[]", "- latest: string"], ops: ["+ subscribe(s: Subscriber): void", "+ unsubscribe(s: Subscriber): void", "+ publish(news: string): void"] },
        { id: "sub", name: "Subscriber", kind: "interface", focal: true, x: 480, y: 40, w: 260, ops: ["+ update(news: string): string"] },
        { id: "email", name: "EmailSubscriber", x: 400, y: 240, w: 200, attrs: ["- email: string"], ops: ["+ update(news): string"] },
        { id: "app", name: "MobileApp", x: 640, y: 240, w: 200, attrs: ["- deviceId: string"], ops: ["+ update(news): string"] },
      ],
      relations: [
        { from: "pub", to: "sub", kind: "aggregate", fromAt: 84, toAt: 84, label: "notifies", toMult: "0..*", accent: true },
        { from: "email", to: "sub", kind: "realize", via: 196 },
        { from: "app", to: "sub", kind: "realize", via: 196 },
      ],
      notes: [{ x: 40, y: 284, w: 300, text: ["publish() lặp qua danh sách và", "gọi update() trên từng subscriber"], attach: "pub" }],
    },
  },
  {
    slug: "state",
    name: "State",
    viName: "Trạng thái",
    category: "behavioral",
    intent:
      "Cho phép một đối tượng thay đổi hành vi khi trạng thái bên trong thay đổi — trông như thể nó đã đổi sang lớp khác.",
    analogy:
      "Điện thoại: cùng một nút nguồn, khi khoá thì mở màn hình, khi mở thì khoá màn hình, khi hết pin thì hiện biểu tượng sạc. Hành vi phụ thuộc trạng thái.",
    problem:
      "Lớp `Document` có các trạng thái Draft → Moderation → Published. Mỗi phương thức đầy `switch (this.state)`; thêm một trạng thái mới là phải sửa mọi switch.",
    solution:
      "Mỗi trạng thái là một lớp hiện thực interface `State`. `Document` giữ tham chiếu tới state hiện tại và uỷ quyền hành vi cho nó. Bản thân các state quyết định chuyển sang state kế tiếp.",
    participants: [
      { name: "Document", role: "Context — giữ state hiện tại, uỷ quyền hành vi." },
      { name: "State", role: "Interface khai báo hành vi phụ thuộc trạng thái." },
      { name: "DraftState, ModerationState, PublishedState", role: "ConcreteState — hành vi riêng và logic chuyển trạng thái." },
    ],
    whenToUse: [
      "Đối tượng hành xử khác nhau tuỳ trạng thái, số trạng thái lớn và thay đổi thường xuyên.",
      "Lớp bị ô nhiễm bởi điều kiện lớn dựa trên giá trị field.",
      "Nhiều code trùng lặp giữa các trạng thái/chuyển trạng thái tương tự.",
    ],
    pros: [
      "Single Responsibility: mỗi state một lớp.",
      "Open/Closed: thêm state mới không sửa state cũ hay context.",
      "Loại bỏ điều kiện cồng kềnh trong context.",
    ],
    cons: ["Quá mức cần thiết nếu máy trạng thái chỉ có vài trạng thái và hiếm khi đổi."],
    related: ["strategy", "bridge", "flyweight"],
    diagram: {
      width: 940,
      classes: [
        { id: "doc", name: "Document", x: 40, y: 40, w: 240, attrs: ["- state: State"], ops: ["+ setState(s: State): void", "+ publish(): string", "+ render(): string"] },
        { id: "state", name: "State", kind: "interface", focal: true, x: 480, y: 40, w: 260, ops: ["+ publish(doc: Document): string", "+ render(): string"] },
        { id: "draft", name: "DraftState", x: 300, y: 240, w: 180, ops: ["+ publish(doc): string"] },
        { id: "mod", name: "ModerationState", x: 510, y: 240, w: 180, ops: ["+ publish(doc): string"] },
        { id: "pubd", name: "PublishedState", x: 720, y: 240, w: 180, ops: ["+ publish(doc): string"] },
      ],
      relations: [
        { from: "doc", to: "state", kind: "aggregate", fromAt: 84, toAt: 84, label: "current", toMult: "1", accent: true },
        { from: "draft", to: "state", kind: "realize", via: 204 },
        { from: "mod", to: "state", kind: "realize", via: 204 },
        { from: "pubd", to: "state", kind: "realize", via: 204 },
      ],
      notes: [{ x: 300, y: 356, w: 600, text: ["Draft → Moderation → Published: mỗi state tự gọi doc.setState(next)"] }],
    },
  },
  {
    slug: "strategy",
    name: "Strategy",
    viName: "Chiến lược",
    category: "behavioral",
    intent:
      "Định nghĩa một họ thuật toán, đóng gói từng thuật toán vào lớp riêng và làm cho chúng có thể hoán đổi cho nhau lúc runtime.",
    analogy:
      "Ra sân bay: đi taxi, xe buýt hay xe đạp tuỳ ngân sách và thời gian. Mục tiêu như nhau — chỉ ‘chiến lược’ di chuyển khác nhau.",
    problem:
      "App bản đồ ban đầu chỉ tìm đường cho ô tô, sau đó thêm đi bộ, phương tiện công cộng… Lớp `Navigator` phình to với mỗi thuật toán mới, và mọi thay đổi đều có nguy cơ phá vỡ thuật toán khác.",
    solution:
      "Tách mỗi thuật toán vào một lớp hiện thực interface `RouteStrategy`. `Navigator` (context) giữ tham chiếu tới một strategy và uỷ quyền công việc; client chọn strategy phù hợp.",
    participants: [
      { name: "Navigator", role: "Context — giữ tham chiếu strategy, chỉ giao tiếp qua interface." },
      { name: "RouteStrategy", role: "Interface chung cho mọi thuật toán." },
      { name: "RoadStrategy, WalkingStrategy, TransitStrategy", role: "ConcreteStrategy — các biến thể thuật toán." },
      { name: "Client", role: "Chọn và truyền strategy cho context." },
    ],
    whenToUse: [
      "Muốn dùng nhiều biến thể thuật toán và đổi qua lại lúc runtime.",
      "Có nhiều lớp tương tự chỉ khác nhau ở cách thực thi một hành vi.",
      "Muốn tách logic nghiệp vụ khỏi chi tiết hiện thực thuật toán.",
    ],
    pros: [
      "Hoán đổi thuật toán lúc runtime.",
      "Cô lập chi tiết hiện thực của thuật toán.",
      "Thay kế thừa bằng hợp thành; Open/Closed.",
    ],
    cons: ["Client phải hiểu sự khác nhau giữa các strategy để chọn đúng.", "Với vài thuật toán đơn giản, một hàm lambda là đủ."],
    related: ["state", "command", "template-method", "bridge"],
    diagram: {
      width: 960,
      classes: [
        { id: "nav", name: "Navigator", x: 40, y: 40, w: 260, attrs: ["- strategy: RouteStrategy"], ops: ["+ setStrategy(s: RouteStrategy): void", "+ buildRoute(a, b): string"] },
        { id: "strategy", name: "RouteStrategy", kind: "interface", focal: true, x: 500, y: 40, w: 260, ops: ["+ buildRoute(a, b): string"] },
        { id: "road", name: "RoadStrategy", x: 340, y: 240, w: 180, ops: ["+ buildRoute(a, b): string"] },
        { id: "walk", name: "WalkingStrategy", x: 540, y: 240, w: 180, ops: ["+ buildRoute(a, b): string"] },
        { id: "transit", name: "TransitStrategy", x: 740, y: 240, w: 180, ops: ["+ buildRoute(a, b): string"] },
        { id: "client", name: "Client", kind: "client", x: 70, y: 260, w: 200 },
      ],
      relations: [
        { from: "nav", to: "strategy", kind: "aggregate", fromAt: 84, toAt: 84, toMult: "1", accent: true },
        { from: "road", to: "strategy", kind: "realize", via: 196 },
        { from: "walk", to: "strategy", kind: "realize", via: 196 },
        { from: "transit", to: "strategy", kind: "realize", via: 196 },
        { from: "client", to: "nav", kind: "depend", label: "setStrategy" },
      ],
    },
  },
  {
    slug: "template-method",
    name: "Template Method",
    viName: "Phương thức khuôn mẫu",
    category: "behavioral",
    intent:
      "Định nghĩa bộ khung của một thuật toán trong lớp cha, để lớp con override các bước cụ thể mà không thay đổi cấu trúc tổng thể.",
    analogy:
      "Xây nhà theo thiết kế mẫu: móng → khung → tường → điện nước → hoàn thiện là cố định; mỗi chủ nhà được tuỳ chỉnh vài bước như màu sơn, loại gạch.",
    problem:
      "Ứng dụng phân tích dữ liệu từ CSV và PDF. Hai lớp có quy trình gần như y hệt (mở file → parse → phân tích), chỉ khác bước đọc file — code bị lặp lại.",
    solution:
      "Đưa thuật toán vào phương thức `mine()` của lớp cha `DataMiner`, chia thành các bước. Bước chung hiện thực sẵn; bước khác biệt là abstract; hook là bước tuỳ chọn có hiện thực rỗng.",
    participants: [
      { name: "DataMiner", role: "AbstractClass — chứa template method và các bước (abstract/hook)." },
      { name: "CsvMiner, PdfMiner", role: "ConcreteClass — override các bước cần thiết, không override template method." },
    ],
    whenToUse: [
      "Cho phép client mở rộng một số bước của thuật toán, nhưng không phải toàn bộ cấu trúc.",
      "Nhiều lớp có thuật toán gần giống nhau, chỉ khác vài chi tiết.",
    ],
    pros: ["Loại bỏ code trùng lặp bằng cách kéo phần chung lên lớp cha.", "Lớp con chỉ override phần nhỏ cần thiết."],
    cons: [
      "Khung thuật toán có thể giới hạn client.",
      "Dễ vi phạm Liskov nếu lớp con chặn một bước mặc định.",
      "Càng nhiều bước càng khó bảo trì.",
    ],
    related: ["factory-method", "strategy"],
    diagram: {
      width: 880,
      classes: [
        { id: "miner", name: "DataMiner", kind: "abstract", focal: true, x: 300, y: 40, w: 280, ops: ["+ mine(path: string): string", "# openFile(path): string", "# parseData(raw): Row[]", "# analyze(rows: Row[]): string", "# hook(): void"] },
        { id: "csv", name: "CsvMiner", x: 120, y: 300, w: 220, ops: ["# openFile(path): string", "# parseData(raw): Row[]"] },
        { id: "pdf", name: "PdfMiner", x: 540, y: 300, w: 220, ops: ["# openFile(path): string", "# parseData(raw): Row[]", "# hook(): void"] },
      ],
      relations: [
        { from: "csv", to: "miner", kind: "inherit", via: 256, accent: true },
        { from: "pdf", to: "miner", kind: "inherit", via: 256, accent: true },
      ],
      notes: [{ x: 620, y: 40, w: 240, text: ["mine() là template method:", "open → parse → analyze → hook", "thứ tự cố định"], attach: "miner" }],
    },
  },
  {
    slug: "visitor",
    name: "Visitor",
    viName: "Khách viếng thăm",
    category: "behavioral",
    intent:
      "Tách thuật toán khỏi các đối tượng mà nó thao tác, cho phép thêm thao tác mới cho một cấu trúc đối tượng mà không sửa các lớp đó.",
    analogy:
      "Nhân viên bảo hiểm đến từng nhà: với nhà dân thì chào bảo hiểm y tế, với ngân hàng thì bảo hiểm trộm cắp, với nhà máy thì bảo hiểm cháy nổ. Cùng một người, hành động tuỳ loại nơi đến.",
    problem:
      "Bạn có các lớp hình học `Circle`, `Square` ổn định. Giờ cần xuất JSON, tính diện tích, xuất SVG… Nhét từng tính năng vào mỗi lớp làm chúng phình to và lẫn lộn trách nhiệm.",
    solution:
      "Đặt mỗi thao tác vào một lớp visitor với các phương thức `visitCircle`, `visitSquare`. Mỗi phần tử chỉ cần `accept(v)` gọi đúng phương thức của visitor — kỹ thuật ‘double dispatch’.",
    participants: [
      { name: "Visitor", role: "Interface khai báo visitX() cho từng loại phần tử." },
      { name: "JsonExportVisitor, AreaVisitor", role: "ConcreteVisitor — một thao tác, hiện thực cho mọi loại phần tử." },
      { name: "Shape", role: "Element — khai báo accept(visitor)." },
      { name: "Circle, Square", role: "ConcreteElement — accept() chuyển hướng tới đúng visitX()." },
    ],
    whenToUse: [
      "Cần thực hiện thao tác trên mọi phần tử của cấu trúc phức tạp (ví dụ cây AST).",
      "Muốn tách logic phụ khỏi lớp nghiệp vụ chính.",
      "Hành vi chỉ có nghĩa với một vài lớp trong hệ phân cấp.",
    ],
    pros: [
      "Open/Closed: thêm thao tác mới không sửa các lớp phần tử.",
      "Single Responsibility: gom các biến thể của một thao tác vào một lớp.",
      "Visitor có thể tích luỹ thông tin khi duyệt.",
    ],
    cons: [
      "Phải cập nhật mọi visitor khi thêm/xoá lớp phần tử.",
      "Visitor có thể thiếu quyền truy cập field private của phần tử.",
    ],
    related: ["composite", "iterator", "command"],
    diagram: {
      width: 920,
      classes: [
        { id: "visitor", name: "Visitor", kind: "interface", focal: true, x: 40, y: 40, w: 280, ops: ["+ visitCircle(c: Circle): string", "+ visitSquare(s: Square): string"] },
        { id: "json", name: "JsonExportVisitor", x: 20, y: 220, w: 164, ops: ["+ visitCircle(…)", "+ visitSquare(…)"] },
        { id: "area", name: "AreaVisitor", x: 200, y: 220, w: 164, ops: ["+ visitCircle(…)", "+ visitSquare(…)"] },
        { id: "shape", name: "Shape", kind: "interface", x: 520, y: 40, w: 260, ops: ["+ accept(v: Visitor): string"] },
        { id: "circle", name: "Circle", x: 440, y: 220, w: 200, attrs: ["+ radius: number"], ops: ["+ accept(v: Visitor): string"] },
        { id: "square", name: "Square", x: 680, y: 220, w: 200, attrs: ["+ side: number"], ops: ["+ accept(v: Visitor): string"] },
      ],
      relations: [
        { from: "json", to: "visitor", kind: "realize", via: 184, accent: true },
        { from: "area", to: "visitor", kind: "realize", via: 184, accent: true },
        { from: "circle", to: "shape", kind: "realize", via: 184 },
        { from: "square", to: "shape", kind: "realize", via: 184 },
        { from: "shape", to: "visitor", kind: "depend", fromAt: 84, toAt: 84, label: "accept(v)" },
      ],
      notes: [{ x: 440, y: 384, w: 440, text: ["circle.accept(v) gọi v.visitCircle(this) — double dispatch"], attach: "circle" }],
    },
  },
];
