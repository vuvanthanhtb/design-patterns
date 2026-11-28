/**
 * Copyright (c) 2026 vuvanthanhtb
 * SPDX-License-Identifier: MIT
 */

import { NextResponse, type NextRequest } from "next/server";

/**
 * Trang bài học stream phản hồi (Cache Components) nên luôn bắt đầu bằng 200.
 * Để slug sai trả đúng HTTP 404, kiểm tra slug ở đây — trước khi render.
 *
 * Proxy không nên import module dùng chung, nên danh sách slug được ghi cứng.
 * Giữ đồng bộ với src/data/{creational,structural,behavioral}.ts và src/data/ml/lessons.ts.
 */
const PATTERN_SLUGS = new Set([
  "factory-method",
  "abstract-factory",
  "builder",
  "prototype",
  "singleton",
  "adapter",
  "bridge",
  "composite",
  "decorator",
  "facade",
  "flyweight",
  "proxy",
  "chain-of-responsibility",
  "command",
  "interpreter",
  "iterator",
  "mediator",
  "memento",
  "observer",
  "state",
  "strategy",
  "template-method",
  "visitor",
]);

const ML_SLUGS = new Set([
  "cheatsheet", // trang tĩnh /ml/cheatsheet
  "gradient-descent",
  "linear-regression",
  "logistic-regression",
  "knn",
  "naive-bayes",
  "decision-tree",
  "random-forest",
  "svm",
  "neural-network",
  "k-means",
  "pca",
]);

/** Route metadata do Next.js sinh trong /patterns và /ml (ảnh chia sẻ của trang tổng quan). */
const RESERVED = new Set(["opengraph-image", "twitter-image"]);

export function proxy(request: NextRequest) {
  const [, course, slug = ""] = request.nextUrl.pathname.split("/");
  const known = course === "ml" ? ML_SLUGS : PATTERN_SLUGS;
  if (!known.has(slug) && !RESERVED.has(slug)) {
    // Rewrite tới một đường dẫn không có route → Next render not-found với status 404
    return NextResponse.rewrite(new URL("/__not-found", request.url));
  }
}

export const config = {
  matcher: ["/patterns/:slug", "/ml/:slug"],
};
