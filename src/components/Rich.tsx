/** Hiển thị đoạn văn có `inline code` dạng markdown tối giản. */
export function Rich({ text }: { text: string }) {
  const parts = text.split(/(`[^`]+`)/g);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith("`") && p.endsWith("`") ? (
          <code key={i}>{p.slice(1, -1)}</code>
        ) : (
          p
        ),
      )}
    </>
  );
}
