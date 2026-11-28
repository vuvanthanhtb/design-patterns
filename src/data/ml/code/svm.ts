/**
 * Copyright (c) 2026 vuvanthanhtb
 * SPDX-License-Identifier: MIT
 */

// Dữ liệu cứng: mã Python cho bài svm và output đã chạy thật (NumPy + scikit-learn).
export const svm = {
  file: "svm.py",
  output: [
    "w = [0.642, 0.483]  b = -5.339",
    "Độ rộng lề 2/‖w‖ = 2.489",
    "Vector hỗ trợ (y·f(x) ≤ 1.05): [8, 13, 18]",
    "Accuracy = 100%",
    "sklearn: w = [0.64, 0.48]  b = -5.320  vector hỗ trợ [8, 13, 18]",
  ],
  python: `import numpy as np
from sklearn.svm import SVC

# Dữ liệu tách được tuyến tính (không có điểm nhiễu)
X = np.array([
    [1, 2], [2, 1.5], [1.5, 4], [3, 2.5], [2.5, 5], [4, 1.5], [3.5, 3.5], [1, 6], [4.5, 3], [2, 3],
    [6, 7], [7, 5.5], [8, 8], [6.5, 4.5], [9, 6], [5.5, 8], [7.5, 7], [8.5, 4], [5, 6.5], [6, 5.5],
])
y = np.array([-1] * 10 + [1] * 10)   # SVM dùng nhãn ±1

class LinearSVMScratch:
    """Soft-margin SVM: min  λ/2·‖w‖² + mean(max(0, 1 − y(w·x + b)))  bằng subgradient descent."""

    def __init__(self, lam=0.01, lr=0.01, epochs=100_000):
        self.lam, self.lr, self.epochs = lam, lr, epochs

    def fit(self, X, y):
        self.w, self.b = np.zeros(X.shape[1]), 0.0
        for _ in range(self.epochs):
            viol = y * (X @ self.w + self.b) < 1     # điểm nằm trong lề hoặc sai phía
            self.w -= self.lr * (self.lam * self.w - (y[viol] @ X[viol]) / len(y))
            self.b -= self.lr * (-np.sum(y[viol]) / len(y))
        return self

model = LinearSVMScratch().fit(X, y)
margin = y * (X @ model.w + model.b)
print(f"w = {np.round(model.w, 3).tolist()}  b = {model.b:.3f}")
print(f"Độ rộng lề 2/‖w‖ = {2 / np.linalg.norm(model.w):.3f}")
print(f"Vector hỗ trợ (y·f(x) ≤ 1.05): {np.where(margin <= 1.05)[0].tolist()}")
print(f"Accuracy = {np.mean(np.sign(X @ model.w + model.b) == y):.0%}")

sk = SVC(kernel="linear", C=1 / (0.01 * len(y))).fit(X, y)   # C = 1/(λn) — cùng bài toán
print(f"sklearn: w = {np.round(sk.coef_[0], 3).tolist()}  b = {sk.intercept_[0]:.3f}  vector hỗ trợ {sk.support_.tolist()}")`,
};
