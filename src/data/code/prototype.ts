// Dữ liệu cứng: mã nguồn ví dụ prototype (TypeScript + Java) và output đã chạy thật.
export const prototype = {
  javaFile: "PrototypeDemo.java",
  tsOutput: [
    "Circle(r=20, red) tại (0, 0)",
    "Circle(r=20, red) tại (100, 0)",
    "Rectangle(85x54, blue) tại (0, 0)",
    "a và b là hai đối tượng khác nhau: true"
  ],
  javaOutput: [
    "Circle(r=20, red) tại (0, 0)",
    "Circle(r=20, red) tại (100, 0)",
    "Rectangle(85x54, blue) tại (0, 0)",
    "a và b là hai đối tượng khác nhau: true"
  ],
  typescript: `// Prototype
abstract class Shape {
  x = 0;
  y = 0;
  color = "black";

  // Constructor sao chép: copy các field chung từ nguồn
  constructor(source?: Shape) {
    if (source) {
      this.x = source.x;
      this.y = source.y;
      this.color = source.color;
    }
  }

  abstract clone(): Shape;
  abstract describe(): string;
}

// ConcretePrototype
class Circle extends Shape {
  radius = 1;

  constructor(source?: Circle) {
    super(source);
    if (source) this.radius = source.radius;
  }

  clone(): Circle {
    return new Circle(this);
  }

  describe() {
    return \`Circle(r=\${this.radius}, \${this.color}) tại (\${this.x}, \${this.y})\`;
  }
}

class Rectangle extends Shape {
  width = 1;
  height = 1;

  constructor(source?: Rectangle) {
    super(source);
    if (source) {
      this.width = source.width;
      this.height = source.height;
    }
  }

  clone(): Rectangle {
    return new Rectangle(this);
  }

  describe() {
    return \`Rectangle(\${this.width}x\${this.height}, \${this.color}) tại (\${this.x}, \${this.y})\`;
  }
}

// Prototype registry: lưu sẵn các mẫu đã cấu hình
class ShapeRegistry {
  private items = new Map<string, Shape>();

  add(key: string, shape: Shape) {
    this.items.set(key, shape);
  }

  get(key: string): Shape {
    const proto = this.items.get(key);
    if (!proto) throw new Error(\`Không có mẫu "\${key}"\`);
    return proto.clone();
  }
}

const bigRed = new Circle();
bigRed.radius = 20;
bigRed.color = "red";

const card = new Rectangle();
card.width = 85;
card.height = 54;
card.color = "blue";

const registry = new ShapeRegistry();
registry.add("big-red-circle", bigRed);
registry.add("card", card);

// Client tạo bản sao mà không biết lớp cụ thể
const a = registry.get("big-red-circle");
const b = registry.get("big-red-circle");
b.x = 100;

console.log(a.describe());
console.log(b.describe());
console.log(registry.get("card").describe());
console.log("a và b là hai đối tượng khác nhau:", a !== b);`,
  java: `import java.util.HashMap;
import java.util.Map;

public class PrototypeDemo {
    public static void main(String[] args) {
        Circle bigRed = new Circle();
        bigRed.radius = 20;
        bigRed.color = "red";

        Rectangle card = new Rectangle();
        card.width = 85;
        card.height = 54;
        card.color = "blue";

        ShapeRegistry registry = new ShapeRegistry();
        registry.add("big-red-circle", bigRed);
        registry.add("card", card);

        // Client tạo bản sao mà không biết lớp cụ thể
        Shape a = registry.get("big-red-circle");
        Shape b = registry.get("big-red-circle");
        b.x = 100;

        System.out.println(a.describe());
        System.out.println(b.describe());
        System.out.println(registry.get("card").describe());
        System.out.println("a và b là hai đối tượng khác nhau: " + (a != b));
    }
}

// Prototype
abstract class Shape {
    int x, y;
    String color = "black";

    Shape() {}

    // Constructor sao chép: copy các field chung từ nguồn
    Shape(Shape source) {
        this.x = source.x;
        this.y = source.y;
        this.color = source.color;
    }

    abstract Shape copy();
    abstract String describe();
}

// ConcretePrototype
class Circle extends Shape {
    int radius = 1;

    Circle() {}

    Circle(Circle source) {
        super(source);
        this.radius = source.radius;
    }

    @Override
    Circle copy() { return new Circle(this); }

    @Override
    String describe() {
        return "Circle(r=" + radius + ", " + color + ") tại (" + x + ", " + y + ")";
    }
}

class Rectangle extends Shape {
    int width = 1, height = 1;

    Rectangle() {}

    Rectangle(Rectangle source) {
        super(source);
        this.width = source.width;
        this.height = source.height;
    }

    @Override
    Rectangle copy() { return new Rectangle(this); }

    @Override
    String describe() {
        return "Rectangle(" + width + "x" + height + ", " + color + ") tại (" + x + ", " + y + ")";
    }
}

// Prototype registry: lưu sẵn các mẫu đã cấu hình
class ShapeRegistry {
    private final Map<String, Shape> items = new HashMap<>();

    void add(String key, Shape shape) { items.put(key, shape); }

    Shape get(String key) {
        Shape proto = items.get(key);
        if (proto == null) throw new IllegalArgumentException("Không có mẫu \\"" + key + "\\"");
        return proto.copy();
    }
}`,
};
