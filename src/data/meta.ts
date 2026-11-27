import type { Category, Pattern } from "@/lib/types";

export type PatternMeta = Pattern;

export const CATEGORY_INFO: Record<Category, { label: string; vi: string; blurb: string }> = {
  creational: {
    label: "Creational",
    vi: "Nhóm khởi tạo",
    blurb: "Cơ chế tạo đối tượng linh hoạt, tăng khả năng tái sử dụng và giảm phụ thuộc vào lớp cụ thể.",
  },
  structural: {
    label: "Structural",
    vi: "Nhóm cấu trúc",
    blurb: "Cách lắp ghép lớp và đối tượng thành cấu trúc lớn hơn mà vẫn giữ được sự linh hoạt và hiệu quả.",
  },
  behavioral: {
    label: "Behavioral",
    vi: "Nhóm hành vi",
    blurb: "Thuật toán và cách phân chia trách nhiệm, giao tiếp giữa các đối tượng.",
  },
};
