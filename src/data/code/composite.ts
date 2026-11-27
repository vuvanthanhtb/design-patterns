// Dữ liệu cứng: mã nguồn ví dụ composite (TypeScript + Java) và output đã chạy thật.
export const composite = {
  javaFile: "CompositeDemo.java",
  tsOutput: [
    "📁 project/ (27 KB)",
    "   📄 README.md (4 KB)",
    "   📁 src/ (21 KB)",
    "      📄 index.ts (12 KB)",
    "      📁 utils/ (9 KB)",
    "         📄 math.ts (6 KB)",
    "         📄 date.ts (3 KB)",
    "   📄 package.json (2 KB)",
    "Tổng dung lượng: 27 KB",
  ],
  javaOutput: [
    "📁 project/ (27 KB)",
    "   📄 README.md (4 KB)",
    "   📁 src/ (21 KB)",
    "      📄 index.ts (12 KB)",
    "      📁 utils/ (9 KB)",
    "         📄 math.ts (6 KB)",
    "         📄 date.ts (3 KB)",
    "   📄 package.json (2 KB)",
    "Tổng dung lượng: 27 KB",
  ],
  typescript: `// Component: interface chung cho lá và nhánh
interface FileSystemNode {
  getName(): string;
  getSize(): number;
  print(indent?: string): string;
}

// Leaf
class File implements FileSystemNode {
  private name: string;
  private size: number;

  constructor(name: string, size: number) {
    this.name = name;
    this.size = size;
  }

  getName() { return this.name; }
  getSize() { return this.size; }
  print(indent = "") {
    return \`\${indent}📄 \${this.name} (\${this.size} KB)\`;
  }
}

// Composite: chứa con, uỷ quyền công việc cho chúng
class Folder implements FileSystemNode {
  private name: string;
  private children: FileSystemNode[] = [];

  constructor(name: string) {
    this.name = name;
  }

  add(node: FileSystemNode): this {
    this.children.push(node);
    return this;
  }

  getName() { return this.name; }

  // Đệ quy: tổng kích thước của mọi con
  getSize(): number {
    return this.children.reduce((sum, child) => sum + child.getSize(), 0);
  }

  print(indent = ""): string {
    const lines = [\`\${indent}📁 \${this.name}/ (\${this.getSize()} KB)\`];
    for (const child of this.children) lines.push(child.print(indent + "   "));
    return lines.join("\\n");
  }
}

const root = new Folder("project")
  .add(new File("README.md", 4))
  .add(
    new Folder("src")
      .add(new File("index.ts", 12))
      .add(new Folder("utils").add(new File("math.ts", 6)).add(new File("date.ts", 3))),
  )
  .add(new File("package.json", 2));

// Client xử lý file và folder như nhau
console.log(root.print());
console.log("Tổng dung lượng:", root.getSize(), "KB");`,
  java: `import java.util.ArrayList;
import java.util.List;

public class CompositeDemo {
    public static void main(String[] args) {
        Folder root = new Folder("project")
            .add(new File("README.md", 4))
            .add(new Folder("src")
                .add(new File("index.ts", 12))
                .add(new Folder("utils")
                    .add(new File("math.ts", 6))
                    .add(new File("date.ts", 3))))
            .add(new File("package.json", 2));

        // Client xử lý file và folder như nhau
        System.out.println(root.print(""));
        System.out.println("Tổng dung lượng: " + root.getSize() + " KB");
    }
}

// Component: interface chung cho lá và nhánh
interface FileSystemNode {
    String getName();
    int getSize();
    String print(String indent);
}

// Leaf
class File implements FileSystemNode {
    private final String name;
    private final int size;

    File(String name, int size) {
        this.name = name;
        this.size = size;
    }

    public String getName() { return name; }
    public int getSize() { return size; }
    public String print(String indent) {
        return indent + "📄 " + name + " (" + size + " KB)";
    }
}

// Composite: chứa con, uỷ quyền công việc cho chúng
class Folder implements FileSystemNode {
    private final String name;
    private final List<FileSystemNode> children = new ArrayList<>();

    Folder(String name) { this.name = name; }

    Folder add(FileSystemNode node) {
        children.add(node);
        return this;
    }

    public String getName() { return name; }

    // Đệ quy: tổng kích thước của mọi con
    public int getSize() {
        return children.stream().mapToInt(FileSystemNode::getSize).sum();
    }

    public String print(String indent) {
        StringBuilder sb = new StringBuilder(indent + "📁 " + name + "/ (" + getSize() + " KB)");
        for (FileSystemNode child : children) sb.append("\\n").append(child.print(indent + "   "));
        return sb.toString();
    }
}`,
};
