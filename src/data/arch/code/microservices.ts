/**
 * Copyright (c) 2026 vuvanthanhtb
 * SPDX-License-Identifier: MIT
 */

// Dữ liệu cứng: mã nguồn ví dụ microservices (TypeScript + Java) và output đã chạy thật.
export const microservices = {
  javaFile: "MicroservicesDemo.java",
  tsOutput: [
    "  client → order POST /orders",
    "  order → inventory POST /reserve",
    "  order → payment POST /charge",
    "→ 201 đơn #1, TX-1",
    "  client → order POST /orders",
    "  order → inventory POST /reserve",
    "→ 409 hết hàng",
    "Kho SKU-1 còn 4 · sổ cái 1 giao dịch · 1 đơn",
  ],
  javaOutput: [
    "  client → order POST /orders",
    "  order → inventory POST /reserve",
    "  order → payment POST /charge",
    "→ 201 đơn #1, TX-1",
    "  client → order POST /orders",
    "  order → inventory POST /reserve",
    "→ 409 hết hàng",
    "Kho SKU-1 còn 4 · sổ cái 1 giao dịch · 1 đơn",
  ],
  typescript: `// Mỗi service sở hữu dữ liệu riêng và chỉ giao tiếp qua API (ở đây giả lập mạng)
type Handler = (body: Record<string, unknown>) => Record<string, unknown>;

class Network {
  private routes = new Map<string, Handler>();
  register(service: string, path: string, h: Handler) {
    this.routes.set(\`\${service}\${path}\`, h);
  }
  call(from: string, service: string, path: string, body: Record<string, unknown> = {}) {
    const h = this.routes.get(\`\${service}\${path}\`);
    if (!h) throw new Error(\`\${service} không phản hồi\`);
    console.log(\`  \${from} → \${service} POST \${path}\`);
    return h(body);
  }
}

const net = new Network();

// ── Inventory service: CSDL riêng ──
const stock = new Map([["SKU-1", 5], ["SKU-2", 0]]);
net.register("inventory", "/reserve", ({ sku }) => {
  const left = stock.get(String(sku)) ?? 0;
  if (left <= 0) return { ok: false, reason: "hết hàng" };
  stock.set(String(sku), left - 1);
  return { ok: true };
});

// ── Payment service: CSDL riêng ──
const ledger: number[] = [];
net.register("payment", "/charge", ({ amount }) => {
  ledger.push(Number(amount));
  return { ok: true, txn: \`TX-\${ledger.length}\` };
});

// ── Order service: điều phối, cũng có CSDL riêng ──
const orders: string[] = [];
net.register("order", "/orders", ({ sku, amount }) => {
  const res = net.call("order", "inventory", "/reserve", { sku });
  if (!res.ok) return { status: 409, msg: String(res.reason) };
  const pay = net.call("order", "payment", "/charge", { amount });
  orders.push(String(sku));
  return { status: 201, msg: \`đơn #\${orders.length}, \${pay.txn}\` };
});

for (const sku of ["SKU-1", "SKU-2"]) {
  const r = net.call("client", "order", "/orders", { sku, amount: 150_000 });
  console.log(\`→ \${r.status} \${r.msg}\`);
}
console.log(\`Kho SKU-1 còn \${stock.get("SKU-1")} · sổ cái \${ledger.length} giao dịch · \${orders.length} đơn\`);`,
  java: `import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;

public class MicroservicesDemo {
    public static void main(String[] args) {
        Network net = new Network();

        // ── Inventory service: CSDL riêng ──
        Map<String, Integer> stock = new HashMap<>(Map.of("SKU-1", 5, "SKU-2", 0));
        net.register("inventory", "/reserve", body -> {
            String sku = (String) body.get("sku");
            int left = stock.getOrDefault(sku, 0);
            if (left <= 0) return Map.of("ok", false, "reason", "hết hàng");
            stock.put(sku, left - 1);
            return Map.of("ok", true);
        });

        // ── Payment service: CSDL riêng ──
        List<Long> ledger = new ArrayList<>();
        net.register("payment", "/charge", body -> {
            ledger.add((Long) body.get("amount"));
            return Map.of("ok", true, "txn", "TX-" + ledger.size());
        });

        // ── Order service: điều phối, cũng có CSDL riêng ──
        List<String> orders = new ArrayList<>();
        net.register("order", "/orders", body -> {
            Map<String, Object> res = net.call("order", "inventory", "/reserve", Map.of("sku", body.get("sku")));
            if (!(Boolean) res.get("ok")) return Map.of("status", 409, "msg", res.get("reason"));
            Map<String, Object> pay = net.call("order", "payment", "/charge", Map.of("amount", body.get("amount")));
            orders.add((String) body.get("sku"));
            return Map.of("status", 201, "msg", "đơn #" + orders.size() + ", " + pay.get("txn"));
        });

        for (String sku : List.of("SKU-1", "SKU-2")) {
            Map<String, Object> r = net.call("client", "order", "/orders", Map.of("sku", sku, "amount", 150_000L));
            System.out.println("→ " + r.get("status") + " " + r.get("msg"));
        }
        System.out.println("Kho SKU-1 còn " + stock.get("SKU-1") + " · sổ cái " + ledger.size() + " giao dịch · " + orders.size() + " đơn");
    }
}

// Mỗi service sở hữu dữ liệu riêng và chỉ giao tiếp qua API (ở đây giả lập mạng)
class Network {
    private final Map<String, Function<Map<String, Object>, Map<String, Object>>> routes = new HashMap<>();

    void register(String service, String path, Function<Map<String, Object>, Map<String, Object>> h) {
        routes.put(service + path, h);
    }

    Map<String, Object> call(String from, String service, String path, Map<String, Object> body) {
        var h = routes.get(service + path);
        if (h == null) throw new IllegalStateException(service + " không phản hồi");
        System.out.println("  " + from + " → " + service + " POST " + path);
        return h.apply(body);
    }
}`,
};
