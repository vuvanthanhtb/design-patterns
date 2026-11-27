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

const TOKEN =
  /(\/\/[^\n]*|\/\*[\s\S]*?\*\/|@\w+)|(`(?:\\[\s\S]|[^`])*`|"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*')|(\b\d[\d_]*(?:\.\d+)?\b)|([A-Za-z_$][\w$]*)|(\s+)|([^\sA-Za-z_$\d])/g;

type Tok = { t: string; c?: string };

function tokenize(src: string): Tok[] {
  const out: Tok[] = [];
  let m: RegExpExecArray | null;
  TOKEN.lastIndex = 0;
  while ((m = TOKEN.exec(src))) {
    const [text, comment, str, num, ident] = m;
    if (comment) out.push({ t: text, c: "tk-comment" });
    else if (str) out.push({ t: text, c: "tk-string" });
    else if (num) out.push({ t: text, c: "tk-number" });
    else if (ident) {
      const after = src.slice(TOKEN.lastIndex).match(/^\s*(\(|<[\w\s,]*>\()/);
      if (KEYWORDS.has(text)) out.push({ t: text, c: "tk-keyword" });
      else if (BUILTINS.has(text)) out.push({ t: text, c: "tk-builtin" });
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
}: {
  code: string;
  filename: string;
  tabs?: React.ReactNode;
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
              {tokenize(line).map((tok, j) =>
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
