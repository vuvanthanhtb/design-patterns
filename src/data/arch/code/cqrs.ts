/**
 * Copyright (c) 2026 vuvanthanhtb
 * SPDX-License-Identifier: MIT
 */

// Dữ liệu cứng: mã nguồn ví dụ cqrs (TypeScript + Java) và output đã chạy thật.
export const cqrs = {
  javaFile: "CqrsDemo.java",
  tsOutput: [
    "  [projector] cập nhật view của An",
    "CMD ✓ đã ghi đơn #1",
    "  [projector] cập nhật view của Bình",
    "CMD ✓ đã ghi đơn #2",
    "  [projector] cập nhật view của An",
    "CMD ✓ đã ghi đơn #3",
    "CMD ✗ tổng tiền phải > 0",
    "QUERY top khách hàng → An: 2 đơn / 650000 | Bình: 1 đơn / 500000",
  ],
  javaOutput: [
    "  [projector] cập nhật view của An",
    "CMD ✓ đã ghi đơn #1",
    "  [projector] cập nhật view của Bình",
    "CMD ✓ đã ghi đơn #2",
    "  [projector] cập nhật view của An",
    "CMD ✓ đã ghi đơn #3",
    "CMD ✗ tổng tiền phải > 0",
    "QUERY top khách hàng → An: 2 đơn / 650000 | Bình: 1 đơn / 500000",
  ],
  typescript: `// ── Phía GHI (command): mô hình chuẩn hoá, kiểm tra quy tắc nghiệp vụ ──
type OrderPlaced = { orderId: number; customer: string; total: number };

class CommandSide {
  private orders = new Map<number, { customer: string; total: number }>();
  private listeners: ((e: OrderPlaced) => void)[] = [];
  onEvent(fn: (e: OrderPlaced) => void) {
    this.listeners.push(fn);
  }
  placeOrder(customer: string, total: number) {
    if (total <= 0) return "✗ tổng tiền phải > 0";
    const orderId = this.orders.size + 1;
    this.orders.set(orderId, { customer, total });
    this.listeners.forEach((fn) => fn({ orderId, customer, total }));   // phát sự kiện
    return \`✓ đã ghi đơn #\${orderId}\`;
  }
}

// ── Phía ĐỌC (query): mô hình phi chuẩn hoá, tối ưu cho màn hình ──
class CustomerSummaryView {
  private rows = new Map<string, { orders: number; spent: number }>();
  // Projector: cập nhật view mỗi khi có sự kiện
  project(e: OrderPlaced) {
    const r = this.rows.get(e.customer) ?? { orders: 0, spent: 0 };
    this.rows.set(e.customer, { orders: r.orders + 1, spent: r.spent + e.total });
    console.log(\`  [projector] cập nhật view của \${e.customer}\`);
  }
  // Truy vấn: đọc thẳng, không JOIN, không tính toán
  top() {
    return [...this.rows.entries()]
      .sort((a, b) => b[1].spent - a[1].spent)
      .map(([c, r]) => \`\${c}: \${r.orders} đơn / \${r.spent}\`)
      .join(" | ");
  }
}

const commands = new CommandSide();
const view = new CustomerSummaryView();
commands.onEvent((e) => view.project(e));

console.log("CMD", commands.placeOrder("An", 200_000));
console.log("CMD", commands.placeOrder("Bình", 500_000));
console.log("CMD", commands.placeOrder("An", 450_000));
console.log("CMD", commands.placeOrder("Chi", 0));
console.log("QUERY top khách hàng →", view.top());`,
  java: `import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Consumer;
import java.util.stream.Collectors;

public class CqrsDemo {
    public static void main(String[] args) {
        CommandSide commands = new CommandSide();
        CustomerSummaryView view = new CustomerSummaryView();
        commands.onEvent(view::project);

        System.out.println("CMD " + commands.placeOrder("An", 200_000));
        System.out.println("CMD " + commands.placeOrder("Bình", 500_000));
        System.out.println("CMD " + commands.placeOrder("An", 450_000));
        System.out.println("CMD " + commands.placeOrder("Chi", 0));
        System.out.println("QUERY top khách hàng → " + view.top());
    }
}

record OrderPlaced(int orderId, String customer, long total) {}

// ── Phía GHI (command): mô hình chuẩn hoá, kiểm tra quy tắc nghiệp vụ ──
class CommandSide {
    private final Map<Integer, OrderPlaced> orders = new HashMap<>();
    private final List<Consumer<OrderPlaced>> listeners = new ArrayList<>();

    void onEvent(Consumer<OrderPlaced> fn) { listeners.add(fn); }

    String placeOrder(String customer, long total) {
        if (total <= 0) return "✗ tổng tiền phải > 0";
        int orderId = orders.size() + 1;
        OrderPlaced e = new OrderPlaced(orderId, customer, total);
        orders.put(orderId, e);
        listeners.forEach(fn -> fn.accept(e)); // phát sự kiện
        return "✓ đã ghi đơn #" + orderId;
    }
}

// ── Phía ĐỌC (query): mô hình phi chuẩn hoá, tối ưu cho màn hình ──
class CustomerSummaryView {
    private final Map<String, long[]> rows = new LinkedHashMap<>(); // khách → [số đơn, đã chi]

    // Projector: cập nhật view mỗi khi có sự kiện
    void project(OrderPlaced e) {
        long[] r = rows.computeIfAbsent(e.customer(), k -> new long[2]);
        r[0]++;
        r[1] += e.total();
        System.out.println("  [projector] cập nhật view của " + e.customer());
    }

    // Truy vấn: đọc thẳng, không JOIN, không tính toán
    String top() {
        return rows.entrySet().stream()
            .sorted((a, b) -> Long.compare(b.getValue()[1], a.getValue()[1]))
            .map(en -> en.getKey() + ": " + en.getValue()[0] + " đơn / " + en.getValue()[1])
            .collect(Collectors.joining(" | "));
    }
}`,
};
