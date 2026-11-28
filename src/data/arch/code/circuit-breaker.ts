/**
 * Copyright (c) 2026 vuvanthanhtb
 * SPDX-License-Identifier: MIT
 */

// Dữ liệu cứng: mã nguồn ví dụ circuit-breaker (TypeScript + Java) và output đã chạy thật.
export const circuitBreaker = {
  javaFile: "CircuitBreakerDemo.java",
  tsOutput: [
    "t= 0s payment sống → 200 thanh toán OK                        [CLOSED]",
    "t= 1s payment chết → 202 xếp hàng thanh toán sau (lỗi 1)      [CLOSED]",
    "t= 2s payment chết → 202 xếp hàng thanh toán sau (lỗi 2)      [CLOSED]",
    "t= 3s payment chết → 202 xếp hàng thanh toán sau (lỗi 3)      [OPEN]",
    "t=10s payment chết → 202 xếp hàng thanh toán sau (chặn ngay)  [OPEN]",
    "      ↻ HALF_OPEN: cho thử 1 request",
    "t=40s payment chết → 202 xếp hàng thanh toán sau (lỗi 4)      [OPEN]",
    "t=55s payment chết → 202 xếp hàng thanh toán sau (chặn ngay)  [OPEN]",
    "      ↻ HALF_OPEN: cho thử 1 request",
    "t=71s payment sống → 200 thanh toán OK                        [CLOSED]",
    "t=72s payment sống → 200 thanh toán OK                        [CLOSED]",
  ],
  javaOutput: [
    "t= 0s payment sống → 200 thanh toán OK                        [CLOSED]",
    "t= 1s payment chết → 202 xếp hàng thanh toán sau (lỗi 1)      [CLOSED]",
    "t= 2s payment chết → 202 xếp hàng thanh toán sau (lỗi 2)      [CLOSED]",
    "t= 3s payment chết → 202 xếp hàng thanh toán sau (lỗi 3)      [OPEN]",
    "t=10s payment chết → 202 xếp hàng thanh toán sau (chặn ngay)  [OPEN]",
    "      ↻ HALF_OPEN: cho thử 1 request",
    "t=40s payment chết → 202 xếp hàng thanh toán sau (lỗi 4)      [OPEN]",
    "t=55s payment chết → 202 xếp hàng thanh toán sau (chặn ngay)  [OPEN]",
    "      ↻ HALF_OPEN: cho thử 1 request",
    "t=71s payment sống → 200 thanh toán OK                        [CLOSED]",
    "t=72s payment sống → 200 thanh toán OK                        [CLOSED]",
  ],
  typescript: `type State = "CLOSED" | "OPEN" | "HALF_OPEN";

class CircuitBreaker {
  state: State = "CLOSED";
  private failures = 0;
  private openedAt = 0;
  private threshold: number;
  private cooldown: number;
  constructor(threshold: number, cooldown: number) {
    this.threshold = threshold;
    this.cooldown = cooldown;
  }

  call(now: number, remote: () => string, fallback: () => string): string {
    if (this.state === "OPEN") {
      if (now - this.openedAt < this.cooldown) return \`\${fallback()} (chặn ngay)\`;
      this.state = "HALF_OPEN";   // hết thời gian chờ → cho thử một request
      console.log("      ↻ HALF_OPEN: cho thử 1 request");
    }
    try {
      const res = remote();
      this.state = "CLOSED";
      this.failures = 0;
      return res;
    } catch {
      this.failures++;
      if (this.state === "HALF_OPEN" || this.failures >= this.threshold) {
        this.state = "OPEN";
        this.openedAt = now;
      }
      return \`\${fallback()} (lỗi \${this.failures})\`;
    }
  }
}

let paymentUp = true;
const paymentApi = () => {
  if (!paymentUp) throw new Error("timeout");
  return "200 thanh toán OK";
};
const fallback = () => "202 xếp hàng thanh toán sau";

const cb = new CircuitBreaker(3, 30);
const timeline: [number, boolean][] = [
  [0, true], [1, false], [2, false], [3, false], [10, false], [40, false], [55, false], [71, true], [72, true],
];
for (const [t, up] of timeline) {
  paymentUp = up;
  const res = cb.call(t, paymentApi, fallback);
  console.log(\`t=\${String(t).padStart(2)}s payment \${up ? "sống" : "chết"} → \${res.padEnd(40)} [\${cb.state}]\`);
}`,
  java: `import java.util.function.Supplier;

public class CircuitBreakerDemo {
    static boolean paymentUp = true;

    public static void main(String[] args) {
        Supplier<String> paymentApi = () -> {
            if (!paymentUp) throw new RuntimeException("timeout");
            return "200 thanh toán OK";
        };
        Supplier<String> fallback = () -> "202 xếp hàng thanh toán sau";

        CircuitBreaker cb = new CircuitBreaker(3, 30);
        int[] times = {0, 1, 2, 3, 10, 40, 55, 71, 72};
        boolean[] ups = {true, false, false, false, false, false, false, true, true};
        for (int i = 0; i < times.length; i++) {
            paymentUp = ups[i];
            String res = cb.call(times[i], paymentApi, fallback);
            System.out.printf("t=%2ds payment %s → %-40s [%s]%n", times[i], ups[i] ? "sống" : "chết", res, cb.state);
        }
    }
}

enum State { CLOSED, OPEN, HALF_OPEN }

class CircuitBreaker {
    State state = State.CLOSED;
    private int failures = 0;
    private long openedAt = 0;
    private final int threshold;
    private final long cooldown;

    CircuitBreaker(int threshold, long cooldown) {
        this.threshold = threshold;
        this.cooldown = cooldown;
    }

    String call(long now, Supplier<String> remote, Supplier<String> fallback) {
        if (state == State.OPEN) {
            if (now - openedAt < cooldown) return fallback.get() + " (chặn ngay)";
            state = State.HALF_OPEN; // hết thời gian chờ → cho thử một request
            System.out.println("      ↻ HALF_OPEN: cho thử 1 request");
        }
        try {
            String res = remote.get();
            state = State.CLOSED;
            failures = 0;
            return res;
        } catch (RuntimeException e) {
            failures++;
            if (state == State.HALF_OPEN || failures >= threshold) {
                state = State.OPEN;
                openedAt = now;
            }
            return fallback.get() + " (lỗi " + failures + ")";
        }
    }
}`,
};
