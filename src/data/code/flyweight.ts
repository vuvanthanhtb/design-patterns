// Dữ liệu cứng: mã nguồn ví dụ flyweight (TypeScript + Java) và output đã chạy thật.
export const flyweight = {
  javaFile: "FlyweightDemo.java",
  tsOutput: [
    "Thông (xanh đậm) tại (0, 0)",
    "Sồi (xanh lá) tại (1, 0)",
    "Phong (đỏ) tại (2, 0)",
    "Số cây: 100.000",
    "Số TreeType thực sự trong bộ nhớ: 3"
  ],
  javaOutput: [
    "Thông (xanh đậm) tại (0, 0)",
    "Sồi (xanh lá) tại (1, 0)",
    "Phong (đỏ) tại (2, 0)",
    "Số cây: 100.000",
    "Số TreeType thực sự trong bộ nhớ: 3"
  ],
  typescript: `// Flyweight: trạng thái nội tại (intrinsic), bất biến và dùng chung
class TreeType {
  readonly name: string;
  readonly color: string;
  readonly texture: string;

  constructor(name: string, color: string, texture: string) {
    this.name = name;
    this.color = color;
    this.texture = texture;
  }

  draw(x: number, y: number): string {
    return \`\${this.name} (\${this.color}) tại (\${x}, \${y})\`;
  }
}

// FlyweightFactory: trả flyweight có sẵn hoặc tạo mới
class TreeFactory {
  private static types = new Map<string, TreeType>();

  static getType(name: string, color: string, texture: string): TreeType {
    const key = \`\${name}|\${color}|\${texture}\`;
    let type = this.types.get(key);
    if (!type) {
      type = new TreeType(name, color, texture);
      this.types.set(key, type);
    }
    return type;
  }

  static count() {
    return this.types.size;
  }
}

// Context: chỉ giữ trạng thái ngoại lai (extrinsic) + tham chiếu flyweight
class Tree {
  private x: number;
  private y: number;
  private type: TreeType;

  constructor(x: number, y: number, type: TreeType) {
    this.x = x;
    this.y = y;
    this.type = type;
  }

  draw() {
    return this.type.draw(this.x, this.y);
  }
}

// Client
class Forest {
  private trees: Tree[] = [];

  plantTree(x: number, y: number, name: string, color: string, texture: string) {
    const type = TreeFactory.getType(name, color, texture);
    this.trees.push(new Tree(x, y, type));
  }

  size() {
    return this.trees.length;
  }

  sample(n: number) {
    return this.trees.slice(0, n).map((t) => t.draw());
  }
}

const forest = new Forest();
const species = [
  ["Thông", "xanh đậm", "pine.png"],
  ["Sồi", "xanh lá", "oak.png"],
  ["Phong", "đỏ", "maple.png"],
] as const;

for (let i = 0; i < 100_000; i++) {
  const [name, color, texture] = species[i % species.length];
  forest.plantTree(i % 500, Math.floor(i / 500), name, color, texture);
}

console.log(forest.sample(3).join("\\n"));
console.log(\`Số cây: \${forest.size().toLocaleString("vi-VN")}\`);
console.log(\`Số TreeType thực sự trong bộ nhớ: \${TreeFactory.count()}\`);`,
  java: `import java.text.NumberFormat;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

public class FlyweightDemo {
    public static void main(String[] args) {
        Forest forest = new Forest();
        String[][] species = {
            {"Thông", "xanh đậm", "pine.png"},
            {"Sồi", "xanh lá", "oak.png"},
            {"Phong", "đỏ", "maple.png"},
        };

        for (int i = 0; i < 100_000; i++) {
            String[] s = species[i % species.length];
            forest.plantTree(i % 500, i / 500, s[0], s[1], s[2]);
        }

        forest.sample(3).forEach(System.out::println);
        NumberFormat vi = NumberFormat.getInstance(Locale.forLanguageTag("vi-VN"));
        System.out.println("Số cây: " + vi.format(forest.size()));
        System.out.println("Số TreeType thực sự trong bộ nhớ: " + TreeFactory.count());
    }
}

// Flyweight: trạng thái nội tại (intrinsic), bất biến và dùng chung
record TreeType(String name, String color, String texture) {
    String draw(int x, int y) {
        return name + " (" + color + ") tại (" + x + ", " + y + ")";
    }
}

// FlyweightFactory: trả flyweight có sẵn hoặc tạo mới
final class TreeFactory {
    private static final Map<String, TreeType> types = new HashMap<>();

    static TreeType getType(String name, String color, String texture) {
        String key = name + "|" + color + "|" + texture;
        return types.computeIfAbsent(key, k -> new TreeType(name, color, texture));
    }

    static int count() { return types.size(); }
}

// Context: chỉ giữ trạng thái ngoại lai (extrinsic) + tham chiếu flyweight
class Tree {
    private final int x, y;
    private final TreeType type;

    Tree(int x, int y, TreeType type) {
        this.x = x;
        this.y = y;
        this.type = type;
    }

    String draw() { return type.draw(x, y); }
}

// Client
class Forest {
    private final List<Tree> trees = new ArrayList<>();

    void plantTree(int x, int y, String name, String color, String texture) {
        trees.add(new Tree(x, y, TreeFactory.getType(name, color, texture)));
    }

    int size() { return trees.size(); }

    List<String> sample(int n) {
        return trees.subList(0, n).stream().map(Tree::draw).toList();
    }
}`,
};
