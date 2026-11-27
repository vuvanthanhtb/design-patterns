/**
 * Copyright (c) 2026 vuvanthanhtb
 * SPDX-License-Identifier: MIT
 */

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Tạo .next/standalone chỉ gồm file cần để chạy — dùng cho Docker image gọn nhẹ
  output: "standalone",
  cacheComponents: true,
  partialPrefetching: true,
};

export default nextConfig;
