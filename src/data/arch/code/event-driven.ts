/**
 * Copyright (c) 2026 vuvanthanhtb
 * SPDX-License-Identifier: MIT
 */

// Dữ liệu cứng: mã nguồn ví dụ event-driven (TypeScript + Java) và output đã chạy thật.
export const eventDriven = {
  javaFile: "EventDrivenDemo.java",
  tsOutput: [
    "+ email đăng ký",
    "+ inventory đăng ký",
    "📣 publish OrderPlaced #1",
    "  ✓ email: gửi xác nhận đơn #1",
    "  ✓ inventory: trừ kho cho đơn #1",
    "📣 publish OrderPlaced #2",
    "  ✓ email: gửi xác nhận đơn #2",
    "  ⏸ inventory offline — giữ 1 sự kiện trong hàng đợi",
    "inventory hoạt động lại:",
    "  ✓ inventory: trừ kho cho đơn #2",
    "+ analytics đăng ký (phát lại 2 sự kiện cũ)",
    "  ✓ analytics: ghi doanh thu 120000",
    "  ✓ analytics: ghi doanh thu 80000",
  ],
  javaOutput: [
    "+ email đăng ký",
    "+ inventory đăng ký",
    "📣 publish OrderPlaced #1",
    "  ✓ email: gửi xác nhận đơn #1",
    "  ✓ inventory: trừ kho cho đơn #1",
    "📣 publish OrderPlaced #2",
    "  ✓ email: gửi xác nhận đơn #2",
    "  ⏸ inventory offline — giữ 1 sự kiện trong hàng đợi",
    "inventory hoạt động lại:",
    "  ✓ inventory: trừ kho cho đơn #2",
    "+ analytics đăng ký (phát lại 2 sự kiện cũ)",
    "  ✓ analytics: ghi doanh thu 120000",
    "  ✓ analytics: ghi doanh thu 80000",
  ],
  typescript: `type Event = { type: string; orderId: number; total: number };
type Subscriber = { name: string; online: boolean; handle: (e: Event) => string };

// Broker: lưu sự kiện bền vững, mỗi subscriber có hàng đợi riêng
class Broker {
  private subs: Subscriber[] = [];
  private pending = new Map<string, Event[]>();
  private log: Event[] = [];

  subscribe(s: Subscriber, replay = false) {
    this.subs.push(s);
    this.pending.set(s.name, replay ? [...this.log] : []);
    console.log(\`+ \${s.name} đăng ký\${replay ? \` (phát lại \${this.log.length} sự kiện cũ)\` : ""}\`);
    this.deliver();
  }
  publish(e: Event) {
    console.log(\`📣 publish \${e.type} #\${e.orderId}\`);
    this.log.push(e);
    for (const s of this.subs) this.pending.get(s.name)!.push(e);
    this.deliver();
  }
  deliver() {
    for (const s of this.subs) {
      const q = this.pending.get(s.name)!;
      if (!s.online) {
        if (q.length) console.log(\`  ⏸ \${s.name} offline — giữ \${q.length} sự kiện trong hàng đợi\`);
        continue;
      }
      while (q.length) console.log(\`  ✓ \${s.name}: \${s.handle(q.shift()!)}\`);
    }
  }
}

const email: Subscriber = { name: "email", online: true, handle: (e) => \`gửi xác nhận đơn #\${e.orderId}\` };
const inventory: Subscriber = { name: "inventory", online: true, handle: (e) => \`trừ kho cho đơn #\${e.orderId}\` };

const broker = new Broker();
broker.subscribe(email);
broker.subscribe(inventory);

// Order service chỉ phát sự kiện — không biết ai đang nghe
broker.publish({ type: "OrderPlaced", orderId: 1, total: 120_000 });
inventory.online = false;
broker.publish({ type: "OrderPlaced", orderId: 2, total: 80_000 });
inventory.online = true;
console.log("inventory hoạt động lại:");
broker.deliver();
broker.subscribe({ name: "analytics", online: true, handle: (e) => \`ghi doanh thu \${e.total}\` }, true);`,
  java: `import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Deque;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;

public class EventDrivenDemo {
    public static void main(String[] args) {
        Subscriber email = new Subscriber("email", e -> "gửi xác nhận đơn #" + e.orderId());
        Subscriber inventory = new Subscriber("inventory", e -> "trừ kho cho đơn #" + e.orderId());

        Broker broker = new Broker();
        broker.subscribe(email, false);
        broker.subscribe(inventory, false);

        // Order service chỉ phát sự kiện — không biết ai đang nghe
        broker.publish(new Event("OrderPlaced", 1, 120_000));
        inventory.online = false;
        broker.publish(new Event("OrderPlaced", 2, 80_000));
        inventory.online = true;
        System.out.println("inventory hoạt động lại:");
        broker.deliver();
        broker.subscribe(new Subscriber("analytics", e -> "ghi doanh thu " + e.total()), true);
    }
}

record Event(String type, int orderId, long total) {}

class Subscriber {
    final String name;
    final Function<Event, String> handle;
    boolean online = true;

    Subscriber(String name, Function<Event, String> handle) {
        this.name = name;
        this.handle = handle;
    }
}

// Broker: lưu sự kiện bền vững, mỗi subscriber có hàng đợi riêng
class Broker {
    private final List<Subscriber> subs = new ArrayList<>();
    private final Map<String, Deque<Event>> pending = new HashMap<>();
    private final List<Event> log = new ArrayList<>();

    void subscribe(Subscriber s, boolean replay) {
        subs.add(s);
        pending.put(s.name, replay ? new ArrayDeque<>(log) : new ArrayDeque<>());
        System.out.println("+ " + s.name + " đăng ký" + (replay ? " (phát lại " + log.size() + " sự kiện cũ)" : ""));
        deliver();
    }

    void publish(Event e) {
        System.out.println("📣 publish " + e.type() + " #" + e.orderId());
        log.add(e);
        for (Subscriber s : subs) pending.get(s.name).add(e);
        deliver();
    }

    void deliver() {
        for (Subscriber s : subs) {
            Deque<Event> q = pending.get(s.name);
            if (!s.online) {
                if (!q.isEmpty()) System.out.println("  ⏸ " + s.name + " offline — giữ " + q.size() + " sự kiện trong hàng đợi");
                continue;
            }
            while (!q.isEmpty()) System.out.println("  ✓ " + s.name + ": " + s.handle.apply(q.poll()));
        }
    }
}`,
};
