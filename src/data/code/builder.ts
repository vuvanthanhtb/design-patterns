// Dữ liệu cứng: mã nguồn ví dụ builder (TypeScript + Java) và output đã chạy thật.
export const builder = {
  javaFile: "BuilderDemo.java",
  tsOutput: [
    "Nhà cơ bản: tường gỗ + mái ngói",
    "Nhà cao cấp: tường gỗ + mái ngói + hồ bơi",
    "Tuỳ chỉnh: tường gỗ + hồ bơi",
  ],
  javaOutput: [
    "Nhà cơ bản: tường gỗ + mái ngói",
    "Nhà cao cấp: tường gỗ + mái ngói + hồ bơi",
    "Tuỳ chỉnh: tường gỗ + hồ bơi",
  ],
  typescript: `// Product
class House {
  parts: string[] = [];

  describe(): string {
    return this.parts.join(" + ");
  }
}

// Builder: khai báo các bước xây dựng
interface HouseBuilder {
  reset(): void;
  buildWalls(): this;
  buildRoof(): this;
  buildPool(): this;
}

// ConcreteBuilder
class WoodHouseBuilder implements HouseBuilder {
  private house = new House();

  reset() {
    this.house = new House();
  }
  buildWalls() {
    this.house.parts.push("tường gỗ");
    return this;
  }
  buildRoof() {
    this.house.parts.push("mái ngói");
    return this;
  }
  buildPool() {
    this.house.parts.push("hồ bơi");
    return this;
  }

  // Lấy kết quả và chuẩn bị cho lần xây tiếp theo
  getResult(): House {
    const result = this.house;
    this.reset();
    return result;
  }
}

// Director: biết thứ tự các bước cho từng "công thức"
class Director {
  private builder!: HouseBuilder;

  setBuilder(builder: HouseBuilder) {
    this.builder = builder;
  }

  buildMinimal() {
    this.builder.buildWalls().buildRoof();
  }

  buildLuxury() {
    this.builder.buildWalls().buildRoof().buildPool();
  }
}

// Client
const builder = new WoodHouseBuilder();
const director = new Director();
director.setBuilder(builder);

director.buildMinimal();
console.log("Nhà cơ bản:", builder.getResult().describe());

director.buildLuxury();
console.log("Nhà cao cấp:", builder.getResult().describe());

// Không cần Director — tự gọi từng bước (fluent API)
const custom = builder.buildWalls().buildPool();
console.log("Tuỳ chỉnh:", custom.getResult().describe());`,
  java: `import java.util.ArrayList;
import java.util.List;

public class BuilderDemo {
    public static void main(String[] args) {
        WoodHouseBuilder builder = new WoodHouseBuilder();
        Director director = new Director();
        director.setBuilder(builder);

        director.buildMinimal();
        System.out.println("Nhà cơ bản: " + builder.getResult().describe());

        director.buildLuxury();
        System.out.println("Nhà cao cấp: " + builder.getResult().describe());

        // Không cần Director — tự gọi từng bước (fluent API)
        builder.buildWalls().buildPool();
        System.out.println("Tuỳ chỉnh: " + builder.getResult().describe());
    }
}

// Product
class House {
    final List<String> parts = new ArrayList<>();

    String describe() {
        return String.join(" + ", parts);
    }
}

// Builder: khai báo các bước xây dựng
interface HouseBuilder {
    void reset();
    HouseBuilder buildWalls();
    HouseBuilder buildRoof();
    HouseBuilder buildPool();
}

// ConcreteBuilder
class WoodHouseBuilder implements HouseBuilder {
    private House house = new House();

    public void reset() { house = new House(); }

    public WoodHouseBuilder buildWalls() { house.parts.add("tường gỗ"); return this; }
    public WoodHouseBuilder buildRoof()  { house.parts.add("mái ngói"); return this; }
    public WoodHouseBuilder buildPool()  { house.parts.add("hồ bơi");   return this; }

    // Lấy kết quả và chuẩn bị cho lần xây tiếp theo
    House getResult() {
        House result = house;
        reset();
        return result;
    }
}

// Director: biết thứ tự các bước cho từng "công thức"
class Director {
    private HouseBuilder builder;

    void setBuilder(HouseBuilder builder) { this.builder = builder; }

    void buildMinimal() { builder.buildWalls().buildRoof(); }

    void buildLuxury() { builder.buildWalls().buildRoof().buildPool(); }
}`,
};
