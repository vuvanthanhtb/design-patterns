/**
 * Copyright (c) 2026 vuvanthanhtb
 * SPDX-License-Identifier: MIT
 */

// Dữ liệu cứng: mã nguồn ví dụ abstract-factory (TypeScript + Java) và output đã chạy thật.
export const abstractFactory = {
  javaFile: "AbstractFactoryDemo.java",
  tsOutput: ["[ OK ] (Windows)  [x] (Windows)", "( OK ) (macOS)  (✓) (macOS)"],
  javaOutput: [
    "[ OK ] (Windows)  [x] (Windows)",
    "( OK ) (macOS)  (✓) (macOS)",
  ],
  typescript: `// AbstractProduct
interface Button {
  render(): string;
}
interface Checkbox {
  render(): string;
}

// ConcreteProduct — họ Windows
class WinButton implements Button {
  render() {
    return "[ OK ] (Windows)";
  }
}
class WinCheckbox implements Checkbox {
  render() {
    return "[x] (Windows)";
  }
}

// ConcreteProduct — họ macOS
class MacButton implements Button {
  render() {
    return "( OK ) (macOS)";
  }
}
class MacCheckbox implements Checkbox {
  render() {
    return "(✓) (macOS)";
  }
}

// AbstractFactory: tạo cả một họ sản phẩm đồng bộ
interface GUIFactory {
  createButton(): Button;
  createCheckbox(): Checkbox;
}

class WinFactory implements GUIFactory {
  createButton() {
    return new WinButton();
  }
  createCheckbox() {
    return new WinCheckbox();
  }
}

class MacFactory implements GUIFactory {
  createButton() {
    return new MacButton();
  }
  createCheckbox() {
    return new MacCheckbox();
  }
}

// Client: chỉ biết các interface trừu tượng
class Application {
  private factory: GUIFactory;

  constructor(factory: GUIFactory) {
    this.factory = factory;
  }

  paint(): string {
    const button = this.factory.createButton();
    const checkbox = this.factory.createCheckbox();
    return \`\${button.render()}  \${checkbox.render()}\`;
  }
}

// Chọn factory một lần duy nhất, dựa trên cấu hình
function factoryFor(os: "windows" | "mac"): GUIFactory {
  return os === "windows" ? new WinFactory() : new MacFactory();
}

console.log(new Application(factoryFor("windows")).paint());
console.log(new Application(factoryFor("mac")).paint());`,
  java: `public class AbstractFactoryDemo {
    public static void main(String[] args) {
        System.out.println(new Application(factoryFor("windows")).paint());
        System.out.println(new Application(factoryFor("mac")).paint());
    }

    // Chọn factory một lần duy nhất, dựa trên cấu hình
    static GUIFactory factoryFor(String os) {
        return os.equals("windows") ? new WinFactory() : new MacFactory();
    }
}

// AbstractProduct
interface Button { String render(); }
interface Checkbox { String render(); }

// ConcreteProduct — họ Windows
class WinButton implements Button {
    public String render() { return "[ OK ] (Windows)"; }
}
class WinCheckbox implements Checkbox {
    public String render() { return "[x] (Windows)"; }
}

// ConcreteProduct — họ macOS
class MacButton implements Button {
    public String render() { return "( OK ) (macOS)"; }
}
class MacCheckbox implements Checkbox {
    public String render() { return "(✓) (macOS)"; }
}

// AbstractFactory: tạo cả một họ sản phẩm đồng bộ
interface GUIFactory {
    Button createButton();
    Checkbox createCheckbox();
}

class WinFactory implements GUIFactory {
    public Button createButton() { return new WinButton(); }
    public Checkbox createCheckbox() { return new WinCheckbox(); }
}

class MacFactory implements GUIFactory {
    public Button createButton() { return new MacButton(); }
    public Checkbox createCheckbox() { return new MacCheckbox(); }
}

// Client: chỉ biết các interface trừu tượng
class Application {
    private final GUIFactory factory;

    Application(GUIFactory factory) {
        this.factory = factory;
    }

    String paint() {
        Button button = factory.createButton();
        Checkbox checkbox = factory.createCheckbox();
        return button.render() + "  " + checkbox.render();
    }
}`,
};
