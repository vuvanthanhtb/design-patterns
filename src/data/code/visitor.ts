// Dữ liệu cứng: mã nguồn ví dụ visitor (TypeScript + Java) và output đã chạy thật.
export const visitor = {
  javaFile: "VisitorDemo.java",
  tsOutput: [
    "{\"type\":\"circle\",\"r\":1}",
    "{\"type\":\"square\",\"side\":3}",
    "{\"type\":\"circle\",\"r\":2.5}",
    "Circle: 3.14",
    "Square: 9.00",
    "Circle: 19.63",
    "Tổng diện tích: 31.78"
  ],
  javaOutput: [
    "{\"type\":\"circle\",\"r\":1}",
    "{\"type\":\"square\",\"side\":3}",
    "{\"type\":\"circle\",\"r\":2.5}",
    "Circle: 3.14",
    "Square: 9.00",
    "Circle: 19.63",
    "Tổng diện tích: 31.78"
  ],
  typescript: `// Visitor: một phương thức cho mỗi loại phần tử
interface Visitor {
  visitCircle(c: Circle): string;
  visitSquare(s: Square): string;
}

// Element
interface Shape {
  accept(v: Visitor): string;
}

// ConcreteElement: accept() chọn đúng phương thức — double dispatch
class Circle implements Shape {
  readonly radius: number;
  constructor(radius: number) {
    this.radius = radius;
  }
  accept(v: Visitor) {
    return v.visitCircle(this);
  }
}

class Square implements Shape {
  readonly side: number;
  constructor(side: number) {
    this.side = side;
  }
  accept(v: Visitor) {
    return v.visitSquare(this);
  }
}

// ConcreteVisitor: mỗi thao tác mới là một lớp — không sửa Circle/Square
class JsonExportVisitor implements Visitor {
  visitCircle(c: Circle) {
    return JSON.stringify({ type: "circle", r: c.radius });
  }
  visitSquare(s: Square) {
    return JSON.stringify({ type: "square", side: s.side });
  }
}

class AreaVisitor implements Visitor {
  total = 0;
  visitCircle(c: Circle) {
    const area = Math.PI * c.radius ** 2;
    this.total += area;
    return \`Circle: \${area.toFixed(2)}\`;
  }
  visitSquare(s: Square) {
    const area = s.side ** 2;
    this.total += area;
    return \`Square: \${area.toFixed(2)}\`;
  }
}

const shapes: Shape[] = [new Circle(1), new Square(3), new Circle(2.5)];

const json = new JsonExportVisitor();
console.log(shapes.map((s) => s.accept(json)).join("\\n"));

const area = new AreaVisitor();
for (const s of shapes) console.log(s.accept(area));
console.log("Tổng diện tích:", area.total.toFixed(2));`,
  java: `import java.util.List;

public class VisitorDemo {
    public static void main(String[] args) {
        List<Shape> shapes = List.of(new Circle(1), new Square(3), new Circle(2.5));

        JsonExportVisitor json = new JsonExportVisitor();
        for (Shape s : shapes) System.out.println(s.accept(json));

        AreaVisitor area = new AreaVisitor();
        for (Shape s : shapes) System.out.println(s.accept(area));
        System.out.printf("Tổng diện tích: %.2f%n", area.total);
    }
}

// Visitor: một phương thức cho mỗi loại phần tử
interface Visitor {
    String visitCircle(Circle c);
    String visitSquare(Square s);
}

// Element
interface Shape {
    String accept(Visitor v);
}

// ConcreteElement: accept() chọn đúng phương thức — double dispatch
record Circle(double radius) implements Shape {
    public String accept(Visitor v) { return v.visitCircle(this); }
}

record Square(double side) implements Shape {
    public String accept(Visitor v) { return v.visitSquare(this); }
}

// ConcreteVisitor: mỗi thao tác mới là một lớp — không sửa Circle/Square
class JsonExportVisitor implements Visitor {
    public String visitCircle(Circle c) {
        return "{\\"type\\":\\"circle\\",\\"r\\":" + fmt(c.radius()) + "}";
    }

    public String visitSquare(Square s) {
        return "{\\"type\\":\\"square\\",\\"side\\":" + fmt(s.side()) + "}";
    }

    private static String fmt(double d) {
        return d == Math.rint(d) ? String.valueOf((long) d) : String.valueOf(d);
    }
}

class AreaVisitor implements Visitor {
    double total = 0;

    public String visitCircle(Circle c) {
        double area = Math.PI * c.radius() * c.radius();
        total += area;
        return String.format("Circle: %.2f", area);
    }

    public String visitSquare(Square s) {
        double area = s.side() * s.side();
        total += area;
        return String.format("Square: %.2f", area);
    }
}`,
};
