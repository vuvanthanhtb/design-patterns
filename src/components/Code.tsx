/**
 * Copyright (c) 2026 vuvanthanhtb
 * SPDX-License-Identifier: MIT
 */

import { CopyButton } from "./CopyButton";

const KEYWORDS = new Set(
  "abstract as async await break case catch class const constructor continue declare default do else enum export extends false final finally for from function get if implements import in instanceof interface keyof let new null of package private protected public readonly record return set static super switch synchronized this throw throws true try type typeof undefined var void volatile while yield".split(
    " ",
  ),
);
const BUILTINS = new Set(
  "string number boolean unknown any never object int long double char byte short Record Map Set Array Math JSON Object Number String Symbol Date Error console System List Deque HashMap ArrayList ArrayDeque Integer Override FunctionalInterface".split(
    " ",
  ),
);

const PY_KEYWORDS = new Set(
  "and as assert break class continue def del elif else except False finally for from global if import in is lambda None nonlocal not or pass raise return self True try while with yield".split(
    " ",
  ),
);
const PY_BUILTINS = new Set(
  "print range len zip enumerate sum min max abs round int float str list dict set tuple isinstance np".split(
    " ",
  ),
);
// Python: comment "#…", chuỗi có tiền tố f/r/b, decorator "@…"
const PY_TOKEN =
  /(#[^\n]*|@\w+)|((?:[fFrRbB]{1,2})?"(?:\\.|[^"\\\n])*"|(?:[fFrRbB]{1,2})?'(?:\\.|[^'\\\n])*')|(\b\d[\d_]*(?:\.\d+)?(?:e-?\d+)?\b)|([A-Za-z_][\w]*)|(\s+)|([^\sA-Za-z_\d])/g;

export type CodeLang = "ts" | "java" | "python";

const TOKEN =
  /(\/\/[^\n]*|\/\*[\s\S]*?\*\/|@\w+)|(`(?:\\[\s\S]|[^`])*`|"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*')|(\b\d[\d_]*(?:\.\d+)?\b)|([A-Za-z_$][\w$]*)|(\s+)|([^\sA-Za-z_$\d])/g;

type Tok = { t: string; c?: string };

function tokenize(src: string, lang: CodeLang): Tok[] {
  const out: Tok[] = [];
  const py = lang === "python";
  const re = py ? PY_TOKEN : TOKEN;
  const kw = py ? PY_KEYWORDS : KEYWORDS;
  const bi = py ? PY_BUILTINS : BUILTINS;
  let m: RegExpExecArray | null;
  re.lastIndex = 0;
  while ((m = re.exec(src))) {
    const [text, comment, str, num, ident] = m;
    if (comment) out.push({ t: text, c: "tk-comment" });
    else if (str) out.push({ t: text, c: "tk-string" });
    else if (num) out.push({ t: text, c: "tk-number" });
    else if (ident) {
      const after = src.slice(re.lastIndex).match(/^\s*(\(|<[\w\s,]*>\()/);
      if (kw.has(text)) out.push({ t: text, c: "tk-keyword" });
      else if (bi.has(text)) out.push({ t: text, c: "tk-builtin" });
      else if (/^[A-Z]/.test(text)) out.push({ t: text, c: "tk-type" });
      else if (after) out.push({ t: text, c: "tk-fn" });
      else out.push({ t: text });
    } else
      out.push({ t: text, c: /^\s+$/.test(text) ? undefined : "tk-punct" });
  }
  return out;
}

export function Code({
  code,
  filename,
  tabs,
  lang = "ts",
}: {
  code: string;
  filename: string;
  tabs?: React.ReactNode;
  lang?: CodeLang;
}) {
  const lines = code.split("\n");
  return (
    <div className="code">
      <div className="code-head">
        {tabs}
        <span className="code-file">{filename}</span>
        <CopyButton text={code} />
      </div>
      <pre>
        <code>
          {lines.map((line, i) => (
            <span className="code-line" key={i}>
              <span className="ln" aria-hidden>
                {i + 1}
              </span>
              {tokenize(line, lang).map((tok, j) =>
                tok.c ? (
                  <span key={j} className={tok.c}>
                    {tok.t}
                  </span>
                ) : (
                  tok.t
                ),
              )}
              {"\n"}
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}

export function Terminal({
  lines,
  command,
}: {
  lines: string[];
  command: string;
}) {
  return (
    <div className="terminal">
      <div className="terminal-cmd">
        <span className="prompt">$</span> {command}
      </div>
      <pre>{lines.join("\n")}</pre>
    </div>
  );
}
