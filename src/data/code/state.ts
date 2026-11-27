// Dữ liệu cứng: mã nguồn ví dụ state (TypeScript + Java) và output đã chạy thật.
export const state = {
  javaFile: "StateDemo.java",
  tsOutput: [
    "✏️  \"Design Patterns với TypeScript\" (bản nháp, chỉ tác giả xem)",
    "[Draft] gửi kiểm duyệt",
    "[Moderation] chờ admin duyệt…",
    "[Moderation] admin đã duyệt → xuất bản",
    "🌐 \"Design Patterns với TypeScript\" (công khai)",
    "[Published] đã xuất bản rồi, không làm gì"
  ],
  javaOutput: [
    "✏️  \"Design Patterns với TypeScript\" (bản nháp, chỉ tác giả xem)",
    "[Draft] gửi kiểm duyệt",
    "[Moderation] chờ admin duyệt…",
    "[Moderation] admin đã duyệt → xuất bản",
    "🌐 \"Design Patterns với TypeScript\" (công khai)",
    "[Published] đã xuất bản rồi, không làm gì"
  ],
  typescript: `type Role = "author" | "admin";

// State
interface State {
  readonly name: string;
  publish(doc: Document, role: Role): string;
  render(doc: Document): string;
}

// Context: uỷ quyền hành vi cho state hiện tại
class Document {
  private state: State = new DraftState();
  readonly title: string;

  constructor(title: string) {
    this.title = title;
  }

  setState(s: State) {
    this.state = s;
  }

  publish(role: Role) {
    return \`[\${this.state.name}] \${this.state.publish(this, role)}\`;
  }

  render() {
    return this.state.render(this);
  }
}

// ConcreteState: hành vi riêng + quyết định state tiếp theo
class DraftState implements State {
  readonly name = "Draft";
  publish(doc: Document) {
    doc.setState(new ModerationState());
    return "gửi kiểm duyệt";
  }
  render(doc: Document) {
    return \`✏️  "\${doc.title}" (bản nháp, chỉ tác giả xem)\`;
  }
}

class ModerationState implements State {
  readonly name = "Moderation";
  publish(doc: Document, role: Role) {
    if (role !== "admin") return "chờ admin duyệt…";
    doc.setState(new PublishedState());
    return "admin đã duyệt → xuất bản";
  }
  render(doc: Document) {
    return \`⏳ "\${doc.title}" (đang chờ duyệt)\`;
  }
}

class PublishedState implements State {
  readonly name = "Published";
  publish() {
    return "đã xuất bản rồi, không làm gì";
  }
  render(doc: Document) {
    return \`🌐 "\${doc.title}" (công khai)\`;
  }
}

const doc = new Document("Design Patterns với TypeScript");
console.log(doc.render());
console.log(doc.publish("author"));
console.log(doc.publish("author"));
console.log(doc.publish("admin"));
console.log(doc.render());
console.log(doc.publish("admin"));`,
  java: `public class StateDemo {
    public static void main(String[] args) {
        Document doc = new Document("Design Patterns với TypeScript");
        System.out.println(doc.render());
        System.out.println(doc.publish(Role.AUTHOR));
        System.out.println(doc.publish(Role.AUTHOR));
        System.out.println(doc.publish(Role.ADMIN));
        System.out.println(doc.render());
        System.out.println(doc.publish(Role.ADMIN));
    }
}

enum Role { AUTHOR, ADMIN }

// State
interface State {
    String name();
    String publish(Document doc, Role role);
    String render(Document doc);
}

// Context: uỷ quyền hành vi cho state hiện tại
class Document {
    private State state = new DraftState();
    final String title;

    Document(String title) { this.title = title; }

    void setState(State s) { this.state = s; }

    String publish(Role role) {
        return "[" + state.name() + "] " + state.publish(this, role);
    }

    String render() { return state.render(this); }
}

// ConcreteState: hành vi riêng + quyết định state tiếp theo
class DraftState implements State {
    public String name() { return "Draft"; }

    public String publish(Document doc, Role role) {
        doc.setState(new ModerationState());
        return "gửi kiểm duyệt";
    }

    public String render(Document doc) {
        return "✏️  \\"" + doc.title + "\\" (bản nháp, chỉ tác giả xem)";
    }
}

class ModerationState implements State {
    public String name() { return "Moderation"; }

    public String publish(Document doc, Role role) {
        if (role != Role.ADMIN) return "chờ admin duyệt…";
        doc.setState(new PublishedState());
        return "admin đã duyệt → xuất bản";
    }

    public String render(Document doc) {
        return "⏳ \\"" + doc.title + "\\" (đang chờ duyệt)";
    }
}

class PublishedState implements State {
    public String name() { return "Published"; }

    public String publish(Document doc, Role role) {
        return "đã xuất bản rồi, không làm gì";
    }

    public String render(Document doc) {
        return "🌐 \\"" + doc.title + "\\" (công khai)";
    }
}`,
};
