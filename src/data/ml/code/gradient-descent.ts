/**
 * Copyright (c) 2026 vuvanthanhtb
 * SPDX-License-Identifier: MIT
 */

// Dữ liệu cứng: mã Python cho bài gradient-descent và output đã chạy thật (NumPy + scikit-learn).
export const gradientDescent = {
  file: "gradient_descent.py",
  output: [
    "lr=0.2  w: -1.00 → 0.60 → 1.56 → 2.14 → 2.48 … w8=2.93  f(w8)=1.005",
    "lr=1.05 w: -1.00 → 7.40 → -1.84 → 8.32 → -2.86 … w8=-5.57  f(w8)=74.520",
    "epoch    1: w=1.899  b=0.249  MSE=167.958",
    "epoch   10: w=1.732  b=0.252  MSE=0.303",
    "epoch  100: w=1.704  b=0.475  MSE=0.247",
    "epoch 2000: w=1.559  b=1.593  MSE=0.115",
  ],
  python: `import numpy as np

# Hàm mất mát một biến: f(w) = (w - 3)² + 1, cực tiểu tại w = 3
def f(w):
    return (w - 3) ** 2 + 1

def grad(w):
    return 2 * (w - 3)  # đạo hàm f'(w)

def gradient_descent(w0, lr, steps):
    w = w0
    history = [w]
    for _ in range(steps):
        w = w - lr * grad(w)  # bước ngược hướng đạo hàm
        history.append(w)
    return np.array(history)

for lr in (0.2, 1.05):
    hist = gradient_descent(w0=-1.0, lr=lr, steps=8)
    path = " → ".join(f"{w:.2f}" for w in hist[:5])
    print(f"lr={lr:<4} w: {path} … w8={hist[-1]:.2f}  f(w8)={f(hist[-1]):.3f}")

# Gradient Descent cho hồi quy tuyến tính: y ≈ w·x + b
x = np.array([3, 4, 5, 5.5, 6, 6.5, 7, 8, 8.5, 9, 10, 11])
y = np.array([6.2, 7.5, 9.8, 9.9, 11.4, 11.6, 12.3, 14.5, 15.0, 15.2, 17.6, 18.3])

w, b, lr = 0.0, 0.0, 0.01
for epoch in range(1, 2001):
    err = (w * x + b) - y
    w -= lr * 2 * np.mean(err * x)  # ∂MSE/∂w
    b -= lr * 2 * np.mean(err)      # ∂MSE/∂b
    if epoch in (1, 10, 100, 2000):
        print(f"epoch {epoch:>4}: w={w:.3f}  b={b:.3f}  MSE={np.mean(err ** 2):.3f}")`,
};
