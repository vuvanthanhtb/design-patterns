// Dữ liệu cứng: mã nguồn ví dụ strategy (TypeScript + Java) và output đã chạy thật.
export const strategy = {
  javaFile: "StrategyDemo.java",
  tsOutput: [
    "🚗 Hồ Gươm → Nội Bài: 25 phút qua đường vành đai",
    "🚶 Hồ Gươm → Văn Miếu: 1 giờ 10 phút qua công viên",
    "🚌 Hồ Gươm → Cầu Giấy: 40 phút, buýt số 32 rồi metro",
    "🚲 Hồ Gươm → Hồ Tây: 35 phút"
  ],
  javaOutput: [
    "🚗 Hồ Gươm → Nội Bài: 25 phút qua đường vành đai",
    "🚶 Hồ Gươm → Văn Miếu: 1 giờ 10 phút qua công viên",
    "🚌 Hồ Gươm → Cầu Giấy: 40 phút, buýt số 32 rồi metro",
    "🚲 Hồ Gươm → Hồ Tây: 35 phút"
  ],
  typescript: `// Strategy
interface RouteStrategy {
  buildRoute(from: string, to: string): string;
}

// ConcreteStrategy
class RoadStrategy implements RouteStrategy {
  buildRoute(from: string, to: string) {
    return \`🚗 \${from} → \${to}: 25 phút qua đường vành đai\`;
  }
}

class WalkingStrategy implements RouteStrategy {
  buildRoute(from: string, to: string) {
    return \`🚶 \${from} → \${to}: 1 giờ 10 phút qua công viên\`;
  }
}

class TransitStrategy implements RouteStrategy {
  buildRoute(from: string, to: string) {
    return \`🚌 \${from} → \${to}: 40 phút, buýt số 32 rồi metro\`;
  }
}

// Context: chỉ làm việc qua interface RouteStrategy
class Navigator {
  private strategy: RouteStrategy;

  constructor(strategy: RouteStrategy) {
    this.strategy = strategy;
  }

  setStrategy(strategy: RouteStrategy) {
    this.strategy = strategy;
  }

  buildRoute(from: string, to: string) {
    return this.strategy.buildRoute(from, to);
  }
}

// Client chọn strategy lúc runtime
const nav = new Navigator(new RoadStrategy());
console.log(nav.buildRoute("Hồ Gươm", "Nội Bài"));

nav.setStrategy(new WalkingStrategy());
console.log(nav.buildRoute("Hồ Gươm", "Văn Miếu"));

nav.setStrategy(new TransitStrategy());
console.log(nav.buildRoute("Hồ Gươm", "Cầu Giấy"));

// Trong TS, strategy đơn giản cũng có thể chỉ là một hàm
const bike: RouteStrategy = { buildRoute: (a, b) => \`🚲 \${a} → \${b}: 35 phút\` };
nav.setStrategy(bike);
console.log(nav.buildRoute("Hồ Gươm", "Hồ Tây"));`,
  java: `public class StrategyDemo {
    public static void main(String[] args) {
        // Client chọn strategy lúc runtime
        Navigator nav = new Navigator(new RoadStrategy());
        System.out.println(nav.buildRoute("Hồ Gươm", "Nội Bài"));

        nav.setStrategy(new WalkingStrategy());
        System.out.println(nav.buildRoute("Hồ Gươm", "Văn Miếu"));

        nav.setStrategy(new TransitStrategy());
        System.out.println(nav.buildRoute("Hồ Gươm", "Cầu Giấy"));

        // RouteStrategy là functional interface → strategy có thể là lambda
        nav.setStrategy((a, b) -> "🚲 " + a + " → " + b + ": 35 phút");
        System.out.println(nav.buildRoute("Hồ Gươm", "Hồ Tây"));
    }
}

// Strategy
@FunctionalInterface
interface RouteStrategy {
    String buildRoute(String from, String to);
}

// ConcreteStrategy
class RoadStrategy implements RouteStrategy {
    public String buildRoute(String from, String to) {
        return "🚗 " + from + " → " + to + ": 25 phút qua đường vành đai";
    }
}

class WalkingStrategy implements RouteStrategy {
    public String buildRoute(String from, String to) {
        return "🚶 " + from + " → " + to + ": 1 giờ 10 phút qua công viên";
    }
}

class TransitStrategy implements RouteStrategy {
    public String buildRoute(String from, String to) {
        return "🚌 " + from + " → " + to + ": 40 phút, buýt số 32 rồi metro";
    }
}

// Context: chỉ làm việc qua interface RouteStrategy
class Navigator {
    private RouteStrategy strategy;

    Navigator(RouteStrategy strategy) { this.strategy = strategy; }

    void setStrategy(RouteStrategy strategy) { this.strategy = strategy; }

    String buildRoute(String from, String to) {
        return strategy.buildRoute(from, to);
    }
}`,
};
