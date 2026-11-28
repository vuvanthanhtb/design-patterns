/**
 * Copyright (c) 2026 vuvanthanhtb
 * SPDX-License-Identifier: MIT
 */

// Dữ liệu cứng: mã Python cho bài pca và output đã chạy thật (NumPy + scikit-learn).
export const pca = {
  file: "pca.py",
  output: [
    "Tâm dữ liệu: [5.208, 3.883]",
    "PC1 = [0.843, 0.538]  giải thích 98.9% phương sai",
    "PC2 = [0.538, -0.843]  giải thích 1.1% phương sai",
    "5 điểm đầu sau khi giảm còn 1 chiều: [-3.83, -2.77, -1.86, -1.55, -0.33]",
    "sklearn tỉ lệ phương sai: [0.989, 0.011]",
  ],
  python: `import numpy as np
from sklearn.decomposition import PCA

X = np.array([
    [2, 1.8], [3, 2.2], [3.5, 3.1], [4, 2.9], [5, 3.6], [5.5, 4.4],
    [6, 4.1], [7, 5.0], [7.5, 5.6], [8, 5.2], [4.5, 3.8], [6.5, 4.9],
])

class PCAScratch:
    def __init__(self, n_components=1):
        self.k = n_components

    def fit(self, X):
        self.mean = X.mean(axis=0)
        Xc = X - self.mean                              # 1. căn giữa dữ liệu
        cov = Xc.T @ Xc / (len(X) - 1)                  # 2. ma trận hiệp phương sai
        vals, vecs = np.linalg.eigh(cov)                # 3. trị riêng / vector riêng
        order = np.argsort(vals)[::-1]
        self.values, self.vectors = vals[order], vecs[:, order]
        self.vectors *= np.sign(self.vectors[0])        # cố định chiều để kết quả ổn định
        return self

    def transform(self, X):
        return (X - self.mean) @ self.vectors[:, : self.k]   # 4. chiếu lên k thành phần đầu

pca = PCAScratch(n_components=1).fit(X)
ratio = pca.values / pca.values.sum()
print(f"Tâm dữ liệu: {np.round(pca.mean, 3).tolist()}")
print(f"PC1 = {np.round(pca.vectors[:, 0], 3).tolist()}  giải thích {ratio[0]:.1%} phương sai")
print(f"PC2 = {np.round(pca.vectors[:, 1], 3).tolist()}  giải thích {ratio[1]:.1%} phương sai")
print(f"5 điểm đầu sau khi giảm còn 1 chiều: {np.round(pca.transform(X)[:5, 0], 2).tolist()}")

sk = PCA(n_components=2).fit(X)
print(f"sklearn tỉ lệ phương sai: {np.round(sk.explained_variance_ratio_, 3).tolist()}")`,
};
