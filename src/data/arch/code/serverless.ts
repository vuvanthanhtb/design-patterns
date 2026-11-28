/**
 * Copyright (c) 2026 vuvanthanhtb
 * SPDX-License-Identifier: MIT
 */

// Dữ liệu cứng: mã nguồn ví dụ serverless (TypeScript + Java) và output đã chạy thật.
export const serverless = {
  javaFile: "ServerlessDemo.java",
  tsOutput: [
    "[HTTP POST /orders] λ createOrder cold start 312ms → 201 đơn #1",
    "[HTTP POST /orders] λ createOrder warm 12ms → 201 đơn #2",
    "[S3 ObjectCreated] λ resizeImage cold start 312ms → lưu thumbs/ao.png",
    "[HTTP POST /orders] λ createOrder cold start 312ms → 201 đơn #3",
    "Tổng thời gian tính tiền: 948ms cho 4 lần chạy — không trả tiền lúc rảnh",
  ],
  javaOutput: [
    "[HTTP POST /orders] λ createOrder cold start 312ms → 201 đơn #1",
    "[HTTP POST /orders] λ createOrder warm 12ms → 201 đơn #2",
    "[S3 ObjectCreated] λ resizeImage cold start 312ms → lưu thumbs/ao.png",
    "[HTTP POST /orders] λ createOrder cold start 312ms → 201 đơn #3",
    "Tổng thời gian tính tiền: 948ms cho 4 lần chạy — không trả tiền lúc rảnh",
  ],
  typescript: `// Nền tảng serverless giả lập: tự tạo instance khi có sự kiện, tính tiền theo lần chạy
type Fn = (event: Record<string, string>) => string;

class Platform {
  private warm = new Map<string, number>();   // tên hàm → thời điểm chạy gần nhất (giây)
  private billedMs = 0;
  private now = 0;
  private fns = new Map<string, Fn>();

  deploy(name: string, fn: Fn) {
    this.fns.set(name, fn);
  }
  tick(seconds: number) {
    this.now += seconds;
  }
  invoke(name: string, event: Record<string, string>, trigger: string) {
    const last = this.warm.get(name);
    const cold = last === undefined || this.now - last > 600;   // rảnh > 10 phút → scale về 0
    const ms = (cold ? 300 : 0) + 12;
    this.billedMs += ms;
    this.warm.set(name, this.now);
    const out = this.fns.get(name)!(event);
    console.log(\`[\${trigger}] λ \${name} \${cold ? "cold start" : "warm"} \${ms}ms → \${out}\`);
  }
  bill() {
    return this.billedMs;
  }
}

const db: string[] = [];
const platform = new Platform();
platform.deploy("createOrder", (e) => {
  db.push(e.item);
  return \`201 đơn #\${db.length}\`;
});
platform.deploy("resizeImage", (e) => \`lưu thumbs/\${e.key}\`);

platform.invoke("createOrder", { item: "áo" }, "HTTP POST /orders");
platform.tick(5);
platform.invoke("createOrder", { item: "giày" }, "HTTP POST /orders");
platform.invoke("resizeImage", { key: "ao.png" }, "S3 ObjectCreated");
platform.tick(3600);
platform.invoke("createOrder", { item: "mũ" }, "HTTP POST /orders");
console.log(\`Tổng thời gian tính tiền: \${platform.bill()}ms cho 4 lần chạy — không trả tiền lúc rảnh\`);`,
  java: `import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;

public class ServerlessDemo {
    public static void main(String[] args) {
        List<String> db = new ArrayList<>();
        Platform platform = new Platform();
        platform.deploy("createOrder", e -> {
            db.add(e.get("item"));
            return "201 đơn #" + db.size();
        });
        platform.deploy("resizeImage", e -> "lưu thumbs/" + e.get("key"));

        platform.invoke("createOrder", Map.of("item", "áo"), "HTTP POST /orders");
        platform.tick(5);
        platform.invoke("createOrder", Map.of("item", "giày"), "HTTP POST /orders");
        platform.invoke("resizeImage", Map.of("key", "ao.png"), "S3 ObjectCreated");
        platform.tick(3600);
        platform.invoke("createOrder", Map.of("item", "mũ"), "HTTP POST /orders");
        System.out.println("Tổng thời gian tính tiền: " + platform.bill() + "ms cho 4 lần chạy — không trả tiền lúc rảnh");
    }
}

// Nền tảng serverless giả lập: tự tạo instance khi có sự kiện, tính tiền theo lần chạy
class Platform {
    private final Map<String, Long> warm = new HashMap<>(); // tên hàm → thời điểm chạy gần nhất (giây)
    private final Map<String, Function<Map<String, String>, String>> fns = new HashMap<>();
    private long billedMs = 0;
    private long now = 0;

    void deploy(String name, Function<Map<String, String>, String> fn) { fns.put(name, fn); }

    void tick(long seconds) { now += seconds; }

    void invoke(String name, Map<String, String> event, String trigger) {
        Long last = warm.get(name);
        boolean cold = last == null || now - last > 600; // rảnh > 10 phút → scale về 0
        long ms = (cold ? 300 : 0) + 12;
        billedMs += ms;
        warm.put(name, now);
        String out = fns.get(name).apply(event);
        System.out.println("[" + trigger + "] λ " + name + " " + (cold ? "cold start" : "warm") + " " + ms + "ms → " + out);
    }

    long bill() { return billedMs; }
}`,
};
