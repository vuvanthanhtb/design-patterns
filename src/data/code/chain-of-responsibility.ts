/**
 * Copyright (c) 2026 vuvanthanhtb
 * SPDX-License-Identifier: MIT
 */

// Dữ liệu cứng: mã nguồn ví dụ chain-of-responsibility (TypeScript + Java) và output đã chạy thật.
export const chainOfResponsibility = {
  javaFile: "ChainOfResponsibilityDemo.java",
  tsOutput: [
    "⛔ 401 — chưa đăng nhập",
    "⛔ 400 — thiếu email",
    "✅ 200 OK — request hợp lệ",
    "⛔ 429 — quá nhiều request",
  ],
  javaOutput: [
    "⛔ 401 — chưa đăng nhập",
    "⛔ 400 — thiếu email",
    "✅ 200 OK — request hợp lệ",
    "⛔ 429 — quá nhiều request",
  ],
  typescript: `interface Request {
  user?: string;
  ip: string;
  body: Record<string, unknown>;
}

// Handler
interface Handler {
  setNext(handler: Handler): Handler;
  handle(req: Request): string;
}

// BaseHandler: chuyển tiếp mặc định cho handler kế tiếp
abstract class BaseHandler implements Handler {
  private next: Handler | null = null;

  setNext(handler: Handler): Handler {
    this.next = handler;
    return handler; // trả về handler để nối chuỗi: a.setNext(b).setNext(c)
  }

  handle(req: Request): string {
    return this.next ? this.next.handle(req) : "✅ 200 OK — request hợp lệ";
  }
}

// ConcreteHandler
class AuthHandler extends BaseHandler {
  handle(req: Request): string {
    if (!req.user) return "⛔ 401 — chưa đăng nhập";
    return super.handle(req);
  }
}

class RateLimitHandler extends BaseHandler {
  private hits = new Map<string, number>();
  private limit: number;

  constructor(limit: number) {
    super();
    this.limit = limit;
  }

  handle(req: Request): string {
    const count = (this.hits.get(req.ip) ?? 0) + 1;
    this.hits.set(req.ip, count);
    if (count > this.limit) return "⛔ 429 — quá nhiều request";
    return super.handle(req);
  }
}

class ValidationHandler extends BaseHandler {
  handle(req: Request): string {
    if (typeof req.body.email !== "string") return "⛔ 400 — thiếu email";
    return super.handle(req);
  }
}

// Client lắp ráp chuỗi
const pipeline = new AuthHandler();
pipeline.setNext(new RateLimitHandler(2)).setNext(new ValidationHandler());

const requests: Request[] = [
  { ip: "1.1.1.1", body: {} },
  { user: "an", ip: "2.2.2.2", body: {} },
  { user: "an", ip: "2.2.2.2", body: { email: "an@x.vn" } },
  { user: "an", ip: "2.2.2.2", body: { email: "an@x.vn" } },
];

for (const req of requests) console.log(pipeline.handle(req));`,
  java: `import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class ChainOfResponsibilityDemo {
    public static void main(String[] args) {
        // Client lắp ráp chuỗi
        Handler pipeline = new AuthHandler();
        pipeline.setNext(new RateLimitHandler(2)).setNext(new ValidationHandler());

        List<Request> requests = List.of(
            new Request(null, "1.1.1.1", Map.of()),
            new Request("an", "2.2.2.2", Map.of()),
            new Request("an", "2.2.2.2", Map.of("email", "an@x.vn")),
            new Request("an", "2.2.2.2", Map.of("email", "an@x.vn"))
        );
        for (Request req : requests) System.out.println(pipeline.handle(req));
    }
}

record Request(String user, String ip, Map<String, String> body) {}

// Handler
interface Handler {
    Handler setNext(Handler handler);
    String handle(Request req);
}

// BaseHandler: chuyển tiếp mặc định cho handler kế tiếp
abstract class BaseHandler implements Handler {
    private Handler next;

    public Handler setNext(Handler handler) {
        this.next = handler;
        return handler; // trả về handler để nối chuỗi: a.setNext(b).setNext(c)
    }

    public String handle(Request req) {
        return next != null ? next.handle(req) : "✅ 200 OK — request hợp lệ";
    }
}

// ConcreteHandler
class AuthHandler extends BaseHandler {
    @Override
    public String handle(Request req) {
        if (req.user() == null) return "⛔ 401 — chưa đăng nhập";
        return super.handle(req);
    }
}

class RateLimitHandler extends BaseHandler {
    private final Map<String, Integer> hits = new HashMap<>();
    private final int limit;

    RateLimitHandler(int limit) { this.limit = limit; }

    @Override
    public String handle(Request req) {
        int count = hits.merge(req.ip(), 1, Integer::sum);
        if (count > limit) return "⛔ 429 — quá nhiều request";
        return super.handle(req);
    }
}

class ValidationHandler extends BaseHandler {
    @Override
    public String handle(Request req) {
        if (!req.body().containsKey("email")) return "⛔ 400 — thiếu email";
        return super.handle(req);
    }
}`,
};
