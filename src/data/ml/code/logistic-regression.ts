/**
 * Copyright (c) 2026 vuvanthanhtb
 * SPDX-License-Identifier: MIT
 */

// Dữ liệu cứng: mã Python cho bài logistic-regression và output đã chạy thật (NumPy + scikit-learn).
export const logisticRegression = {
  file: "logistic_regression.py",
  output: [
    "w = [0.6074, 0.6501]  b = -5.9210",
    "Log-loss = 0.3344   accuracy = 87.5%",
    "Học 3h, ngủ 4h → P(đỗ) = 0.183",
    "Học 5h, ngủ 5h → P(đỗ) = 0.591",
    "Học 7h, ngủ 6h → P(đỗ) = 0.903",
    "sklearn: w = [0.6074, 0.6501]  b = -5.9215",
  ],
  python: `import numpy as np
from sklearn.linear_model import LogisticRegression

# x1 = giờ học, x2 = giờ ngủ; nhãn 1 = đỗ, 0 = trượt (4 điểm cuối mỗi lớp chồng lấn)
X = np.array([
    [1, 2], [2, 1.5], [1.5, 4], [3, 2.5], [2.5, 5], [4, 1.5], [3.5, 3.5], [1, 6], [4.5, 3], [2, 3],
    [5.5, 4], [6.5, 6],
    [6, 7], [7, 5.5], [8, 8], [6.5, 4.5], [9, 6], [5.5, 8], [7.5, 7], [8.5, 4], [5, 6.5], [6, 5.5],
    [4, 5.5], [3, 3.5],
])
y = np.array([0] * 12 + [1] * 12)

def sigmoid(z):
    return 1 / (1 + np.exp(-z))

class LogisticRegressionScratch:
    """Hồi quy logistic + L2, tối ưu bằng Gradient Descent trên log-loss."""

    def __init__(self, lr=0.05, epochs=20000, lam=None):
        self.lr, self.epochs, self.lam = lr, epochs, lam

    def fit(self, X, y):
        lam = self.lam if self.lam is not None else 1 / len(y)   # tương đương C=1 của sklearn
        self.w, self.b = np.zeros(X.shape[1]), 0.0
        for _ in range(self.epochs):
            p = sigmoid(X @ self.w + self.b)
            self.w -= self.lr * (X.T @ (p - y) / len(y) + lam * self.w)
            self.b -= self.lr * np.mean(p - y)
        return self

    def predict_proba(self, X):
        return sigmoid(X @ self.w + self.b)

model = LogisticRegressionScratch().fit(X, y)
p = model.predict_proba(X)
loss = -np.mean(y * np.log(p) + (1 - y) * np.log(1 - p))
print(f"w = {np.round(model.w, 4).tolist()}  b = {model.b:.4f}")
print(f"Log-loss = {loss:.4f}   accuracy = {np.mean((p >= 0.5) == y):.1%}")
for q in ([3, 4], [5, 5], [7, 6]):
    print(f"Học {q[0]}h, ngủ {q[1]}h → P(đỗ) = {model.predict_proba(np.array([q]))[0]:.3f}")

sk = LogisticRegression().fit(X, y)   # mặc định: L2 với C=1
print(f"sklearn: w = {np.round(sk.coef_[0], 4).tolist()}  b = {sk.intercept_[0]:.4f}")`,
};
