/**
 * Copyright (c) 2026 vuvanthanhtb
 * SPDX-License-Identifier: MIT
 */

// Dữ liệu cứng: mã Python cho bài knn và output đã chạy thật (NumPy + scikit-learn).
export const knn = {
  file: "knn.py",
  output: [
    "k=1: láng giềng [22] d=[1.03] → đỗ",
    "k=3: láng giềng [22, 6, 10] d=[1.03, 1.25, 1.35] → trượt",
    "k=5: láng giềng [22, 6, 10, 8, 23] d=[1.03, 1.25, 1.35, 1.52, 1.6] → trượt",
    "sklearn k=1 → đỗ",
    "sklearn k=3 → trượt",
    "sklearn k=5 → trượt",
  ],
  python: `import numpy as np
from collections import Counter
from sklearn.neighbors import KNeighborsClassifier

# x1 = giờ học, x2 = giờ ngủ; nhãn 1 = đỗ, 0 = trượt (4 điểm cuối mỗi lớp chồng lấn)
X = np.array([
    [1, 2], [2, 1.5], [1.5, 4], [3, 2.5], [2.5, 5], [4, 1.5], [3.5, 3.5], [1, 6], [4.5, 3], [2, 3],
    [5.5, 4], [6.5, 6],
    [6, 7], [7, 5.5], [8, 8], [6.5, 4.5], [9, 6], [5.5, 8], [7.5, 7], [8.5, 4], [5, 6.5], [6, 5.5],
    [4, 5.5], [3, 3.5],
])
y = np.array([0] * 12 + [1] * 12)

class KNNScratch:
    def __init__(self, k=3):
        self.k = k

    def fit(self, X, y):
        self.X, self.y = X, y   # "lazy learning": chỉ ghi nhớ dữ liệu
        return self

    def predict_one(self, q):
        d = np.sqrt(((self.X - q) ** 2).sum(axis=1))      # khoảng cách Euclid
        nearest = np.argsort(d, kind="stable")[: self.k]
        votes = Counter(self.y[nearest].tolist())
        return votes.most_common(1)[0][0], nearest, d[nearest]

q = np.array([4.25, 4.5])   # học 4h15, ngủ 4h30
for k in (1, 3, 5):
    label, idx, dist = KNNScratch(k).fit(X, y).predict_one(q)
    print(f"k={k}: láng giềng {idx.tolist()} d={np.round(dist, 2).tolist()} → {'đỗ' if label else 'trượt'}")

for k in (1, 3, 5):
    sk = KNeighborsClassifier(n_neighbors=k).fit(X, y)
    print(f"sklearn k={k} → {'đỗ' if sk.predict([q])[0] else 'trượt'}")`,
};
