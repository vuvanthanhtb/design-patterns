/**
 * Copyright (c) 2026 vuvanthanhtb
 * SPDX-License-Identifier: MIT
 */

// Dữ liệu cứng: mã nguồn ví dụ interpreter (TypeScript + Java) và output đã chạy thật.
export const interpreter = {
  javaFile: "InterpreterDemo.java",
  tsOutput: ["Cây cú pháp: (x + 2) * y", "x=3, y=4  → 20", "x=10, y=5 → 60"],
  javaOutput: ["Cây cú pháp: (x + 2) * y", "x=3, y=4  → 20", "x=10, y=5 → 60"],
  typescript: `// Context: thông tin toàn cục cho việc thông dịch
class Context {
  private vars: Map<string, number>;

  constructor(vars: Record<string, number>) {
    this.vars = new Map(Object.entries(vars));
  }

  lookup(name: string): number {
    const value = this.vars.get(name);
    if (value === undefined) throw new Error(\`Biến chưa định nghĩa: \${name}\`);
    return value;
  }
}

// AbstractExpression
interface Expression {
  interpret(ctx: Context): number;
  toString(): string;
}

// TerminalExpression
class NumberExpr implements Expression {
  private value: number;
  constructor(value: number) { this.value = value; }
  interpret() { return this.value; }
  toString() { return String(this.value); }
}

class VariableExpr implements Expression {
  private name: string;
  constructor(name: string) { this.name = name; }
  interpret(ctx: Context) { return ctx.lookup(this.name); }
  toString() { return this.name; }
}

// NonterminalExpression: chứa biểu thức con
class AddExpr implements Expression {
  private left: Expression;
  private right: Expression;
  constructor(left: Expression, right: Expression) {
    this.left = left;
    this.right = right;
  }
  interpret(ctx: Context) { return this.left.interpret(ctx) + this.right.interpret(ctx); }
  toString() { return \`(\${this.left} + \${this.right})\`; }
}

class MultiplyExpr implements Expression {
  private left: Expression;
  private right: Expression;
  constructor(left: Expression, right: Expression) {
    this.left = left;
    this.right = right;
  }
  interpret(ctx: Context) { return this.left.interpret(ctx) * this.right.interpret(ctx); }
  toString() { return \`\${this.left} * \${this.right}\`; }
}

// Parser tối giản: hậu tố (RPN) → cây cú pháp. VD: "x 2 + y *"
function parse(rpn: string): Expression {
  const stack: Expression[] = [];
  for (const token of rpn.split(/\\s+/)) {
    if (token === "+" || token === "*") {
      const right = stack.pop()!;
      const left = stack.pop()!;
      stack.push(token === "+" ? new AddExpr(left, right) : new MultiplyExpr(left, right));
    } else if (/^\\d+$/.test(token)) {
      stack.push(new NumberExpr(Number(token)));
    } else {
      stack.push(new VariableExpr(token));
    }
  }
  return stack.pop()!;
}

const expr = parse("x 2 + y *");
console.log("Cây cú pháp:", expr.toString());
console.log("x=3, y=4  →", expr.interpret(new Context({ x: 3, y: 4 })));
console.log("x=10, y=5 →", expr.interpret(new Context({ x: 10, y: 5 })));`,
  java: `import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Map;

public class InterpreterDemo {
    public static void main(String[] args) {
        Expression expr = parse("x 2 + y *");
        System.out.println("Cây cú pháp: " + expr);
        System.out.println("x=3, y=4  → " + expr.interpret(new Context(Map.of("x", 3, "y", 4))));
        System.out.println("x=10, y=5 → " + expr.interpret(new Context(Map.of("x", 10, "y", 5))));
    }

    // Parser tối giản: hậu tố (RPN) → cây cú pháp. VD: "x 2 + y *"
    static Expression parse(String rpn) {
        Deque<Expression> stack = new ArrayDeque<>();
        for (String token : rpn.split("\\\\s+")) {
            switch (token) {
                case "+", "*" -> {
                    Expression right = stack.pop();
                    Expression left = stack.pop();
                    stack.push(token.equals("+") ? new AddExpr(left, right) : new MultiplyExpr(left, right));
                }
                default -> stack.push(token.matches("\\\\d+")
                        ? new NumberExpr(Integer.parseInt(token))
                        : new VariableExpr(token));
            }
        }
        return stack.pop();
    }
}

// Context: thông tin toàn cục cho việc thông dịch
record Context(Map<String, Integer> vars) {
    int lookup(String name) {
        Integer value = vars.get(name);
        if (value == null) throw new IllegalArgumentException("Biến chưa định nghĩa: " + name);
        return value;
    }
}

// AbstractExpression
interface Expression {
    int interpret(Context ctx);
}

// TerminalExpression
record NumberExpr(int value) implements Expression {
    public int interpret(Context ctx) { return value; }
    public String toString() { return String.valueOf(value); }
}

record VariableExpr(String name) implements Expression {
    public int interpret(Context ctx) { return ctx.lookup(name); }
    public String toString() { return name; }
}

// NonterminalExpression: chứa biểu thức con
record AddExpr(Expression left, Expression right) implements Expression {
    public int interpret(Context ctx) { return left.interpret(ctx) + right.interpret(ctx); }
    public String toString() { return "(" + left + " + " + right + ")"; }
}

record MultiplyExpr(Expression left, Expression right) implements Expression {
    public int interpret(Context ctx) { return left.interpret(ctx) * right.interpret(ctx); }
    public String toString() { return left + " * " + right; }
}`,
};
