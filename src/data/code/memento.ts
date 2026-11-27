/**
 * Copyright (c) 2026 vuvanthanhtb
 * SPDX-License-Identifier: MIT
 */

// Dữ liệu cứng: mã nguồn ví dụ memento (TypeScript + Java) và output đã chạy thật.
export const memento = {
  javaFile: "MementoDemo.java",
  tsOutput: [
    'Hiện tại: "Design Patterns — GoF" (cursor=21)',
    'Undo 1:   "Design Patterns" (cursor=15)',
    'Undo 2:   "Design" (cursor=6)',
    'Undo 3:   "" (cursor=0)',
  ],
  javaOutput: [
    'Hiện tại: "Design Patterns — GoF" (cursor=21)',
    'Undo 1:   "Design Patterns" (cursor=15)',
    'Undo 2:   "Design" (cursor=6)',
    'Undo 3:   "" (cursor=0)',
  ],
  typescript: `// Memento: bất biến, lưu trạng thái của Editor
class Snapshot {
  readonly content: string;
  readonly cursor: number;
  private readonly date = new Date();

  constructor(content: string, cursor: number) {
    this.content = content;
    this.cursor = cursor;
  }

  getDate() {
    return this.date;
  }
}

// Originator: tự tạo và khôi phục snapshot của chính nó
class Editor {
  private content = "";
  private cursor = 0;

  type(text: string) {
    this.content =
      this.content.slice(0, this.cursor) + text + this.content.slice(this.cursor);
    this.cursor += text.length;
  }

  save(): Snapshot {
    return new Snapshot(this.content, this.cursor);
  }

  restore(s: Snapshot) {
    this.content = s.content;
    this.cursor = s.cursor;
  }

  show() {
    return \`"\${this.content}" (cursor=\${this.cursor})\`;
  }
}

// Caretaker: giữ lịch sử, KHÔNG đọc nội dung snapshot
class History {
  private stack: Snapshot[] = [];
  private editor: Editor;

  constructor(editor: Editor) {
    this.editor = editor;
  }

  backup() {
    this.stack.push(this.editor.save());
  }

  undo() {
    const s = this.stack.pop();
    if (s) this.editor.restore(s);
  }
}

const editor = new Editor();
const history = new History(editor);

history.backup();
editor.type("Design");
history.backup();
editor.type(" Patterns");
history.backup();
editor.type(" — GoF");
console.log("Hiện tại:", editor.show());

history.undo();
console.log("Undo 1:  ", editor.show());
history.undo();
console.log("Undo 2:  ", editor.show());
history.undo();
console.log("Undo 3:  ", editor.show());`,
  java: `import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Deque;

public class MementoDemo {
    public static void main(String[] args) {
        Editor editor = new Editor();
        History history = new History(editor);

        history.backup();
        editor.type("Design");
        history.backup();
        editor.type(" Patterns");
        history.backup();
        editor.type(" — GoF");
        System.out.println("Hiện tại: " + editor.show());

        history.undo();
        System.out.println("Undo 1:   " + editor.show());
        history.undo();
        System.out.println("Undo 2:   " + editor.show());
        history.undo();
        System.out.println("Undo 3:   " + editor.show());
    }
}

// Memento: record bất biến lưu trạng thái của Editor
record Snapshot(String content, int cursor, Instant date) {}

// Originator: tự tạo và khôi phục snapshot của chính nó
class Editor {
    private String content = "";
    private int cursor = 0;

    void type(String text) {
        content = content.substring(0, cursor) + text + content.substring(cursor);
        cursor += text.length();
    }

    Snapshot save() { return new Snapshot(content, cursor, Instant.now()); }

    void restore(Snapshot s) {
        content = s.content();
        cursor = s.cursor();
    }

    String show() { return "\\"" + content + "\\" (cursor=" + cursor + ")"; }
}

// Caretaker: giữ lịch sử, KHÔNG đọc nội dung snapshot
class History {
    private final Deque<Snapshot> stack = new ArrayDeque<>();
    private final Editor editor;

    History(Editor editor) { this.editor = editor; }

    void backup() { stack.push(editor.save()); }

    void undo() {
        if (!stack.isEmpty()) editor.restore(stack.pop());
    }
}`,
};
