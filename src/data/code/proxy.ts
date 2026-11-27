// Dữ liệu cứng: mã nguồn ví dụ proxy (TypeScript + Java) và output đã chạy thật.
export const proxy = {
  javaFile: "ProxyDemo.java",
  tsOutput: [
    "  [cache miss] cat → gọi YouTube",
    "  [cache miss] dog → gọi YouTube",
    "  [cache hit]  cat",
    "  [cache hit]  cat",
    "  [cache hit]  dog",
    "Số lần gọi YouTube thật: 2/5",
  ],
  javaOutput: [
    "  [cache miss] cat → gọi YouTube",
    "  [cache miss] dog → gọi YouTube",
    "  [cache hit]  cat",
    "  [cache hit]  cat",
    "  [cache hit]  dog",
    "Số lần gọi YouTube thật: 2/5",
  ],
  typescript: `// Subject
interface VideoService {
  getVideo(id: string): string;
}

// RealSubject: chậm và tốn kém
class YouTubeService implements VideoService {
  calls = 0;

  getVideo(id: string): string {
    this.calls++;
    // giả lập gọi mạng chậm
    return \`<video \${id}>\`;
  }
}

// Proxy: cùng interface, thêm cache phía trước dịch vụ thật
class CachedVideoProxy implements VideoService {
  private service: YouTubeService;
  private cache = new Map<string, string>();

  constructor(service: YouTubeService) {
    this.service = service;
  }

  getVideo(id: string): string {
    const hit = this.cache.get(id);
    if (hit) {
      console.log(\`  [cache hit]  \${id}\`);
      return hit;
    }
    console.log(\`  [cache miss] \${id} → gọi YouTube\`);
    const video = this.service.getVideo(id);
    this.cache.set(id, video);
    return video;
  }
}

// Client chỉ biết VideoService — không phân biệt proxy hay đối tượng thật
function watch(service: VideoService, ids: string[]) {
  for (const id of ids) service.getVideo(id);
}

const youtube = new YouTubeService();
const proxy = new CachedVideoProxy(youtube);

watch(proxy, ["cat", "dog", "cat", "cat", "dog"]);
console.log(\`Số lần gọi YouTube thật: \${youtube.calls}/5\`);`,
  java: `import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class ProxyDemo {
    public static void main(String[] args) {
        YouTubeService youtube = new YouTubeService();
        CachedVideoProxy proxy = new CachedVideoProxy(youtube);

        watch(proxy, List.of("cat", "dog", "cat", "cat", "dog"));
        System.out.println("Số lần gọi YouTube thật: " + youtube.calls + "/5");
    }

    // Client chỉ biết VideoService — không phân biệt proxy hay đối tượng thật
    static void watch(VideoService service, List<String> ids) {
        for (String id : ids) service.getVideo(id);
    }
}

// Subject
interface VideoService {
    String getVideo(String id);
}

// RealSubject: chậm và tốn kém
class YouTubeService implements VideoService {
    int calls = 0;

    public String getVideo(String id) {
        calls++;
        return "<video " + id + ">"; // giả lập gọi mạng chậm
    }
}

// Proxy: cùng interface, thêm cache phía trước dịch vụ thật
class CachedVideoProxy implements VideoService {
    private final YouTubeService service;
    private final Map<String, String> cache = new HashMap<>();

    CachedVideoProxy(YouTubeService service) {
        this.service = service;
    }

    public String getVideo(String id) {
        String hit = cache.get(id);
        if (hit != null) {
            System.out.println("  [cache hit]  " + id);
            return hit;
        }
        System.out.println("  [cache miss] " + id + " → gọi YouTube");
        String video = service.getVideo(id);
        cache.put(id, video);
        return video;
    }
}`,
};
