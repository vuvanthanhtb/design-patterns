// Dữ liệu cứng: mã nguồn ví dụ adapter (TypeScript + Java) và output đã chạy thật.
export const adapter = {
  javaFile: "AdapterDemo.java",
  tsOutput: [
    "Thu tiền mặt 250.000₫",
    "Đã thanh toán 250.000₫ qua Stripe (ch_1000, 1000 cents)",
  ],
  javaOutput: [
    "Thu tiền mặt 250.000₫",
    "Đã thanh toán 250.000₫ qua Stripe (ch_1000, 1000 cents)",
  ],
  typescript: `// Target: interface mà hệ thống của bạn đang dùng
interface PaymentProcessor {
  pay(amountVnd: number): string;
}

// Adaptee: thư viện bên thứ ba, interface không tương thích
class StripeApi {
  charge(cents: number, currency: string) {
    return { id: "ch_" + cents, amount: cents, currency };
  }
}

// Adapter: hiện thực Target, bên trong gọi Adaptee
class StripeAdapter implements PaymentProcessor {
  private static readonly VND_PER_USD = 25_000;
  private stripe: StripeApi;

  constructor(stripe: StripeApi) {
    this.stripe = stripe;
  }

  pay(amountVnd: number): string {
    // Dịch dữ liệu: VND → cents USD
    const cents = Math.round((amountVnd / StripeAdapter.VND_PER_USD) * 100);
    const result = this.stripe.charge(cents, "usd");
    return \`Đã thanh toán \${amountVnd.toLocaleString("vi-VN")}₫ qua Stripe (\${result.id}, \${result.amount} cents)\`;
  }
}

// Một processor khác, vốn đã khớp interface
class CashProcessor implements PaymentProcessor {
  pay(amountVnd: number): string {
    return \`Thu tiền mặt \${amountVnd.toLocaleString("vi-VN")}₫\`;
  }
}

// Client: chỉ biết PaymentProcessor
class Checkout {
  private processor: PaymentProcessor;

  constructor(processor: PaymentProcessor) {
    this.processor = processor;
  }

  submit(total: number) {
    return this.processor.pay(total);
  }
}

console.log(new Checkout(new CashProcessor()).submit(250_000));
console.log(new Checkout(new StripeAdapter(new StripeApi())).submit(250_000));`,
  java: `import java.text.NumberFormat;
import java.util.Locale;

public class AdapterDemo {
    public static void main(String[] args) {
        System.out.println(new Checkout(new CashProcessor()).submit(250_000));
        System.out.println(new Checkout(new StripeAdapter(new StripeApi())).submit(250_000));
    }

    static String vnd(long amount) {
        return NumberFormat.getInstance(Locale.forLanguageTag("vi-VN")).format(amount) + "₫";
    }
}

// Target: interface mà hệ thống của bạn đang dùng
interface PaymentProcessor {
    String pay(long amountVnd);
}

// Adaptee: thư viện bên thứ ba, interface không tương thích
class StripeApi {
    record Charge(String id, long amount, String currency) {}

    Charge charge(long cents, String currency) {
        return new Charge("ch_" + cents, cents, currency);
    }
}

// Adapter: hiện thực Target, bên trong gọi Adaptee
class StripeAdapter implements PaymentProcessor {
    private static final long VND_PER_USD = 25_000;
    private final StripeApi stripe;

    StripeAdapter(StripeApi stripe) {
        this.stripe = stripe;
    }

    @Override
    public String pay(long amountVnd) {
        // Dịch dữ liệu: VND → cents USD
        long cents = Math.round(amountVnd * 100.0 / VND_PER_USD);
        StripeApi.Charge result = stripe.charge(cents, "usd");
        return "Đã thanh toán " + AdapterDemo.vnd(amountVnd) + " qua Stripe ("
                + result.id() + ", " + result.amount() + " cents)";
    }
}

// Một processor khác, vốn đã khớp interface
class CashProcessor implements PaymentProcessor {
    @Override
    public String pay(long amountVnd) {
        return "Thu tiền mặt " + AdapterDemo.vnd(amountVnd);
    }
}

// Client: chỉ biết PaymentProcessor
class Checkout {
    private final PaymentProcessor processor;

    Checkout(PaymentProcessor processor) {
        this.processor = processor;
    }

    String submit(long total) {
        return processor.pay(total);
    }
}`,
};
