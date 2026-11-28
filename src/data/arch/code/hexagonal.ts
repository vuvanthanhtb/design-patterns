/**
 * Copyright (c) 2026 vuvanthanhtb
 * SPDX-License-Identifier: MIT
 */

// Dữ liệu cứng: mã nguồn ví dụ hexagonal (TypeScript + Java) và output đã chạy thật.
export const hexagonal = {
  javaFile: "HexagonalDemo.java",
  tsOutput: [
    "HTTP 200 → đơn #1 đã tạo",
    "CLI → đơn #2 đã tạo",
    "CLI → thanh toán bị từ chối",
  ],
  javaOutput: [
    "HTTP 200 → đơn #1 đã tạo",
    "CLI → đơn #2 đã tạo",
    "CLI → thanh toán bị từ chối",
  ],
  typescript: `// ═════════ LÕI (domain) — không phụ thuộc framework, DB hay HTTP ═════════

// Port vào (driving): cách thế giới bên ngoài gọi vào lõi
interface PlaceOrderUseCase {
  placeOrder(customer: string, amount: number): string;
}

// Port ra (driven): những gì lõi cần từ bên ngoài
interface OrderRepositoryPort {
  save(customer: string, amount: number): number;
}
interface PaymentPort {
  charge(customer: string, amount: number): boolean;
}

class OrderService implements PlaceOrderUseCase {
  private repo: OrderRepositoryPort;
  private payment: PaymentPort;
  constructor(repo: OrderRepositoryPort, payment: PaymentPort) {
    this.repo = repo;
    this.payment = payment;
  }
  placeOrder(customer: string, amount: number): string {
    if (!this.payment.charge(customer, amount)) return "thanh toán bị từ chối";
    return \`đơn #\${this.repo.save(customer, amount)} đã tạo\`;
  }
}

// ═════════ ADAPTER — cắm vào port, có thể thay thế tuỳ ý ═════════

class InMemoryOrderRepo implements OrderRepositoryPort {
  private seq = 0;
  save() {
    return ++this.seq;
  }
}
class FakePayment implements PaymentPort {
  charge(_customer: string, amount: number) {
    return amount <= 1_000_000;   // giả lập: từ chối đơn quá lớn
  }
}

// Adapter vào: HTTP và CLI dùng CHUNG một port
class RestAdapter {
  private useCase: PlaceOrderUseCase;
  constructor(useCase: PlaceOrderUseCase) {
    this.useCase = useCase;
  }
  handle(json: string) {
    const { customer, amount } = JSON.parse(json);
    return \`HTTP 200 → \${this.useCase.placeOrder(customer, amount)}\`;
  }
}
class CliAdapter {
  private useCase: PlaceOrderUseCase;
  constructor(useCase: PlaceOrderUseCase) {
    this.useCase = useCase;
  }
  run(argv: string[]) {
    return \`CLI → \${this.useCase.placeOrder(argv[0], Number(argv[1]))}\`;
  }
}

const core = new OrderService(new InMemoryOrderRepo(), new FakePayment());
console.log(new RestAdapter(core).handle('{"customer":"An","amount":250000}'));
console.log(new CliAdapter(core).run(["Bình", "90000"]));
console.log(new CliAdapter(core).run(["Chi", "5000000"]));`,
  java: `public class HexagonalDemo {
    public static void main(String[] args) {
        OrderService core = new OrderService(new InMemoryOrderRepo(), new FakePayment());
        System.out.println(new RestAdapter(core).handle("An", 250_000));
        System.out.println(new CliAdapter(core).run(new String[] {"Bình", "90000"}));
        System.out.println(new CliAdapter(core).run(new String[] {"Chi", "5000000"}));
    }
}

// ═════════ LÕI (domain) — không phụ thuộc framework, DB hay HTTP ═════════

// Port vào (driving): cách thế giới bên ngoài gọi vào lõi
interface PlaceOrderUseCase {
    String placeOrder(String customer, long amount);
}

// Port ra (driven): những gì lõi cần từ bên ngoài
interface OrderRepositoryPort {
    int save(String customer, long amount);
}

interface PaymentPort {
    boolean charge(String customer, long amount);
}

class OrderService implements PlaceOrderUseCase {
    private final OrderRepositoryPort repo;
    private final PaymentPort payment;

    OrderService(OrderRepositoryPort repo, PaymentPort payment) {
        this.repo = repo;
        this.payment = payment;
    }

    public String placeOrder(String customer, long amount) {
        if (!payment.charge(customer, amount)) return "thanh toán bị từ chối";
        return "đơn #" + repo.save(customer, amount) + " đã tạo";
    }
}

// ═════════ ADAPTER — cắm vào port, có thể thay thế tuỳ ý ═════════

class InMemoryOrderRepo implements OrderRepositoryPort {
    private int seq = 0;
    public int save(String customer, long amount) { return ++seq; }
}

class FakePayment implements PaymentPort {
    public boolean charge(String customer, long amount) {
        return amount <= 1_000_000; // giả lập: từ chối đơn quá lớn
    }
}

// Adapter vào: HTTP và CLI dùng CHUNG một port
class RestAdapter {
    private final PlaceOrderUseCase useCase;
    RestAdapter(PlaceOrderUseCase useCase) { this.useCase = useCase; }
    String handle(String customer, long amount) {
        return "HTTP 200 → " + useCase.placeOrder(customer, amount);
    }
}

class CliAdapter {
    private final PlaceOrderUseCase useCase;
    CliAdapter(PlaceOrderUseCase useCase) { this.useCase = useCase; }
    String run(String[] argv) {
        return "CLI → " + useCase.placeOrder(argv[0], Long.parseLong(argv[1]));
    }
}`,
};
