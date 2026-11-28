/**
 * Copyright (c) 2026 vuvanthanhtb
 * SPDX-License-Identifier: MIT
 */

// Dữ liệu cứng: mã nguồn ví dụ strangler-fig (TypeScript + Java) và output đã chạy thật.
export const stranglerFig = {
  javaFile: "StranglerFigDemo.java",
  tsOutput: [
    "Giai đoạn 0: chỉ monolith      0% qua hệ mới | legacy:/orders/1 legacy:/users/7 legacy:/reports/q3 legacy:/orders/2",
    "Giai đoạn 1: chuyển /orders   50% qua hệ mới | order-svc:/orders/1 legacy:/users/7 legacy:/reports/q3 order-svc:/orders/2",
    "Giai đoạn 2: chuyển /users    75% qua hệ mới | order-svc:/orders/1 user-svc:/users/7 legacy:/reports/q3 order-svc:/orders/2",
    "Rollback /users (sự cố)       50% qua hệ mới | order-svc:/orders/1 legacy:/users/7 legacy:/reports/q3 order-svc:/orders/2",
  ],
  javaOutput: [
    "Giai đoạn 0: chỉ monolith      0% qua hệ mới | legacy:/orders/1 legacy:/users/7 legacy:/reports/q3 legacy:/orders/2",
    "Giai đoạn 1: chuyển /orders   50% qua hệ mới | order-svc:/orders/1 legacy:/users/7 legacy:/reports/q3 order-svc:/orders/2",
    "Giai đoạn 2: chuyển /users    75% qua hệ mới | order-svc:/orders/1 user-svc:/users/7 legacy:/reports/q3 order-svc:/orders/2",
    "Rollback /users (sự cố)       50% qua hệ mới | order-svc:/orders/1 legacy:/users/7 legacy:/reports/q3 order-svc:/orders/2",
  ],
  typescript: `// Hệ thống cũ (monolith) — vẫn chạy trong lúc chuyển đổi
const legacy = (path: string) => \`legacy:\${path}\`;
// Service mới viết lại từng phần
const services: Record<string, (path: string) => string> = {
  "/orders": (p) => \`order-svc:\${p}\`,
  "/users": (p) => \`user-svc:\${p}\`,
};

// Facade đứng trước mọi request, quyết định route nào đã "chuyển nhà"
class StranglerFacade {
  migrated = new Set<string>();
  route(path: string) {
    const prefix = "/" + path.split("/")[1];
    return this.migrated.has(prefix) ? services[prefix](path) : legacy(path);
  }
}

const facade = new StranglerFacade();
const traffic = ["/orders/1", "/users/7", "/reports/q3", "/orders/2"];
const report = (stage: string) => {
  const res = traffic.map((p) => facade.route(p));
  const pct = Math.round((res.filter((r) => !r.startsWith("legacy")).length / res.length) * 100);
  console.log(\`\${stage.padEnd(28)} \${pct.toString().padStart(3)}% qua hệ mới | \${res.join(" ")}\`);
};

report("Giai đoạn 0: chỉ monolith");
facade.migrated.add("/orders");
report("Giai đoạn 1: chuyển /orders");
facade.migrated.add("/users");
report("Giai đoạn 2: chuyển /users");
// /reports vẫn ở monolith — chuyển dần, có thể quay lui bất cứ lúc nào
facade.migrated.delete("/users");
report("Rollback /users (sự cố)");`,
  java: `import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.UnaryOperator;

public class StranglerFigDemo {
    static final StranglerFacade facade = new StranglerFacade();
    static final List<String> traffic = List.of("/orders/1", "/users/7", "/reports/q3", "/orders/2");

    public static void main(String[] args) {
        report("Giai đoạn 0: chỉ monolith");
        facade.migrated.add("/orders");
        report("Giai đoạn 1: chuyển /orders");
        facade.migrated.add("/users");
        report("Giai đoạn 2: chuyển /users");
        // /reports vẫn ở monolith — chuyển dần, có thể quay lui bất cứ lúc nào
        facade.migrated.remove("/users");
        report("Rollback /users (sự cố)");
    }

    static void report(String stage) {
        List<String> res = traffic.stream().map(facade::route).toList();
        long pct = Math.round(res.stream().filter(r -> !r.startsWith("legacy")).count() * 100.0 / res.size());
        System.out.printf("%-28s %3d%% qua hệ mới | %s%n", stage, pct, String.join(" ", res));
    }
}

// Facade đứng trước mọi request, quyết định route nào đã "chuyển nhà"
class StranglerFacade {
    // Hệ thống cũ (monolith) — vẫn chạy trong lúc chuyển đổi
    private final UnaryOperator<String> legacy = path -> "legacy:" + path;
    // Service mới viết lại từng phần
    private final Map<String, UnaryOperator<String>> services = Map.of(
        "/orders", p -> "order-svc:" + p,
        "/users", p -> "user-svc:" + p);
    final Set<String> migrated = new HashSet<>();

    String route(String path) {
        String prefix = "/" + path.split("/")[1];
        return migrated.contains(prefix) ? services.get(prefix).apply(path) : legacy.apply(path);
    }
}`,
};
