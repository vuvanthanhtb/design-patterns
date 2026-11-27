// Dữ liệu cứng: mã nguồn ví dụ bridge (TypeScript + Java) và output đã chạy thật.
export const bridge = {
  javaFile: "BridgeDemo.java",
  tsOutput: [
    "TV: BẬT",
    "TV: âm lượng 40",
    "Radio: BẬT",
    "Radio: âm lượng 20",
    "Radio: đã tắt tiếng",
  ],
  javaOutput: [
    "TV: BẬT",
    "TV: âm lượng 40",
    "Radio: BẬT",
    "Radio: âm lượng 20",
    "Radio: đã tắt tiếng",
  ],
  typescript: `// Implementation: interface chung cho mọi thiết bị
interface Device {
  readonly name: string;
  isEnabled(): boolean;
  enable(): void;
  disable(): void;
  getVolume(): number;
  setVolume(v: number): void;
}

// ConcreteImplementation
class Tv implements Device {
  readonly name = "TV";
  private on = false;
  private volume = 30;
  isEnabled() { return this.on; }
  enable() { this.on = true; }
  disable() { this.on = false; }
  getVolume() { return this.volume; }
  setVolume(v: number) { this.volume = Math.max(0, Math.min(100, v)); }
}

class Radio implements Device {
  readonly name = "Radio";
  private on = false;
  private volume = 10;
  isEnabled() { return this.on; }
  enable() { this.on = true; }
  disable() { this.on = false; }
  getVolume() { return this.volume; }
  setVolume(v: number) { this.volume = Math.max(0, Math.min(100, v)); }
}

// Abstraction: giữ tham chiếu tới Device — đây là "cây cầu"
class RemoteControl {
  protected device: Device;

  constructor(device: Device) {
    this.device = device;
  }

  togglePower(): string {
    if (this.device.isEnabled()) this.device.disable();
    else this.device.enable();
    return \`\${this.device.name}: \${this.device.isEnabled() ? "BẬT" : "TẮT"}\`;
  }

  volumeUp(): string {
    this.device.setVolume(this.device.getVolume() + 10);
    return \`\${this.device.name}: âm lượng \${this.device.getVolume()}\`;
  }
}

// RefinedAbstraction: mở rộng phía abstraction, không động tới Device
class AdvancedRemote extends RemoteControl {
  mute(): string {
    this.device.setVolume(0);
    return \`\${this.device.name}: đã tắt tiếng\`;
  }
}

const basic = new RemoteControl(new Tv());
console.log(basic.togglePower());
console.log(basic.volumeUp());

const advanced = new AdvancedRemote(new Radio());
console.log(advanced.togglePower());
console.log(advanced.volumeUp());
console.log(advanced.mute());`,
  java: `public class BridgeDemo {
    public static void main(String[] args) {
        RemoteControl basic = new RemoteControl(new Tv());
        System.out.println(basic.togglePower());
        System.out.println(basic.volumeUp());

        AdvancedRemote advanced = new AdvancedRemote(new Radio());
        System.out.println(advanced.togglePower());
        System.out.println(advanced.volumeUp());
        System.out.println(advanced.mute());
    }
}

// Implementation: interface chung cho mọi thiết bị
interface Device {
    String name();
    boolean isEnabled();
    void enable();
    void disable();
    int getVolume();
    void setVolume(int v);
}

// Lớp tiện ích chia sẻ trạng thái chung cho các thiết bị
abstract class BaseDevice implements Device {
    private boolean on = false;
    private int volume;

    BaseDevice(int volume) { this.volume = volume; }

    public boolean isEnabled() { return on; }
    public void enable() { on = true; }
    public void disable() { on = false; }
    public int getVolume() { return volume; }
    public void setVolume(int v) { volume = Math.max(0, Math.min(100, v)); }
}

// ConcreteImplementation
class Tv extends BaseDevice {
    Tv() { super(30); }
    public String name() { return "TV"; }
}

class Radio extends BaseDevice {
    Radio() { super(10); }
    public String name() { return "Radio"; }
}

// Abstraction: giữ tham chiếu tới Device — đây là "cây cầu"
class RemoteControl {
    protected final Device device;

    RemoteControl(Device device) {
        this.device = device;
    }

    String togglePower() {
        if (device.isEnabled()) device.disable();
        else device.enable();
        return device.name() + ": " + (device.isEnabled() ? "BẬT" : "TẮT");
    }

    String volumeUp() {
        device.setVolume(device.getVolume() + 10);
        return device.name() + ": âm lượng " + device.getVolume();
    }
}

// RefinedAbstraction: mở rộng phía abstraction, không động tới Device
class AdvancedRemote extends RemoteControl {
    AdvancedRemote(Device device) { super(device); }

    String mute() {
        device.setVolume(0);
        return device.name() + ": đã tắt tiếng";
    }
}`,
};
