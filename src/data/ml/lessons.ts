/**
 * Copyright (c) 2026 vuvanthanhtb
 * SPDX-License-Identifier: MIT
 */

import type { MlGroup, MlLesson } from "@/lib/ml/types";

export const ML_GROUPS: Record<
  MlGroup,
  { label: string; vi: string; blurb: string }
> = {
  foundation: {
    label: "Foundation",
    vi: "Nền tảng",
    blurb:
      "Cơ chế tối ưu mà gần như mọi mô hình học máy đều dùng để “học” từ dữ liệu.",
  },
  supervised: {
    label: "Supervised",
    vi: "Học có giám sát",
    blurb:
      "Dữ liệu có nhãn sẵn: mô hình học ánh xạ từ đặc trưng sang nhãn để dự đoán cho dữ liệu mới.",
  },
  unsupervised: {
    label: "Unsupervised",
    vi: "Học không giám sát",
    blurb:
      "Dữ liệu không có nhãn: tìm cấu trúc ẩn như các cụm, hay một biểu diễn gọn hơn.",
  },
};

/** Toàn bộ nội dung là hằng số trong mã nguồn — không gọi API. */
export const ML_LESSONS: MlLesson[] = [
  {
    slug: "gradient-descent",
    name: "Gradient Descent",
    viName: "Hạ gradient",
    group: "foundation",
    task: "Tối ưu",
    intent:
      "Tìm tham số làm hàm mất mát nhỏ nhất bằng cách liên tục bước ngược hướng đạo hàm.",
    analogy:
      "Xuống núi trong sương mù: bạn không nhìn thấy thung lũng, chỉ cảm nhận được độ dốc dưới chân. Cứ bước về phía dốc xuống, bước dài khi dốc đứng, bước ngắn khi gần bằng phẳng.",
    problem:
      "Hầu hết mô hình học máy được huấn luyện bằng cách tối thiểu một hàm mất mát. Với hàng triệu tham số, ta không thể giải phương trình trực tiếp hay thử mọi giá trị.",
    idea: "Đạo hàm cho biết hướng mà hàm tăng nhanh nhất. Đi ngược hướng đó một bước nhỏ (tỉ lệ với `learning rate`) là hàm giảm. Lặp lại tới khi đạo hàm gần bằng 0.",
    formulas: [
      { label: "Cập nhật", expr: "w ← w − η · ∇f(w)" },
      { label: "Ví dụ", expr: "f(w) = (w − 3)² + 1,   f′(w) = 2(w − 3)" },
      { label: "Hồi quy tuyến tính", expr: "∂MSE/∂w = 2·mean((ŷ − y)·x)" },
    ],
    hyperparams: [
      {
        name: "learning rate η",
        desc: "Quá nhỏ: hội tụ chậm. Quá lớn: dao động hoặc phân kỳ.",
      },
      {
        name: "số bước / epoch",
        desc: "Dừng khi mất mát ngừng giảm (early stopping).",
      },
    ],
    sklearn: "sklearn.linear_model.SGDRegressor / SGDClassifier",
    complexity: "O(n · d) mỗi bước với n mẫu, d tham số",
    whenToUse: [
      "Huấn luyện mô hình có hàm mất mát khả vi: hồi quy, logistic, mạng nơ-ron.",
      "Dữ liệu quá lớn để giải nghiệm đóng — dùng biến thể mini-batch / stochastic.",
    ],
    pros: [
      "Đơn giản, áp dụng cho mọi hàm khả vi.",
      "Mở rộng tốt với dữ liệu lớn (SGD, mini-batch).",
      "Là nền tảng của deep learning.",
    ],
    cons: [
      "Nhạy với learning rate.",
      "Có thể kẹt ở cực tiểu địa phương hoặc điểm yên ngựa với hàm không lồi.",
      "Đặc trưng có thang đo lệch nhau làm hội tụ chậm — nên chuẩn hoá.",
    ],
    related: ["linear-regression", "logistic-regression", "neural-network"],
  },
  {
    slug: "linear-regression",
    name: "Linear Regression",
    viName: "Hồi quy tuyến tính",
    group: "supervised",
    task: "Hồi quy",
    intent: "Dự đoán một giá trị số bằng tổ hợp tuyến tính của các đặc trưng.",
    analogy:
      "Môi giới ước giá nhà: “mỗi 10 m² thêm khoảng 155 triệu, cộng một mức nền 160 triệu”. Một quy tắc đơn giản, dễ giải thích, đúng gần đủ.",
    problem:
      "Có dữ liệu diện tích và giá của 12 căn nhà. Cần một công thức dự đoán giá cho căn nhà mới sao cho sai số trung bình nhỏ nhất.",
    idea: "Tìm đường thẳng `ŷ = w·x + b` làm tổng bình phương phần dư nhỏ nhất (bình phương tối thiểu). Có thể giải trực tiếp bằng phương trình chuẩn, hoặc lặp bằng Gradient Descent.",
    formulas: [
      { label: "Mô hình", expr: "ŷ = w·x + b" },
      { label: "Mất mát", expr: "MSE = (1/n) · Σ (ŷᵢ − yᵢ)²" },
      { label: "Nghiệm đóng", expr: "θ = (XᵀX)⁻¹ Xᵀy" },
    ],
    hyperparams: [
      { name: "fit_intercept", desc: "Có học hệ số chặn b hay không." },
      {
        name: "regularization",
        desc: "Ridge (L2) / Lasso (L1) khi có nhiều đặc trưng tương quan.",
      },
    ],
    sklearn: "sklearn.linear_model.LinearRegression",
    complexity: "Nghiệm đóng O(n·d² + d³); GD O(n·d) mỗi epoch",
    whenToUse: [
      "Quan hệ giữa đặc trưng và mục tiêu xấp xỉ tuyến tính.",
      "Cần mô hình dễ giải thích: mỗi hệ số là mức ảnh hưởng của một đặc trưng.",
      "Làm mốc so sánh (baseline) trước khi thử mô hình phức tạp.",
    ],
    pros: [
      "Nhanh, đơn giản, dễ giải thích.",
      "Có nghiệm đóng chính xác.",
      "Ít bị overfitting khi ít đặc trưng.",
    ],
    cons: [
      "Không nắm được quan hệ phi tuyến (trừ khi tự tạo đặc trưng).",
      "Nhạy với điểm ngoại lai do bình phương sai số.",
    ],
    related: ["gradient-descent", "logistic-regression"],
  },
  {
    slug: "logistic-regression",
    name: "Logistic Regression",
    viName: "Hồi quy logistic",
    group: "supervised",
    task: "Phân loại",
    intent:
      "Ước lượng xác suất thuộc một lớp bằng hàm sigmoid của tổ hợp tuyến tính các đặc trưng.",
    analogy:
      "Thầy giáo đoán khả năng đỗ: mỗi giờ học và giờ ngủ cộng thêm “điểm tự tin”. Tổng điểm càng cao, xác suất đỗ càng tiến về 100% nhưng không bao giờ vượt quá.",
    problem:
      "Từ giờ học và giờ ngủ của 24 học sinh, dự đoán một học sinh mới đỗ hay trượt — và quan trọng hơn: **chắc chắn đến mức nào**.",
    idea: "Tính điểm tuyến tính `z = w·x + b` rồi nén về khoảng (0, 1) bằng sigmoid. Ranh giới quyết định (P = 0.5) là một đường thẳng. Huấn luyện bằng Gradient Descent trên log-loss, kèm L2 để tránh trọng số phình to.",
    formulas: [
      {
        label: "Xác suất",
        expr: "P(y=1 | x) = σ(w·x + b),   σ(z) = 1 / (1 + e⁻ᶻ)",
      },
      {
        label: "Log-loss",
        expr: "L = −mean(y·log p + (1 − y)·log(1 − p)) + λ/2·‖w‖²",
      },
      { label: "Gradient", expr: "∂L/∂w = Xᵀ(p − y)/n + λw" },
    ],
    hyperparams: [
      {
        name: "C (= 1/λn)",
        desc: "Nghịch đảo độ mạnh regularization; mặc định sklearn C = 1.",
      },
      {
        name: "ngưỡng",
        desc: "Mặc định 0.5; dịch ngưỡng để đổi precision lấy recall.",
      },
    ],
    sklearn: "sklearn.linear_model.LogisticRegression",
    complexity: "O(n · d) mỗi epoch",
    whenToUse: [
      "Phân loại nhị phân cần xác suất đã hiệu chỉnh (rủi ro tín dụng, chẩn đoán).",
      "Ranh giới giữa các lớp gần tuyến tính.",
      "Cần mô hình nhẹ, dễ giải thích, làm baseline cho phân loại.",
    ],
    pros: [
      "Cho xác suất, không chỉ nhãn.",
      "Huấn luyện nhanh, hàm mất mát lồi — luôn tìm được cực tiểu toàn cục.",
      "Dễ giải thích qua trọng số.",
    ],
    cons: [
      "Ranh giới tuyến tính.",
      "Dữ liệu tách được hoàn toàn khiến trọng số phân kỳ nếu không có regularization.",
    ],
    related: ["linear-regression", "svm", "neural-network", "naive-bayes"],
  },
  {
    slug: "knn",
    name: "k-Nearest Neighbors",
    viName: "k láng giềng gần nhất",
    group: "supervised",
    task: "Phân loại",
    intent:
      "Dự đoán nhãn của một điểm bằng cách bỏ phiếu giữa k điểm huấn luyện gần nó nhất.",
    analogy:
      "“Hãy cho tôi biết bạn chơi với ai, tôi sẽ nói bạn là người thế nào.” Muốn đoán một người, nhìn vào k người thân cận nhất.",
    problem:
      "Không muốn giả định gì về hình dạng ranh giới giữa các lớp. Chỉ cần: điểm giống nhau thì nhãn giống nhau.",
    idea: "Không có pha huấn luyện — chỉ ghi nhớ dữ liệu (lazy learning). Khi cần dự đoán: tính khoảng cách tới mọi điểm, lấy k điểm gần nhất, bỏ phiếu đa số. k nhỏ → ranh giới chi tiết, dễ overfit; k lớn → mượt hơn.",
    formulas: [
      { label: "Khoảng cách Euclid", expr: "d(x, q) = √Σⱼ (xⱼ − qⱼ)²" },
      { label: "Dự đoán", expr: "ŷ = mode{ yᵢ : i ∈ k điểm gần q nhất }" },
    ],
    hyperparams: [
      {
        name: "k",
        desc: "Số láng giềng; nên chọn lẻ với 2 lớp, tinh chỉnh bằng cross-validation.",
      },
      { name: "metric", desc: "Euclid, Manhattan, cosine…" },
      {
        name: "weights",
        desc: "Bỏ phiếu đều hoặc theo nghịch đảo khoảng cách.",
      },
    ],
    sklearn: "sklearn.neighbors.KNeighborsClassifier",
    complexity:
      "Huấn luyện O(1); dự đoán O(n · d) mỗi điểm (giảm được bằng KD-tree)",
    whenToUse: [
      "Tập dữ liệu nhỏ đến vừa, ít chiều.",
      "Ranh giới phức tạp, không có dạng tham số rõ ràng.",
      "Hệ gợi ý đơn giản: “sản phẩm tương tự”.",
    ],
    pros: [
      "Cực kỳ đơn giản, không giả định phân phối.",
      "Ranh giới phi tuyến tự nhiên.",
      "Thêm dữ liệu mới không cần huấn luyện lại.",
    ],
    cons: [
      "Dự đoán chậm với dữ liệu lớn.",
      "Bắt buộc chuẩn hoá đặc trưng — đặc trưng có thang đo lớn sẽ áp đảo khoảng cách.",
      "Kém hiệu quả ở không gian nhiều chiều (curse of dimensionality).",
    ],
    related: ["naive-bayes", "decision-tree", "k-means"],
  },
  {
    slug: "naive-bayes",
    name: "Naive Bayes",
    viName: "Bayes ngây thơ",
    group: "supervised",
    task: "Phân loại",
    intent:
      "Phân loại bằng định lý Bayes với giả định các đặc trưng độc lập với nhau khi đã biết lớp.",
    analogy:
      "Bác sĩ chẩn đoán: “bệnh này thường gặp ở mức sốt X, mức ho Y” — xét từng triệu chứng riêng rồi nhân các khả năng lại, dù thực tế các triệu chứng có liên quan với nhau.",
    problem:
      "Cần một bộ phân loại huấn luyện tức thì, chạy được cả với ít dữ liệu, và cho xác suất của từng lớp.",
    idea: "Với mỗi lớp, ước lượng phân phối của **từng** đặc trưng (ở đây là Gauss: chỉ cần μ và σ). Khi dự đoán: nhân prior với likelihood của từng đặc trưng, chuẩn hoá thành xác suất hậu nghiệm. Giả định độc lập làm mô hình “ngây thơ” nhưng thường vẫn hoạt động tốt.",
    formulas: [
      { label: "Bayes", expr: "P(c | x) ∝ P(c) · Πⱼ P(xⱼ | c)" },
      { label: "Gauss", expr: "P(xⱼ | c) = 𝒩(xⱼ; μ_cj, σ²_cj)" },
      {
        label: "Ổn định số",
        expr: "log P(c | x) = log P(c) + Σⱼ log P(xⱼ | c) + const",
      },
    ],
    hyperparams: [
      {
        name: "loại phân phối",
        desc: "Gaussian (số thực), Multinomial (đếm từ), Bernoulli (nhị phân).",
      },
      {
        name: "var_smoothing / alpha",
        desc: "Làm trơn để tránh xác suất bằng 0.",
      },
    ],
    sklearn: "sklearn.naive_bayes.GaussianNB",
    complexity: "Huấn luyện O(n · d); dự đoán O(c · d)",
    whenToUse: [
      "Phân loại văn bản: lọc spam, phân loại cảm xúc (MultinomialNB).",
      "Cần baseline cực nhanh hoặc dữ liệu huấn luyện rất ít.",
      "Rất nhiều đặc trưng, mỗi đặc trưng mang một phần thông tin.",
    ],
    pros: [
      "Huấn luyện và dự đoán rất nhanh.",
      "Hoạt động tốt với ít dữ liệu.",
      "Ít siêu tham số.",
    ],
    cons: [
      "Giả định độc lập thường sai — xác suất có thể quá tự tin.",
      "Không nắm được tương tác giữa các đặc trưng.",
    ],
    related: ["logistic-regression", "knn"],
  },
  {
    slug: "decision-tree",
    name: "Decision Tree",
    viName: "Cây quyết định",
    group: "supervised",
    task: "Phân loại",
    intent:
      "Chia không gian dữ liệu bằng một chuỗi câu hỏi có/không về từng đặc trưng, tạo thành một cây.",
    analogy:
      "Trò chơi 20 câu hỏi: “Học nhiều hơn 4.75 giờ không?” → “Ngủ nhiều hơn 4.25 giờ không?” → kết luận. Mỗi câu hỏi được chọn để loại bỏ nhiều nhầm lẫn nhất.",
    problem:
      "Cần một mô hình phi tuyến mà con người đọc hiểu được từng bước ra quyết định.",
    idea: "Ở mỗi nút, thử mọi đặc trưng và mọi ngưỡng; chọn phép tách làm giảm **Gini impurity** nhiều nhất. Lặp lại đệ quy cho hai nhánh tới khi nút thuần khiết hoặc chạm độ sâu tối đa.",
    formulas: [
      { label: "Gini", expr: "G = 1 − Σₖ pₖ²" },
      { label: "Chọn phép tách", expr: "argmin  (n_L·G_L + n_R·G_R) / n" },
    ],
    hyperparams: [
      {
        name: "max_depth",
        desc: "Giới hạn độ sâu — cách chính để chống overfitting.",
      },
      { name: "min_samples_leaf", desc: "Số mẫu tối thiểu ở mỗi lá." },
      { name: "criterion", desc: "gini hoặc entropy." },
    ],
    sklearn: "sklearn.tree.DecisionTreeClassifier",
    complexity: "Huấn luyện O(d · n log n) mỗi tầng; dự đoán O(độ sâu)",
    whenToUse: [
      "Cần giải thích quyết định (tín dụng, y tế) — có thể vẽ cây ra.",
      "Dữ liệu dạng bảng có đặc trưng hỗn hợp, không cần chuẩn hoá.",
      "Làm khối xây dựng cho Random Forest, Gradient Boosting.",
    ],
    pros: [
      "Dễ hiểu, dễ trực quan hoá.",
      "Không cần chuẩn hoá đặc trưng.",
      "Nắm được quan hệ phi tuyến và tương tác.",
    ],
    cons: [
      "Dễ overfitting khi cây sâu.",
      "Không ổn định: thay đổi nhỏ trong dữ liệu có thể đổi cả cây.",
      "Ranh giới luôn song song với trục.",
    ],
    related: ["random-forest", "knn"],
  },
  {
    slug: "random-forest",
    name: "Random Forest",
    viName: "Rừng ngẫu nhiên",
    group: "supervised",
    task: "Phân loại",
    intent:
      "Kết hợp nhiều cây quyết định huấn luyện trên các mẫu bootstrap khác nhau rồi bỏ phiếu đa số.",
    analogy:
      "“Trí tuệ đám đông”: hỏi ý kiến nhiều người, mỗi người biết một phần và sai theo cách riêng. Ý kiến số đông thường đúng hơn bất kỳ cá nhân nào.",
    problem:
      "Một cây quyết định đơn lẻ không ổn định và dễ overfit — đổi vài mẫu dữ liệu là cả cây thay đổi.",
    idea: "**Bagging**: mỗi cây học trên một mẫu bootstrap (lấy có hoàn lại). Các cây khác nhau mắc lỗi khác nhau; bỏ phiếu làm triệt tiêu lỗi riêng lẻ. Random Forest còn chọn ngẫu nhiên tập đặc trưng ở mỗi lần tách để các cây càng khác nhau.",
    formulas: [
      { label: "Bootstrap", expr: "Dᵦ = n mẫu lấy có hoàn lại từ D" },
      { label: "Dự đoán", expr: "ŷ = mode{ tree_b(x) : b = 1..B }" },
    ],
    hyperparams: [
      {
        name: "n_estimators",
        desc: "Số cây; nhiều hơn thường tốt hơn, chỉ tốn thời gian.",
      },
      {
        name: "max_features",
        desc: "Số đặc trưng xét ở mỗi lần tách — tăng độ đa dạng.",
      },
      { name: "max_depth", desc: "Độ sâu mỗi cây." },
    ],
    sklearn: "sklearn.ensemble.RandomForestClassifier",
    complexity: "O(B · d · n log n) huấn luyện; song song hoá dễ dàng",
    whenToUse: [
      "Dữ liệu dạng bảng — thường là lựa chọn mạnh “dùng ngay không cần tinh chỉnh”.",
      "Cần độ chính xác cao hơn một cây mà vẫn có độ quan trọng của đặc trưng.",
    ],
    pros: [
      "Chính xác, ổn định, ít overfit hơn một cây.",
      "Ít cần tinh chỉnh siêu tham số.",
      "Đánh giá được độ quan trọng đặc trưng và lỗi out-of-bag.",
    ],
    cons: [
      "Khó giải thích hơn một cây.",
      "Mô hình nặng, dự đoán chậm hơn với nhiều cây.",
    ],
    related: ["decision-tree", "knn"],
  },
  {
    slug: "svm",
    name: "Support Vector Machine",
    viName: "Máy vector hỗ trợ",
    group: "supervised",
    task: "Phân loại",
    intent:
      "Tìm siêu phẳng phân tách hai lớp với lề (khoảng cách tới điểm gần nhất) lớn nhất.",
    analogy:
      "Kẻ một con đường giữa hai ngôi làng sao cho đường **rộng nhất** có thể — ngôi nhà nào sát mép đường quyết định đường được rộng bao nhiêu.",
    problem:
      "Khi có vô số đường thẳng cùng tách đúng dữ liệu huấn luyện, chọn đường nào để dự đoán dữ liệu mới tốt nhất?",
    idea: "Chọn ranh giới có **lề cực đại**. Chỉ những điểm nằm trên lề (vector hỗ trợ) quyết định ranh giới. Bản soft-margin cho phép vài điểm vi phạm lề với hinge loss. Kernel trick mở rộng sang ranh giới phi tuyến.",
    formulas: [
      { label: "Ranh giới", expr: "w·x + b = 0,   lề: w·x + b = ±1" },
      { label: "Độ rộng lề", expr: "2 / ‖w‖" },
      {
        label: "Soft-margin",
        expr: "min  λ/2·‖w‖² + mean(max(0, 1 − yᵢ(w·xᵢ + b)))",
      },
    ],
    hyperparams: [
      {
        name: "C",
        desc: "Phạt vi phạm lề; C lớn ≈ hard margin, C nhỏ = lề rộng hơn, chấp nhận lỗi.",
      },
      { name: "kernel", desc: "linear, rbf, poly — cho ranh giới phi tuyến." },
      { name: "gamma", desc: "Độ “cong” của kernel rbf." },
    ],
    sklearn: 'sklearn.svm.SVC (kernel="linear")',
    complexity:
      "Huấn luyện O(n²)–O(n³) với kernel; tuyến tính O(n · d) mỗi epoch",
    whenToUse: [
      "Dữ liệu vừa và nhỏ, nhiều chiều (phân loại văn bản, sinh học).",
      "Cần ranh giới tổng quát hoá tốt khi dữ liệu ít.",
    ],
    pros: [
      "Tổng quát hoá tốt nhờ lề cực đại.",
      "Hiệu quả ở không gian nhiều chiều.",
      "Kernel trick cho ranh giới phi tuyến.",
    ],
    cons: [
      "Chậm với dữ liệu rất lớn.",
      "Không trực tiếp cho xác suất.",
      "Nhạy với việc chuẩn hoá và chọn C, gamma.",
    ],
    related: ["logistic-regression", "neural-network"],
  },
  {
    slug: "neural-network",
    name: "Perceptron & MLP",
    viName: "Mạng nơ-ron",
    group: "supervised",
    task: "Phân loại",
    intent:
      "Xếp chồng các lớp nơ-ron tuyến tính + hàm kích hoạt phi tuyến để học ranh giới bất kỳ, huấn luyện bằng lan truyền ngược.",
    analogy:
      "Một nơ-ron giống một người chỉ biết kẻ một đường thẳng. Một nhóm người cùng kẻ nhiều đường rồi tổng hợp lại thì khoanh vùng được hình dạng bất kỳ.",
    problem:
      "Perceptron (một nơ-ron) chỉ vẽ được ranh giới thẳng — thất bại ngay với bài toán XOR đơn giản.",
    idea: "Thêm **lớp ẩn** với hàm kích hoạt phi tuyến (tanh): mỗi nơ-ron ẩn tạo một “nếp gấp”, lớp ra kết hợp chúng thành ranh giới phi tuyến. Huấn luyện bằng Gradient Descent, gradient tính bằng **lan truyền ngược** (quy tắc dây chuyền).",
    formulas: [
      { label: "Lớp ẩn", expr: "h = tanh(X·W₁ + b₁)" },
      { label: "Lớp ra", expr: "ŷ = σ(h·W₂ + b₂)" },
      { label: "Lan truyền ngược", expr: "δ_h = (δ_out · W₂ᵀ) ⊙ (1 − h²)" },
    ],
    hyperparams: [
      { name: "kiến trúc", desc: "Số lớp ẩn và số nơ-ron mỗi lớp." },
      { name: "activation", desc: "relu, tanh, sigmoid." },
      {
        name: "learning rate, epoch",
        desc: "Giống Gradient Descent; thường dùng Adam.",
      },
    ],
    sklearn: "sklearn.neural_network.MLPClassifier",
    complexity: "O(n · số trọng số) mỗi epoch",
    whenToUse: [
      "Quan hệ phi tuyến phức tạp, dữ liệu nhiều.",
      "Dữ liệu phi cấu trúc: ảnh, âm thanh, văn bản (dạng mạng sâu chuyên biệt).",
    ],
    pros: [
      "Xấp xỉ được hàm bất kỳ (universal approximation).",
      "Tự học đặc trưng từ dữ liệu thô.",
      "Mở rộng thành deep learning.",
    ],
    cons: [
      "Cần nhiều dữ liệu và tinh chỉnh.",
      "Khó giải thích (hộp đen).",
      "Hàm mất mát không lồi — có thể kẹt ở cao nguyên hoặc cực tiểu địa phương.",
    ],
    related: ["logistic-regression", "gradient-descent", "svm"],
  },
  {
    slug: "k-means",
    name: "K-Means",
    viName: "Phân cụm K trung bình",
    group: "unsupervised",
    task: "Phân cụm",
    intent:
      "Chia dữ liệu không nhãn thành k cụm, mỗi điểm thuộc về cụm có tâm gần nó nhất.",
    analogy:
      "Đặt k xe bán kem trên bãi biển: mỗi người đi tới xe gần nhất; mỗi xe lại dời về giữa đám khách của mình. Lặp lại tới khi không xe nào cần dời nữa.",
    problem:
      "Có dữ liệu khách hàng nhưng không có nhãn. Muốn tự động tìm các nhóm khách hàng giống nhau.",
    idea: "Xen kẽ hai bước tới khi hội tụ: **gán** mỗi điểm về tâm gần nhất, **cập nhật** mỗi tâm bằng trung bình các điểm của nó. Mỗi vòng đều làm inertia (tổng bình phương khoảng cách) giảm.",
    formulas: [
      { label: "Gán", expr: "cᵢ = argminₖ ‖xᵢ − μₖ‖²" },
      { label: "Cập nhật", expr: "μₖ = mean{ xᵢ : cᵢ = k }" },
      { label: "Inertia", expr: "J = Σᵢ ‖xᵢ − μ_cᵢ‖²" },
    ],
    hyperparams: [
      {
        name: "k",
        desc: "Số cụm — chọn bằng phương pháp khuỷu tay (elbow) hoặc silhouette.",
      },
      {
        name: "init",
        desc: "k-means++ chọn tâm ban đầu xa nhau, tránh nghiệm tệ.",
      },
      {
        name: "n_init",
        desc: "Chạy nhiều lần với khởi tạo khác nhau, giữ kết quả tốt nhất.",
      },
    ],
    sklearn: "sklearn.cluster.KMeans",
    complexity: "O(n · k · d) mỗi vòng",
    whenToUse: [
      "Phân khúc khách hàng, nén ảnh (lượng tử hoá màu).",
      "Cụm có dạng tròn, kích thước tương đương nhau.",
    ],
    pros: ["Đơn giản, nhanh, mở rộng tốt.", "Dễ hiểu và dễ cài đặt."],
    cons: [
      "Phải chọn trước k.",
      "Kết quả phụ thuộc khởi tạo — có thể kẹt ở nghiệm tệ (xem phần code).",
      "Kém với cụm hình dạng phức tạp hoặc kích thước chênh lệch.",
    ],
    related: ["knn", "pca"],
  },
  {
    slug: "pca",
    name: "Principal Component Analysis",
    viName: "Phân tích thành phần chính",
    group: "unsupervised",
    task: "Giảm chiều",
    intent:
      "Tìm các hướng có phương sai lớn nhất trong dữ liệu và chiếu dữ liệu lên vài hướng đầu để giảm số chiều.",
    analogy:
      "Chụp ảnh một vật thể 3D: chọn góc chụp sao cho cái bóng 2D giữ được nhiều hình dáng nhất. PCA chọn “góc chụp” tốt nhất cho dữ liệu.",
    problem:
      "Dữ liệu có nhiều đặc trưng tương quan, gây dư thừa, khó trực quan hoá và làm mô hình chậm.",
    idea: "Căn giữa dữ liệu, tính ma trận hiệp phương sai, lấy các vector riêng ứng với trị riêng lớn nhất — đó là các **thành phần chính**, vuông góc với nhau. Chiếu dữ liệu lên k thành phần đầu để giữ phần lớn phương sai với ít chiều hơn.",
    formulas: [
      { label: "Hiệp phương sai", expr: "Σ = (1/(n−1)) · X̃ᵀX̃,   X̃ = X − μ" },
      { label: "Thành phần chính", expr: "Σ·v = λ·v   (sắp xếp λ giảm dần)" },
      { label: "Chiếu", expr: "Z = X̃ · V_k,   tỉ lệ giữ lại = Σᵢ≤ₖ λᵢ / Σλ" },
    ],
    hyperparams: [
      {
        name: "n_components",
        desc: "Số chiều giữ lại, hoặc tỉ lệ phương sai muốn giữ (vd 0.95).",
      },
      { name: "whiten", desc: "Chuẩn hoá phương sai mỗi thành phần về 1." },
    ],
    sklearn: "sklearn.decomposition.PCA",
    complexity: "O(n · d² + d³)",
    whenToUse: [
      "Trực quan hoá dữ liệu nhiều chiều xuống 2D/3D.",
      "Giảm chiều trước khi huấn luyện để nhanh hơn, bớt nhiễu.",
      "Loại bỏ đặc trưng tương quan (đa cộng tuyến).",
    ],
    pros: [
      "Nhanh, có nghiệm chính xác.",
      "Giảm nhiễu và dư thừa.",
      "Các thành phần không tương quan với nhau.",
    ],
    cons: [
      "Chỉ nắm được cấu trúc tuyến tính.",
      "Thành phần mới khó diễn giải ý nghĩa.",
      "Nhạy với thang đo — cần chuẩn hoá đặc trưng.",
    ],
    related: ["k-means", "linear-regression"],
  },
];
