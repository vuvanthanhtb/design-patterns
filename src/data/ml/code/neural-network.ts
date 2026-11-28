/**
 * Copyright (c) 2026 vuvanthanhtb
 * SPDX-License-Identifier: MIT
 */

// Dữ liệu cứng: mã Python cho bài neural-network và output đã chạy thật (NumPy + scikit-learn).
export const neuralNetwork = {
  file: "neural_network.py",
  output: [
    "Perceptron trên XOR: accuracy = 50%",
    "epoch    1: loss = 0.7031  dự đoán = [0.5, 0.46, 0.44, 0.4]",
    "epoch  100: loss = 0.6932  dự đoán = [0.5, 0.5, 0.5, 0.5]",
    "epoch  500: loss = 0.0500  dự đoán = [0.02, 0.96, 0.93, 0.07]",
    "epoch 3000: loss = 0.0010  dự đoán = [0.0, 1.0, 1.0, 0.0]",
    "sklearn MLP trên XOR: [0, 1, 1, 0]",
  ],
  python: `import numpy as np
from sklearn.neural_network import MLPClassifier

# XOR: không thể tách bằng một đường thẳng
X = np.array([[0, 0], [0, 1], [1, 0], [1, 1]], dtype=float)
y = np.array([0, 1, 1, 0])

# 1) Perceptron một lớp: thất bại với XOR
w, b = np.zeros(2), 0.0
for epoch in range(20):
    for xi, yi in zip(X, y):
        pred = int(xi @ w + b > 0)
        w += 0.1 * (yi - pred) * xi      # luật cập nhật Perceptron
        b += 0.1 * (yi - pred)
print(f"Perceptron trên XOR: accuracy = {np.mean((X @ w + b > 0).astype(int) == y):.0%}")

# 2) MLP 2 → 3 → 1, lan truyền ngược (backpropagation)
#    Trọng số khởi tạo ghi cứng để kết quả tái lập được
W1 = np.array([[-0.4, 0.0, -0.2], [-0.2, 0.1, -0.2]]); b1 = np.zeros(3)
W2 = np.array([[0.3], [0.0], [0.6]]);                   b2 = np.zeros(1)
sigmoid = lambda z: 1 / (1 + np.exp(-z))

for epoch in range(1, 3001):
    h = np.tanh(X @ W1 + b1)                 # lớp ẩn
    out = sigmoid(h @ W2 + b2).ravel()       # lớp ra
    d_out = (out - y)[:, None] / len(y)      # ∂loss/∂z2 (log-loss + sigmoid)
    d_h = (d_out @ W2.T) * (1 - h ** 2)      # lan truyền ngược qua tanh
    W2 -= 1.0 * h.T @ d_out;  b2 -= 1.0 * d_out.sum(0)
    W1 -= 1.0 * X.T @ d_h;    b1 -= 1.0 * d_h.sum(0)
    if epoch in (1, 100, 500, 3000):
        loss = -np.mean(y * np.log(out) + (1 - y) * np.log(1 - out))
        print(f"epoch {epoch:>4}: loss = {loss:.4f}  dự đoán = {np.round(out, 2).tolist()}")

sk = MLPClassifier(hidden_layer_sizes=(3,), activation="tanh", solver="lbfgs", random_state=1).fit(X, y)
print(f"sklearn MLP trên XOR: {sk.predict(X).tolist()}")`,
};
