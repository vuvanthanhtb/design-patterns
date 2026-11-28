/**
 * Copyright (c) 2026 vuvanthanhtb
 * SPDX-License-Identifier: MIT
 */

// Dữ liệu cứng: mã nguồn ví dụ api-gateway (TypeScript + Java) và output đã chạy thật.
export const apiGateway = {
  javaFile: "ApiGatewayDemo.java",
  tsOutput: [
    "  gateway → user-service",
    "  gateway → order-service",
    "  gateway → product-service",
    'mobile GET /home: 200 {"user":{"name":"Lan","id":"u42"},"order":[{"id":1},{"id":2}],"product":[{"sku":"A"},{"sku":"B"},{"sku":"C"}]}',
    "web GET /home (không token): 401 Unauthorized",
    "  gateway → user-service",
    "  gateway → order-service",
    "  gateway → product-service",
    'web GET /home: 200 {"user":{"name":"Lan","id":"u42"},"order":[{"id":1},{"id":2}],"product":[{"sku":"A"},{"sku":"B"},{"sku":"C"}]}',
    "web GET /home: 429 Too Many Requests",
  ],
  javaOutput: [
    "  gateway → user-service",
    "  gateway → order-service",
    "  gateway → product-service",
    'mobile GET /home: 200 {"user":{"name":"Lan","id":"u42"},"order":[{"id":1},{"id":2}],"product":[{"sku":"A"},{"sku":"B"},{"sku":"C"}]}',
    "web GET /home (không token): 401 Unauthorized",
    "  gateway → user-service",
    "  gateway → order-service",
    "  gateway → product-service",
    'web GET /home: 200 {"user":{"name":"Lan","id":"u42"},"order":[{"id":1},{"id":2}],"product":[{"sku":"A"},{"sku":"B"},{"sku":"C"}]}',
    "web GET /home: 429 Too Many Requests",
  ],
  typescript: `// Các service phía sau — client không gọi trực tiếp
const services: Record<string, (userId: string) => string> = {
  user: (id) => \`{"name":"Lan","id":"\${id}"}\`,
  order: () => \`[{"id":1},{"id":2}]\`,
  product: () => \`[{"sku":"A"},{"sku":"B"},{"sku":"C"}]\`,
};

class ApiGateway {
  private tokens = new Map([["tok-lan", "u42"]]);
  private hits = new Map<string, number>();
  private limit: number;
  constructor(limit: number) {
    this.limit = limit;
  }

  handle(client: string, path: string, token?: string): string {
    // 1. Giới hạn tần suất theo client
    const n = (this.hits.get(client) ?? 0) + 1;
    this.hits.set(client, n);
    if (n > this.limit) return "429 Too Many Requests";
    // 2. Xác thực tập trung — service phía sau không phải tự làm
    const userId = token ? this.tokens.get(token) : undefined;
    if (!userId) return "401 Unauthorized";
    // 3. Định tuyến + gộp kết quả (aggregation) cho màn hình home
    if (path === "/home") {
      const parts = ["user", "order", "product"].map((s) => {
        console.log(\`  gateway → \${s}-service\`);
        return \`"\${s}":\${services[s](userId)}\`;
      });
      return \`200 {\${parts.join(",")}}\`;
    }
    return "404 Not Found";
  }
}

const gw = new ApiGateway(2);
console.log("mobile GET /home:", gw.handle("mobile", "/home", "tok-lan"));
console.log("web GET /home (không token):", gw.handle("web", "/home"));
console.log("web GET /home:", gw.handle("web", "/home", "tok-lan"));
console.log("web GET /home:", gw.handle("web", "/home", "tok-lan"));`,
  java: `import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;

public class ApiGatewayDemo {
    public static void main(String[] args) {
        ApiGateway gw = new ApiGateway(2);
        System.out.println("mobile GET /home: " + gw.handle("mobile", "/home", "tok-lan"));
        System.out.println("web GET /home (không token): " + gw.handle("web", "/home", null));
        System.out.println("web GET /home: " + gw.handle("web", "/home", "tok-lan"));
        System.out.println("web GET /home: " + gw.handle("web", "/home", "tok-lan"));
    }
}

class ApiGateway {
    // Các service phía sau — client không gọi trực tiếp
    private final Map<String, Function<String, String>> services = Map.of(
        "user", id -> "{\\"name\\":\\"Lan\\",\\"id\\":\\"" + id + "\\"}",
        "order", id -> "[{\\"id\\":1},{\\"id\\":2}]",
        "product", id -> "[{\\"sku\\":\\"A\\"},{\\"sku\\":\\"B\\"},{\\"sku\\":\\"C\\"}]");

    private final Map<String, String> tokens = Map.of("tok-lan", "u42");
    private final Map<String, Integer> hits = new HashMap<>();
    private final int limit;

    ApiGateway(int limit) { this.limit = limit; }

    String handle(String client, String path, String token) {
        // 1. Giới hạn tần suất theo client
        int n = hits.merge(client, 1, Integer::sum);
        if (n > limit) return "429 Too Many Requests";
        // 2. Xác thực tập trung — service phía sau không phải tự làm
        String userId = token == null ? null : tokens.get(token);
        if (userId == null) return "401 Unauthorized";
        // 3. Định tuyến + gộp kết quả (aggregation) cho màn hình home
        if (path.equals("/home")) {
            List<String> parts = new ArrayList<>();
            for (String s : List.of("user", "order", "product")) {
                System.out.println("  gateway → " + s + "-service");
                parts.add("\\"" + s + "\\":" + services.get(s).apply(userId));
            }
            return "200 {" + String.join(",", parts) + "}";
        }
        return "404 Not Found";
    }
}`,
};
