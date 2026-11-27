// Dữ liệu cứng: mã nguồn ví dụ template-method (TypeScript + Java) và output đã chạy thật.
export const templateMethod = {
  javaFile: "TemplateMethodDemo.java",
  tsOutput: [
    "  [CSV] đọc sales.csv",
    "Kết quả: 3 dòng, tổng doanh thu = 400",
    "  [PDF] trích xuất text từ report.pdf",
    "  [PDF] dọn file tạm sau khi OCR",
    "Kết quả: 2 dòng, tổng doanh thu = 750"
  ],
  javaOutput: [
    "  [CSV] đọc sales.csv",
    "Kết quả: 3 dòng, tổng doanh thu = 400",
    "  [PDF] trích xuất text từ report.pdf",
    "  [PDF] dọn file tạm sau khi OCR",
    "Kết quả: 2 dòng, tổng doanh thu = 750"
  ],
  typescript: `type Row = Record<string, number>;

// AbstractClass: chứa template method mine()
abstract class DataMiner {
  // Template method — thứ tự các bước cố định, lớp con không override
  mine(path: string): string {
    const raw = this.openFile(path);
    const rows = this.parseData(raw);
    const report = this.analyze(rows);
    this.hook();
    return report;
  }

  // Các bước bắt buộc lớp con hiện thực
  protected abstract openFile(path: string): string;
  protected abstract parseData(raw: string): Row[];

  // Bước dùng chung
  protected analyze(rows: Row[]): string {
    const total = rows.reduce((sum, r) => sum + (r.revenue ?? 0), 0);
    return \`\${rows.length} dòng, tổng doanh thu = \${total}\`;
  }

  // Hook: tuỳ chọn override, mặc định không làm gì
  protected hook(): void {}
}

class CsvMiner extends DataMiner {
  protected openFile(path: string) {
    console.log(\`  [CSV] đọc \${path}\`);
    return "month,revenue\\n1,120\\n2,80\\n3,200";
  }

  protected parseData(raw: string): Row[] {
    const [header, ...lines] = raw.split("\\n");
    const keys = header.split(",");
    return lines.map((line) =>
      Object.fromEntries(line.split(",").map((v, i) => [keys[i], Number(v)])),
    );
  }
}

class PdfMiner extends DataMiner {
  protected openFile(path: string) {
    console.log(\`  [PDF] trích xuất text từ \${path}\`);
    return "Revenue: 300; Revenue: 450";
  }

  protected parseData(raw: string): Row[] {
    return [...raw.matchAll(/Revenue: (\\d+)/g)].map((m) => ({ revenue: Number(m[1]) }));
  }

  protected hook() {
    console.log("  [PDF] dọn file tạm sau khi OCR");
  }
}

console.log("Kết quả:", new CsvMiner().mine("sales.csv"));
console.log("Kết quả:", new PdfMiner().mine("report.pdf"));`,
  java: `import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class TemplateMethodDemo {
    public static void main(String[] args) {
        System.out.println("Kết quả: " + new CsvMiner().mine("sales.csv"));
        System.out.println("Kết quả: " + new PdfMiner().mine("report.pdf"));
    }
}

// AbstractClass: chứa template method mine()
abstract class DataMiner {
    // Template method — final: lớp con không thể đổi thứ tự các bước
    public final String mine(String path) {
        String raw = openFile(path);
        List<Integer> rows = parseData(raw);
        String report = analyze(rows);
        hook();
        return report;
    }

    // Các bước bắt buộc lớp con hiện thực
    protected abstract String openFile(String path);
    protected abstract List<Integer> parseData(String raw);

    // Bước dùng chung
    protected String analyze(List<Integer> revenues) {
        int total = revenues.stream().mapToInt(Integer::intValue).sum();
        return revenues.size() + " dòng, tổng doanh thu = " + total;
    }

    // Hook: tuỳ chọn override, mặc định không làm gì
    protected void hook() {}
}

class CsvMiner extends DataMiner {
    protected String openFile(String path) {
        System.out.println("  [CSV] đọc " + path);
        return "month,revenue\\n1,120\\n2,80\\n3,200";
    }

    protected List<Integer> parseData(String raw) {
        List<Integer> result = new ArrayList<>();
        String[] lines = raw.split("\\n");
        for (int i = 1; i < lines.length; i++) result.add(Integer.parseInt(lines[i].split(",")[1]));
        return result;
    }
}

class PdfMiner extends DataMiner {
    protected String openFile(String path) {
        System.out.println("  [PDF] trích xuất text từ " + path);
        return "Revenue: 300; Revenue: 450";
    }

    protected List<Integer> parseData(String raw) {
        List<Integer> result = new ArrayList<>();
        Matcher m = Pattern.compile("Revenue: (\\\\d+)").matcher(raw);
        while (m.find()) result.add(Integer.parseInt(m.group(1)));
        return result;
    }

    @Override
    protected void hook() {
        System.out.println("  [PDF] dọn file tạm sau khi OCR");
    }
}`,
};
