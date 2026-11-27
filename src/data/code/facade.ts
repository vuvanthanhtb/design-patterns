// Dữ liệu cứng: mã nguồn ví dụ facade (TypeScript + Java) và output đã chạy thật.
export const facade = {
  javaFile: "FacadeDemo.java",
  tsOutput: [
    "Bắt đầu chuyển đổi…",
    "  CodecFactory: phát hiện codec \"ogg\"",
    "  BitrateReader: đọc holiday.ogg bằng ogg",
    "  BitrateReader: chuyển buffer(holiday.ogg) → mp4",
    "  AudioMixer: cân bằng âm thanh",
    "Kết quả: holiday.ogg.mp4"
  ],
  javaOutput: [
    "Bắt đầu chuyển đổi…",
    "  CodecFactory: phát hiện codec \"ogg\"",
    "  BitrateReader: đọc holiday.ogg bằng ogg",
    "  BitrateReader: chuyển buffer(holiday.ogg) → mp4",
    "  AudioMixer: cân bằng âm thanh",
    "Kết quả: holiday.ogg.mp4"
  ],
  typescript: `// ── Hệ thống con phức tạp (giả lập một thư viện xử lý video) ──
class VideoFile {
  readonly name: string;
  readonly codec: string;
  constructor(name: string) {
    this.name = name;
    this.codec = name.split(".").pop() ?? "unknown";
  }
}

class CodecFactory {
  extract(file: VideoFile): string {
    console.log(\`  CodecFactory: phát hiện codec "\${file.codec}"\`);
    return file.codec;
  }
}

class BitrateReader {
  static read(file: VideoFile, codec: string): string {
    console.log(\`  BitrateReader: đọc \${file.name} bằng \${codec}\`);
    return \`buffer(\${file.name})\`;
  }
  static convert(buffer: string, format: string): string {
    console.log(\`  BitrateReader: chuyển \${buffer} → \${format}\`);
    return \`\${buffer}.\${format}\`;
  }
}

class AudioMixer {
  fix(result: string): string {
    console.log("  AudioMixer: cân bằng âm thanh");
    return result.replace("buffer(", "").replace(")", "");
  }
}

// ── Facade: một phương thức duy nhất cho client ──
class VideoConverter {
  convert(fileName: string, format: "mp4" | "ogg"): string {
    const file = new VideoFile(fileName);
    const sourceCodec = new CodecFactory().extract(file);
    const buffer = BitrateReader.read(file, sourceCodec);
    const converted = BitrateReader.convert(buffer, format);
    return new AudioMixer().fix(converted);
  }
}

// Client không cần biết gì về các lớp bên trong
console.log("Bắt đầu chuyển đổi…");
const output = new VideoConverter().convert("holiday.ogg", "mp4");
console.log("Kết quả:", output);`,
  java: `public class FacadeDemo {
    public static void main(String[] args) {
        // Client không cần biết gì về các lớp bên trong
        System.out.println("Bắt đầu chuyển đổi…");
        String output = new VideoConverter().convert("holiday.ogg", "mp4");
        System.out.println("Kết quả: " + output);
    }
}

// ── Hệ thống con phức tạp (giả lập một thư viện xử lý video) ──
class VideoFile {
    final String name;
    final String codec;

    VideoFile(String name) {
        this.name = name;
        this.codec = name.substring(name.lastIndexOf('.') + 1);
    }
}

class CodecFactory {
    String extract(VideoFile file) {
        System.out.println("  CodecFactory: phát hiện codec \\"" + file.codec + "\\"");
        return file.codec;
    }
}

class BitrateReader {
    static String read(VideoFile file, String codec) {
        System.out.println("  BitrateReader: đọc " + file.name + " bằng " + codec);
        return "buffer(" + file.name + ")";
    }

    static String convert(String buffer, String format) {
        System.out.println("  BitrateReader: chuyển " + buffer + " → " + format);
        return buffer + "." + format;
    }
}

class AudioMixer {
    String fix(String result) {
        System.out.println("  AudioMixer: cân bằng âm thanh");
        return result.replace("buffer(", "").replace(")", "");
    }
}

// ── Facade: một phương thức duy nhất cho client ──
class VideoConverter {
    String convert(String fileName, String format) {
        VideoFile file = new VideoFile(fileName);
        String sourceCodec = new CodecFactory().extract(file);
        String buffer = BitrateReader.read(file, sourceCodec);
        String converted = BitrateReader.convert(buffer, format);
        return new AudioMixer().fix(converted);
    }
}`,
};
