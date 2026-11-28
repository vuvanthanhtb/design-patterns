/**
 * Copyright (c) 2026 vuvanthanhtb
 * SPDX-License-Identifier: MIT
 */

// Dữ liệu cứng: mã nguồn ví dụ clean-architecture (TypeScript + Java) và output đã chạy thật.
export const cleanArchitecture = {
  javaFile: "CleanArchitectureDemo.java",
  tsOutput: [
    "  [DB] lưu 2 dòng",
    '201 {"id":"ORD-1","total":220000}',
    '422 {"error":"Số lượng phải > 0"}',
  ],
  javaOutput: [
    "  [DB] lưu 2 dòng",
    '201 {"id":"ORD-1","total":220000}',
    '422 {"error":"Số lượng phải > 0"}',
  ],
  typescript: `// ── Vòng 1 · Entities: quy tắc nghiệp vụ cốt lõi, ổn định nhất ──
class Order {
  readonly items: { sku: string; qty: number; price: number }[];
  constructor(items: { sku: string; qty: number; price: number }[]) {
    if (items.some((i) => i.qty <= 0)) throw new Error("Số lượng phải > 0");
    this.items = items;
  }
  total() {
    return this.items.reduce((s, i) => s + i.qty * i.price, 0);
  }
}

// ── Vòng 2 · Use cases: điều phối, định nghĩa interface mình cần ──
interface OrderGateway {
  save(order: Order): string;
}
interface PlaceOrderOutput {
  present(result: { id: string; total: number } | { error: string }): void;
}

class PlaceOrderInteractor {
  private gateway: OrderGateway;
  private output: PlaceOrderOutput;
  constructor(gateway: OrderGateway, output: PlaceOrderOutput) {
    this.gateway = gateway;
    this.output = output;
  }
  execute(input: { sku: string; qty: number; price: number }[]) {
    try {
      const order = new Order(input);
      this.output.present({ id: this.gateway.save(order), total: order.total() });
    } catch (e) {
      this.output.present({ error: (e as Error).message });
    }
  }
}

// ── Vòng 3 · Interface adapters: chuyển đổi dữ liệu ──
class OrderController {
  private interactor: PlaceOrderInteractor;
  constructor(interactor: PlaceOrderInteractor) {
    this.interactor = interactor;
  }
  post(body: string) {
    this.interactor.execute(JSON.parse(body));
  }
}
class JsonPresenter implements PlaceOrderOutput {
  present(r: { id: string; total: number } | { error: string }) {
    console.log("error" in r ? \`422 \${JSON.stringify(r)}\` : \`201 \${JSON.stringify(r)}\`);
  }
}

// ── Vòng 4 · Frameworks & drivers: chi tiết dễ thay (DB, web…) ──
class InMemoryDb implements OrderGateway {
  private n = 0;
  save(order: Order) {
    console.log(\`  [DB] lưu \${order.items.length} dòng\`);
    return \`ORD-\${++this.n}\`;
  }
}

// Mọi phụ thuộc trong mã nguồn đều hướng VÀO TRONG (về phía Entities)
const app = new OrderController(new PlaceOrderInteractor(new InMemoryDb(), new JsonPresenter()));
app.post('[{"sku":"A1","qty":2,"price":50000},{"sku":"B2","qty":1,"price":120000}]');
app.post('[{"sku":"A1","qty":0,"price":50000}]');`,
  java: `import java.util.List;

public class CleanArchitectureDemo {
    public static void main(String[] args) {
        // Mọi phụ thuộc trong mã nguồn đều hướng VÀO TRONG (về phía Entities)
        OrderController app = new OrderController(new PlaceOrderInteractor(new InMemoryDb(), new JsonPresenter()));
        app.post(List.of(new Line("A1", 2, 50_000), new Line("B2", 1, 120_000)));
        app.post(List.of(new Line("A1", 0, 50_000)));
    }
}

record Line(String sku, int qty, long price) {}

// ── Vòng 1 · Entities: quy tắc nghiệp vụ cốt lõi, ổn định nhất ──
class Order {
    final List<Line> items;

    Order(List<Line> items) {
        if (items.stream().anyMatch(i -> i.qty() <= 0)) throw new IllegalArgumentException("Số lượng phải > 0");
        this.items = items;
    }

    long total() { return items.stream().mapToLong(i -> i.qty() * i.price()).sum(); }
}

// ── Vòng 2 · Use cases: điều phối, định nghĩa interface mình cần ──
interface OrderGateway {
    String save(Order order);
}

interface PlaceOrderOutput {
    void success(String id, long total);
    void failure(String error);
}

class PlaceOrderInteractor {
    private final OrderGateway gateway;
    private final PlaceOrderOutput output;

    PlaceOrderInteractor(OrderGateway gateway, PlaceOrderOutput output) {
        this.gateway = gateway;
        this.output = output;
    }

    void execute(List<Line> input) {
        try {
            Order order = new Order(input);
            output.success(gateway.save(order), order.total());
        } catch (IllegalArgumentException e) {
            output.failure(e.getMessage());
        }
    }
}

// ── Vòng 3 · Interface adapters: chuyển đổi dữ liệu ──
class OrderController {
    private final PlaceOrderInteractor interactor;
    OrderController(PlaceOrderInteractor interactor) { this.interactor = interactor; }
    void post(List<Line> body) { interactor.execute(body); }
}

class JsonPresenter implements PlaceOrderOutput {
    public void success(String id, long total) {
        System.out.println("201 {\\"id\\":\\"" + id + "\\",\\"total\\":" + total + "}");
    }
    public void failure(String error) {
        System.out.println("422 {\\"error\\":\\"" + error + "\\"}");
    }
}

// ── Vòng 4 · Frameworks & drivers: chi tiết dễ thay (DB, web…) ──
class InMemoryDb implements OrderGateway {
    private int n = 0;
    public String save(Order order) {
        System.out.println("  [DB] lưu " + order.items.size() + " dòng");
        return "ORD-" + (++n);
    }
}`,
};
