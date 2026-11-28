/**
 * Copyright (c) 2026 vuvanthanhtb
 * SPDX-License-Identifier: MIT
 */

// Dữ liệu cứng: mã nguồn ví dụ service-mesh (TypeScript + Java) và output đã chạy thật.
export const serviceMesh = {
  javaFile: "ServiceMeshDemo.java",
  tsOutput: [
    "control plane: retries=2, mTLS=true",
    "order-app → localhost:15001 → payment",
    "  [order-proxy] lần 1: lỗi mạng → thử lại",
    "  [order-proxy] lần 2: gửi mTLS → payment-proxy",
    "→ 200 đã thu 150000đ",
    "metrics order-proxy: 2 request, 1 retry",
    "kẻ lạ gọi thẳng payment: mTLS: chứng chỉ không hợp lệ",
  ],
  javaOutput: [
    "control plane: retries=2, mTLS=true",
    "order-app → localhost:15001 → payment",
    "  [order-proxy] lần 1: lỗi mạng → thử lại",
    "  [order-proxy] lần 2: gửi mTLS → payment-proxy",
    "→ 200 đã thu 150000đ",
    "metrics order-proxy: 2 request, 1 retry",
    "kẻ lạ gọi thẳng payment: mTLS: chứng chỉ không hợp lệ",
  ],
  typescript: `// Ứng dụng chỉ chứa nghiệp vụ; mọi việc mạng do sidecar (proxy cạnh bên) lo
type App = (req: string) => string;

// Control plane: cấu hình tập trung cho mọi sidecar
const meshConfig = { retries: 2, mtls: true };

class Sidecar {
  metrics = { requests: 0, retries: 0 };
  private name: string;
  private app: App;
  constructor(name: string, app: App) {
    this.name = name;
    this.app = app;
  }
  // Nhận request từ sidecar khác (đã mã hoá mTLS)
  inbound(req: string, cert: string) {
    if (meshConfig.mtls && cert !== "mesh-ca") throw new Error("mTLS: chứng chỉ không hợp lệ");
    return this.app(req);
  }
  // Ứng dụng gọi ra ngoài qua localhost → sidecar xử lý retry, mTLS, metrics
  outbound(target: Sidecar, req: string, flaky: () => boolean) {
    for (let attempt = 1; attempt <= 1 + meshConfig.retries; attempt++) {
      this.metrics.requests++;
      if (flaky()) {
        console.log(\`  [\${this.name}-proxy] lần \${attempt}: lỗi mạng → thử lại\`);
        this.metrics.retries++;
        continue;
      }
      console.log(\`  [\${this.name}-proxy] lần \${attempt}: gửi mTLS → \${target.name}-proxy\`);
      return target.inbound(req, "mesh-ca");
    }
    return "503 hết lượt thử";
  }
}

const payment = new Sidecar("payment", (req) => \`200 đã thu \${req}\`);
const order = new Sidecar("order", () => "");

let calls = 0;
const flakyNetwork = () => ++calls === 1;   // lần gọi đầu tiên rớt mạng

console.log(\`control plane: retries=\${meshConfig.retries}, mTLS=\${meshConfig.mtls}\`);
console.log("order-app → localhost:15001 → payment");
console.log("→", order.outbound(payment, "150000đ", flakyNetwork));
console.log(\`metrics order-proxy: \${order.metrics.requests} request, \${order.metrics.retries} retry\`);
try {
  payment.inbound("150000đ", "giả-mạo");
} catch (e) {
  console.log("kẻ lạ gọi thẳng payment:", (e as Error).message);
}`,
  java: `import java.util.function.BooleanSupplier;
import java.util.function.UnaryOperator;

public class ServiceMeshDemo {
    // Control plane: cấu hình tập trung cho mọi sidecar
    static final int RETRIES = 2;
    static final boolean MTLS = true;

    public static void main(String[] args) {
        Sidecar payment = new Sidecar("payment", req -> "200 đã thu " + req);
        Sidecar order = new Sidecar("order", req -> "");

        int[] calls = {0};
        BooleanSupplier flakyNetwork = () -> ++calls[0] == 1; // lần gọi đầu tiên rớt mạng

        System.out.println("control plane: retries=" + RETRIES + ", mTLS=" + MTLS);
        System.out.println("order-app → localhost:15001 → payment");
        System.out.println("→ " + order.outbound(payment, "150000đ", flakyNetwork));
        System.out.println("metrics order-proxy: " + order.requests + " request, " + order.retries + " retry");
        try {
            payment.inbound("150000đ", "giả-mạo");
        } catch (SecurityException e) {
            System.out.println("kẻ lạ gọi thẳng payment: " + e.getMessage());
        }
    }
}

// Ứng dụng chỉ chứa nghiệp vụ; mọi việc mạng do sidecar (proxy cạnh bên) lo
class Sidecar {
    final String name;
    private final UnaryOperator<String> app;
    int requests = 0, retries = 0;

    Sidecar(String name, UnaryOperator<String> app) {
        this.name = name;
        this.app = app;
    }

    // Nhận request từ sidecar khác (đã mã hoá mTLS)
    String inbound(String req, String cert) {
        if (ServiceMeshDemo.MTLS && !cert.equals("mesh-ca")) throw new SecurityException("mTLS: chứng chỉ không hợp lệ");
        return app.apply(req);
    }

    // Ứng dụng gọi ra ngoài qua localhost → sidecar xử lý retry, mTLS, metrics
    String outbound(Sidecar target, String req, BooleanSupplier flaky) {
        for (int attempt = 1; attempt <= 1 + ServiceMeshDemo.RETRIES; attempt++) {
            requests++;
            if (flaky.getAsBoolean()) {
                System.out.println("  [" + name + "-proxy] lần " + attempt + ": lỗi mạng → thử lại");
                retries++;
                continue;
            }
            System.out.println("  [" + name + "-proxy] lần " + attempt + ": gửi mTLS → " + target.name + "-proxy");
            return target.inbound(req, "mesh-ca");
        }
        return "503 hết lượt thử";
    }
}`,
};
