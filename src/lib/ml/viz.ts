/**
 * Copyright (c) 2026 vuvanthanhtb
 * SPDX-License-Identifier: MIT
 */

/**
 * Dựng các khung hình cho biểu đồ động của từng bài. Chạy lúc build (server):
 * trình duyệt chỉ nhận dữ liệu khung hình đã tính sẵn.
 */
import {
  buildTree,
  gdF,
  gdGrad,
  gdPath,
  kmeansSteps,
  knnNeighbors,
  knnPredict,
  linregExact,
  linregGD,
  logisticGD,
  logLoss,
  mlpForward,
  mlpTrain,
  mse,
  nbFit,
  nbProba,
  pca2,
  perceptron,
  sigmoid,
  svmTrain,
  treePredict,
  type TreeNode,
} from "./algorithms";
import {
  BLOBS,
  BLOBS_INIT,
  FOREST_BOOTSTRAPS,
  HOUSE_X,
  HOUSE_Y,
  MLP_INIT,
  PCA_X,
  STUDY_QUERY,
  STUDY_SEP_X,
  STUDY_SEP_Y,
  STUDY_X,
  STUDY_Y,
  type Vec,
  XOR_X,
  XOR_Y,
} from "./datasets";
import type { Viz, VizPoint, VizRegion, VizSegment } from "./types";

type Domain = { x: [number, number]; y: [number, number] };

const f = (n: number, d = 2) =>
  (Object.is(Math.round(n * 10 ** d), -0) ? 0 : n).toFixed(d);
const pct = (n: number) => `${(n * 100).toFixed(1)}%`;

const studyPoints = (
  X: Vec[],
  y: number[],
  extra?: (i: number) => Partial<VizPoint>,
): VizPoint[] =>
  X.map((p, i) => ({
    id: `p${i}`,
    x: p[0],
    y: p[1],
    cls: y[i],
    ...extra?.(i),
  }));

/** Lưới vùng quyết định: giá trị tại tâm mỗi ô (hàng 0 = trên cùng). */
function region(
  D: Domain,
  predict: (q: Vec) => number,
  mode: VizRegion["mode"],
  cols = 40,
  rows = 36,
): VizRegion {
  const values: number[] = [];
  for (let r = 0; r < rows; r++) {
    const y = D.y[1] - ((r + 0.5) / rows) * (D.y[1] - D.y[0]);
    for (let c = 0; c < cols; c++) {
      const x = D.x[0] + ((c + 0.5) / cols) * (D.x[1] - D.x[0]);
      const v = predict([x, y]);
      values.push(mode === "prob" ? Math.round(v * 100) / 100 : v);
    }
  }
  return { cols, rows, values, mode };
}

/** Giao đường thẳng w0·x + w1·y + b = c với khung miền — trả về đoạn thẳng hoặc null. */
function clipLine(w: Vec, b: number, D: Domain, c = 0): [Vec, Vec] | null {
  const pts: Vec[] = [];
  const add = (p: Vec) => {
    if (
      p[0] >= D.x[0] - 1e-9 &&
      p[0] <= D.x[1] + 1e-9 &&
      p[1] >= D.y[0] - 1e-9 &&
      p[1] <= D.y[1] + 1e-9
    )
      if (!pts.some((q) => Math.hypot(q[0] - p[0], q[1] - p[1]) < 1e-6))
        pts.push(p);
  };
  if (Math.abs(w[1]) > 1e-12)
    for (const x of D.x) add([x, (c - b - w[0] * x) / w[1]]);
  if (Math.abs(w[0]) > 1e-12)
    for (const y of D.y) add([(c - b - w[1] * y) / w[0], y]);
  if (pts.length < 2) return null;
  pts.sort((a, z) => a[0] - z[0] || a[1] - z[1]);
  return [pts[0], pts[pts.length - 1]];
}

const seg = (
  id: string,
  line: [Vec, Vec] | null,
  kind: VizSegment["kind"],
): VizSegment[] =>
  line
    ? [
        {
          id,
          x1: line[0][0],
          y1: line[0][1],
          x2: line[1][0],
          y2: line[1][1],
          kind,
        },
      ]
    : [];

const STUDY: Domain = { x: [0, 10], y: [0, 9] };
const STUDY_AXES = {
  xLabel: "giờ học",
  yLabel: "giờ ngủ",
  x: STUDY.x,
  y: STUDY.y,
  classNames: ["trượt", "đỗ"],
};

/* ───────────────────────── 1. Gradient Descent ───────────────────────── */

function gradientDescent(): Viz {
  const D: Domain = { x: [-4, 10], y: [0, 60] };
  const curve: [number, number][] = [];
  for (let w = D.x[0]; w <= D.x[1] + 1e-9; w += 0.25) curve.push([w, gdF(w)]);
  const good = gdPath(-1, 0.2, 8);
  const bad = gdPath(-1, 1.05, 5);
  const tangent = (w: number): VizSegment => {
    const s = gdGrad(w);
    const dx = 1.6 / Math.sqrt(1 + (s / 6) ** 2);
    return {
      id: "tan",
      x1: w - dx,
      y1: gdF(w) - s * dx,
      x2: w + dx,
      y2: gdF(w) + s * dx,
      kind: "tangent",
    };
  };
  const frame = (
    path: number[],
    upto: number,
    title: string,
    text: string,
    lr: number,
  ) => {
    const w = path[upto];
    return {
      title,
      text,
      curve,
      points: [
        ...path.slice(0, upto).map((v, i) => ({
          id: `t${i}`,
          x: v,
          y: gdF(v),
          kind: "trail" as const,
        })),
        { id: "ball", x: w, y: gdF(w), kind: "ball" as const },
      ],
      segments: [
        tangent(w),
        ...path.slice(0, upto).map((v, i) => ({
          id: `jump${i}`,
          x1: v,
          y1: gdF(v),
          x2: path[i + 1],
          y2: gdF(path[i + 1]),
          kind: "projection" as const,
        })),
      ],
      metrics: [
        { label: "lr", value: String(lr) },
        { label: "w", value: f(w) },
        { label: "f(w)", value: f(gdF(w), 3) },
        { label: "f′(w)", value: f(gdGrad(w)) },
      ],
      series: { label: "f(w)", values: path.map(gdF), current: upto },
    };
  };
  return {
    xLabel: "tham số w",
    yLabel: "mất mát f(w)",
    ...D,
    classNames: [],
    seriesAt: "br",
    frames: [
      frame(
        good,
        0,
        "Điểm xuất phát",
        "Bắt đầu tại `w = -1`. Đạo hàm `f′(-1) = -8` âm: đi sang phải thì mất mát giảm.",
        0.2,
      ),
      frame(
        good,
        1,
        "Bước đầu tiên",
        "`w ← w − lr·f′(w) = -1 − 0.2·(-8) = 0.6`. Bước đi tỉ lệ với độ dốc.",
        0.2,
      ),
      frame(
        good,
        3,
        "Càng gần đáy, bước càng ngắn",
        "Độ dốc nhỏ dần nên bước cũng nhỏ dần — không cần tự giảm learning rate.",
        0.2,
      ),
      frame(
        good,
        8,
        "Hội tụ",
        `Sau 8 bước: \`w = ${f(good[8])}\`, rất gần cực tiểu \`w* = 3\`.`,
        0.2,
      ),
      frame(
        bad,
        5,
        "Learning rate quá lớn",
        "Với `lr = 1.05` mỗi bước vượt qua đáy và rơi xa hơn — thuật toán phân kỳ.",
        1.05,
      ),
    ],
  };
}

/* ───────────────────────── 2. Hồi quy tuyến tính ───────────────────────── */

function linearRegression(): Viz {
  const D: Domain = { x: [2, 12], y: [4, 20] };
  const pts: VizPoint[] = HOUSE_X.map((x, i) => ({
    id: `p${i}`,
    x,
    y: HOUSE_Y[i],
  }));
  const exact = linregExact(HOUSE_X, HOUSE_Y);
  const gd = linregGD(HOUSE_X, HOUSE_Y, 0.01, [1, 10, 100, 2000]);
  const meanY = HOUSE_Y.reduce((s, v) => s + v, 0) / HOUSE_Y.length;
  const states = [
    { w: 0, b: meanY, label: "trung bình" },
    ...gd.map((g) => ({ w: g.w, b: g.b, label: `epoch ${g.epoch}` })),
    { w: exact.w, b: exact.b, label: "tối ưu" },
  ];
  const mses = states.map((s) => mse(HOUSE_X, HOUSE_Y, s.w, s.b));
  const frame = (k: number, title: string, text: string) => {
    const { w, b } = states[k];
    return {
      title,
      text,
      points:
        k === states.length - 1
          ? [
              ...pts,
              { id: "q", x: 7.5, y: w * 7.5 + b, kind: "query" as const },
            ]
          : pts,
      segments: [
        ...seg("model", clipLine([w, -1], b, D), "model"),
        ...HOUSE_X.map((x, i) => ({
          id: `r${i}`,
          x1: x,
          y1: HOUSE_Y[i],
          x2: x,
          y2: w * x + b,
          kind: "residual" as const,
        })),
      ],
      metrics: [
        { label: "w", value: f(w, 3) },
        { label: "b", value: f(b, 3) },
        { label: "MSE", value: f(mses[k], 3) },
      ],
      series: { label: "MSE", values: mses, current: k },
    };
  };
  const r2 =
    1 -
    (mses[5] * HOUSE_Y.length) /
      HOUSE_Y.reduce((s, v) => s + (v - meanY) ** 2, 0);
  return {
    xLabel: "diện tích (chục m²)",
    yLabel: "giá (trăm triệu)",
    ...D,
    classNames: [],
    seriesAt: "br",
    frames: [
      frame(
        0,
        "Mô hình ngây thơ",
        "Dự đoán mọi căn nhà bằng giá trung bình. Các đoạn thẳng đứng là **phần dư** — sai số của từng điểm.",
      ),
      frame(
        1,
        "Gradient Descent — epoch 1",
        "Bắt đầu từ `w = b = 0`, một bước GD đã xoay đường thẳng lên gần đúng hướng.",
      ),
      frame(
        2,
        "Epoch 10",
        "MSE giảm mạnh. Hệ số chặn `b` học chậm hơn `w` vì `x` có giá trị lớn.",
      ),
      frame(
        3,
        "Epoch 100",
        "Đường thẳng gần như đã khớp; phần còn lại là tinh chỉnh `b`.",
      ),
      frame(4, "Epoch 2000", "GD tiến rất sát nghiệm tối ưu."),
      frame(
        5,
        "Nghiệm tối ưu",
        `Phương trình chuẩn cho ngay \`y = ${f(exact.w, 3)}·x + ${f(exact.b, 3)}\`, R² = ${f(r2, 4)}. Nhà 75 m² ≈ ${f(exact.w * 7.5 + exact.b)} trăm triệu.`,
      ),
    ],
  };
}

/* ───────────────────────── 3. Hồi quy logistic ───────────────────────── */

function logisticRegression(): Viz {
  const hist = logisticGD(
    STUDY_X,
    STUDY_Y,
    0.05,
    1 / 24,
    [10, 100, 1000, 20000],
  );
  const losses = hist.map((h) => logLoss(STUDY_X, STUDY_Y, h.w, h.b));
  const frame = (k: number, title: string, text: string, query = false) => {
    const { w, b } = hist[k];
    const prob = (q: Vec) => sigmoid(q[0] * w[0] + q[1] * w[1] + b);
    const acc =
      STUDY_X.filter((p, i) => (prob(p) >= 0.5 ? 1 : 0) === STUDY_Y[i]).length /
      24;
    return {
      title,
      text,
      region: region(STUDY, prob, "prob"),
      points: [
        ...studyPoints(STUDY_X, STUDY_Y, (i) => ({
          ring: k > 0 && (prob(STUDY_X[i]) >= 0.5 ? 1 : 0) !== STUDY_Y[i],
        })),
        ...(query ? [{ id: "q", x: 5, y: 5, kind: "query" as const }] : []),
      ],
      segments: k > 0 ? seg("model", clipLine(w, b, STUDY), "model") : [],
      metrics: [
        { label: "epoch", value: String(hist[k].epoch) },
        { label: "log-loss", value: f(losses[k], 4) },
        { label: "accuracy", value: pct(acc) },
        ...(query
          ? [{ label: "P(đỗ | 5h, 5h)", value: f(prob([5, 5]), 3) }]
          : []),
      ],
      series: { label: "log-loss", values: losses, current: k },
    };
  };
  return {
    ...STUDY_AXES,
    frames: [
      frame(
        0,
        "Khởi tạo",
        "`w = 0, b = 0` nên mọi điểm đều có `P(đỗ) = σ(0) = 0.5` — mô hình chưa biết gì.",
      ),
      frame(
        1,
        "Epoch 10",
        "Màu nền là xác suất đỗ: cam đậm = gần 1, tím đậm = gần 0. Đường thẳng là nơi `P = 0.5`.",
      ),
      frame(2, "Epoch 100", "Ranh giới xoay dần để giảm log-loss."),
      frame(3, "Epoch 1000", "Các điểm có viền là điểm đang bị phân loại sai."),
      frame(
        4,
        "Hội tụ",
        "Dữ liệu chồng lấn nên không đường thẳng nào đúng 100%. Xác suất ở vùng giữa phản ánh đúng sự không chắc chắn đó.",
        true,
      ),
    ],
  };
}

/* ───────────────────────── 4. k-NN ───────────────────────── */

function knn(): Viz {
  const q = STUDY_QUERY;
  const nn = knnNeighbors(STUDY_X, q);
  const base = studyPoints(STUDY_X, STUDY_Y);
  const queryPt = (cls?: number): VizPoint => ({
    id: "q",
    x: q[0],
    y: q[1],
    kind: "query",
    cls,
  });
  const kFrame = (k: number) => {
    const ids = new Set(nn.slice(0, k).map((n) => n.i));
    const pred = knnPredict(STUDY_X, STUDY_Y, q, k);
    const votes = [0, 0];
    nn.slice(0, k).forEach((n) => votes[STUDY_Y[n.i]]++);
    return {
      title: `k = ${k}`,
      text:
        k === 1
          ? "Láng giềng gần nhất là một **điểm nhiễu** thuộc lớp đỗ → k = 1 dự đoán đỗ. k nhỏ rất nhạy với nhiễu."
          : `${votes[0]} phiếu trượt, ${votes[1]} phiếu đỗ → dự đoán **${pred ? "đỗ" : "trượt"}**.`,
      points: [
        ...base.map((p, i) => ({ ...p, ring: ids.has(i), dim: !ids.has(i) })),
        queryPt(pred),
      ],
      circles: [{ id: "radius", cx: q[0], cy: q[1], r: nn[k - 1].d }],
      segments: nn.slice(0, k).map((n) => ({
        id: `d${n.i}`,
        x1: q[0],
        y1: q[1],
        x2: STUDY_X[n.i][0],
        y2: STUDY_X[n.i][1],
        kind: "distance" as const,
      })),
      metrics: [
        { label: "k", value: String(k) },
        { label: "bán kính", value: f(nn[k - 1].d) },
        { label: "phiếu", value: `${votes[0]} trượt · ${votes[1]} đỗ` },
        { label: "dự đoán", value: pred ? "đỗ" : "trượt" },
      ],
    };
  };
  const regionFrame = (k: number, text: string) => ({
    title: `Vùng quyết định k = ${k}`,
    text,
    region: region(STUDY, (p) => knnPredict(STUDY_X, STUDY_Y, p, k), "class"),
    points: [...base, queryPt(knnPredict(STUDY_X, STUDY_Y, q, k))],
    metrics: [
      { label: "k", value: String(k) },
      {
        label: "accuracy (train)",
        value: pct(
          STUDY_X.filter(
            (p, i) => knnPredict(STUDY_X, STUDY_Y, p, k) === STUDY_Y[i],
          ).length / 24,
        ),
      },
    ],
  });
  return {
    ...STUDY_AXES,
    frames: [
      {
        title: "Điểm cần dự đoán",
        text: "Một học sinh học 4h15, ngủ 4h30 — đỗ hay trượt? k-NN không huấn luyện gì, chỉ nhìn các điểm xung quanh.",
        points: [...base, queryPt()],
        metrics: [{ label: "điểm hỏi", value: "(4.25, 4.5)" }],
      },
      {
        title: "Tính khoảng cách",
        text: "Đo khoảng cách Euclid từ điểm hỏi tới **mọi** điểm huấn luyện rồi sắp xếp tăng dần.",
        points: [...base, queryPt()],
        segments: STUDY_X.map((p, i) => ({
          id: `d${i}`,
          x1: q[0],
          y1: q[1],
          x2: p[0],
          y2: p[1],
          kind: "distance" as const,
        })),
        metrics: nn.slice(0, 3).map((n, r) => ({
          label: `gần thứ ${r + 1}`,
          value: `#${n.i} · ${f(n.d)}`,
        })),
      },
      kFrame(1),
      kFrame(3),
      kFrame(5),
      regionFrame(
        1,
        "Với k = 1, ranh giới uốn lượn quanh từng điểm nhiễu — **overfitting**. Accuracy trên tập train luôn 100%.",
      ),
      regionFrame(
        5,
        "k = 5 làm ranh giới mượt hơn, bỏ qua nhiễu — đánh đổi một chút độ chính xác trên tập train.",
      ),
    ],
  };
}

/* ───────────────────────── 5. Naive Bayes ───────────────────────── */

function naiveBayes(): Viz {
  const model = nbFit(STUDY_X, STUDY_Y);
  const base = studyPoints(STUDY_X, STUDY_Y);
  const ell = (c: number, s: number) => ({
    id: `e${c}-${s}`,
    cx: model[c].mu[0],
    cy: model[c].mu[1],
    rx: s * Math.sqrt(model[c].v[0]),
    ry: s * Math.sqrt(model[c].v[1]),
    cls: c,
  });
  const stats = (c: number) => [
    {
      label: `μ lớp ${c}`,
      value: `(${f(model[c].mu[0])}, ${f(model[c].mu[1])})`,
    },
    {
      label: `σ lớp ${c}`,
      value: `(${f(Math.sqrt(model[c].v[0]))}, ${f(Math.sqrt(model[c].v[1]))})`,
    },
  ];
  const post = nbProba(model, STUDY_QUERY);
  const cent = (c: number) => ({
    id: `mu${c}`,
    x: model[c].mu[0],
    y: model[c].mu[1],
    cls: c,
  });
  return {
    ...STUDY_AXES,
    frames: [
      {
        title: "Dữ liệu",
        text: "Naive Bayes học **phân phối** của từng lớp thay vì học một đường ranh giới.",
        points: base,
        metrics: [{ label: "P(trượt) = P(đỗ)", value: "0.5" }],
      },
      {
        title: "Phân phối lớp trượt",
        text: "Giả định Gauss độc lập theo từng trục: chỉ cần trung bình μ và độ lệch σ của mỗi đặc trưng. Hai elip là 1σ và 2σ.",
        points: base.map((p) => ({ ...p, dim: p.cls !== 0 })),
        ellipses: [ell(0, 1), ell(0, 2)],
        centroids: [cent(0)],
        metrics: stats(0),
      },
      {
        title: "Phân phối lớp đỗ",
        text: "Elip **song song với trục** vì giả định “naive”: giờ học và giờ ngủ độc lập khi đã biết lớp.",
        points: base,
        ellipses: [ell(0, 1), ell(0, 2), ell(1, 1), ell(1, 2)],
        centroids: [cent(0), cent(1)],
        metrics: [...stats(0), ...stats(1)],
      },
      {
        title: "Áp dụng định lý Bayes",
        text: `Nhân prior với likelihood của từng trục rồi chuẩn hoá: P(trượt) = ${f(post[0], 3)}, P(đỗ) = ${f(post[1], 3)} → dự đoán **trượt**.`,
        points: [
          ...base,
          {
            id: "q",
            x: STUDY_QUERY[0],
            y: STUDY_QUERY[1],
            kind: "query",
            cls: post[1] > 0.5 ? 1 : 0,
          },
        ],
        ellipses: [ell(0, 1), ell(0, 2), ell(1, 1), ell(1, 2)],
        centroids: [cent(0), cent(1)],
        metrics: [
          { label: "P(trượt | x)", value: f(post[0], 3) },
          { label: "P(đỗ | x)", value: f(post[1], 3) },
        ],
      },
      {
        title: "Vùng quyết định",
        text: "Ranh giới là một **đường cong bậc hai** vì hai lớp có phương sai khác nhau.",
        region: region(STUDY, (p) => nbProba(model, p)[1], "prob"),
        points: base.map((p, i) => ({
          ...p,
          ring: (nbProba(model, STUDY_X[i])[1] >= 0.5 ? 1 : 0) !== STUDY_Y[i],
        })),
        centroids: [cent(0), cent(1)],
        metrics: [
          {
            label: "accuracy",
            value: pct(
              STUDY_X.filter(
                (p, i) => (nbProba(model, p)[1] >= 0.5 ? 1 : 0) === STUDY_Y[i],
              ).length / 24,
            ),
          },
        ],
      },
    ],
  };
}

/* ───────────────────────── 6. Cây quyết định ───────────────────────── */

const FEATURE = ["giờ học", "giờ ngủ"];

/** Các đường tách của cây, giới hạn trong ô chữ nhật của nút. */
function treeSplits(
  node: TreeNode,
  box: Domain,
  maxDepth: number,
  prefix = "s",
  depth = 0,
): VizSegment[] {
  if (typeof node === "number" || depth >= maxDepth) return [];
  const s: VizSegment =
    node.f === 0
      ? {
          id: prefix,
          x1: node.t,
          y1: box.y[0],
          x2: node.t,
          y2: box.y[1],
          kind: "split",
        }
      : {
          id: prefix,
          x1: box.x[0],
          y1: node.t,
          x2: box.x[1],
          y2: node.t,
          kind: "split",
        };
  const lb: Domain =
    node.f === 0
      ? { x: [box.x[0], node.t], y: box.y }
      : { x: box.x, y: [box.y[0], node.t] };
  const rb: Domain =
    node.f === 0
      ? { x: [node.t, box.x[1]], y: box.y }
      : { x: box.x, y: [node.t, box.y[1]] };
  return [
    s,
    ...treeSplits(node.left, lb, maxDepth, `${prefix}L`, depth + 1),
    ...treeSplits(node.right, rb, maxDepth, `${prefix}R`, depth + 1),
  ];
}

const accuracy = (pred: (p: Vec) => number, X: Vec[], y: number[]) =>
  X.filter((p, i) => pred(p) === y[i]).length / y.length;

function decisionTree(): Viz {
  const tree = buildTree(STUDY_X, STUDY_Y, 2);
  const t1 = buildTree(STUDY_X, STUDY_Y, 1);
  if (
    typeof tree === "number" ||
    typeof tree.left === "number" ||
    typeof tree.right === "number"
  )
    throw new Error("tree");
  const pts = studyPoints(STUDY_X, STUDY_Y);
  const stage = (node: TreeNode, splitsDepth: number, ring = false) => ({
    region: region(STUDY, (p) => treePredict(node, p), "class"),
    segments: treeSplits(tree, STUDY, splitsDepth),
    points: pts.map((p, i) => ({
      ...p,
      ring: ring && treePredict(node, STUDY_X[i]) !== STUDY_Y[i],
    })),
  });
  // Cây trung gian: gốc + chỉ tách nhánh trái
  const leftOnly: TreeNode = { ...tree, right: treePredict(t1, [9, 9]) };
  return {
    ...STUDY_AXES,
    frames: [
      {
        title: "Nút gốc",
        text: "12 trượt, 12 đỗ → độ vẩn đục Gini = 1 − (0.5² + 0.5²) = **0.5**, mức hỗn loạn cao nhất.",
        points: pts,
        metrics: [{ label: "Gini", value: "0.500" }],
      },
      {
        title: `Tách 1: ${FEATURE[tree.f]} ≤ ${tree.t}`,
        text: "Thử **mọi** ngưỡng trên **mọi** đặc trưng, chọn phép tách làm Gini có trọng số giảm nhiều nhất.",
        ...stage(t1, 1),
        metrics: [
          { label: "Gini", value: `${f(tree.gini, 3)} → ${f(tree.after, 3)}` },
          {
            label: "accuracy",
            value: pct(accuracy((p) => treePredict(t1, p), STUDY_X, STUDY_Y)),
          },
        ],
      },
      {
        title: `Tách 2 (nhánh trái): ${FEATURE[tree.left.f]} ≤ ${tree.left.t}`,
        text: "Gini giảm nhưng **cả hai lá vẫn dự đoán trượt** — phép tách này không đổi kết quả. Cây tham lam chỉ nhìn Gini, không nhìn accuracy.",
        ...stage(leftOnly, 2),
        segments: treeSplits(tree, STUDY, 2).filter((s) => s.id !== "sR"),
        metrics: [
          {
            label: "Gini (trái)",
            value: `${f(tree.left.gini, 3)} → ${f(tree.left.after, 3)}`,
          },
        ],
      },
      {
        title: `Tách 3 (nhánh phải): ${FEATURE[tree.right.f]} ≤ ${tree.right.t}`,
        text: "Bên phải: học nhiều nhưng ngủ quá ít vẫn trượt.",
        ...stage(tree, 2),
        metrics: [
          {
            label: "Gini (phải)",
            value: `${f(tree.right.gini, 3)} → ${f(tree.right.after, 3)}`,
          },
        ],
      },
      {
        title: "Cây độ sâu 2",
        text: "Ranh giới luôn là các đoạn **song song với trục**. Điểm có viền là điểm bị phân loại sai.",
        ...stage(tree, 2, true),
        metrics: [
          {
            label: "accuracy",
            value: pct(accuracy((p) => treePredict(tree, p), STUDY_X, STUDY_Y)),
          },
        ],
      },
    ],
  };
}

/* ───────────────────────── 7. Random Forest ───────────────────────── */

function randomForest(): Viz {
  const trees = FOREST_BOOTSTRAPS.map((idx) =>
    buildTree(
      idx.map((i) => STUDY_X[i]),
      idx.map((i) => STUDY_Y[i]),
      2,
    ),
  );
  const pts = studyPoints(STUDY_X, STUDY_Y);
  const forest = (p: Vec) =>
    trees.reduce<number>((s, t) => s + treePredict(t, p), 0) / trees.length >=
    0.5
      ? 1
      : 0;
  const treeFrame = (k: number) => {
    const counts = new Map<number, number>();
    FOREST_BOOTSTRAPS[k].forEach((i) =>
      counts.set(i, (counts.get(i) ?? 0) + 1),
    );
    const root = trees[k];
    return {
      title: `Cây ${k + 1}${typeof root !== "number" ? `: gốc ${FEATURE[root.f]} ≤ ${root.t}` : ""}`,
      text:
        k === 0
          ? `Lấy 24 mẫu **có hoàn lại**: có điểm bị lấy nhiều lần, ${24 - counts.size} điểm không được chọn (mờ). Mỗi cây thấy một phiên bản dữ liệu khác nhau.`
          : "Bootstrap khác → cây khác: gốc tách khác, ranh giới khác.",
      region: region(STUDY, (p) => treePredict(root, p), "class", 30, 27),
      segments: treeSplits(root, STUDY, 2, `t${k}`),
      points: pts.map((p, i) => ({
        ...p,
        dim: !counts.has(i),
        r: 4 + Math.min(3, (counts.get(i) ?? 0) - 1) * 1.5,
      })),
      metrics: [
        { label: "mẫu khác nhau", value: `${counts.size}/24` },
        {
          label: "accuracy cây",
          value: pct(accuracy((p) => treePredict(root, p), STUDY_X, STUDY_Y)),
        },
      ],
    };
  };
  const votes = trees.map((t) => treePredict(t, STUDY_QUERY));
  return {
    ...STUDY_AXES,
    frames: [
      ...trees.map((_, k) => treeFrame(k)),
      {
        title: "Bỏ phiếu đa số",
        text: `Mỗi cây yếu (71–83%), nhưng lỗi của chúng **không trùng nhau** nên bỏ phiếu cho kết quả tốt hơn hẳn. Điểm hỏi nhận phiếu [${votes.join(", ")}] → trượt.`,
        region: region(STUDY, forest, "class"),
        points: [
          ...pts.map((p, i) => ({
            ...p,
            ring: forest(STUDY_X[i]) !== STUDY_Y[i],
          })),
          {
            id: "q",
            x: STUDY_QUERY[0],
            y: STUDY_QUERY[1],
            kind: "query",
            cls: forest(STUDY_QUERY),
          },
        ],
        metrics: [
          {
            label: "accuracy rừng",
            value: pct(accuracy(forest, STUDY_X, STUDY_Y)),
          },
          { label: "phiếu điểm hỏi", value: votes.join(" · ") },
        ],
      },
    ],
  };
}

/* ───────────────────────── 8. SVM ───────────────────────── */

function svm(): Viz {
  const hist = svmTrain(
    STUDY_SEP_X,
    STUDY_SEP_Y,
    0.01,
    0.01,
    [50, 500, 5000, 100000],
  );
  const ypm = STUDY_SEP_Y.map((v) => (v ? 1 : -1));
  const pts = studyPoints(STUDY_SEP_X, STUDY_SEP_Y);
  const frame = (k: number, title: string, text: string, final = false) => {
    const { w, b } = hist[k];
    const margins = STUDY_SEP_X.map(
      (p, i) => ypm[i] * (p[0] * w[0] + p[1] * w[1] + b),
    );
    return {
      title,
      text,
      points: pts.map((p, i) => ({
        ...p,
        ring: final ? margins[i] <= 1.05 : margins[i] < 1,
      })),
      segments: [
        ...seg("model", clipLine(w, b, STUDY), "model"),
        ...seg("m+", clipLine(w, b, STUDY, 1), "margin"),
        ...seg("m-", clipLine(w, b, STUDY, -1), "margin"),
      ],
      metrics: [
        { label: "epoch", value: hist[k].epoch.toLocaleString("vi-VN") },
        { label: "độ rộng lề", value: f(2 / Math.hypot(w[0], w[1]), 3) },
        {
          label: final ? "vector hỗ trợ" : "điểm trong lề",
          value: String(
            margins.filter((m) => (final ? m <= 1.05 : m < 1)).length,
          ),
        },
      ],
    };
  };
  return {
    ...STUDY_AXES,
    frames: [
      {
        title: "Nhiều đường đều tách được",
        text: "Dữ liệu tách được tuyến tính: có vô số đường thẳng phân loại đúng 100%. Đường nào **an toàn nhất** với dữ liệu mới?",
        points: pts,
        segments: [
          ...seg("c1", clipLine([1, 1], -9.2, STUDY), "candidate"),
          ...seg("c2", clipLine([1, 0.35], -6.1, STUDY), "candidate"),
          ...seg("c3", clipLine([0.3, 1], -6.3, STUDY), "candidate"),
        ],
        metrics: [{ label: "accuracy", value: "100% (cả 3 đường)" }],
      },
      frame(
        0,
        "Lề cực đại",
        "SVM chọn đường có **lề** (khoảng trống giữa hai nét đứt) rộng nhất. Điểm có viền đang nằm trong lề và bị phạt hinge loss.",
      ),
      frame(
        1,
        "Epoch 500",
        "Subgradient đẩy ranh giới ra xa các điểm vi phạm lề.",
      ),
      frame(2, "Epoch 5.000", "Lề rộng dần; chỉ còn vài điểm sát lề."),
      frame(
        3,
        "Vector hỗ trợ",
        "Chỉ **3 điểm** nằm trên lề quyết định vị trí ranh giới. Xoá các điểm còn lại, kết quả không đổi.",
        true,
      ),
    ],
  };
}

/* ───────────────────────── 9. Neural Network ───────────────────────── */

function neuralNetwork(): Viz {
  const D: Domain = { x: [-0.5, 1.5], y: [-0.5, 1.5] };
  const pts: VizPoint[] = XOR_X.map((p, i) => ({
    id: `p${i}`,
    x: p[0],
    y: p[1],
    cls: XOR_Y[i],
    r: 9,
  }));
  const per = perceptron(XOR_X, XOR_Y, 20);
  const snaps = mlpTrain(XOR_X, XOR_Y, MLP_INIT, 1.0, [1, 100, 500, 3000]);
  const losses = snaps.map((s) => s.loss);
  const mlpFrame = (k: number, title: string, text: string) => {
    const m = snaps[k].model;
    const pred = (q: Vec) => mlpForward(m, q).out;
    return {
      title,
      text,
      region: region(D, pred, "prob", 32, 32),
      points: pts.map((p, i) => ({
        ...p,
        ring: (pred(XOR_X[i]) >= 0.5 ? 1 : 0) !== XOR_Y[i],
      })),
      metrics: [
        { label: "epoch", value: String(snaps[k].epoch) },
        { label: "loss", value: f(snaps[k].loss, 4) },
        { label: "dự đoán", value: XOR_X.map((q) => f(pred(q))).join(" · ") },
      ],
      series: { label: "loss", values: losses, current: k },
    };
  };
  return {
    xLabel: "x₁",
    yLabel: "x₂",
    ...D,
    classNames: ["0", "1"],
    frames: [
      {
        title: "Bài toán XOR",
        text: "Đầu ra là 1 khi đúng **một** trong hai đầu vào bằng 1. Hai lớp nằm chéo nhau.",
        points: pts,
        metrics: [{ label: "mẫu", value: "4" }],
      },
      {
        title: "Perceptron thất bại",
        text: "Perceptron chỉ vẽ được **một đường thẳng** — không đường thẳng nào tách được XOR. Sau 20 epoch accuracy vẫn 50%.",
        region: region(
          D,
          (q) => (q[0] * per.w[0] + q[1] * per.w[1] + per.b > 0 ? 1 : 0),
          "class",
          32,
          32,
        ),
        points: pts.map((p, i) => ({
          ...p,
          ring:
            (XOR_X[i][0] * per.w[0] + XOR_X[i][1] * per.w[1] + per.b > 0
              ? 1
              : 0) !== XOR_Y[i],
        })),
        metrics: [{ label: "accuracy", value: "50%" }],
      },
      mlpFrame(
        0,
        "MLP 2 → 3 → 1: khởi tạo",
        "Thêm một **lớp ẩn** 3 nơ-ron tanh. Trọng số khởi tạo nhỏ nên mọi dự đoán ≈ 0.5.",
      ),
      mlpFrame(
        1,
        "Epoch 100: cao nguyên",
        "Loss gần như đứng yên ở 0.693 — gradient rất nhỏ ở vùng đối xứng. Hiện tượng hay gặp khi huấn luyện mạng.",
      ),
      mlpFrame(
        2,
        "Epoch 500: thoát cao nguyên",
        "Lan truyền ngược phá thế đối xứng; lớp ẩn học được hai “nếp gấp” — ranh giới **phi tuyến**.",
      ),
      mlpFrame(3, "Epoch 3000", "Cả 4 điểm đều đúng với độ tự tin rất cao."),
    ],
  };
}

/* ───────────────────────── 10. K-Means ───────────────────────── */

function kMeans(): Viz {
  const init = BLOBS_INIT.map((i) => BLOBS[i]);
  const steps = kmeansSteps(BLOBS, init);
  const pts = (labels?: number[]): VizPoint[] =>
    BLOBS.map((p, i) => ({ id: `p${i}`, x: p[0], y: p[1], cls: labels?.[i] }));
  const cents = (c: Vec[]) =>
    c.map((p, k) => ({ id: `c${k}`, x: p[0], y: p[1], cls: k }));
  const inertias = steps.map((s) => s.inertia);
  const last = steps[steps.length - 1];
  const sizes = [0, 1, 2].map((k) => last.labels.filter((l) => l === k).length);
  const assign = (k: number, title: string, text: string) => ({
    title,
    text,
    points: pts(steps[k].labels),
    centroids: cents(steps[k].before),
    metrics: [
      { label: "vòng", value: String(steps[k].iter) },
      { label: "inertia", value: f(steps[k].inertia, 3) },
    ],
    series: { label: "inertia", values: inertias, current: k },
  });
  const update = (k: number, title: string, text: string) => ({
    ...assign(k, title, text),
    centroids: cents(steps[k].after),
  });
  return {
    xLabel: "đặc trưng 1",
    yLabel: "đặc trưng 2",
    x: [0, 9],
    y: [0, 9],
    classNames: ["cụm 1", "cụm 2", "cụm 3"],
    frames: [
      {
        title: "Khởi tạo 3 tâm",
        text: "Dữ liệu **không có nhãn**. Chọn k = 3 điểm làm tâm ban đầu — ở đây cố ý chọn 2 tâm cùng cụm trên.",
        points: pts(),
        centroids: cents(init),
        metrics: [{ label: "k", value: "3" }],
      },
      assign(
        0,
        "Vòng 1 — gán",
        "Mỗi điểm thuộc về tâm **gần nhất**. Cụm trái-dưới bị gộp chung vì chưa có tâm nào ở đó.",
      ),
      update(
        0,
        "Vòng 1 — cập nhật",
        "Mỗi tâm dời về **trung bình** các điểm của nó.",
      ),
      update(
        1,
        "Vòng 2",
        "Gán lại rồi cập nhật lại — inertia (tổng bình phương khoảng cách) giảm sau mỗi vòng.",
      ),
      update(3, "Vòng 4", "Một tâm “trượt” dần xuống cụm trái-dưới."),
      update(
        steps.length - 1,
        `Hội tụ sau ${last.iter} vòng`,
        `Các tâm không còn di chuyển. Ba cụm ${sizes.join(" · ")} điểm, inertia ${f(last.inertia, 3)} — bằng đúng kết quả sklearn.`,
      ),
    ],
  };
}

/* ───────────────────────── 11. PCA ───────────────────────── */

function pca(): Viz {
  const { mu, values, v1, v2 } = pca2(PCA_X);
  const ratio = values[0] / (values[0] + values[1]);
  const pts: VizPoint[] = PCA_X.map((p, i) => ({
    id: `p${i}`,
    x: p[0],
    y: p[1],
  }));
  const proj = PCA_X.map((p) => {
    const t = (p[0] - mu[0]) * v1[0] + (p[1] - mu[1]) * v1[1];
    return [mu[0] + t * v1[0], mu[1] + t * v1[1]] as Vec;
  });
  const axes: VizSegment[] = [
    { id: "ax", x1: 0, y1: mu[1], x2: 10, y2: mu[1], kind: "axis" },
    { id: "ay", x1: mu[0], y1: 0, x2: mu[0], y2: 8, kind: "axis" },
  ];
  const s1 = 2 * Math.sqrt(values[0]);
  const s2 = 2 * Math.sqrt(values[1]) + 0.6;
  const arrows = [
    {
      id: "pc1",
      x1: mu[0],
      y1: mu[1],
      x2: mu[0] + s1 * v1[0],
      y2: mu[1] + s1 * v1[1],
      label: "PC1",
    },
    {
      id: "pc2",
      x1: mu[0],
      y1: mu[1],
      x2: mu[0] + s2 * v2[0],
      y2: mu[1] + s2 * v2[1],
      label: "PC2",
    },
  ];
  const pcLine = seg(
    "pcline",
    clipLine([v1[1], -v1[0]], -(v1[1] * mu[0] - v1[0] * mu[1]), {
      x: [0, 10],
      y: [0, 8],
    }),
    "model",
  );
  return {
    xLabel: "đặc trưng 1",
    yLabel: "đặc trưng 2",
    x: [0, 10],
    y: [0, 8],
    classNames: [],
    frames: [
      {
        title: "Hai đặc trưng tương quan",
        text: "Hai chiều gần như “nói cùng một điều”. Có thể giữ lại 1 chiều mà mất rất ít thông tin không?",
        points: pts,
        metrics: [{ label: "số chiều", value: "2" }],
      },
      {
        title: "1. Căn giữa",
        text: `Trừ đi trung bình: gốc toạ độ mới đặt tại tâm dữ liệu (${f(mu[0])}, ${f(mu[1])}).`,
        points: pts,
        segments: axes,
        centroids: [{ id: "mu", x: mu[0], y: mu[1], cls: 2 }],
        metrics: [{ label: "tâm", value: `(${f(mu[0], 3)}, ${f(mu[1], 3)})` }],
      },
      {
        title: "2. Tìm hướng phương sai lớn nhất",
        text: "Vector riêng của ma trận hiệp phương sai cho các **thành phần chính**. Độ dài mũi tên tỉ lệ với độ lệch chuẩn theo hướng đó.",
        points: pts,
        segments: axes,
        arrows,
        metrics: [
          { label: "PC1", value: `(${f(v1[0], 3)}, ${f(v1[1], 3)})` },
          { label: "phương sai PC1", value: pct(ratio) },
          { label: "phương sai PC2", value: pct(1 - ratio) },
        ],
      },
      {
        title: "3. Chiếu lên PC1",
        text: "Mỗi điểm được chiếu vuông góc xuống đường PC1. Các đoạn chiếu rất ngắn → mất rất ít thông tin.",
        points: pts,
        segments: [
          ...pcLine,
          ...PCA_X.map((p, i) => ({
            id: `pj${i}`,
            x1: p[0],
            y1: p[1],
            x2: proj[i][0],
            y2: proj[i][1],
            kind: "projection" as const,
          })),
        ],
        arrows: [arrows[0]],
        metrics: [{ label: "giữ lại", value: pct(ratio) }],
      },
      {
        title: "Còn lại 1 chiều",
        text: `Dữ liệu 2 chiều giờ được mô tả bằng 1 toạ độ duy nhất trên PC1, giữ ${pct(ratio)} phương sai.`,
        points: pts.map((p, i) => ({ ...p, x: proj[i][0], y: proj[i][1] })),
        segments: pcLine,
        metrics: [
          { label: "số chiều", value: "1" },
          { label: "phương sai giữ lại", value: pct(ratio) },
        ],
      },
    ],
  };
}

const BUILDERS: Record<string, () => Viz> = {
  "gradient-descent": gradientDescent,
  "linear-regression": linearRegression,
  "logistic-regression": logisticRegression,
  knn,
  "naive-bayes": naiveBayes,
  "decision-tree": decisionTree,
  "random-forest": randomForest,
  svm,
  "neural-network": neuralNetwork,
  "k-means": kMeans,
  pca,
};

export function buildViz(slug: string): Viz {
  const b = BUILDERS[slug];
  if (!b) throw new Error(`Không có biểu đồ cho bài ${slug}`);
  return b();
}

export const VIZ_SLUGS = Object.keys(BUILDERS);
