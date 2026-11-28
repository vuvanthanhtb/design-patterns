/**
 * Copyright (c) 2026 vuvanthanhtb
 * SPDX-License-Identifier: MIT
 */

/**
 * Cài đặt TypeScript của 11 thuật toán, viết theo đúng thứ tự phép tính của code
 * Python (NumPy) trong bài học — dùng lúc build để sinh khung hình cho biểu đồ động.
 */
import type { Vec } from "./datasets";

export const mean = (a: number[]) => a.reduce((s, v) => s + v, 0) / a.length;
export const sigmoid = (z: number) => 1 / (1 + Math.exp(-z));
const dist = (a: Vec, b: Vec) => Math.hypot(a[0] - b[0], a[1] - b[1]);

/* ───────────── Gradient Descent ───────────── */

export const gdF = (w: number) => (w - 3) ** 2 + 1;
export const gdGrad = (w: number) => 2 * (w - 3);

export function gdPath(w0: number, lr: number, steps: number) {
  const path = [w0];
  let w = w0;
  for (let i = 0; i < steps; i++) {
    w = w - lr * gdGrad(w);
    path.push(w);
  }
  return path;
}

/* ───────────── Hồi quy tuyến tính ───────────── */

export const mse = (x: number[], y: number[], w: number, b: number) =>
  mean(x.map((xi, i) => (w * xi + b - y[i]) ** 2));

/** GD trên MSE (như bài Gradient Descent): trả về tham số sau các epoch được yêu cầu. */
export function linregGD(
  x: number[],
  y: number[],
  lr: number,
  epochs: number[],
) {
  let w = 0;
  let b = 0;
  const out: { epoch: number; w: number; b: number }[] = [];
  const last = Math.max(...epochs);
  for (let e = 1; e <= last; e++) {
    const err = x.map((xi, i) => w * xi + b - y[i]);
    const gw = 2 * mean(err.map((v, i) => v * x[i]));
    const gb = 2 * mean(err);
    w -= lr * gw;
    b -= lr * gb;
    if (epochs.includes(e)) out.push({ epoch: e, w, b });
  }
  return out;
}

/** Nghiệm đóng (phương trình chuẩn) cho 1 biến. */
export function linregExact(x: number[], y: number[]) {
  const mx = mean(x);
  const my = mean(y);
  const w =
    x.reduce((s, xi, i) => s + (xi - mx) * (y[i] - my), 0) /
    x.reduce((s, xi) => s + (xi - mx) ** 2, 0);
  return { w, b: my - w * mx };
}

/* ───────────── Hồi quy logistic (GD + L2) ───────────── */

export function logisticGD(
  X: Vec[],
  y: number[],
  lr: number,
  lam: number,
  epochs: number[],
) {
  let w: Vec = [0, 0];
  let b = 0;
  const n = y.length;
  const out: { epoch: number; w: Vec; b: number }[] = [
    { epoch: 0, w: [0, 0], b: 0 },
  ];
  const last = Math.max(...epochs);
  for (let e = 1; e <= last; e++) {
    const p = X.map((xi) => sigmoid(xi[0] * w[0] + xi[1] * w[1] + b));
    let g0 = 0;
    let g1 = 0;
    let gb = 0;
    for (let i = 0; i < n; i++) {
      g0 += X[i][0] * (p[i] - y[i]);
      g1 += X[i][1] * (p[i] - y[i]);
      gb += p[i] - y[i];
    }
    w = [w[0] - lr * (g0 / n + lam * w[0]), w[1] - lr * (g1 / n + lam * w[1])];
    b -= lr * (gb / n);
    if (epochs.includes(e)) out.push({ epoch: e, w, b });
  }
  return out;
}

export function logLoss(X: Vec[], y: number[], w: Vec, b: number) {
  return mean(
    X.map((xi, i) => {
      const p = sigmoid(xi[0] * w[0] + xi[1] * w[1] + b);
      return -(y[i] * Math.log(p) + (1 - y[i]) * Math.log(1 - p));
    }),
  );
}

/* ───────────── k-NN ───────────── */

export function knnNeighbors(X: Vec[], q: Vec) {
  // argsort ổn định theo khoảng cách (giống np.argsort(kind="stable"))
  return X.map((p, i) => ({ i, d: dist(p, q) })).sort(
    (a, b) => a.d - b.d || a.i - b.i,
  );
}

export function knnPredict(X: Vec[], y: number[], q: Vec, k: number) {
  const nn = knnNeighbors(X, q).slice(0, k);
  const votes = [0, 0];
  for (const { i } of nn) votes[y[i]]++;
  // Counter.most_common: hoà phiếu → lớp gặp trước trong danh sách láng giềng
  if (votes[0] === votes[1]) return y[nn[0].i];
  return votes[1] > votes[0] ? 1 : 0;
}

/* ───────────── Gaussian Naive Bayes ───────────── */

export function nbFit(X: Vec[], y: number[]) {
  return [0, 1].map((c) => {
    const pts = X.filter((_, i) => y[i] === c);
    const mu: Vec = [mean(pts.map((p) => p[0])), mean(pts.map((p) => p[1]))];
    const v: Vec = [
      mean(pts.map((p) => (p[0] - mu[0]) ** 2)),
      mean(pts.map((p) => (p[1] - mu[1]) ** 2)),
    ];
    return { prior: pts.length / y.length, mu, v };
  });
}

export function nbProba(model: ReturnType<typeof nbFit>, q: Vec) {
  const logPost = model.map(
    (m) =>
      Math.log(m.prior) -
      0.5 *
        [0, 1].reduce(
          (s, j) =>
            s + Math.log(2 * Math.PI * m.v[j]) + (q[j] - m.mu[j]) ** 2 / m.v[j],
          0,
        ),
  );
  const mx = Math.max(...logPost);
  const e = logPost.map((l) => Math.exp(l - mx));
  const s = e[0] + e[1];
  return [e[0] / s, e[1] / s];
}

/* ───────────── Cây quyết định (Gini) ───────────── */

export type TreeNode =
  | number
  | {
      f: number;
      t: number;
      left: TreeNode;
      right: TreeNode;
      gini: number;
      after: number;
      n: number;
    };

export function gini(y: number[]) {
  if (y.length === 0) return 0;
  const p1 = y.filter((v) => v === 1).length / y.length;
  return 1 - ((1 - p1) ** 2 + p1 ** 2);
}

function bestSplit(X: Vec[], y: number[]) {
  let best: { f: number | null; t: number; g: number } = {
    f: null,
    t: 0,
    g: gini(y),
  };
  for (let f = 0; f < 2; f++) {
    const values = [...new Set(X.map((p) => p[f]))].sort((a, b) => a - b);
    for (let i = 0; i < values.length - 1; i++) {
      const t = (values[i] + values[i + 1]) / 2;
      const L: number[] = [];
      const R: number[] = [];
      X.forEach((p, k) => (p[f] <= t ? L : R).push(y[k]));
      const g = (L.length * gini(L) + R.length * gini(R)) / y.length;
      if (g < best.g - 1e-12) best = { f, t, g };
    }
  }
  return best;
}

const majority = (y: number[]) =>
  y.filter((v) => v === 1).length > y.length / 2 ? 1 : 0;

export function buildTree(
  X: Vec[],
  y: number[],
  maxDepth: number,
  depth = 0,
): TreeNode {
  const { f, t, g } = bestSplit(X, y);
  if (depth === maxDepth || f === null || gini(y) === 0) return majority(y);
  const li = X.map((p, k) => (p[f] <= t ? k : -1)).filter((k) => k >= 0);
  const ri = X.map((p, k) => (p[f] > t ? k : -1)).filter((k) => k >= 0);
  return {
    f,
    t,
    gini: gini(y),
    after: g,
    n: y.length,
    left: buildTree(
      li.map((k) => X[k]),
      li.map((k) => y[k]),
      maxDepth,
      depth + 1,
    ),
    right: buildTree(
      ri.map((k) => X[k]),
      ri.map((k) => y[k]),
      maxDepth,
      depth + 1,
    ),
  };
}

export function treePredict(node: TreeNode, q: Vec): number {
  let n = node;
  while (typeof n !== "number") n = q[n.f] <= n.t ? n.left : n.right;
  return n;
}

/* ───────────── SVM tuyến tính (subgradient) ───────────── */

export function svmTrain(
  X: Vec[],
  y01: number[],
  lam: number,
  lr: number,
  epochs: number[],
) {
  const y = y01.map((v) => (v === 1 ? 1 : -1));
  const n = y.length;
  let w: Vec = [0, 0];
  let b = 0;
  const out: { epoch: number; w: Vec; b: number }[] = [];
  const last = Math.max(...epochs);
  for (let e = 1; e <= last; e++) {
    let s0 = 0;
    let s1 = 0;
    let sy = 0;
    for (let i = 0; i < n; i++) {
      if (y[i] * (X[i][0] * w[0] + X[i][1] * w[1] + b) < 1) {
        s0 += y[i] * X[i][0];
        s1 += y[i] * X[i][1];
        sy += y[i];
      }
    }
    w = [w[0] - lr * (lam * w[0] - s0 / n), w[1] - lr * (lam * w[1] - s1 / n)];
    b -= lr * (-sy / n);
    if (epochs.includes(e)) out.push({ epoch: e, w, b });
  }
  return out;
}

/* ───────────── Perceptron & MLP ───────────── */

export function perceptron(X: Vec[], y: number[], epochs: number, lr = 0.1) {
  let w: Vec = [0, 0];
  let b = 0;
  for (let e = 0; e < epochs; e++) {
    for (let i = 0; i < X.length; i++) {
      const pred = X[i][0] * w[0] + X[i][1] * w[1] + b > 0 ? 1 : 0;
      const d = lr * (y[i] - pred);
      w = [w[0] + d * X[i][0], w[1] + d * X[i][1]];
      b += d;
    }
  }
  return { w, b };
}

export interface Mlp {
  W1: number[][];
  b1: number[];
  W2: number[];
  b2: number;
}

export function mlpForward(m: Mlp, q: Vec) {
  const h = [0, 1, 2].map((j) =>
    Math.tanh(q[0] * m.W1[0][j] + q[1] * m.W1[1][j] + m.b1[j]),
  );
  return {
    h,
    out: sigmoid(h[0] * m.W2[0] + h[1] * m.W2[1] + h[2] * m.W2[2] + m.b2),
  };
}

export function mlpTrain(
  X: Vec[],
  y: number[],
  init: { W1: number[][]; W2: number[] },
  lr: number,
  epochs: number[],
) {
  const m: Mlp = {
    W1: init.W1.map((r) => [...r]),
    b1: [0, 0, 0],
    W2: [...init.W2],
    b2: 0,
  };
  const n = X.length;
  const snaps: { epoch: number; model: Mlp; loss: number }[] = [];
  const last = Math.max(...epochs);
  for (let e = 1; e <= last; e++) {
    const fw = X.map((q) => mlpForward(m, q));
    const dOut = fw.map((f, i) => (f.out - y[i]) / n);
    const dH = fw.map((f, i) =>
      f.h.map((hj, j) => dOut[i] * m.W2[j] * (1 - hj * hj)),
    );
    const loss = mean(
      fw.map(
        (f, i) => -(y[i] * Math.log(f.out) + (1 - y[i]) * Math.log(1 - f.out)),
      ),
    );
    // Chụp mô hình TRƯỚC khi cập nhật — khớp với thời điểm code Python in loss/dự đoán
    if (epochs.includes(e))
      snaps.push({
        epoch: e,
        loss,
        model: {
          W1: m.W1.map((r) => [...r]),
          b1: [...m.b1],
          W2: [...m.W2],
          b2: m.b2,
        },
      });
    for (let j = 0; j < 3; j++)
      m.W2[j] -= lr * fw.reduce((s, f, i) => s + f.h[j] * dOut[i], 0);
    m.b2 -= lr * dOut.reduce((s, v) => s + v, 0);
    for (let a = 0; a < 2; a++)
      for (let j = 0; j < 3; j++)
        m.W1[a][j] -= lr * X.reduce((s, q, i) => s + q[a] * dH[i][j], 0);
    for (let j = 0; j < 3; j++)
      m.b1[j] -= lr * dH.reduce((s, d) => s + d[j], 0);
  }
  return snaps;
}

/* ───────────── K-Means ───────────── */

export function kmeansSteps(X: Vec[], init: Vec[], maxIter = 10) {
  let c = init.map((p) => [...p] as Vec);
  const steps: {
    iter: number;
    labels: number[];
    before: Vec[];
    after: Vec[];
    inertia: number;
  }[] = [];
  for (let it = 1; it <= maxIter; it++) {
    const labels = X.map((p) => {
      let best = 0;
      for (let k = 1; k < c.length; k++)
        if (dist(p, c[k]) < dist(p, c[best])) best = k;
      return best;
    });
    const inertia = X.reduce((s, p, i) => s + dist(p, c[labels[i]]) ** 2, 0);
    const next = c.map((ck, k) => {
      const pts = X.filter((_, i) => labels[i] === k);
      return pts.length
        ? ([mean(pts.map((p) => p[0])), mean(pts.map((p) => p[1]))] as Vec)
        : ck;
    });
    steps.push({ iter: it, labels, before: c, after: next, inertia });
    if (
      next.every(
        (p, k) =>
          Math.abs(p[0] - c[k][0]) < 1e-8 && Math.abs(p[1] - c[k][1]) < 1e-8,
      )
    )
      break;
    c = next;
  }
  return steps;
}

/* ───────────── PCA (2 chiều, trị riêng dạng đóng) ───────────── */

export function pca2(X: Vec[]) {
  const mu: Vec = [mean(X.map((p) => p[0])), mean(X.map((p) => p[1]))];
  const n = X.length;
  let a = 0;
  let b = 0;
  let d = 0;
  for (const p of X) {
    const u = p[0] - mu[0];
    const v = p[1] - mu[1];
    a += u * u;
    b += u * v;
    d += v * v;
  }
  a /= n - 1;
  b /= n - 1;
  d /= n - 1;
  const tr = a + d;
  const disc = Math.sqrt(((a - d) / 2) ** 2 + b * b);
  const l1 = tr / 2 + disc;
  const l2 = tr / 2 - disc;
  const norm = (v: Vec): Vec => {
    const s = Math.hypot(v[0], v[1]);
    const u: Vec = [v[0] / s, v[1] / s];
    return u[0] < 0 ? [-u[0], -u[1]] : u; // cố định chiều như code Python
  };
  const v1 = norm(Math.abs(b) > 1e-12 ? [l1 - d, b] : [1, 0]);
  const v2 = norm([v1[1], -v1[0]]);
  return { mu, values: [l1, l2] as Vec, v1, v2, cov: [a, b, d] };
}
