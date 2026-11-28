/**
 * Copyright (c) 2026 vuvanthanhtb
 * SPDX-License-Identifier: MIT
 */

// Dữ liệu cứng: mã nguồn ví dụ event-sourcing (TypeScript + Java) và output đã chạy thật.
export const eventSourcing = {
  javaFile: "EventSourcingDemo.java",
  tsOutput: [
    '  append v1: {"type":"Opened","owner":"Lan"}',
    '  append v2: {"type":"Deposited","amount":500}',
    '  append v3: {"type":"Withdrawn","amount":200}',
    "  ✗ từ chối rút 900: số dư 300",
    '  append v4: {"type":"Deposited","amount":50}',
    "Trạng thái hiện tại: 350",
    "Số dư tại v3: 300",
    'Projection mới "tổng tiền nạp": 550',
  ],
  javaOutput: [
    '  append v1: {"type":"Opened","owner":"Lan"}',
    '  append v2: {"type":"Deposited","amount":500}',
    '  append v3: {"type":"Withdrawn","amount":200}',
    "  ✗ từ chối rút 900: số dư 300",
    '  append v4: {"type":"Deposited","amount":50}',
    "Trạng thái hiện tại: 350",
    "Số dư tại v3: 300",
    'Projection mới "tổng tiền nạp": 550',
  ],
  typescript: `type Event =
  | { type: "Opened"; owner: string }
  | { type: "Deposited"; amount: number }
  | { type: "Withdrawn"; amount: number };

// Event store: chỉ THÊM, không bao giờ sửa hay xoá
class EventStore {
  private streams = new Map<string, Event[]>();
  append(id: string, e: Event) {
    const s = this.streams.get(id) ?? [];
    s.push(e);
    this.streams.set(id, s);
    console.log(\`  append v\${s.length}: \${JSON.stringify(e)}\`);
  }
  load(id: string) {
    return [...(this.streams.get(id) ?? [])];
  }
}

// Aggregate: trạng thái hiện tại = gấp (fold) toàn bộ sự kiện
class Account {
  owner = "";
  balance = 0;
  static replay(events: Event[]) {
    const acc = new Account();
    for (const e of events) acc.apply(e);
    return acc;
  }
  apply(e: Event) {
    if (e.type === "Opened") this.owner = e.owner;
    if (e.type === "Deposited") this.balance += e.amount;
    if (e.type === "Withdrawn") this.balance -= e.amount;
  }
}

const store = new EventStore();
const handle = (id: string, cmd: Event) => {
  const acc = Account.replay(store.load(id));   // dựng lại trạng thái trước khi xử lý lệnh
  if (cmd.type === "Withdrawn" && cmd.amount > acc.balance) return console.log(\`  ✗ từ chối rút \${cmd.amount}: số dư \${acc.balance}\`);
  store.append(id, cmd);
};

handle("ACC-1", { type: "Opened", owner: "Lan" });
handle("ACC-1", { type: "Deposited", amount: 500 });
handle("ACC-1", { type: "Withdrawn", amount: 200 });
handle("ACC-1", { type: "Withdrawn", amount: 900 });
handle("ACC-1", { type: "Deposited", amount: 50 });

const events = store.load("ACC-1");
console.log(\`Trạng thái hiện tại: \${Account.replay(events).balance}\`);
// Du hành thời gian: trạng thái tại bất kỳ phiên bản nào trong quá khứ
console.log(\`Số dư tại v3: \${Account.replay(events.slice(0, 3)).balance}\`);
// Projection mới từ sự kiện cũ — không cần migrate dữ liệu
const totalIn = events.reduce((s, e) => s + (e.type === "Deposited" ? e.amount : 0), 0);
console.log(\`Projection mới "tổng tiền nạp": \${totalIn}\`);`,
  java: `import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class EventSourcingDemo {
    static final EventStore store = new EventStore();

    public static void main(String[] args) {
        handle("ACC-1", new Event("Opened", "Lan", 0));
        handle("ACC-1", new Event("Deposited", null, 500));
        handle("ACC-1", new Event("Withdrawn", null, 200));
        handle("ACC-1", new Event("Withdrawn", null, 900));
        handle("ACC-1", new Event("Deposited", null, 50));

        List<Event> events = store.load("ACC-1");
        System.out.println("Trạng thái hiện tại: " + Account.replay(events).balance);
        // Du hành thời gian: trạng thái tại bất kỳ phiên bản nào trong quá khứ
        System.out.println("Số dư tại v3: " + Account.replay(events.subList(0, 3)).balance);
        // Projection mới từ sự kiện cũ — không cần migrate dữ liệu
        long totalIn = events.stream().filter(e -> e.type().equals("Deposited")).mapToLong(Event::amount).sum();
        System.out.println("Projection mới \\"tổng tiền nạp\\": " + totalIn);
    }

    static void handle(String id, Event cmd) {
        Account acc = Account.replay(store.load(id)); // dựng lại trạng thái trước khi xử lý lệnh
        if (cmd.type().equals("Withdrawn") && cmd.amount() > acc.balance) {
            System.out.println("  ✗ từ chối rút " + cmd.amount() + ": số dư " + acc.balance);
            return;
        }
        store.append(id, cmd);
    }
}

record Event(String type, String owner, long amount) {
    String json() {
        return type.equals("Opened")
            ? "{\\"type\\":\\"Opened\\",\\"owner\\":\\"" + owner + "\\"}"
            : "{\\"type\\":\\"" + type + "\\",\\"amount\\":" + amount + "}";
    }
}

// Event store: chỉ THÊM, không bao giờ sửa hay xoá
class EventStore {
    private final Map<String, List<Event>> streams = new HashMap<>();

    void append(String id, Event e) {
        List<Event> s = streams.computeIfAbsent(id, k -> new ArrayList<>());
        s.add(e);
        System.out.println("  append v" + s.size() + ": " + e.json());
    }

    List<Event> load(String id) { return new ArrayList<>(streams.getOrDefault(id, List.of())); }
}

// Aggregate: trạng thái hiện tại = gấp (fold) toàn bộ sự kiện
class Account {
    String owner = "";
    long balance = 0;

    static Account replay(List<Event> events) {
        Account acc = new Account();
        for (Event e : events) acc.apply(e);
        return acc;
    }

    void apply(Event e) {
        switch (e.type()) {
            case "Opened" -> owner = e.owner();
            case "Deposited" -> balance += e.amount();
            case "Withdrawn" -> balance -= e.amount();
            default -> { }
        }
    }
}`,
};
