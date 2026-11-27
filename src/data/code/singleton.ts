// Dữ liệu cứng: mã nguồn ví dụ singleton (TypeScript + Java) và output đã chạy thật.
export const singleton = {
  javaFile: "SingletonDemo.java",
  tsOutput: [
    "→ Mở kết nối database (chỉ một lần)",
    "#1 SELECT * FROM users",
    "#2 SELECT * FROM orders",
    "Cùng một instance: true"
  ],
  javaOutput: [
    "→ Mở kết nối database (chỉ một lần)",
    "#1 SELECT * FROM users",
    "#2 SELECT * FROM orders",
    "Cùng một instance: true"
  ],
  typescript: `class Database {
  // Instance duy nhất, được giữ trong field tĩnh
  private static instance: Database | null = null;
  private queries = 0;

  // Constructor private: chặn \`new Database()\` từ bên ngoài
  private constructor() {
    console.log("→ Mở kết nối database (chỉ một lần)");
  }

  // Điểm truy cập toàn cục, khởi tạo lười
  static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  query(sql: string): string {
    this.queries++;
    return \`#\${this.queries} \${sql}\`;
  }
}

// Hai service khác nhau, cùng dùng một instance
class ServiceA {
  run() {
    return Database.getInstance().query("SELECT * FROM users");
  }
}

class ServiceB {
  run() {
    return Database.getInstance().query("SELECT * FROM orders");
  }
}

console.log(new ServiceA().run());
console.log(new ServiceB().run());
console.log("Cùng một instance:", Database.getInstance() === Database.getInstance());

// new Database(); // ❌ Lỗi biên dịch: constructor là private`,
  java: `public class SingletonDemo {
    public static void main(String[] args) {
        System.out.println(new ServiceA().run());
        System.out.println(new ServiceB().run());
        System.out.println("Cùng một instance: " + (Database.getInstance() == Database.getInstance()));
        // new Database(); // ❌ Lỗi biên dịch: constructor là private
    }
}

final class Database {
    // Instance duy nhất, volatile để an toàn đa luồng
    private static volatile Database instance;
    private int queries = 0;

    // Constructor private: chặn \`new Database()\` từ bên ngoài
    private Database() {
        System.out.println("→ Mở kết nối database (chỉ một lần)");
    }

    // Double-checked locking: khởi tạo lười, an toàn đa luồng
    static Database getInstance() {
        if (instance == null) {
            synchronized (Database.class) {
                if (instance == null) instance = new Database();
            }
        }
        return instance;
    }

    synchronized String query(String sql) {
        queries++;
        return "#" + queries + " " + sql;
    }
}

// Hai service khác nhau, cùng dùng một instance
class ServiceA {
    String run() { return Database.getInstance().query("SELECT * FROM users"); }
}

class ServiceB {
    String run() { return Database.getInstance().query("SELECT * FROM orders"); }
}`,
};
