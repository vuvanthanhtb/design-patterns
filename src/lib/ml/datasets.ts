/**
 * Copyright (c) 2026 vuvanthanhtb
 * SPDX-License-Identifier: MIT
 */

/**
 * Tập dữ liệu nhỏ, ghi cứng — trùng khớp từng con số với code Python của mỗi bài,
 * nên biểu đồ động trên web và output Python mô tả cùng một bài toán.
 */

export type Vec = [number, number];

/** Diện tích (chục m²) → giá nhà (trăm triệu). */
export const HOUSE_X = [3, 4, 5, 5.5, 6, 6.5, 7, 8, 8.5, 9, 10, 11];
export const HOUSE_Y = [
  6.2, 7.5, 9.8, 9.9, 11.4, 11.6, 12.3, 14.5, 15.0, 15.2, 17.6, 18.3,
];

const BASE_FAIL: Vec[] = [
  [1, 2],
  [2, 1.5],
  [1.5, 4],
  [3, 2.5],
  [2.5, 5],
  [4, 1.5],
  [3.5, 3.5],
  [1, 6],
  [4.5, 3],
  [2, 3],
];
const BASE_PASS: Vec[] = [
  [6, 7],
  [7, 5.5],
  [8, 8],
  [6.5, 4.5],
  [9, 6],
  [5.5, 8],
  [7.5, 7],
  [8.5, 4],
  [5, 6.5],
  [6, 5.5],
];

/** Giờ học × giờ ngủ → đỗ (1) / trượt (0); 2 điểm cuối mỗi lớp chồng lấn sang lớp kia. */
export const STUDY_X: Vec[] = [
  ...BASE_FAIL,
  [5.5, 4],
  [6.5, 6],
  ...BASE_PASS,
  [4, 5.5],
  [3, 3.5],
];
export const STUDY_Y: number[] = [...Array(12).fill(0), ...Array(12).fill(1)];

/** Bản tách được tuyến tính (không có điểm nhiễu) — cho SVM. */
export const STUDY_SEP_X: Vec[] = [...BASE_FAIL, ...BASE_PASS];
export const STUDY_SEP_Y: number[] = [
  ...Array(10).fill(0),
  ...Array(10).fill(1),
];

/** Điểm cần dự đoán trong k-NN, Naive Bayes, Random Forest. */
export const STUDY_QUERY: Vec = [4.25, 4.5];

export const XOR_X: Vec[] = [
  [0, 0],
  [0, 1],
  [1, 0],
  [1, 1],
];
export const XOR_Y = [0, 1, 1, 0];

/** Ba cụm, mỗi cụm 7 điểm. */
export const BLOBS: Vec[] = [
  [1.5, 2.2],
  [2.3, 1.4],
  [2.8, 2.6],
  [1.2, 1.3],
  [2.0, 3.0],
  [3.1, 1.9],
  [1.7, 2.7],
  [6.5, 2.4],
  [7.4, 3.6],
  [7.9, 2.7],
  [6.8, 3.9],
  [7.2, 2.1],
  [6.2, 3.2],
  [8.1, 3.4],
  [4.0, 7.5],
  [5.1, 6.6],
  [4.6, 8.0],
  [3.7, 6.8],
  [5.4, 7.6],
  [4.2, 6.2],
  [5.0, 7.1],
];
export const BLOBS_INIT = [11, 14, 18];

/** Hai đặc trưng tương quan mạnh — cho PCA. */
export const PCA_X: Vec[] = [
  [2, 1.8],
  [3, 2.2],
  [3.5, 3.1],
  [4, 2.9],
  [5, 3.6],
  [5.5, 4.4],
  [6, 4.1],
  [7, 5.0],
  [7.5, 5.6],
  [8, 5.2],
  [4.5, 3.8],
  [6.5, 4.9],
];

/** Bootstrap của 5 cây (np.random.default_rng(98)), giống hệt code Python. */
export const FOREST_BOOTSTRAPS = [
  [
    0, 1, 1, 1, 2, 3, 3, 5, 6, 6, 6, 7, 8, 8, 9, 9, 12, 13, 17, 18, 19, 20, 22,
    23,
  ],
  [
    0, 0, 0, 4, 4, 5, 6, 6, 6, 9, 9, 9, 10, 10, 11, 11, 11, 12, 13, 15, 20, 22,
    22, 23,
  ],
  [
    0, 1, 1, 1, 2, 3, 5, 6, 7, 7, 7, 10, 11, 11, 11, 11, 12, 14, 17, 19, 19, 20,
    21, 21,
  ],
  [
    1, 1, 2, 3, 6, 8, 9, 9, 12, 12, 12, 12, 13, 13, 13, 14, 16, 16, 17, 20, 20,
    21, 22, 23,
  ],
  [
    0, 0, 1, 1, 3, 3, 5, 6, 7, 8, 8, 10, 11, 12, 14, 14, 19, 19, 21, 22, 22, 22,
    23, 23,
  ],
];

/** Trọng số khởi tạo MLP 2 → 3 → 1 cho XOR. */
export const MLP_INIT = {
  W1: [
    [-0.4, 0.0, -0.2],
    [-0.2, 0.1, -0.2],
  ],
  W2: [0.3, 0.0, 0.6],
};
