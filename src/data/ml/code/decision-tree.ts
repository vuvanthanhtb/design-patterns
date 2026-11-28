/**
 * Copyright (c) 2026 vuvanthanhtb
 * SPDX-License-Identifier: MIT
 */

// Dữ liệu cứng: mã Python cho bài decision-tree và output đã chạy thật (NumPy + scikit-learn).
export const decisionTree = {
  file: "decision_tree.py",
  output: [
    "[giờ học ≤ 4.75]  gini 0.500 → 0.278",
    "  [giờ học ≤ 2.75]  gini 0.278 → 0.222",
    "    → lá: trượt (6 mẫu)",
    "    → lá: trượt (6 mẫu)",
    "  [giờ ngủ ≤ 4.25]  gini 0.278 → 0.233",
    "    → lá: trượt (2 mẫu)",
    "    → lá: đỗ (10 mẫu)",
    "Độ chính xác (max_depth=2): 83.3%",
    "sklearn (max_depth=2): 83.3%",
  ],
  python: `import numpy as np
from sklearn.tree import DecisionTreeClassifier

# x1 = giờ học, x2 = giờ ngủ; nhãn 1 = đỗ, 0 = trượt (4 điểm cuối mỗi lớp chồng lấn)
X = np.array([
    [1, 2], [2, 1.5], [1.5, 4], [3, 2.5], [2.5, 5], [4, 1.5], [3.5, 3.5], [1, 6], [4.5, 3], [2, 3],
    [5.5, 4], [6.5, 6],
    [6, 7], [7, 5.5], [8, 8], [6.5, 4.5], [9, 6], [5.5, 8], [7.5, 7], [8.5, 4], [5, 6.5], [6, 5.5],
    [4, 5.5], [3, 3.5],
])
y = np.array([0] * 12 + [1] * 12)
FEATURES = ["giờ học", "giờ ngủ"]

def gini(y):
    p = np.bincount(y, minlength=2) / len(y)
    return 1 - np.sum(p ** 2)

def best_split(X, y):
    best = (None, None, gini(y))
    for f in range(X.shape[1]):
        values = np.unique(X[:, f])
        for t in (values[:-1] + values[1:]) / 2:          # ngưỡng giữa hai giá trị liền kề
            left = X[:, f] <= t
            g = (left.sum() * gini(y[left]) + (~left).sum() * gini(y[~left])) / len(y)
            if g < best[2] - 1e-12:
                best = (f, t, g)
    return best

def build(X, y, depth=0, max_depth=3):
    f, t, g = best_split(X, y)
    if depth == max_depth or f is None or gini(y) == 0:
        leaf = int(np.bincount(y, minlength=2).argmax())
        print(f"{'  ' * depth}→ lá: {'đỗ' if leaf else 'trượt'} ({len(y)} mẫu)")
        return leaf
    left = X[:, f] <= t
    print(f"{'  ' * depth}[{FEATURES[f]} ≤ {t:.2f}]  gini {gini(y):.3f} → {g:.3f}")
    return (f, t, build(X[left], y[left], depth + 1, max_depth), build(X[~left], y[~left], depth + 1, max_depth))

def predict(node, q):
    while isinstance(node, tuple):
        f, t, l, r = node
        node = l if q[f] <= t else r
    return node

tree = build(X, y, max_depth=2)
acc = np.mean([predict(tree, q) == c for q, c in zip(X, y)])
print(f"Độ chính xác (max_depth=2): {acc:.1%}")
sk = DecisionTreeClassifier(max_depth=2, random_state=0).fit(X, y)
print(f"sklearn (max_depth=2): {sk.score(X, y):.1%}")`,
};
