/**
 * Copyright (c) 2026 vuvanthanhtb
 * SPDX-License-Identifier: MIT
 */

// Dữ liệu cứng: mã nguồn ví dụ layered (TypeScript + Java) và output đã chạy thật.
export const layered = {
  javaFile: "LayeredDemo.java",
  tsOutput: [
    "[Presentation] POST /orders [cà phê, bánh mì]",
    "  [Business] tính giá 2 món = 60000",
    "  [Persistence] INSERT order #1",
    "→ 201 order #1, tổng 60000",
    "[Presentation] POST /orders []",
    "→ 400 Đơn hàng rỗng",
  ],
  javaOutput: [
    "[Presentation] POST /orders [cà phê, bánh mì]",
    "  [Business] tính giá 2 món = 60000",
    "  [Persistence] INSERT order #1",
    "→ 201 order #1, tổng 60000",
    "[Presentation] POST /orders []",
    "→ 400 Đơn hàng rỗng",
  ],
  typescript: `// ── Tầng dữ liệu (Persistence) ──
interface Order {
  id: number;
  items: string[];
  total: number;
}

class OrderRepository {
  private rows: Order[] = [];
  save(order: Omit<Order, "id">): Order {
    const saved = { id: this.rows.length + 1, ...order };
    this.rows.push(saved);
    console.log(\`  [Persistence] INSERT order #\${saved.id}\`);
    return saved;
  }
}

// ── Tầng nghiệp vụ (Business) ──
class PricingService {
  private prices: Record<string, number> = { "cà phê": 35_000, "bánh mì": 25_000 };
  quote(items: string[]): number {
    const total = items.reduce((s, i) => s + (this.prices[i] ?? 0), 0);
    console.log(\`  [Business] tính giá \${items.length} món = \${total}\`);
    return total;
  }
}

class OrderService {
  private pricing: PricingService;
  private repo: OrderRepository;
  constructor(pricing: PricingService, repo: OrderRepository) {
    this.pricing = pricing;
    this.repo = repo;
  }
  placeOrder(items: string[]): Order {
    if (items.length === 0) throw new Error("Đơn hàng rỗng");   // quy tắc nghiệp vụ
    return this.repo.save({ items, total: this.pricing.quote(items) });
  }
}

// ── Tầng trình bày (Presentation) ──
class OrderController {
  private service: OrderService;
  constructor(service: OrderService) {
    this.service = service;
  }
  // Mỗi tầng chỉ gọi tầng ngay bên dưới nó
  post(body: { items: string[] }): { status: number; body: string } {
    console.log(\`[Presentation] POST /orders [\${body.items.join(", ")}]\`);
    try {
      const order = this.service.placeOrder(body.items);
      return { status: 201, body: \`order #\${order.id}, tổng \${order.total}\` };
    } catch (e) {
      return { status: 400, body: (e as Error).message };
    }
  }
}

// Lắp ráp từ dưới lên
const controller = new OrderController(new OrderService(new PricingService(), new OrderRepository()));
for (const items of [["cà phê", "bánh mì"], []]) {
  const res = controller.post({ items });
  console.log(\`→ \${res.status} \${res.body}\`);
}`,
  java: `import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class LayeredDemo {
    public static void main(String[] args) {
        // Lắp ráp từ dưới lên
        OrderController controller = new OrderController(new OrderService(new PricingService(), new OrderRepository()));
        for (List<String> items : List.of(List.of("cà phê", "bánh mì"), List.<String>of())) {
            Response res = controller.post(items);
            System.out.println("→ " + res.status() + " " + res.body());
        }
    }
}

record Order(int id, List<String> items, int total) {}
record Response(int status, String body) {}

// ── Tầng dữ liệu (Persistence) ──
class OrderRepository {
    private final List<Order> rows = new ArrayList<>();

    Order save(List<String> items, int total) {
        Order saved = new Order(rows.size() + 1, items, total);
        rows.add(saved);
        System.out.println("  [Persistence] INSERT order #" + saved.id());
        return saved;
    }
}

// ── Tầng nghiệp vụ (Business) ──
class PricingService {
    private final Map<String, Integer> prices = Map.of("cà phê", 35_000, "bánh mì", 25_000);

    int quote(List<String> items) {
        int total = items.stream().mapToInt(i -> prices.getOrDefault(i, 0)).sum();
        System.out.println("  [Business] tính giá " + items.size() + " món = " + total);
        return total;
    }
}

class OrderService {
    private final PricingService pricing;
    private final OrderRepository repo;

    OrderService(PricingService pricing, OrderRepository repo) {
        this.pricing = pricing;
        this.repo = repo;
    }

    Order placeOrder(List<String> items) {
        if (items.isEmpty()) throw new IllegalArgumentException("Đơn hàng rỗng"); // quy tắc nghiệp vụ
        return repo.save(items, pricing.quote(items));
    }
}

// ── Tầng trình bày (Presentation) ──
class OrderController {
    private final OrderService service;

    OrderController(OrderService service) { this.service = service; }

    // Mỗi tầng chỉ gọi tầng ngay bên dưới nó
    Response post(List<String> items) {
        System.out.println("[Presentation] POST /orders " + items);
        try {
            Order order = service.placeOrder(items);
            return new Response(201, "order #" + order.id() + ", tổng " + order.total());
        } catch (IllegalArgumentException e) {
            return new Response(400, e.getMessage());
        }
    }
}`,
};
