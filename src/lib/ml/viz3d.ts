/**
 * Copyright (c) 2026 vuvanthanhtb
 * SPDX-License-Identifier: MIT
 */

/**
 * Dựng cảnh 3D cho từng bài (chạy lúc build). Ý tưởng chung: "nâng" mặt phẳng 2D
 * thành một mặt cong có chiều cao là đầu ra của mô hình — xác suất, hàm quyết định,
 * mật độ, hay mất mát. Mỗi khung 3D khớp 1:1 với khung 2D cùng chỉ số.
 */
import {
  buildTree,
  knnNeighbors,
  linregExact,
  logisticGD,
  mean,
  mlpForward,
  mlpTrain,
  mse,
  nbFit,
  nbProba,
  perceptron,
  sigmoid,
  svmTrain,
  treePredict,
  type TreeNode,
} from "./algorithms";
import {
  FOREST_BOOTSTRAPS,
  HOUSE_X,
  HOUSE_Y,
  MLP_INIT,
  STUDY_QUERY,
  STUDY_SEP_X,
  STUDY_SEP_Y,
  STUDY_X,
  STUDY_Y,
  type Vec,
  XOR_X,
  XOR_Y,
} from "./datasets";
import type { Scene3DFrame, Scene3DPoint, Viz3D } from "./types";

const N = 36;
const r3 = (v: number) => Math.round(v * 1000) / 1000;

/** Lấy mẫu hàm trên lưới N × N (hàng theo y tăng dần). */
function sample(
  x: [number, number],
  y: [number, number],
  fn: (p: Vec) => number,
  n = N,
) {
  const out: number[] = [];
  for (let j = 0; j < n; j++) {
    const yy = y[0] + (j / (n - 1)) * (y[1] - y[0]);
    for (let i = 0; i < n; i++)
      out.push(r3(fn([x[0] + (i / (n - 1)) * (x[1] - x[0]), yy])));
  }
  return out;
}

const STUDY = { x: [0, 10] as [number, number], y: [0, 9] as [number, number] };
const studyPts = (
  X: Vec[],
  y: number[],
  z: (i: number) => number,
  ring?: (i: number) => boolean,
): Scene3DPoint[] =>
  X.map((p, i) => ({
    id: `p${i}`,
    x: p[0],
    y: p[1],
    z: z(i),
    cls: y[i],
    ring: ring?.(i),
  }));

/* ───────────── Mặt MSE(w, b) — dùng cho Gradient Descent & Linear Regression ───────────── */

const W_RANGE: [number, number] = [-0.2, 2.6];
const B_RANGE: [number, number] = [-1, 4];
const lossZ = (w: number, b: number) => Math.log1p(mse(HOUSE_X, HOUSE_Y, w, b));

/** Toàn bộ quỹ đạo GD trên MSE với learning rate cho trước. */
function gdTrajectory(lr: number, epochs: number, w0 = 0, b0 = 0) {
  let w = w0;
  let b = b0;
  const pts: [number, number][] = [[w, b]];
  for (let e = 1; e <= epochs; e++) {
    const err = HOUSE_X.map((x, i) => w * x + b - HOUSE_Y[i]);
    const gw = 2 * mean(err.map((v, i) => v * HOUSE_X[i]));
    const gb = 2 * mean(err);
    w -= lr * gw;
    b -= lr * gb;
    pts.push([w, b]);
  }
  return pts;
}

/** Rút gọn quỹ đạo dài thành ≤ ~120 điểm (mật độ cao ở đầu). */
function thin(pts: [number, number][], upto: number) {
  const out: [number, number, number][] = [];
  let next = 0;
  for (let i = 0; i <= upto; i++) {
    if (i >= next || i === upto) {
      const [w, b] = pts[i];
      out.push([w, b, r3(lossZ(w, b))]);
      next = i < 20 ? i + 1 : Math.ceil(i * 1.08);
    }
  }
  return out;
}

const clampW = (v: number) => Math.max(W_RANGE[0], Math.min(W_RANGE[1], v));
const clampB = (v: number) => Math.max(B_RANGE[0], Math.min(B_RANGE[1], v));

function lossSurfaceBase(note: string, frames: Scene3DFrame[]): Viz3D {
  return {
    xLabel: "w (độ dốc)",
    yLabel: "b (hệ số chặn)",
    zLabel: "log(1 + MSE)",
    x: W_RANGE,
    y: B_RANGE,
    z: [0, 5],
    nx: N,
    ny: N,
    mode: "loss",
    note,
    frames,
  };
}

function gradientDescent3d(): Viz3D {
  const surface = sample(W_RANGE, B_RANGE, ([w, b]) =>
    Math.min(5, lossZ(w, b)),
  );
  const good = gdTrajectory(0.01, 2000);
  const bad = gdTrajectory(0.02, 40);
  const ball = (w: number, b: number): Scene3DPoint => ({
    id: "ball",
    x: clampW(w),
    y: clampB(b),
    z: Math.min(5, r3(lossZ(clampW(w), clampB(b)))),
    kind: "ball",
  });
  const metrics = (pts: [number, number][], e: number, lr: number) => [
    { label: "lr", value: String(lr) },
    { label: "epoch", value: String(e) },
    {
      label: "w, b",
      value: `${pts[e][0].toFixed(3)}, ${pts[e][1].toFixed(3)}`,
    },
    {
      label: "MSE",
      value: mse(HOUSE_X, HOUSE_Y, pts[e][0], pts[e][1]).toFixed(3),
    },
  ];
  const at = (pts: [number, number][], e: number): Scene3DFrame => ({
    surface,
    path: thin(pts, e).map(
      ([w, b, z]) =>
        [clampW(w), clampB(b), Math.min(5, z)] as [number, number, number],
    ),
    points: [ball(...pts[e])],
    metrics: metrics(pts, e, 0.01),
  });
  return lossSurfaceBase(
    "3D: cùng thuật toán trên mặt mất mát MSE(w, b) của bài hồi quy giá nhà. Thung lũng hẹp và dài khiến GD lao nhanh xuống đáy rồi trôi chậm dọc đáy thung lũng.",
    [
      at(good, 0),
      at(good, 1),
      at(good, 10),
      at(good, 2000),
      {
        surface,
        path: thin(bad, 40).map(
          ([w, b, z]) =>
            [clampW(w), clampB(b), Math.min(5, z)] as [number, number, number],
        ),
        points: [ball(...bad[40])],
        metrics: metrics(bad, 40, 0.02),
      },
    ],
  );
}

function linearRegression3d(): Viz3D {
  const surface = sample(W_RANGE, B_RANGE, ([w, b]) =>
    Math.min(5, lossZ(w, b)),
  );
  const traj = gdTrajectory(0.01, 2000);
  const exact = linregExact(HOUSE_X, HOUSE_Y);
  const meanY = mean(HOUSE_Y);
  const ball = (
    w: number,
    b: number,
    kind: Scene3DPoint["kind"] = "ball",
  ): Scene3DPoint => ({
    id: "ball",
    x: clampW(w),
    y: clampB(b),
    z: r3(Math.min(5, lossZ(clampW(w), clampB(b)))),
    kind,
  });
  const gd = (e: number): Scene3DFrame => ({
    surface,
    path: thin(traj, e).map(
      ([w, b, z]) =>
        [clampW(w), clampB(b), Math.min(5, z)] as [number, number, number],
    ),
    points: [ball(...traj[e])],
  });
  return lossSurfaceBase(
    "3D: mỗi điểm trên mặt cong là một đường thẳng (w, b) và độ cao là sai số của nó. Viên bi là mô hình hiện tại; nghiệm tối ưu nằm ở đáy thung lũng.",
    [
      { surface, points: [ball(0, meanY)] },
      gd(1),
      gd(10),
      gd(100),
      gd(2000),
      {
        surface,
        path: thin(traj, 2000).map(([w, b, z]) => [clampW(w), clampB(b), z]),
        points: [ball(exact.w, exact.b, "query")],
      },
    ],
  );
}

/* ───────────── Mặt xác suất ───────────── */

function logistic3d(): Viz3D {
  const hist = logisticGD(
    STUDY_X,
    STUDY_Y,
    0.05,
    1 / 24,
    [10, 100, 1000, 20000],
  );
  return {
    xLabel: "giờ học",
    yLabel: "giờ ngủ",
    zLabel: "P(đỗ)",
    ...STUDY,
    z: [0, 1],
    nx: N,
    ny: N,
    mode: "prob",
    note: "3D: độ cao là xác suất đỗ — một tấm sigmoid uốn cong. Học sinh đỗ nằm ở độ cao 1, trượt ở 0; điểm nằm sai phía tấm là điểm bị phân loại sai. Mặt phẳng mờ là ngưỡng 0.5.",
    frames: hist.map(({ w, b }) => {
      const prob = (q: Vec) => sigmoid(q[0] * w[0] + q[1] * w[1] + b);
      return {
        surface: sample(STUDY.x, STUDY.y, prob),
        planes: [{ z: 0.5, label: "P = 0.5" }],
        points: studyPts(
          STUDY_X,
          STUDY_Y,
          (i) => STUDY_Y[i],
          (i) => (prob(STUDY_X[i]) >= 0.5 ? 1 : 0) !== STUDY_Y[i],
        ),
      };
    }),
  };
}

function neuralNetwork3d(): Viz3D {
  const D = {
    x: [-0.5, 1.5] as [number, number],
    y: [-0.5, 1.5] as [number, number],
  };
  const per = perceptron(XOR_X, XOR_Y, 20);
  const snaps = mlpTrain(XOR_X, XOR_Y, MLP_INIT, 1.0, [1, 100, 500, 3000]);
  const pts = (pred?: (q: Vec) => number): Scene3DPoint[] =>
    XOR_X.map((p, i) => ({
      id: `p${i}`,
      x: p[0],
      y: p[1],
      z: XOR_Y[i],
      cls: XOR_Y[i],
      ring: pred ? (pred(p) >= 0.5 ? 1 : 0) !== XOR_Y[i] : false,
    }));
  const perPred = (q: Vec) =>
    q[0] * per.w[0] + q[1] * per.w[1] + per.b > 0 ? 1 : 0;
  return {
    xLabel: "x₁",
    yLabel: "x₂",
    zLabel: "đầu ra",
    ...D,
    z: [0, 1],
    nx: N,
    ny: N,
    mode: "prob",
    note: "3D: độ cao là đầu ra của mạng. Perceptron chỉ tạo được một “bậc thềm” thẳng; MLP uốn mặt cong thành yên ngựa nâng hai góc lớp 1 lên và hạ hai góc lớp 0 xuống.",
    frames: [
      { points: pts() },
      {
        surface: sample(D.x, D.y, perPred),
        points: pts(perPred),
        planes: [{ z: 0.5, label: "0.5" }],
      },
      ...snaps.map((s) => {
        const pred = (q: Vec) => mlpForward(s.model, q).out;
        return {
          surface: sample(D.x, D.y, pred),
          points: pts(pred),
          planes: [{ z: 0.5, label: "0.5" }],
        };
      }),
    ],
  };
}

/* ───────────── k-NN: tỉ lệ phiếu đỗ ───────────── */

function knn3d(): Viz3D {
  const frac = (k: number) => (q: Vec) =>
    knnNeighbors(STUDY_X, q)
      .slice(0, k)
      .filter((n) => STUDY_Y[n.i] === 1).length / k;
  const base = (q?: number) => [
    ...studyPts(STUDY_X, STUDY_Y, () => 0),
    {
      id: "q",
      x: STUDY_QUERY[0],
      y: STUDY_QUERY[1],
      z: q ?? 0,
      kind: "query" as const,
    },
  ];
  const kFrame = (k: number): Scene3DFrame => ({
    surface: sample(STUDY.x, STUDY.y, frac(k), 40),
    planes: [{ z: 0.5, label: "đa số" }],
    points: base(frac(k)(STUDY_QUERY)),
  });
  return {
    xLabel: "giờ học",
    yLabel: "giờ ngủ",
    zLabel: "tỉ lệ phiếu đỗ",
    ...STUDY,
    z: [0, 1],
    nx: 40,
    ny: 40,
    mode: "prob",
    note: "3D: độ cao là tỉ lệ láng giềng thuộc lớp đỗ. k = 1 tạo các bậc nhảy 0/1 sắc cạnh quanh từng điểm; k càng lớn mặt càng có nhiều bậc trung gian, mượt hơn.",
    frames: [
      { points: base() },
      { points: base() },
      kFrame(1),
      kFrame(3),
      kFrame(5),
      kFrame(1),
      kFrame(5),
    ],
  };
}

/* ───────────── Naive Bayes: hai ngọn đồi Gauss ───────────── */

function naiveBayes3d(): Viz3D {
  const m = nbFit(STUDY_X, STUDY_Y);
  const dens = (c: number, q: Vec) =>
    m[c].prior *
    [0, 1].reduce(
      (p, j) =>
        (p * Math.exp(-((q[j] - m[c].mu[j]) ** 2) / (2 * m[c].v[j]))) /
        Math.sqrt(2 * Math.PI * m[c].v[j]),
      1,
    );
  // Chuẩn hoá để đỉnh cao nhất bằng 1
  const peak = Math.max(dens(0, m[0].mu), dens(1, m[1].mu));
  const hills = (classes: number[]): Scene3DFrame["surface"] =>
    sample(
      STUDY.x,
      STUDY.y,
      (q) => Math.max(...classes.map((c) => dens(c, q))) / peak,
    );
  const hillCls = (classes: number[]) =>
    sample(STUDY.x, STUDY.y, (q) =>
      classes.length === 1 ? classes[0] : dens(1, q) > dens(0, q) ? 1 : 0,
    ).map(Math.round);
  const pts = () => studyPts(STUDY_X, STUDY_Y, () => 0);
  return {
    xLabel: "giờ học",
    yLabel: "giờ ngủ",
    zLabel: "P(x | lớp)·P(lớp)",
    ...STUDY,
    z: [0, 1],
    nx: N,
    ny: N,
    mode: "prob",
    note: "3D: mỗi lớp là một ngọn đồi Gauss; đồi trải dài theo trục có σ lớn. Điểm mới thuộc về lớp có đồi cao hơn tại vị trí của nó — ranh giới là nơi hai sườn đồi giao nhau.",
    frames: [
      { points: pts() },
      { surface: hills([0]), surfaceCls: hillCls([0]), points: pts() },
      { surface: hills([0, 1]), surfaceCls: hillCls([0, 1]), points: pts() },
      {
        surface: hills([0, 1]),
        surfaceCls: hillCls([0, 1]),
        points: [
          ...pts(),
          {
            id: "q",
            x: STUDY_QUERY[0],
            y: STUDY_QUERY[1],
            z: r3(Math.max(dens(0, STUDY_QUERY), dens(1, STUDY_QUERY)) / peak),
            kind: "query",
          },
        ],
      },
      {
        surface: sample(STUDY.x, STUDY.y, (q) => nbProba(m, q)[1]),
        planes: [{ z: 0.5, label: "P = 0.5" }],
        points: studyPts(
          STUDY_X,
          STUDY_Y,
          (i) => STUDY_Y[i],
          (i) => (nbProba(m, STUDY_X[i])[1] >= 0.5 ? 1 : 0) !== STUDY_Y[i],
        ),
      },
    ],
  };
}

/* ───────────── Cây & rừng: mặt bậc thang ───────────── */

function terrace(predict: (q: Vec) => number) {
  return sample(STUDY.x, STUDY.y, predict, 48);
}

function decisionTree3d(): Viz3D {
  const tree = buildTree(STUDY_X, STUDY_Y, 2);
  const t1 = buildTree(STUDY_X, STUDY_Y, 1);
  if (typeof tree === "number") throw new Error("tree");
  const leftOnly: TreeNode = { ...tree, right: treePredict(t1, [9, 9]) };
  const pts = (node?: TreeNode) =>
    studyPts(
      STUDY_X,
      STUDY_Y,
      (i) => STUDY_Y[i],
      node ? (i) => treePredict(node, STUDY_X[i]) !== STUDY_Y[i] : undefined,
    );
  const f = (node: TreeNode): Scene3DFrame => ({
    surface: terrace((q) => treePredict(node, q)),
    points: pts(node),
  });
  return {
    xLabel: "giờ học",
    yLabel: "giờ ngủ",
    zLabel: "dự đoán",
    ...STUDY,
    z: [0, 1],
    nx: 48,
    ny: 48,
    mode: "class",
    note: "3D: cây chia mặt phẳng thành các khối chữ nhật; mỗi lá là một bậc thềm phẳng ở độ cao 0 (trượt) hoặc 1 (đỗ). Mỗi phép tách là một vách đứng song song với trục.",
    frames: [{ points: pts() }, f(t1), f(leftOnly), f(tree), f(tree)],
  };
}

function randomForest3d(): Viz3D {
  const trees = FOREST_BOOTSTRAPS.map((idx) =>
    buildTree(
      idx.map((i) => STUDY_X[i]),
      idx.map((i) => STUDY_Y[i]),
      2,
    ),
  );
  const vote = (q: Vec) =>
    trees.reduce<number>((s, t) => s + treePredict(t, q), 0) / trees.length;
  return {
    xLabel: "giờ học",
    yLabel: "giờ ngủ",
    zLabel: "tỉ lệ phiếu đỗ",
    ...STUDY,
    z: [0, 1],
    nx: 48,
    ny: 48,
    mode: "prob",
    note: "3D: mỗi cây là một mặt bậc thang 0/1 khác nhau. Khi bỏ phiếu, độ cao là tỉ lệ cây nói “đỗ” — các bậc trung gian 0.2, 0.4… cho thấy nơi các cây bất đồng.",
    frames: [
      ...trees.map((t) => ({
        surface: terrace((q) => treePredict(t, q)),
        points: studyPts(STUDY_X, STUDY_Y, (i) => STUDY_Y[i]),
      })),
      {
        surface: terrace(vote),
        planes: [{ z: 0.5, label: "đa số" }],
        points: [
          ...studyPts(
            STUDY_X,
            STUDY_Y,
            (i) => STUDY_Y[i],
            (i) => (vote(STUDY_X[i]) >= 0.5 ? 1 : 0) !== STUDY_Y[i],
          ),
          {
            id: "q",
            x: STUDY_QUERY[0],
            y: STUDY_QUERY[1],
            z: r3(vote(STUDY_QUERY)),
            kind: "query",
          },
        ],
      },
    ],
  };
}

/* ───────────── SVM: mặt phẳng quyết định ───────────── */

function svm3d(): Viz3D {
  const hist = svmTrain(
    STUDY_SEP_X,
    STUDY_SEP_Y,
    0.01,
    0.01,
    [50, 500, 5000, 100000],
  );
  const Z = 3;
  const clamp = (v: number) => Math.max(-Z, Math.min(Z, v));
  const pts = (w?: Vec, b = 0) =>
    STUDY_SEP_X.map((p, i) => {
      const f = w ? p[0] * w[0] + p[1] * w[1] + b : 0;
      const yy = STUDY_SEP_Y[i] ? 1 : -1;
      return {
        id: `p${i}`,
        x: p[0],
        y: p[1],
        z: r3(clamp(f)),
        cls: STUDY_SEP_Y[i],
        ring: w ? yy * f <= 1.05 : false,
      };
    });
  return {
    xLabel: "giờ học",
    yLabel: "giờ ngủ",
    zLabel: "f(x) = w·x + b",
    ...STUDY,
    z: [-Z, Z],
    nx: N,
    ny: N,
    mode: "decision",
    note: "3D: độ cao là giá trị hàm quyết định f(x) — một mặt phẳng nghiêng. Hai tấm mờ là lề f = ±1; vector hỗ trợ (có viền) nằm đúng trên tấm lề. Lề rộng ⇔ mặt phẳng ít dốc ⇔ ‖w‖ nhỏ.",
    frames: [
      { points: pts() },
      ...hist.map(({ w, b }) => ({
        surface: sample(STUDY.x, STUDY.y, (q) =>
          clamp(q[0] * w[0] + q[1] * w[1] + b),
        ),
        planes: [
          { z: -1, label: "f = −1" },
          { z: 1, label: "f = +1" },
        ],
        points: pts(w, b),
      })),
    ],
  };
}

const BUILDERS: Record<string, () => Viz3D> = {
  "gradient-descent": gradientDescent3d,
  "linear-regression": linearRegression3d,
  "logistic-regression": logistic3d,
  knn: knn3d,
  "naive-bayes": naiveBayes3d,
  "decision-tree": decisionTree3d,
  "random-forest": randomForest3d,
  svm: svm3d,
  "neural-network": neuralNetwork3d,
};

/** Cảnh 3D của bài, hoặc null nếu bài chỉ có dạng 2D (K-Means, PCA). */
export function buildViz3D(slug: string): Viz3D | null {
  return BUILDERS[slug]?.() ?? null;
}
