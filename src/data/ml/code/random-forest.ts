/**
 * Copyright (c) 2026 vuvanthanhtb
 * SPDX-License-Identifier: MIT
 */

// Dữ liệu cứng: mã Python cho bài random-forest và output đã chạy thật (NumPy + scikit-learn).
export const randomForest = {
  file: "random_forest.py",
  output: [
    "Cây 1: gốc tách [giờ học ≤ 4.75]  accuracy = 83.3%",
    "Cây 2: gốc tách [giờ ngủ ≤ 5.25]  accuracy = 75.0%",
    "Cây 3: gốc tách [giờ học ≤ 4.50]  accuracy = 70.8%",
    "Cây 4: gốc tách [giờ ngủ ≤ 4.75]  accuracy = 75.0%",
    "Cây 5: gốc tách [giờ ngủ ≤ 3.25]  accuracy = 83.3%",
    "Cả rừng (bỏ phiếu 5 cây): accuracy = 91.7%",
    "Điểm [4.25, 4.5]: phiếu [0, 0, 0, 0, 1]",
    "sklearn (100 cây, max_depth=2): 87.5%",
  ],
  python: `import numpy as np
from sklearn.ensemble import RandomForestClassifier

# x1 = giờ học, x2 = giờ ngủ; nhãn 1 = đỗ, 0 = trượt (4 điểm cuối mỗi lớp chồng lấn)
X = np.array([
    [1, 2], [2, 1.5], [1.5, 4], [3, 2.5], [2.5, 5], [4, 1.5], [3.5, 3.5], [1, 6], [4.5, 3], [2, 3],
    [5.5, 4], [6.5, 6],
    [6, 7], [7, 5.5], [8, 8], [6.5, 4.5], [9, 6], [5.5, 8], [7.5, 7], [8.5, 4], [5, 6.5], [6, 5.5],
    [4, 5.5], [3, 3.5],
])
y = np.array([0] * 12 + [1] * 12)

def gini(y):
    p = np.bincount(y, minlength=2) / len(y)
    return 1 - np.sum(p ** 2)

def build_tree(X, y, depth=0, max_depth=2):
    """Cây quyết định nhỏ (giống bài Decision Tree) — tách theo Gini."""
    best = (None, None, gini(y))
    for f in range(X.shape[1]):
        v = np.unique(X[:, f])
        for t in (v[:-1] + v[1:]) / 2:
            left = X[:, f] <= t
            g = (left.sum() * gini(y[left]) + (~left).sum() * gini(y[~left])) / len(y)
            if g < best[2] - 1e-12:
                best = (f, t, g)
    f, t, _ = best
    if depth == max_depth or f is None or gini(y) == 0:
        return int(np.bincount(y, minlength=2).argmax())
    left = X[:, f] <= t
    return (f, t, build_tree(X[left], y[left], depth + 1), build_tree(X[~left], y[~left], depth + 1))

def predict_tree(node, q):
    while isinstance(node, tuple):
        f, t, l, r = node
        node = l if q[f] <= t else r
    return node

# Bootstrap: mỗi cây học trên 24 mẫu lấy CÓ HOÀN LẠI (sinh bởi np.random.default_rng(98),
# ghi cứng để minh hoạ trên web cho ra đúng cùng một khu rừng)
BOOTSTRAPS = [
    [0, 1, 1, 1, 2, 3, 3, 5, 6, 6, 6, 7, 8, 8, 9, 9, 12, 13, 17, 18, 19, 20, 22, 23],
    [0, 0, 0, 4, 4, 5, 6, 6, 6, 9, 9, 9, 10, 10, 11, 11, 11, 12, 13, 15, 20, 22, 22, 23],
    [0, 1, 1, 1, 2, 3, 5, 6, 7, 7, 7, 10, 11, 11, 11, 11, 12, 14, 17, 19, 19, 20, 21, 21],
    [1, 1, 2, 3, 6, 8, 9, 9, 12, 12, 12, 12, 13, 13, 13, 14, 16, 16, 17, 20, 20, 21, 22, 23],
    [0, 0, 1, 1, 3, 3, 5, 6, 7, 8, 8, 10, 11, 12, 14, 14, 19, 19, 21, 22, 22, 22, 23, 23],
]

trees = [build_tree(X[idx], y[idx]) for idx in BOOTSTRAPS]
votes = np.array([[predict_tree(t, q) for q in X] for t in trees])    # (5 cây, 24 mẫu)
forest = (votes.mean(axis=0) >= 0.5).astype(int)                       # bỏ phiếu đa số

for i, t in enumerate(trees):
    print(f"Cây {i + 1}: gốc tách [{['giờ học', 'giờ ngủ'][t[0]]} ≤ {t[1]:.2f}]  accuracy = {np.mean(votes[i] == y):.1%}")
print(f"Cả rừng (bỏ phiếu 5 cây): accuracy = {np.mean(forest == y):.1%}")
q = np.array([4.25, 4.5])
print(f"Điểm {q.tolist()}: phiếu {[predict_tree(t, q) for t in trees]}")

sk = RandomForestClassifier(n_estimators=100, max_depth=2, random_state=0).fit(X, y)
print(f"sklearn (100 cây, max_depth=2): {sk.score(X, y):.1%}")`,
};
