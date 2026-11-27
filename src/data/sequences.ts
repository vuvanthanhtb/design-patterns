import type { SeqMessage, Sequence } from "@/lib/types";

// Ký hiệu ngắn gọn cho các loại thông điệp UML sequence
const call = (from: string, to: string, label: string): SeqMessage => ({ from, to, label, kind: "call" });
const ret = (from: string, to: string, label: string): SeqMessage => ({ from, to, label, kind: "return" });
const async = (from: string, to: string, label: string): SeqMessage => ({ from, to, label, kind: "async" });
const create = (from: string, to: string, label = "«create»"): SeqMessage => ({ from, to, label, kind: "create" });
const self = (id: string, label: string): SeqMessage => ({ from: id, to: id, label, kind: "call" });

export const SEQUENCES: Record<string, Sequence> = {
  "factory-method": {
    participants: [
      { id: "client", label: "client" },
      { id: "road", label: "RoadLogistics", focal: true },
      { id: "truck", label: "Truck" },
    ],
    steps: [
      { title: "Gọi nghiệp vụ", text: "Client gọi `planDelivery()` trên một `Logistics` — nó không biết đây là chi nhánh đường bộ.", messages: [call("client", "road", "planDelivery(#1024)")] },
      { title: "Factory method", text: "Lớp cha gọi `createTransport()`. Lớp con `RoadLogistics` quyết định: tạo một `Truck`.", messages: [self("road", "createTransport()"), create("road", "truck", "new Truck()")] },
      { title: "Dùng qua interface", text: "Logic chung chỉ gọi `deliver()` trên interface `Transport` — không có `if/else` theo loại xe.", messages: [call("road", "truck", "deliver()"), ret("truck", "road", "\"xe tải đường bộ\"")] },
      { title: "Trả kết quả", text: "Đổi sang `SeaLogistics` là có `Ship` — code của client không đổi một dòng.", messages: [ret("road", "client", "\"Đơn #1024: …\"")] },
    ],
  },
  "abstract-factory": {
    participants: [
      { id: "main", label: "main" },
      { id: "app", label: "Application" },
      { id: "f", label: "WinFactory", focal: true },
      { id: "btn", label: "WinButton" },
      { id: "cb", label: "WinCheckbox" },
    ],
    steps: [
      { title: "Chọn họ sản phẩm", text: "Cấu hình chọn `WinFactory` đúng một lần và truyền vào `Application`.", messages: [call("main", "app", "new Application(winFactory)"), call("main", "app", "paint()")] },
      { title: "Tạo nút", text: "Application xin một `Button` từ factory — nhận về `WinButton` mà không cần biết tên lớp.", messages: [call("app", "f", "createButton()"), create("f", "btn")] },
      { title: "Tạo checkbox", text: "Cùng factory nên checkbox chắc chắn thuộc họ Windows.", messages: [call("app", "f", "createCheckbox()"), create("f", "cb")] },
      { title: "Vẽ giao diện", text: "Hai sản phẩm được dùng qua interface `Button` và `Checkbox`.", messages: [call("app", "btn", "render()"), call("app", "cb", "render()")] },
      { title: "Kết quả đồng bộ", text: "Giao diện luôn cùng phong cách. Đổi sang `MacFactory` là đổi cả bộ.", messages: [ret("app", "main", "\"[ OK ]  [x] (Windows)\"")] },
    ],
  },
  builder: {
    participants: [
      { id: "client", label: "client" },
      { id: "dir", label: "Director" },
      { id: "b", label: "WoodHouseBuilder", focal: true },
      { id: "house", label: "House" },
    ],
    steps: [
      { title: "Gắn builder", text: "Client tạo builder cụ thể và đưa cho Director.", messages: [call("client", "dir", "setBuilder(builder)")] },
      { title: "Chạy công thức", text: "`buildLuxury()` biết thứ tự các bước; builder biết cách làm từng bước.", messages: [call("client", "dir", "buildLuxury()"), call("dir", "b", "buildWalls()")] },
      { title: "Từng bước một", text: "Các bước trả về `this` nên có thể nối chuỗi.", messages: [call("dir", "b", "buildRoof()"), call("dir", "b", "buildPool()")] },
      { title: "Lấy sản phẩm", text: "Kết quả lấy từ builder, không phải từ Director — builder reset để xây căn tiếp theo.", messages: [call("client", "b", "getResult()"), ret("b", "client", "house")] },
      { title: "Dùng sản phẩm", text: "Một `House` hoàn chỉnh, không cần constructor với hàng chục tham số.", messages: [call("client", "house", "describe()"), ret("house", "client", "\"tường + mái + hồ bơi\"")] },
    ],
  },
  prototype: {
    participants: [
      { id: "client", label: "client" },
      { id: "reg", label: "ShapeRegistry" },
      { id: "proto", label: "bigRed: Circle", focal: true },
      { id: "copy", label: "copy: Circle" },
    ],
    steps: [
      { title: "Đăng ký mẫu", text: "Một hình tròn đỏ bán kính 20 được cấu hình sẵn và lưu vào registry.", messages: [call("client", "reg", "add(\"big-red-circle\", bigRed)")] },
      { title: "Xin bản sao", text: "Client chỉ biết khoá, không biết lớp cụ thể. Registry nhờ chính mẫu tự sao chép.", messages: [call("client", "reg", "get(\"big-red-circle\")"), call("reg", "proto", "clone()")] },
      { title: "Tự sao chép", text: "`Circle` dùng constructor sao chép nên copy được cả field private.", messages: [create("proto", "copy", "new Circle(this)"), ret("proto", "reg", "copy")] },
      { title: "Bản sao độc lập", text: "Sửa bản sao không ảnh hưởng mẫu gốc.", messages: [ret("reg", "client", "copy"), call("client", "copy", "x = 100")] },
    ],
  },
  singleton: {
    participants: [
      { id: "a", label: "ServiceA" },
      { id: "b", label: "ServiceB" },
      { id: "cls", label: "Database «class»" },
      { id: "db", label: "instance: Database", focal: true },
    ],
    steps: [
      { title: "Lần gọi đầu tiên", text: "`instance` còn rỗng nên `getInstance()` gọi constructor private — đúng một lần.", messages: [call("a", "cls", "getInstance()"), create("cls", "db", "new Database()")] },
      { title: "Dùng instance", text: "ServiceA nhận instance và chạy truy vấn.", messages: [ret("cls", "a", "instance"), call("a", "db", "query(users)")] },
      { title: "Lần gọi thứ hai", text: "ServiceB gọi `getInstance()` — không tạo mới, trả về instance đã lưu.", messages: [call("b", "cls", "getInstance()"), ret("cls", "b", "cùng instance")] },
      { title: "Trạng thái dùng chung", text: "Bộ đếm truy vấn tăng lên #2 vì cả hai service dùng chung một đối tượng.", messages: [call("b", "db", "query(orders)"), ret("db", "b", "\"#2 SELECT …\"")] },
    ],
    fragments: [{ kind: "opt", guard: "[instance == null]", fromStep: 0, toStep: 0 }],
  },
  adapter: {
    participants: [
      { id: "client", label: "Checkout" },
      { id: "ad", label: "StripeAdapter", focal: true },
      { id: "api", label: "StripeApi" },
    ],
    steps: [
      { title: "Gọi interface quen thuộc", text: "Checkout gọi `pay(250000)` theo interface `PaymentProcessor`.", messages: [call("client", "ad", "pay(250000)")] },
      { title: "Dịch dữ liệu", text: "Adapter đổi VND sang cents USD — thứ mà Stripe hiểu.", messages: [self("ad", "250.000₫ → 1000 cents")] },
      { title: "Gọi adaptee", text: "Interface của Stripe khác hẳn: `charge(cents, currency)`.", messages: [call("ad", "api", "charge(1000, \"usd\")"), ret("api", "ad", "{ id: ch_1000 }")] },
      { title: "Trả về đúng định dạng", text: "Kết quả được dịch ngược lại thành chuỗi mà Checkout mong đợi.", messages: [ret("ad", "client", "\"Đã thanh toán …\"")] },
    ],
  },
  bridge: {
    participants: [
      { id: "client", label: "client" },
      { id: "remote", label: "AdvancedRemote" },
      { id: "dev", label: "device: Radio", focal: true },
    ],
    steps: [
      { title: "Bật thiết bị", text: "Remote không biết đang điều khiển TV hay Radio — nó chỉ hỏi qua interface `Device`.", messages: [call("client", "remote", "togglePower()"), call("remote", "dev", "isEnabled()")] },
      { title: "Uỷ quyền", text: "Abstraction chuyển lời gọi qua ‘cây cầu’ `device`.", messages: [call("remote", "dev", "enable()"), ret("remote", "client", "\"Radio: BẬT\"")] },
      { title: "Tăng âm lượng", text: "Logic cấp cao (cộng 10) nằm ở remote; lưu trữ âm lượng nằm ở thiết bị.", messages: [call("client", "remote", "volumeUp()"), call("remote", "dev", "setVolume(v + 10)")] },
      { title: "Tính năng mở rộng", text: "`mute()` chỉ có ở `AdvancedRemote` — thêm vào phía abstraction mà không đụng Device.", messages: [call("client", "remote", "mute()"), call("remote", "dev", "setVolume(0)")] },
    ],
  },
  composite: {
    participants: [
      { id: "client", label: "client" },
      { id: "root", label: "project: Folder", focal: true },
      { id: "readme", label: "README.md: File" },
      { id: "src", label: "src: Folder" },
    ],
    steps: [
      { title: "Hỏi gốc cây", text: "Client gọi `getSize()` trên thư mục gốc — giống hệt cách gọi trên một file.", messages: [call("client", "root", "getSize()")] },
      { title: "Lá trả lời ngay", text: "File là lá: trả về kích thước của chính nó.", messages: [call("root", "readme", "getSize()"), ret("readme", "root", "4")] },
      { title: "Nhánh đệ quy", text: "Thư mục con lại hỏi các con của nó — cùng một interface, đệ quy tự nhiên.", messages: [call("root", "src", "getSize()"), self("src", "Σ con = 21")] },
      { title: "Cộng dồn", text: "Kết quả được cộng dồn ngược lên gốc.", messages: [ret("src", "root", "21"), ret("root", "client", "27 KB")] },
    ],
    fragments: [{ kind: "loop", guard: "[mỗi child]", fromStep: 1, toStep: 2 }],
  },
  decorator: {
    participants: [
      { id: "client", label: "client" },
      { id: "slack", label: "SlackDecorator", focal: true },
      { id: "sms", label: "SmsDecorator" },
      { id: "email", label: "EmailNotifier" },
    ],
    steps: [
      { title: "Gọi lớp ngoài cùng", text: "Client chỉ thấy một `Notifier` — thực ra là một chồng wrapper.", messages: [call("client", "slack", "send(msg)")] },
      { title: "Đi vào trong", text: "Mỗi decorator gọi `wrappee.send()` trước khi thêm hành vi của nó.", messages: [call("slack", "sms", "send(msg)"), call("sms", "email", "send(msg)")] },
      { title: "Hành vi gốc", text: "Đối tượng lõi gửi email; SmsDecorator nối thêm dòng SMS.", messages: [ret("email", "sms", "📧 Email"), ret("sms", "slack", "📧 + 📱 SMS")] },
      { title: "Lớp ngoài thêm Slack", text: "Ba kênh thông báo từ một lời gọi — không cần lớp con cho từng tổ hợp.", messages: [self("slack", "+ 💬 Slack"), ret("slack", "client", "3 kênh")] },
    ],
  },
  facade: {
    participants: [
      { id: "client", label: "client" },
      { id: "f", label: "VideoConverter", focal: true },
      { id: "codec", label: "CodecFactory" },
      { id: "br", label: "BitrateReader" },
      { id: "mix", label: "AudioMixer" },
    ],
    steps: [
      { title: "Một lời gọi", text: "Client chỉ cần biết `convert(file, format)`.", messages: [call("client", "f", "convert(holiday.ogg, mp4)")] },
      { title: "Phát hiện codec", text: "Facade bắt đầu điều phối hệ thống con.", messages: [call("f", "codec", "extract(file)"), ret("codec", "f", "ogg")] },
      { title: "Đọc và chuyển đổi", text: "Đúng thứ tự mà thư viện yêu cầu — client không phải nhớ.", messages: [call("f", "br", "read(file, ogg)"), call("f", "br", "convert(buf, mp4)")] },
      { title: "Hoàn thiện âm thanh", text: "Bước cuối của quy trình phức tạp.", messages: [call("f", "mix", "fix(result)"), ret("mix", "f", "holiday.ogg.mp4")] },
      { title: "Trả kết quả", text: "Bốn lớp phức tạp ẩn sau một phương thức.", messages: [ret("f", "client", "holiday.ogg.mp4")] },
    ],
  },
  flyweight: {
    participants: [
      { id: "forest", label: "Forest" },
      { id: "fac", label: "TreeFactory" },
      { id: "type", label: "pine: TreeType", focal: true },
      { id: "tree", label: "tree: Tree" },
    ],
    steps: [
      { title: "Trồng cây đầu tiên", text: "Forest xin kiểu cây ‘Thông’ từ factory.", messages: [call("forest", "fac", "getType(Thông, …)")] },
      { title: "Tạo flyweight", text: "Chưa có trong cache nên factory tạo `TreeType` — phần nặng (texture) chỉ tạo một lần.", messages: [create("fac", "type", "new TreeType()"), ret("fac", "forest", "pine")] },
      { title: "Context nhẹ", text: "Mỗi `Tree` chỉ giữ x, y và một tham chiếu tới flyweight.", messages: [create("forest", "tree", "new Tree(0, 0, pine)")] },
      { title: "Cây thứ 100.000", text: "Lần sau factory trả lại đúng đối tượng cũ từ cache.", messages: [call("forest", "fac", "getType(Thông, …)"), ret("fac", "forest", "pine (cache)")] },
      { title: "Vẽ", text: "Trạng thái ngoại lai (x, y) được truyền vào khi gọi flyweight.", messages: [call("forest", "tree", "draw()"), call("tree", "type", "draw(x, y)")] },
    ],
    fragments: [{ kind: "opt", guard: "[chưa có trong cache]", fromStep: 1, toStep: 1 }],
  },
  proxy: {
    participants: [
      { id: "client", label: "client" },
      { id: "proxy", label: "CachedVideoProxy", focal: true },
      { id: "yt", label: "YouTubeService" },
    ],
    steps: [
      { title: "Yêu cầu đầu tiên", text: "Client gọi `getVideo()` qua interface `VideoService` — không biết đó là proxy.", messages: [call("client", "proxy", "getVideo(cat)")] },
      { title: "Cache miss", text: "Proxy chưa có video nên chuyển yêu cầu tới dịch vụ thật (chậm).", messages: [self("proxy", "cache miss"), call("proxy", "yt", "getVideo(cat)")] },
      { title: "Lưu và trả về", text: "Kết quả được lưu vào cache trước khi trả cho client.", messages: [ret("yt", "proxy", "<video cat>"), ret("proxy", "client", "<video cat>")] },
      { title: "Yêu cầu lặp lại", text: "Lần này proxy trả lời ngay từ cache.", messages: [call("client", "proxy", "getVideo(cat)"), self("proxy", "cache hit")] },
      { title: "Không chạm dịch vụ thật", text: "5 lần xem chỉ tốn 2 lần gọi YouTube.", messages: [ret("proxy", "client", "<video cat>")] },
    ],
  },
  "chain-of-responsibility": {
    participants: [
      { id: "client", label: "client" },
      { id: "auth", label: "AuthHandler", focal: true },
      { id: "rate", label: "RateLimitHandler" },
      { id: "valid", label: "ValidationHandler" },
    ],
    steps: [
      { title: "Vào đầu chuỗi", text: "Client chỉ biết handler đầu tiên.", messages: [call("client", "auth", "handle(req)")] },
      { title: "Xác thực", text: "Đã đăng nhập → chuyển tiếp cho handler kế tiếp.", messages: [self("auth", "user ✓"), call("auth", "rate", "next.handle(req)")] },
      { title: "Giới hạn tần suất", text: "Chưa vượt 2 request → đi tiếp.", messages: [self("rate", "hits ≤ 2 ✓"), call("rate", "valid", "next.handle(req)")] },
      { title: "Kiểm tra dữ liệu", text: "Có email; đây là cuối chuỗi nên trả 200 OK.", messages: [self("valid", "email ✓"), ret("valid", "rate", "200 OK")] },
      { title: "Trả ngược về", text: "Bất kỳ handler nào cũng có thể dừng chuỗi sớm (401, 429, 400).", messages: [ret("rate", "auth", "200 OK"), ret("auth", "client", "200 OK")] },
    ],
  },
  command: {
    participants: [
      { id: "client", label: "client" },
      { id: "tb", label: "Toolbar" },
      { id: "cmd", label: "InsertTextCommand", focal: true },
      { id: "ed", label: "Editor" },
    ],
    steps: [
      { title: "Đóng gói yêu cầu", text: "Thao tác ‘chèn chữ’ trở thành một đối tượng chứa editor + text.", messages: [create("client", "cmd", "new Insert(editor, text)"), call("client", "tb", "click(cmd)")] },
      { title: "Thực thi", text: "Invoker chỉ gọi `execute()` — không biết command làm gì.", messages: [call("tb", "cmd", "execute()"), call("cmd", "ed", "insert(text)")] },
      { title: "Ghi lịch sử", text: "Command được đẩy vào stack để hoàn tác.", messages: [self("tb", "history.push(cmd)")] },
      { title: "Hoàn tác", text: "Lấy command cuối và gọi `undo()`.", messages: [call("client", "tb", "undoLast()"), call("tb", "cmd", "undo()")] },
      { title: "Receiver đảo ngược", text: "Command biết cách đảo ngược chính nó.", messages: [call("cmd", "ed", "deleteLast(n)")] },
    ],
  },
  interpreter: {
    participants: [
      { id: "client", label: "client" },
      { id: "mul", label: "MultiplyExpr", focal: true },
      { id: "add", label: "AddExpr" },
      { id: "x", label: "x: VariableExpr" },
      { id: "ctx", label: "Context" },
    ],
    steps: [
      { title: "Thông dịch từ gốc", text: "Cây của `(x + 2) * y` có gốc là phép nhân.", messages: [call("client", "mul", "interpret(ctx)")] },
      { title: "Đi xuống cây", text: "Mỗi nút non-terminal thông dịch các con trước.", messages: [call("mul", "add", "interpret(ctx)"), call("add", "x", "interpret(ctx)")] },
      { title: "Tra cứu biến", text: "Terminal `x` đọc giá trị từ Context.", messages: [call("x", "ctx", "lookup(\"x\")"), ret("ctx", "x", "3")] },
      { title: "Cộng dồn lên", text: "`AddExpr` tính 3 + 2.", messages: [ret("x", "add", "3"), ret("add", "mul", "5")] },
      { title: "Kết quả", text: "Nhân với y = 4 → 20.", messages: [self("mul", "5 × y(4)"), ret("mul", "client", "20")] },
    ],
  },
  iterator: {
    participants: [
      { id: "client", label: "client" },
      { id: "pl", label: "Playlist" },
      { id: "it", label: "PlaylistIterator", focal: true },
    ],
    steps: [
      { title: "Xin iterator", text: "Collection tạo iterator phù hợp với cấu trúc bên trong của nó.", messages: [call("client", "pl", "createIterator()"), create("pl", "it")] },
      { title: "Nhận iterator", text: "Client chỉ giữ interface `Iterator<Song>`.", messages: [ret("pl", "client", "it")] },
      { title: "Còn phần tử?", text: "Iterator giữ vị trí hiện tại.", messages: [call("client", "it", "hasNext()"), ret("it", "client", "true")] },
      { title: "Lấy phần tử", text: "Iterator đọc collection và tiến vị trí.", messages: [call("client", "it", "next()"), call("it", "pl", "at(index)")] },
      { title: "Trả về bài hát", text: "Lặp lại tới khi `hasNext()` trả về false.", messages: [ret("it", "client", "Song")] },
    ],
    fragments: [{ kind: "loop", guard: "[while hasNext()]", fromStep: 2, toStep: 4 }],
  },
  mediator: {
    participants: [
      { id: "pw", label: "password: TextBox" },
      { id: "dlg", label: "AuthDialog", focal: true },
      { id: "btn", label: "submit: Button" },
      { id: "guest", label: "guest: Checkbox" },
    ],
    steps: [
      { title: "Component báo sự kiện", text: "Ô mật khẩu không biết nút submit — nó chỉ báo cho mediator.", messages: [self("pw", "type(\"bí-mật-123\")"), call("pw", "dlg", "notify(this, input)")] },
      { title: "Mediator quyết định", text: "Mật khẩu đủ 6 ký tự → mediator bật nút.", messages: [call("dlg", "btn", "enabled = true")] },
      { title: "Bấm nút", text: "Nút cũng chỉ báo cho mediator.", messages: [call("btn", "dlg", "notify(this, click)"), self("dlg", "✅ gửi form")] },
      { title: "Đổi chế độ khách", text: "Logic ẩn/hiện ô mật khẩu nằm gọn trong mediator.", messages: [call("guest", "dlg", "notify(this, toggle)"), call("dlg", "pw", "visible = false")] },
    ],
  },
  memento: {
    participants: [
      { id: "client", label: "client" },
      { id: "hist", label: "History" },
      { id: "ed", label: "Editor", focal: true },
      { id: "snap", label: "s: Snapshot" },
    ],
    steps: [
      { title: "Sao lưu", text: "Caretaker yêu cầu originator tự chụp trạng thái.", messages: [call("client", "hist", "backup()"), call("hist", "ed", "save()")] },
      { title: "Tạo snapshot", text: "Snapshot bất biến; History chỉ giữ chứ không đọc.", messages: [create("ed", "snap"), ret("ed", "hist", "s")] },
      { title: "Tiếp tục soạn", text: "Trạng thái của Editor thay đổi.", messages: [call("client", "ed", "type(\" — GoF\")")] },
      { title: "Hoàn tác", text: "History lấy snapshot gần nhất và trả cho Editor.", messages: [call("client", "hist", "undo()"), call("hist", "ed", "restore(s)")] },
      { title: "Khôi phục", text: "Chỉ Editor đọc nội dung snapshot — đóng gói được giữ nguyên.", messages: [call("ed", "snap", "content, cursor"), ret("snap", "ed", "trạng thái cũ")] },
    ],
  },
  observer: {
    participants: [
      { id: "client", label: "client" },
      { id: "agency", label: "NewsAgency", focal: true },
      { id: "email", label: "lan: EmailSubscriber" },
      { id: "app", label: "phone: MobileApp" },
    ],
    steps: [
      { title: "Đăng ký", text: "Hai subscriber đăng ký nhận tin.", messages: [call("client", "agency", "subscribe(lan)"), call("client", "agency", "subscribe(phone)")] },
      { title: "Có tin mới", text: "Publisher không cần biết ai đang nghe.", messages: [call("client", "agency", "publish(news)")] },
      { title: "Thông báo", text: "Lặp qua danh sách, gọi `update()` trên từng subscriber.", messages: [async("agency", "email", "update(news)"), async("agency", "app", "update(news)")] },
      { title: "Huỷ đăng ký", text: "Danh sách thay đổi lúc runtime.", messages: [call("client", "agency", "unsubscribe(lan)")] },
      { title: "Tin tiếp theo", text: "Chỉ còn điện thoại nhận được thông báo.", messages: [call("client", "agency", "publish(news2)"), async("agency", "app", "update(news2)")] },
    ],
    fragments: [{ kind: "loop", guard: "[mỗi subscriber]", fromStep: 2, toStep: 2 }],
  },
  state: {
    participants: [
      { id: "client", label: "client" },
      { id: "doc", label: "Document", focal: true },
      { id: "draft", label: "DraftState" },
      { id: "mod", label: "ModerationState" },
      { id: "pub", label: "PublishedState" },
    ],
    steps: [
      { title: "Xuất bản bản nháp", text: "Document uỷ quyền cho state hiện tại.", messages: [call("client", "doc", "publish(author)"), call("doc", "draft", "publish(doc)")] },
      { title: "Chuyển trạng thái", text: "Chính `DraftState` quyết định state tiếp theo.", messages: [call("draft", "doc", "setState(Moderation)")] },
      { title: "Hành vi khác", text: "Cùng lời gọi `publish()`, nhưng giờ là ModerationState trả lời.", messages: [call("client", "doc", "publish(admin)"), call("doc", "mod", "publish(doc)")] },
      { title: "Admin duyệt", text: "Có quyền admin → chuyển sang Published.", messages: [call("mod", "doc", "setState(Published)")] },
      { title: "Hiển thị", text: "Không có `switch (state)` nào trong Document.", messages: [call("client", "doc", "render()"), call("doc", "pub", "render(doc)")] },
    ],
  },
  strategy: {
    participants: [
      { id: "client", label: "client" },
      { id: "nav", label: "Navigator", focal: true },
      { id: "road", label: "RoadStrategy" },
      { id: "walk", label: "WalkingStrategy" },
    ],
    steps: [
      { title: "Chọn chiến lược", text: "Client tạo Navigator với chiến lược đi ô tô.", messages: [call("client", "nav", "new Navigator(road)"), call("client", "nav", "buildRoute(A, B)")] },
      { title: "Uỷ quyền thuật toán", text: "Navigator không tự tính đường — nó gọi strategy.", messages: [call("nav", "road", "buildRoute(A, B)"), ret("road", "nav", "🚗 25 phút")] },
      { title: "Đổi lúc runtime", text: "Một dòng `setStrategy()` là đổi thuật toán.", messages: [call("client", "nav", "setStrategy(walk)")] },
      { title: "Thuật toán mới", text: "Cùng lời gọi, kết quả khác.", messages: [call("client", "nav", "buildRoute(A, C)"), call("nav", "walk", "buildRoute(A, C)")] },
      { title: "Kết quả", text: "Navigator không cần biết có bao nhiêu chiến lược tồn tại.", messages: [ret("walk", "nav", "🚶 1h10"), ret("nav", "client", "lộ trình")] },
    ],
  },
  "template-method": {
    participants: [
      { id: "client", label: "client" },
      { id: "miner", label: "CsvMiner", focal: true },
    ],
    steps: [
      { title: "Gọi template method", text: "`mine()` được định nghĩa ở lớp cha `DataMiner` và là `final`.", messages: [call("client", "miner", "mine(sales.csv)")] },
      { title: "Bước của lớp con", text: "`openFile()` là abstract — CsvMiner tự hiện thực.", messages: [self("miner", "openFile(path) «Csv»")] },
      { title: "Bước của lớp con", text: "`parseData()` cũng do lớp con cung cấp.", messages: [self("miner", "parseData(raw) «Csv»")] },
      { title: "Bước chung + hook", text: "`analyze()` dùng chung; `hook()` mặc định rỗng (PdfMiner override).", messages: [self("miner", "analyze(rows) «base»"), self("miner", "hook() «base»")] },
      { title: "Kết quả", text: "Thứ tự các bước cố định, chỉ chi tiết thay đổi.", messages: [ret("miner", "client", "\"3 dòng, tổng = 400\"")] },
    ],
  },
  visitor: {
    participants: [
      { id: "client", label: "client" },
      { id: "circle", label: "c: Circle" },
      { id: "v", label: "AreaVisitor", focal: true },
      { id: "square", label: "s: Square" },
    ],
    steps: [
      { title: "Mời phần tử", text: "Client gọi `accept(visitor)` trên từng hình.", messages: [call("client", "circle", "accept(area)")] },
      { title: "Double dispatch", text: "Circle biết mình là Circle nên gọi đúng `visitCircle(this)`.", messages: [call("circle", "v", "visitCircle(this)"), self("v", "π·r² = 3.14")] },
      { title: "Trả kết quả", text: "Visitor tích luỹ tổng diện tích qua các lần thăm.", messages: [ret("v", "circle", "\"Circle: 3.14\""), ret("circle", "client", "…")] },
      { title: "Phần tử khác", text: "Square gọi `visitSquare(this)` — không cần `instanceof`.", messages: [call("client", "square", "accept(area)"), call("square", "v", "visitSquare(this)")] },
      { title: "Thêm thao tác mới", text: "Muốn xuất JSON? Viết `JsonExportVisitor` — không sửa Circle/Square.", messages: [ret("v", "square", "\"Square: 9.00\"")] },
    ],
    fragments: [{ kind: "loop", guard: "[mỗi shape]", fromStep: 0, toStep: 4 }],
  },
};
