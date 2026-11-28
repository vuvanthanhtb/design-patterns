/**
 * Copyright (c) 2026 vuvanthanhtb
 * SPDX-License-Identifier: MIT
 */

// Dữ liệu cứng: mã Python cho bài linear-regression và output đã chạy thật (NumPy + scikit-learn).
export const linearRegression = {
  file: "linear_regression.py",
  output: [
    "Từ đầu   : y = 1.555·x + 1.620",
    "MSE = 0.1150   R² = 0.9913",
    "Dự đoán nhà 75 m² (x=7.5): 13.28 trăm triệu",
    "sklearn  : y = 1.555·x + 1.620",
  ],
  python: `import numpy as np
from sklearn.linear_model import LinearRegression

# Diện tích (chục m²) → giá nhà (trăm triệu)
X = np.array([3, 4, 5, 5.5, 6, 6.5, 7, 8, 8.5, 9, 10, 11]).reshape(-1, 1)
y = np.array([6.2, 7.5, 9.8, 9.9, 11.4, 11.6, 12.3, 14.5, 15.0, 15.2, 17.6, 18.3])

class LinearRegressionScratch:
    """Hồi quy tuyến tính bằng phương trình chuẩn: θ = (XᵀX)⁻¹ Xᵀy."""

    def fit(self, X, y):
        Xb = np.c_[np.ones(len(X)), X]          # thêm cột 1 cho hệ số chặn b
        theta = np.linalg.solve(Xb.T @ Xb, Xb.T @ y)
        self.b, self.w = theta[0], theta[1:]
        return self

    def predict(self, X):
        return X @ self.w + self.b

model = LinearRegressionScratch().fit(X, y)
pred = model.predict(X)
mse = np.mean((pred - y) ** 2)
r2 = 1 - np.sum((y - pred) ** 2) / np.sum((y - y.mean()) ** 2)
print(f"Từ đầu   : y = {model.w[0]:.3f}·x + {model.b:.3f}")
print(f"MSE = {mse:.4f}   R² = {r2:.4f}")
print(f"Dự đoán nhà 75 m² (x=7.5): {model.predict(np.array([[7.5]]))[0]:.2f} trăm triệu")

sk = LinearRegression().fit(X, y)
print(f"sklearn  : y = {sk.coef_[0]:.3f}·x + {sk.intercept_:.3f}")`,
};
