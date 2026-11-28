/**
 * Copyright (c) 2026 vuvanthanhtb
 * SPDX-License-Identifier: MIT
 */

// Dữ liệu cứng: mã nguồn ví dụ mvc (TypeScript + Java) và output đã chạy thật.
export const mvc = {
  javaFile: "MvcDemo.java",
  tsOutput: [
    "[Controller] add(Học MVC)",
    "[View] 1 việc",
    "  ☐ Học MVC",
    "[Controller] add(Viết code)",
    "[View] 2 việc",
    "  ☐ Học MVC",
    "  ☐ Viết code",
    "[Controller] toggle(0)",
    "[View] 2 việc",
    "  ☑ Học MVC",
    "  ☐ Viết code",
    "[Controller] add(   )",
    "  bỏ qua: dữ liệu không hợp lệ",
  ],
  javaOutput: [
    "[Controller] add(Học MVC)",
    "[View] 1 việc",
    "  ☐ Học MVC",
    "[Controller] add(Viết code)",
    "[View] 2 việc",
    "  ☐ Học MVC",
    "  ☐ Viết code",
    "[Controller] toggle(0)",
    "[View] 2 việc",
    "  ☑ Học MVC",
    "  ☐ Viết code",
    "[Controller] add(   )",
    "  bỏ qua: dữ liệu không hợp lệ",
  ],
  typescript: `type Listener = () => void;

// ── Model: dữ liệu + quy tắc, không biết gì về giao diện ──
class TodoModel {
  private todos: { title: string; done: boolean }[] = [];
  private listeners: Listener[] = [];

  subscribe(fn: Listener) {
    this.listeners.push(fn);
  }
  add(title: string) {
    this.todos.push({ title, done: false });
    this.listeners.forEach((fn) => fn());   // báo cho View: dữ liệu đã đổi
  }
  toggle(i: number) {
    this.todos[i].done = !this.todos[i].done;
    this.listeners.forEach((fn) => fn());
  }
  all() {
    return [...this.todos];
  }
}

// ── View: chỉ hiển thị, đọc từ Model ──
class TodoView {
  private model: TodoModel;
  constructor(model: TodoModel) {
    this.model = model;
    model.subscribe(() => this.render());
  }
  render() {
    const lines = this.model.all().map((t) => \`  \${t.done ? "☑" : "☐"} \${t.title}\`);
    console.log(\`[View] \${lines.length} việc\\n\${lines.join("\\n")}\`);
  }
}

// ── Controller: nhận thao tác người dùng, cập nhật Model ──
class TodoController {
  private model: TodoModel;
  constructor(model: TodoModel) {
    this.model = model;
  }
  handle(action: string, arg: string) {
    console.log(\`[Controller] \${action}(\${arg})\`);
    if (action === "add" && arg.trim()) this.model.add(arg.trim());
    else if (action === "toggle") this.model.toggle(Number(arg));
    else console.log("  bỏ qua: dữ liệu không hợp lệ");
  }
}

const model = new TodoModel();
new TodoView(model);
const controller = new TodoController(model);

controller.handle("add", "Học MVC");
controller.handle("add", "Viết code");
controller.handle("toggle", "0");
controller.handle("add", "   ");`,
  java: `import java.util.ArrayList;
import java.util.List;

public class MvcDemo {
    public static void main(String[] args) {
        TodoModel model = new TodoModel();
        new TodoView(model);
        TodoController controller = new TodoController(model);

        controller.handle("add", "Học MVC");
        controller.handle("add", "Viết code");
        controller.handle("toggle", "0");
        controller.handle("add", "   ");
    }
}

// ── Model: dữ liệu + quy tắc, không biết gì về giao diện ──
class TodoModel {
    static final class Todo {
        final String title;
        boolean done;
        Todo(String title) { this.title = title; }
    }

    private final List<Todo> todos = new ArrayList<>();
    private final List<Runnable> listeners = new ArrayList<>();

    void subscribe(Runnable fn) { listeners.add(fn); }

    void add(String title) {
        todos.add(new Todo(title));
        listeners.forEach(Runnable::run); // báo cho View: dữ liệu đã đổi
    }

    void toggle(int i) {
        todos.get(i).done = !todos.get(i).done;
        listeners.forEach(Runnable::run);
    }

    List<Todo> all() { return List.copyOf(todos); }
}

// ── View: chỉ hiển thị, đọc từ Model ──
class TodoView {
    private final TodoModel model;

    TodoView(TodoModel model) {
        this.model = model;
        model.subscribe(this::render);
    }

    void render() {
        List<TodoModel.Todo> all = model.all();
        StringBuilder sb = new StringBuilder("[View] " + all.size() + " việc");
        for (TodoModel.Todo t : all) sb.append("\\n  ").append(t.done ? "☑" : "☐").append(" ").append(t.title);
        System.out.println(sb);
    }
}

// ── Controller: nhận thao tác người dùng, cập nhật Model ──
class TodoController {
    private final TodoModel model;

    TodoController(TodoModel model) { this.model = model; }

    void handle(String action, String arg) {
        System.out.println("[Controller] " + action + "(" + arg + ")");
        if (action.equals("add") && !arg.isBlank()) model.add(arg.trim());
        else if (action.equals("toggle")) model.toggle(Integer.parseInt(arg));
        else System.out.println("  bỏ qua: dữ liệu không hợp lệ");
    }
}`,
};
