/**
 * Copyright (c) 2026 vuvanthanhtb
 * SPDX-License-Identifier: MIT
 */

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="overview">
      <section className="card hero">
        <p className="crumb">Lỗi 404</p>
        <h1>
          Không tìm thấy <mark>mẫu thiết kế</mark> này
        </h1>
        <p className="subtitle">
          Đường dẫn có thể đã sai chính tả. Khoá học có đúng 23 mẫu GoF — chọn
          lại từ danh sách bên trái hoặc trang tổng quan.
        </p>
        <div className="hero-actions">
          <Link href="/" className="btn btn-green">
            Về trang tổng quan →
          </Link>
          <Link href="/cheatsheet" className="btn">
            Xem cheatsheet
          </Link>
        </div>
      </section>
    </div>
  );
}
