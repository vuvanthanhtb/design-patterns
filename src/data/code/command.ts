/**
 * Copyright (c) 2026 vuvanthanhtb
 * SPDX-License-Identifier: MIT
 */

// Dữ liệu cứng: mã nguồn ví dụ command (TypeScript + Java) và output đã chạy thật.
export const command = {
  javaFile: "CommandDemo.java",
  tsOutput: [
    '"Xin chào, thế giới!"',
    '"Xin chào, thế giới"',
    '"Xin chào, thế giới!"',
    '"Xin chào"',
  ],
  javaOutput: [
    '"Xin chào, thế giới!"',
    '"Xin chào, thế giới"',
    '"Xin chào, thế giới!"',
    '"Xin chào"',
  ],
  typescript: `// Receiver: chứa logic nghiệp vụ thật
class Editor {
  content = "";

  insert(text: string) {
    this.content += text;
  }

  deleteLast(n: number): string {
    const removed = this.content.slice(-n);
    this.content = this.content.slice(0, -n);
    return removed;
  }
}

// Command
interface Command {
  execute(): void;
  undo(): void;
}

// ConcreteCommand: lưu đủ thông tin để thực thi và hoàn tác
class InsertTextCommand implements Command {
  private editor: Editor;
  private text: string;

  constructor(editor: Editor, text: string) {
    this.editor = editor;
    this.text = text;
  }

  execute() {
    this.editor.insert(this.text);
  }

  undo() {
    this.editor.deleteLast(this.text.length);
  }
}

class DeleteTextCommand implements Command {
  private editor: Editor;
  private count: number;
  private deleted = "";

  constructor(editor: Editor, count: number) {
    this.editor = editor;
    this.count = count;
  }

  execute() {
    this.deleted = this.editor.deleteLast(this.count);
  }

  undo() {
    this.editor.insert(this.deleted);
  }
}

// Invoker: không biết command làm gì, chỉ gọi và lưu lịch sử
class Toolbar {
  private history: Command[] = [];

  click(cmd: Command) {
    cmd.execute();
    this.history.push(cmd);
  }

  undoLast() {
    this.history.pop()?.undo();
  }
}

// Client: tạo command và gắn receiver
const editor = new Editor();
const toolbar = new Toolbar();

toolbar.click(new InsertTextCommand(editor, "Xin chào"));
toolbar.click(new InsertTextCommand(editor, ", thế giới!"));
console.log(JSON.stringify(editor.content));

toolbar.click(new DeleteTextCommand(editor, 1));
console.log(JSON.stringify(editor.content));

toolbar.undoLast(); // hoàn tác Delete
console.log(JSON.stringify(editor.content));

toolbar.undoLast(); // hoàn tác Insert thứ hai
console.log(JSON.stringify(editor.content));`,
  java: `import java.util.ArrayDeque;
import java.util.Deque;

public class CommandDemo {
    public static void main(String[] args) {
        // Client: tạo command và gắn receiver
        Editor editor = new Editor();
        Toolbar toolbar = new Toolbar();

        toolbar.click(new InsertTextCommand(editor, "Xin chào"));
        toolbar.click(new InsertTextCommand(editor, ", thế giới!"));
        System.out.println(editor.show());

        toolbar.click(new DeleteTextCommand(editor, 1));
        System.out.println(editor.show());

        toolbar.undoLast(); // hoàn tác Delete
        System.out.println(editor.show());

        toolbar.undoLast(); // hoàn tác Insert thứ hai
        System.out.println(editor.show());
    }
}

// Receiver: chứa logic nghiệp vụ thật
class Editor {
    private final StringBuilder content = new StringBuilder();

    void insert(String text) { content.append(text); }

    String deleteLast(int n) {
        String removed = content.substring(content.length() - n);
        content.setLength(content.length() - n);
        return removed;
    }

    String show() { return "\\"" + content + "\\""; }
}

// Command
interface Command {
    void execute();
    void undo();
}

// ConcreteCommand: lưu đủ thông tin để thực thi và hoàn tác
class InsertTextCommand implements Command {
    private final Editor editor;
    private final String text;

    InsertTextCommand(Editor editor, String text) {
        this.editor = editor;
        this.text = text;
    }

    public void execute() { editor.insert(text); }
    public void undo() { editor.deleteLast(text.length()); }
}

class DeleteTextCommand implements Command {
    private final Editor editor;
    private final int count;
    private String deleted = "";

    DeleteTextCommand(Editor editor, int count) {
        this.editor = editor;
        this.count = count;
    }

    public void execute() { deleted = editor.deleteLast(count); }
    public void undo() { editor.insert(deleted); }
}

// Invoker: không biết command làm gì, chỉ gọi và lưu lịch sử
class Toolbar {
    private final Deque<Command> history = new ArrayDeque<>();

    void click(Command cmd) {
        cmd.execute();
        history.push(cmd);
    }

    void undoLast() {
        if (!history.isEmpty()) history.pop().undo();
    }
}`,
};
