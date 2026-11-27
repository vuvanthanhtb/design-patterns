// Dữ liệu cứng: mã nguồn ví dụ observer (TypeScript + Java) và output đã chạy thật.
export const observer = {
  javaFile: "ObserverDemo.java",
  tsOutput: [
    '📰 Phát tin: "Giá vàng tăng mạnh"',
    "   ✉️  gửi tới lan@example.vn: Giá vàng tăng mạnh",
    "   🔔 push tới thiết bị iphone-42: Giá vàng tăng mạnh",
    '📰 Phát tin: "Thời tiết: mưa lớn ở Hà Nội"',
    "   🔔 push tới thiết bị iphone-42: Thời tiết: mưa lớn ở Hà Nội",
  ],
  javaOutput: [
    '📰 Phát tin: "Giá vàng tăng mạnh"',
    "   ✉️  gửi tới lan@example.vn: Giá vàng tăng mạnh",
    "   🔔 push tới thiết bị iphone-42: Giá vàng tăng mạnh",
    '📰 Phát tin: "Thời tiết: mưa lớn ở Hà Nội"',
    "   🔔 push tới thiết bị iphone-42: Thời tiết: mưa lớn ở Hà Nội",
  ],
  typescript: `// Subscriber
interface Subscriber {
  update(news: string): string;
}

// Publisher: quản lý danh sách đăng ký và phát sự kiện
class NewsAgency {
  private subscribers: Subscriber[] = [];
  private latest = "";

  subscribe(s: Subscriber) {
    this.subscribers.push(s);
  }

  unsubscribe(s: Subscriber) {
    this.subscribers = this.subscribers.filter((x) => x !== s);
  }

  publish(news: string) {
    this.latest = news;
    console.log(\`📰 Phát tin: "\${this.latest}"\`);
    for (const s of this.subscribers) console.log("   " + s.update(news));
  }
}

// ConcreteSubscriber
class EmailSubscriber implements Subscriber {
  private email: string;
  constructor(email: string) {
    this.email = email;
  }
  update(news: string) {
    return \`✉️  gửi tới \${this.email}: \${news}\`;
  }
}

class MobileApp implements Subscriber {
  private deviceId: string;
  constructor(deviceId: string) {
    this.deviceId = deviceId;
  }
  update(news: string) {
    return \`🔔 push tới thiết bị \${this.deviceId}: \${news}\`;
  }
}

const agency = new NewsAgency();
const lan = new EmailSubscriber("lan@example.vn");
const phone = new MobileApp("iphone-42");

agency.subscribe(lan);
agency.subscribe(phone);
agency.publish("Giá vàng tăng mạnh");

agency.unsubscribe(lan);
agency.publish("Thời tiết: mưa lớn ở Hà Nội");`,
  java: `import java.util.ArrayList;
import java.util.List;

public class ObserverDemo {
    public static void main(String[] args) {
        NewsAgency agency = new NewsAgency();
        Subscriber lan = new EmailSubscriber("lan@example.vn");
        Subscriber phone = new MobileApp("iphone-42");

        agency.subscribe(lan);
        agency.subscribe(phone);
        agency.publish("Giá vàng tăng mạnh");

        agency.unsubscribe(lan);
        agency.publish("Thời tiết: mưa lớn ở Hà Nội");
    }
}

// Subscriber
interface Subscriber {
    String update(String news);
}

// Publisher: quản lý danh sách đăng ký và phát sự kiện
class NewsAgency {
    private final List<Subscriber> subscribers = new ArrayList<>();
    private String latest = "";

    void subscribe(Subscriber s) { subscribers.add(s); }

    void unsubscribe(Subscriber s) { subscribers.remove(s); }

    void publish(String news) {
        latest = news;
        System.out.println("📰 Phát tin: \\"" + latest + "\\"");
        for (Subscriber s : subscribers) System.out.println("   " + s.update(news));
    }
}

// ConcreteSubscriber
class EmailSubscriber implements Subscriber {
    private final String email;

    EmailSubscriber(String email) { this.email = email; }

    public String update(String news) {
        return "✉️  gửi tới " + email + ": " + news;
    }
}

class MobileApp implements Subscriber {
    private final String deviceId;

    MobileApp(String deviceId) { this.deviceId = deviceId; }

    public String update(String news) {
        return "🔔 push tới thiết bị " + deviceId + ": " + news;
    }
}`,
};
