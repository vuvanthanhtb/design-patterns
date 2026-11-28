/**
 * Copyright (c) 2026 vuvanthanhtb
 * SPDX-License-Identifier: MIT
 */

// Dữ liệu cứng: mã nguồn ví dụ saga (TypeScript + Java) và output đã chạy thật.
export const saga = {
  javaFile: "SagaDemo.java",
  tsOutput: [
    "ORD-1",
    "  ✓ order: tạo đơn PENDING",
    "  ✓ payment: trừ 300000",
    '  ✓ inventory: giữ hàng "ao"',
    "  ✓ shipping: tạo vận đơn",
    "→ ORD-1: CONFIRMED",
    "ORD-2",
    "  ✓ order: tạo đơn PENDING",
    "  ✓ payment: trừ 300000",
    '  ✗ inventory: giữ hàng "ao" thất bại → bù trừ 2 bước đã làm',
    "    ↩ payment: hoàn 300000",
    "    ↩ order: huỷ đơn",
    "→ ORD-2: CANCELLED (dữ liệu vẫn nhất quán)",
    "Số dư 700000 · tồn kho áo 0",
  ],
  javaOutput: [
    "ORD-1",
    "  ✓ order: tạo đơn PENDING",
    "  ✓ payment: trừ 300000",
    '  ✓ inventory: giữ hàng "ao"',
    "  ✓ shipping: tạo vận đơn",
    "→ ORD-1: CONFIRMED",
    "ORD-2",
    "  ✓ order: tạo đơn PENDING",
    "  ✓ payment: trừ 300000",
    '  ✗ inventory: giữ hàng "ao" thất bại → bù trừ 2 bước đã làm',
    "    ↩ payment: hoàn 300000",
    "    ↩ order: huỷ đơn",
    "→ ORD-2: CANCELLED (dữ liệu vẫn nhất quán)",
    "Số dư 700000 · tồn kho áo 0",
  ],
  typescript: `// Mỗi bước có một hành động và một hành động BÙ TRỪ để hoàn tác
interface Step {
  name: string;
  action: () => boolean;
  compensate: () => void;
}

class SagaOrchestrator {
  run(orderId: string, steps: Step[]) {
    const done: Step[] = [];
    for (const step of steps) {
      if (step.action()) {
        console.log(\`  ✓ \${step.name}\`);
        done.push(step);
        continue;
      }
      console.log(\`  ✗ \${step.name} thất bại → bù trừ \${done.length} bước đã làm\`);
      // Hoàn tác theo thứ tự ngược lại
      for (const d of done.reverse()) d.compensate();
      return \`\${orderId}: CANCELLED (dữ liệu vẫn nhất quán)\`;
    }
    return \`\${orderId}: CONFIRMED\`;
  }
}

const stock = { ao: 1 };
let balance = 1_000_000;

const orderSaga = (id: string, item: keyof typeof stock, price: number): Step[] => [
  { name: "order: tạo đơn PENDING", action: () => true, compensate: () => console.log("    ↩ order: huỷ đơn") },
  {
    name: \`payment: trừ \${price}\`,
    action: () => (balance >= price ? ((balance -= price), true) : false),
    compensate: () => {
      balance += price;
      console.log(\`    ↩ payment: hoàn \${price}\`);
    },
  },
  {
    name: \`inventory: giữ hàng "\${item}"\`,
    action: () => (stock[item] > 0 ? (stock[item]--, true) : false),
    compensate: () => {
      stock[item]++;
      console.log("    ↩ inventory: trả hàng");
    },
  },
  { name: "shipping: tạo vận đơn", action: () => true, compensate: () => console.log("    ↩ shipping: huỷ vận đơn") },
];

const saga = new SagaOrchestrator();
console.log("ORD-1");
console.log("→", saga.run("ORD-1", orderSaga("ORD-1", "ao", 300_000)));
console.log("ORD-2");
console.log("→", saga.run("ORD-2", orderSaga("ORD-2", "ao", 300_000)));
console.log(\`Số dư \${balance} · tồn kho áo \${stock.ao}\`);`,
  java: `import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.function.BooleanSupplier;

public class SagaDemo {
    static int stockAo = 1;
    static long balance = 1_000_000;

    public static void main(String[] args) {
        SagaOrchestrator saga = new SagaOrchestrator();
        System.out.println("ORD-1");
        System.out.println("→ " + saga.run("ORD-1", orderSaga(300_000)));
        System.out.println("ORD-2");
        System.out.println("→ " + saga.run("ORD-2", orderSaga(300_000)));
        System.out.println("Số dư " + balance + " · tồn kho áo " + stockAo);
    }

    static List<Step> orderSaga(long price) {
        return List.of(
            new Step("order: tạo đơn PENDING", () -> true, () -> System.out.println("    ↩ order: huỷ đơn")),
            new Step("payment: trừ " + price,
                () -> {
                    if (balance < price) return false;
                    balance -= price;
                    return true;
                },
                () -> {
                    balance += price;
                    System.out.println("    ↩ payment: hoàn " + price);
                }),
            new Step("inventory: giữ hàng \\"ao\\"",
                () -> {
                    if (stockAo <= 0) return false;
                    stockAo--;
                    return true;
                },
                () -> {
                    stockAo++;
                    System.out.println("    ↩ inventory: trả hàng");
                }),
            new Step("shipping: tạo vận đơn", () -> true, () -> System.out.println("    ↩ shipping: huỷ vận đơn")));
    }
}

// Mỗi bước có một hành động và một hành động BÙ TRỪ để hoàn tác
record Step(String name, BooleanSupplier action, Runnable compensate) {}

class SagaOrchestrator {
    String run(String orderId, List<Step> steps) {
        List<Step> done = new ArrayList<>();
        for (Step step : steps) {
            if (step.action().getAsBoolean()) {
                System.out.println("  ✓ " + step.name());
                done.add(step);
                continue;
            }
            System.out.println("  ✗ " + step.name() + " thất bại → bù trừ " + done.size() + " bước đã làm");
            // Hoàn tác theo thứ tự ngược lại
            Collections.reverse(done);
            done.forEach(d -> d.compensate().run());
            return orderId + ": CANCELLED (dữ liệu vẫn nhất quán)";
        }
        return orderId + ": CONFIRMED";
    }
}`,
};
