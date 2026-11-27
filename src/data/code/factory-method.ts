// Dữ liệu cứng: mã nguồn ví dụ factory-method (TypeScript + Java) và output đã chạy thật.
export const factoryMethod = {
  javaFile: "FactoryMethodDemo.java",
  tsOutput: [
    "Đơn #1024: giao bằng xe tải trên đường bộ",
    "Đơn #1024: giao bằng tàu biển trong container",
  ],
  javaOutput: [
    "Đơn #1024: giao bằng xe tải trên đường bộ",
    "Đơn #1024: giao bằng tàu biển trong container",
  ],
  typescript: `// Product: interface chung cho mọi phương tiện
interface Transport {
  deliver(): string;
}

// ConcreteProduct
class Truck implements Transport {
  deliver(): string {
    return "giao bằng xe tải trên đường bộ";
  }
}

class Ship implements Transport {
  deliver(): string {
    return "giao bằng tàu biển trong container";
  }
}

// Creator: chứa logic nghiệp vụ, KHÔNG biết lớp cụ thể của Transport
abstract class Logistics {
  // Factory Method — lớp con quyết định tạo sản phẩm nào
  protected abstract createTransport(): Transport;

  planDelivery(orderId: string): string {
    const transport = this.createTransport();
    return \`Đơn \${orderId}: \${transport.deliver()}\`;
  }
}

// ConcreteCreator
class RoadLogistics extends Logistics {
  protected createTransport(): Transport {
    return new Truck();
  }
}

class SeaLogistics extends Logistics {
  protected createTransport(): Transport {
    return new Ship();
  }
}

// Client chỉ làm việc với lớp trừu tượng Logistics
function run(logistics: Logistics) {
  console.log(logistics.planDelivery("#1024"));
}

run(new RoadLogistics());
run(new SeaLogistics());`,
  java: `public class FactoryMethodDemo {
    public static void main(String[] args) {
        run(new RoadLogistics());
        run(new SeaLogistics());
    }

    // Client chỉ làm việc với lớp trừu tượng Logistics
    static void run(Logistics logistics) {
        System.out.println(logistics.planDelivery("#1024"));
    }
}

// Product: interface chung cho mọi phương tiện
interface Transport {
    String deliver();
}

// ConcreteProduct
class Truck implements Transport {
    public String deliver() {
        return "giao bằng xe tải trên đường bộ";
    }
}

class Ship implements Transport {
    public String deliver() {
        return "giao bằng tàu biển trong container";
    }
}

// Creator: chứa logic nghiệp vụ, KHÔNG biết lớp cụ thể của Transport
abstract class Logistics {
    // Factory Method — lớp con quyết định tạo sản phẩm nào
    protected abstract Transport createTransport();

    public String planDelivery(String orderId) {
        Transport transport = createTransport();
        return "Đơn " + orderId + ": " + transport.deliver();
    }
}

// ConcreteCreator
class RoadLogistics extends Logistics {
    @Override
    protected Transport createTransport() {
        return new Truck();
    }
}

class SeaLogistics extends Logistics {
    @Override
    protected Transport createTransport() {
        return new Ship();
    }
}`,
};
