/**
 * Copyright (c) 2026 vuvanthanhtb
 * SPDX-License-Identifier: MIT
 */

// Dữ liệu cứng: mã Python cho bài naive-bayes và output đã chạy thật (NumPy + scikit-learn).
export const naiveBayes = {
  file: "naive_bayes.py",
  output: [
    "Lớp 0: μ = [3.08, 3.5]  σ = [1.69, 1.5]",
    "Lớp 1: μ = [6.33, 5.92]  σ = [1.72, 1.4]",
    "P(trượt, đỗ | 4.25h, 4.5h) = [0.675, 0.325]",
    "sklearn                    = [0.675, 0.325]",
  ],
  python: `import numpy as np
from sklearn.naive_bayes import GaussianNB

# x1 = giờ học, x2 = giờ ngủ; nhãn 1 = đỗ, 0 = trượt (4 điểm cuối mỗi lớp chồng lấn)
X = np.array([
    [1, 2], [2, 1.5], [1.5, 4], [3, 2.5], [2.5, 5], [4, 1.5], [3.5, 3.5], [1, 6], [4.5, 3], [2, 3],
    [5.5, 4], [6.5, 6],
    [6, 7], [7, 5.5], [8, 8], [6.5, 4.5], [9, 6], [5.5, 8], [7.5, 7], [8.5, 4], [5, 6.5], [6, 5.5],
    [4, 5.5], [3, 3.5],
])
y = np.array([0] * 12 + [1] * 12)

class GaussianNBScratch:
    def fit(self, X, y):
        self.classes = np.unique(y)
        self.prior = np.array([np.mean(y == c) for c in self.classes])
        self.mean = np.array([X[y == c].mean(0) for c in self.classes])
        self.var = np.array([X[y == c].var(0) for c in self.classes])
        return self

    def log_likelihood(self, q):
        # "naive": các đặc trưng độc lập → cộng log-likelihood của từng chiều
        return -0.5 * np.sum(np.log(2 * np.pi * self.var) + (q - self.mean) ** 2 / self.var, axis=1)

    def predict_proba(self, q):
        log_post = np.log(self.prior) + self.log_likelihood(q)
        p = np.exp(log_post - log_post.max())
        return p / p.sum()

model = GaussianNBScratch().fit(X, y)
for c in model.classes:
    print(f"Lớp {c}: μ = {np.round(model.mean[c], 2).tolist()}  σ = {np.round(np.sqrt(model.var[c]), 2).tolist()}")
q = np.array([4.25, 4.5])
print(f"P(trượt, đỗ | 4.25h, 4.5h) = {np.round(model.predict_proba(q), 3).tolist()}")

sk = GaussianNB().fit(X, y)
print(f"sklearn                    = {np.round(sk.predict_proba([q])[0], 3).tolist()}")`,
};
