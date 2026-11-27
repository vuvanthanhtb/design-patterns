export type Category = "creational" | "structural" | "behavioral";

export type ClassKind = "class" | "interface" | "abstract" | "client";

export type Side = "top" | "bottom" | "left" | "right";

export interface UmlClass {
  id: string;
  name: string;
  x: number;
  y: number;
  /** Width in px; auto-computed from content when omitted. */
  w?: number;
  kind?: ClassKind;
  /** Accent treatment: the participant the pattern revolves around. */
  focal?: boolean;
  attrs?: string[];
  ops?: string[];
}

export type RelationKind =
  | "inherit" // from child → to parent (hollow triangle at parent)
  | "realize" // from implementer → to interface (dashed, hollow triangle)
  | "compose" // from OWNER → to part (filled diamond at owner)
  | "aggregate" // from OWNER → to part (hollow diamond at owner)
  | "assoc" // from source → to target (open arrow)
  | "depend"; // from source → to target (dashed, open arrow)

export interface UmlRelation {
  from: string;
  to: string;
  kind: RelationKind;
  fromSide?: Side;
  toSide?: Side;
  /** Absolute coordinate along the side (x for top/bottom, y for left/right). */
  fromAt?: number;
  toAt?: number;
  /** Coordinate of the middle leg for Z-shaped routes. */
  via?: number;
  /** Explicit route: list of waypoints between the two anchors. */
  points?: [number, number][];
  label?: string;
  fromMult?: string;
  toMult?: string;
  /** Draw in accent colour (counts toward the 2-accent budget). */
  accent?: boolean;
}

export interface UmlNote {
  x: number;
  y: number;
  w: number;
  text: string[];
  /** Class id the note is attached to with a dotted line. */
  attach?: string;
}

export interface Diagram {
  width: number;
  classes: UmlClass[];
  relations: UmlRelation[];
  notes?: UmlNote[];
}

export interface Pattern {
  slug: string;
  name: string;
  viName: string;
  category: Category;
  /** One-line intent (Vietnamese). */
  intent: string;
  /** Plain-language analogy. */
  analogy: string;
  problem: string;
  solution: string;
  participants: { name: string; role: string }[];
  whenToUse: string[];
  pros: string[];
  cons: string[];
  related: string[];
  diagram: Diagram;
}

/* ───────── Sơ đồ tuần tự (dynamic diagram) ───────── */

export interface SeqParticipant {
  id: string;
  label: string;
  focal?: boolean;
}

export type SeqKind = "call" | "return" | "async" | "create";

export interface SeqMessage {
  from: string;
  to: string;
  label: string;
  kind: SeqKind;
}

export interface SeqStep {
  title: string;
  /** Lời kể cho bước này; hỗ trợ `inline code`. */
  text: string;
  messages: SeqMessage[];
}

export interface SeqFragment {
  kind: "loop" | "opt" | "alt";
  guard: string;
  /** Chỉ số bước (0-based), bao gồm cả hai đầu. */
  fromStep: number;
  toStep: number;
}

export interface Sequence {
  participants: SeqParticipant[];
  steps: SeqStep[];
  fragments?: SeqFragment[];
}

/* ───────── Code ví dụ (dữ liệu cứng) ───────── */

export interface ExampleCode {
  javaFile: string;
  tsOutput: string[];
  javaOutput: string[];
  typescript: string;
  java: string;
}
