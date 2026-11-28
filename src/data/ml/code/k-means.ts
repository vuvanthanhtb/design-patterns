/**
 * Copyright (c) 2026 vuvanthanhtb
 * SPDX-License-Identifier: MIT
 */

// Dữ liệu cứng: mã Python cho bài k-means và output đã chạy thật (NumPy + scikit-learn).
export const kMeans = {
  file: "k_means.py",
  output: [
    "vòng 1: inertia = 198.930  tâm = [[5.08, 2.56], [3.37, 5.7], [5.17, 7.1]]",
    "vòng 2: inertia = 111.775  tâm = [[4.82, 2.57], [3.3, 5.33], [4.82, 7.36]]",
    "vòng 3: inertia = 108.518  tâm = [[5.08, 2.56], [2.63, 3.97], [4.63, 7.27]]",
    "vòng 4: inertia =  72.618  tâm = [[6.65, 2.9], [1.92, 2.2], [4.57, 7.11]]",
    "vòng 5: inertia =  17.939  tâm = [[7.16, 3.04], [2.09, 2.16], [4.57, 7.11]]",
    "vòng 6: inertia =  15.783  tâm = [[7.16, 3.04], [2.09, 2.16], [4.57, 7.11]]",
    "Hội tụ sau 6 vòng",
    "Kích thước cụm: [7, 7, 7]",
    "— Khởi tạo tệ (3 tâm cùng một cụm):",
    "vòng 1: inertia = 311.790  tâm = [[1.47, 2.07], [2.3, 1.4], [5.29, 4.62]]",
    "vòng 2: inertia = 104.075  tâm = [[1.6, 2.3], [2.73, 1.97], [5.86, 5.08]]",
    "vòng 3: inertia =  94.809  tâm = [[1.6, 2.3], [2.73, 1.97], [5.86, 5.08]]",
    "Hội tụ sau 3 vòng",
    "sklearn inertia = 15.783",
  ],
  python: `import numpy as np
from sklearn.cluster import KMeans

X = np.array([
    [1.5, 2.2], [2.3, 1.4], [2.8, 2.6], [1.2, 1.3], [2.0, 3.0], [3.1, 1.9], [1.7, 2.7],
    [6.5, 2.4], [7.4, 3.6], [7.9, 2.7], [6.8, 3.9], [7.2, 2.1], [6.2, 3.2], [8.1, 3.4],
    [4.0, 7.5], [5.1, 6.6], [4.6, 8.0], [3.7, 6.8], [5.4, 7.6], [4.2, 6.2], [5.0, 7.1],
])

def k_means(X, centroids, max_iter=10):
    for it in range(1, max_iter + 1):
        # Bước gán: mỗi điểm về tâm gần nhất
        d = np.linalg.norm(X[:, None, :] - centroids[None, :, :], axis=2)
        labels = d.argmin(axis=1)
        inertia = np.sum(d[np.arange(len(X)), labels] ** 2)
        # Bước cập nhật: tâm = trung bình các điểm của cụm
        new = np.array([X[labels == k].mean(axis=0) for k in range(len(centroids))])
        print(f"vòng {it}: inertia = {inertia:7.3f}  tâm = {np.round(new, 2).tolist()}")
        if np.allclose(new, centroids):
            print(f"Hội tụ sau {it} vòng")
            return labels, new
        centroids = new
    return labels, centroids

init = X[[11, 14, 18]].copy()   # 2 tâm cùng nằm trong cụm trên, cụm trái chưa có tâm
labels, centers = k_means(X, init)
print(f"Kích thước cụm: {np.bincount(labels).tolist()}")

bad = X[[0, 1, 2]].copy()        # khởi tạo tệ: cả 3 tâm trong cùng một cụm
print("— Khởi tạo tệ (3 tâm cùng một cụm):")
k_means(X, bad)

sk = KMeans(n_clusters=3, n_init=10, random_state=0).fit(X)
print(f"sklearn inertia = {sk.inertia_:.3f}")`,
};
