// Dữ liệu cứng: mã nguồn ví dụ decorator (TypeScript + Java) và output đã chạy thật.
export const decorator = {
  javaFile: "DecoratorDemo.java",
  tsOutput: [
    "📧 Email: Server CPU 95%",
    "📱 SMS: Server CPU 95%",
    "💬 Slack: Server CPU 95%",
    "---",
    "📧 Email: DEPLOY XONG"
  ],
  javaOutput: [
    "📧 Email: Server CPU 95%",
    "📱 SMS: Server CPU 95%",
    "💬 Slack: Server CPU 95%",
    "---",
    "📧 Email: DEPLOY XONG"
  ],
  typescript: `// Component
interface Notifier {
  send(message: string): string;
}

// ConcreteComponent: hành vi cơ bản
class EmailNotifier implements Notifier {
  send(message: string): string {
    return \`📧 Email: \${message}\`;
  }
}

// BaseDecorator: cùng interface, bọc một Notifier khác
abstract class NotifierDecorator implements Notifier {
  protected wrappee: Notifier;

  constructor(wrappee: Notifier) {
    this.wrappee = wrappee;
  }

  send(message: string): string {
    return this.wrappee.send(message);
  }
}

// ConcreteDecorator: thêm hành vi rồi uỷ quyền cho wrappee
class SmsDecorator extends NotifierDecorator {
  send(message: string): string {
    return \`\${super.send(message)}\\n📱 SMS: \${message}\`;
  }
}

class SlackDecorator extends NotifierDecorator {
  send(message: string): string {
    return \`\${super.send(message)}\\n💬 Slack: \${message}\`;
  }
}

class UppercaseDecorator extends NotifierDecorator {
  send(message: string): string {
    return super.send(message.toUpperCase());
  }
}

// Xếp chồng decorator lúc runtime theo cấu hình
let notifier: Notifier = new EmailNotifier();
const settings = { sms: true, slack: true, shout: false };
if (settings.sms) notifier = new SmsDecorator(notifier);
if (settings.slack) notifier = new SlackDecorator(notifier);
if (settings.shout) notifier = new UppercaseDecorator(notifier);

console.log(notifier.send("Server CPU 95%"));
console.log("---");
console.log(new UppercaseDecorator(new EmailNotifier()).send("deploy xong"));`,
  java: `public class DecoratorDemo {
    public static void main(String[] args) {
        // Xếp chồng decorator lúc runtime theo cấu hình
        boolean sms = true, slack = true, shout = false;
        Notifier notifier = new EmailNotifier();
        if (sms) notifier = new SmsDecorator(notifier);
        if (slack) notifier = new SlackDecorator(notifier);
        if (shout) notifier = new UppercaseDecorator(notifier);

        System.out.println(notifier.send("Server CPU 95%"));
        System.out.println("---");
        System.out.println(new UppercaseDecorator(new EmailNotifier()).send("deploy xong"));
    }
}

// Component
interface Notifier {
    String send(String message);
}

// ConcreteComponent: hành vi cơ bản
class EmailNotifier implements Notifier {
    public String send(String message) {
        return "📧 Email: " + message;
    }
}

// BaseDecorator: cùng interface, bọc một Notifier khác
abstract class NotifierDecorator implements Notifier {
    protected final Notifier wrappee;

    NotifierDecorator(Notifier wrappee) {
        this.wrappee = wrappee;
    }

    public String send(String message) {
        return wrappee.send(message);
    }
}

// ConcreteDecorator: thêm hành vi rồi uỷ quyền cho wrappee
class SmsDecorator extends NotifierDecorator {
    SmsDecorator(Notifier wrappee) { super(wrappee); }

    @Override
    public String send(String message) {
        return super.send(message) + "\\n📱 SMS: " + message;
    }
}

class SlackDecorator extends NotifierDecorator {
    SlackDecorator(Notifier wrappee) { super(wrappee); }

    @Override
    public String send(String message) {
        return super.send(message) + "\\n💬 Slack: " + message;
    }
}

class UppercaseDecorator extends NotifierDecorator {
    UppercaseDecorator(Notifier wrappee) { super(wrappee); }

    @Override
    public String send(String message) {
        return super.send(message.toUpperCase());
    }
}`,
};
