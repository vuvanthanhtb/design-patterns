// Dữ liệu cứng: mã nguồn ví dụ mediator (TypeScript + Java) và output đã chạy thật.
export const mediator = {
  javaFile: "MediatorDemo.java",
  tsOutput: [
    "  (Đăng nhập đang bị vô hiệu hoá)",
    '→ mediator nhận "input" từ Mật khẩu',
    "  (Đăng nhập đang bị vô hiệu hoá)",
    '→ mediator nhận "input" từ Mật khẩu',
    '→ mediator nhận "click" từ Đăng nhập',
    "  ✅ Gửi form (khách: false)",
    '→ mediator nhận "toggle" từ Đăng nhập khách',
    "  Ô mật khẩu hiển thị: false",
  ],
  javaOutput: [
    "  (Đăng nhập đang bị vô hiệu hoá)",
    '→ mediator nhận "input" từ Mật khẩu',
    "  (Đăng nhập đang bị vô hiệu hoá)",
    '→ mediator nhận "input" từ Mật khẩu',
    '→ mediator nhận "click" từ Đăng nhập',
    "  ✅ Gửi form (khách: false)",
    '→ mediator nhận "toggle" từ Đăng nhập khách',
    "  Ô mật khẩu hiển thị: false",
  ],
  typescript: `// Mediator
interface Mediator {
  notify(sender: Component, event: string): void;
}

// Component cơ sở: chỉ biết mediator, không biết component khác
abstract class Component {
  protected dialog: Mediator | null = null;
  readonly name: string;

  constructor(name: string) {
    this.name = name;
  }

  setMediator(dialog: Mediator) {
    this.dialog = dialog;
  }

  emit(event: string) {
    this.dialog?.notify(this, event);
  }
}

class Checkbox extends Component {
  checked = false;
  toggle() {
    this.checked = !this.checked;
    this.emit("toggle");
  }
}

class TextBox extends Component {
  value = "";
  visible = true;
  type(text: string) {
    this.value = text;
    this.emit("input");
  }
}

class Button extends Component {
  enabled = false;
  click() {
    if (this.enabled) this.emit("click");
    else console.log(\`  (\${this.name} đang bị vô hiệu hoá)\`);
  }
}

// ConcreteMediator: toàn bộ logic phối hợp nằm ở đây
class AuthDialog implements Mediator {
  private guest = new Checkbox("Đăng nhập khách");
  private password = new TextBox("Mật khẩu");
  private submit = new Button("Đăng nhập");

  constructor() {
    for (const c of [this.guest, this.password, this.submit]) c.setMediator(this);
  }

  notify(sender: Component, event: string) {
    console.log(\`→ mediator nhận "\${event}" từ \${sender.name}\`);
    if (sender === this.guest) {
      this.password.visible = !this.guest.checked;
    }
    this.submit.enabled = this.guest.checked || this.password.value.length >= 6;
    if (sender === this.submit && event === "click") {
      console.log(\`  ✅ Gửi form (khách: \${this.guest.checked})\`);
    }
  }

  // Giả lập người dùng thao tác
  simulate() {
    this.submit.click();
    this.password.type("123");
    this.submit.click();
    this.password.type("bí-mật-123");
    this.submit.click();
    this.guest.toggle();
    console.log(\`  Ô mật khẩu hiển thị: \${this.password.visible}\`);
  }
}

new AuthDialog().simulate();`,
  java: `public class MediatorDemo {
    public static void main(String[] args) {
        new AuthDialog().simulate();
    }
}

// Mediator
interface Mediator {
    void notify(Component sender, String event);
}

// Component cơ sở: chỉ biết mediator, không biết component khác
abstract class Component {
    protected Mediator dialog;
    final String name;

    Component(String name) { this.name = name; }

    void setMediator(Mediator dialog) { this.dialog = dialog; }

    void emit(String event) {
        if (dialog != null) dialog.notify(this, event);
    }
}

class Checkbox extends Component {
    boolean checked = false;

    Checkbox(String name) { super(name); }

    void toggle() {
        checked = !checked;
        emit("toggle");
    }
}

class TextBox extends Component {
    String value = "";
    boolean visible = true;

    TextBox(String name) { super(name); }

    void type(String text) {
        value = text;
        emit("input");
    }
}

class Button extends Component {
    boolean enabled = false;

    Button(String name) { super(name); }

    void click() {
        if (enabled) emit("click");
        else System.out.println("  (" + name + " đang bị vô hiệu hoá)");
    }
}

// ConcreteMediator: toàn bộ logic phối hợp nằm ở đây
class AuthDialog implements Mediator {
    private final Checkbox guest = new Checkbox("Đăng nhập khách");
    private final TextBox password = new TextBox("Mật khẩu");
    private final Button submit = new Button("Đăng nhập");

    AuthDialog() {
        guest.setMediator(this);
        password.setMediator(this);
        submit.setMediator(this);
    }

    public void notify(Component sender, String event) {
        System.out.println("→ mediator nhận \\"" + event + "\\" từ " + sender.name);
        if (sender == guest) password.visible = !guest.checked;
        submit.enabled = guest.checked || password.value.length() >= 6;
        if (sender == submit && event.equals("click")) {
            System.out.println("  ✅ Gửi form (khách: " + guest.checked + ")");
        }
    }

    // Giả lập người dùng thao tác
    void simulate() {
        submit.click();
        password.type("123");
        submit.click();
        password.type("bí-mật-123");
        submit.click();
        guest.toggle();
        System.out.println("  Ô mật khẩu hiển thị: " + password.visible);
    }
}`,
};
