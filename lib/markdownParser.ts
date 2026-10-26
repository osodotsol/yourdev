/**
 * Safe, zero-dependency Markdown Parser for YourDev.
 * Compiles Markdown text into a structured AST without regex soup or dangerouslySetInnerHTML.
 * Adheres strictly to security bounds, URL validation, and inert code handling.
 */

export type InlineNode =
  | { type: "text"; value: string }
  | { type: "strong"; children: InlineNode[] }
  | { type: "emphasis"; children: InlineNode[] }
  | { type: "inlineCode"; value: string }
  | { type: "link"; text: string; url: string }
  | { type: "lineBreak" };

export interface TableCell {
  children: InlineNode[];
  align?: "left" | "center" | "right";
}

export interface TableRow {
  cells: TableCell[];
  isHeader?: boolean;
}

export type BlockNode =
  | { type: "heading"; level: 1 | 2 | 3 | 4 | 5 | 6; children: InlineNode[] }
  | { type: "paragraph"; children: InlineNode[] }
  | { type: "codeBlock"; language: string; code: string }
  | { type: "blockquote"; blocks: BlockNode[] }
  | { type: "list"; ordered: boolean; start?: number; items: ListItemNode[] }
  | { type: "table"; headers: TableRow; rows: TableRow[] }
  | { type: "horizontalRule" };

export interface ListItemNode {
  children: InlineNode[];
  subList?: BlockNode & { type: "list" };
}

/**
 * Protocol validator for link safety.
 * Strictly disallows javascript:, vbscript:, data:, and malformed protocols.
 */
export function sanitizeUrl(rawUrl: string): string | null {
  if (!rawUrl || typeof rawUrl !== "string") return null;
  const trimmed = rawUrl.trim();
  if (!trimmed) return null;

  // Relative URLs & anchor links are safe
  if (trimmed.startsWith("#") || trimmed.startsWith("/")) {
    return trimmed;
  }

  // Check scheme
  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith("javascript:") ||
    lower.startsWith("data:") ||
    lower.startsWith("vbscript:") ||
    lower.startsWith("file:")
  ) {
    return null;
  }

  if (
    lower.startsWith("https://") ||
    lower.startsWith("http://") ||
    lower.startsWith("mailto:")
  ) {
    return trimmed;
  }

  // If protocol-relative e.g. //example.com
  if (trimmed.startsWith("//")) {
    return `https:${trimmed}`;
  }

  // Reject unrecognized protocols
  return null;
}

/**
 * Tokenize and parse inline Markdown syntax:
 * - Bold: **text** or __text__
 * - Italic: *text* or _text_
 * - Bold+Italic: ***text***
 * - Inline code: `code`
 * - Links: [text](url)
 * - Escaped characters
 */
export function parseInline(text: string): InlineNode[] {
  if (!text) return [];

  const nodes: InlineNode[] = [];
  let i = 0;
  const len = text.length;

  while (i < len) {
    // 1. Escaped character
    if (text[i] === "\\" && i + 1 < len) {
      nodes.push({ type: "text", value: text[i + 1] });
      i += 2;
      continue;
    }

    // 2. Inline Code: `...`
    if (text[i] === "`") {
      const closeIdx = text.indexOf("`", i + 1);
      if (closeIdx !== -1) {
        const codeContent = text.slice(i + 1, closeIdx);
        nodes.push({ type: "inlineCode", value: codeContent });
        i = closeIdx + 1;
        continue;
      }
    }

    // 3. Links: [label](url)
    if (text[i] === "[") {
      const closeBracket = text.indexOf("]", i + 1);
      if (closeBracket !== -1 && text[closeBracket + 1] === "(") {
        const closeParen = text.indexOf(")", closeBracket + 2);
        if (closeParen !== -1) {
          const label = text.slice(i + 1, closeBracket);
          const rawUrl = text.slice(closeBracket + 2, closeParen).trim();
          const safeUrl = sanitizeUrl(rawUrl);
          if (safeUrl) {
            nodes.push({ type: "link", text: label, url: safeUrl });
          } else {
            // Malformed/unsafe link rendered as inert text
            nodes.push({ type: "text", value: label });
          }
          i = closeParen + 1;
          continue;
        }
      }
    }

    // 4. Bold + Italic: ***text*** or ___text___
    if (
      (text.startsWith("***", i) && text.indexOf("***", i + 3) !== -1) ||
      (text.startsWith("___", i) && text.indexOf("___", i + 3) !== -1)
    ) {
      const marker = text.slice(i, i + 3);
      const closeIdx = text.indexOf(marker, i + 3);
      const inner = text.slice(i + 3, closeIdx);
      nodes.push({
        type: "strong",
        children: [{ type: "emphasis", children: parseInline(inner) }],
      });
      i = closeIdx + 3;
      continue;
    }

    // 5. Bold: **text** or __text__
    if (
      (text.startsWith("**", i) && text.indexOf("**", i + 2) !== -1) ||
      (text.startsWith("__", i) && text.indexOf("__", i + 2) !== -1)
    ) {
      const marker = text.slice(i, i + 2);
      const closeIdx = text.indexOf(marker, i + 2);
      const inner = text.slice(i + 2, closeIdx);
      nodes.push({ type: "strong", children: parseInline(inner) });
      i = closeIdx + 2;
      continue;
    }

    // 6. Italic: *text* or _text_ (ensure not followed/preceded by same char or word middle for _)
    if (text[i] === "*" || text[i] === "_") {
      const marker = text[i];
      const closeIdx = text.indexOf(marker, i + 1);
      if (closeIdx !== -1 && closeIdx > i + 1) {
        const inner = text.slice(i + 1, closeIdx);
        nodes.push({ type: "emphasis", children: parseInline(inner) });
        i = closeIdx + 1;
        continue;
      }
    }

    // 7. Plain text: accumulate until next special character
    let nextSpecial = len;
    for (let j = i + 1; j < len; j++) {
      const c = text[j];
      if (c === "\\" || c === "`" || c === "[" || c === "*" || c === "_") {
        nextSpecial = j;
        break;
      }
    }

    nodes.push({ type: "text", value: text.slice(i, nextSpecial) });
    i = nextSpecial;
  }

  return mergeAdjacentTextNodes(nodes);
}

function mergeAdjacentTextNodes(nodes: InlineNode[]): InlineNode[] {
  const merged: InlineNode[] = [];
  for (const node of nodes) {
    const prev = merged[merged.length - 1];
    if (node.type === "text" && prev && prev.type === "text") {
      prev.value += node.value;
    } else {
      merged.push(node);
    }
  }
  return merged;
}

/**
 * Check if a line is a table delimiter row like `| --- | :---: | ---: |`
 */
function parseTableDelimiter(line: string): Array<"left" | "center" | "right"> | null {
  const trimmed = line.trim();
  if (!trimmed.includes("-")) return null;

  const parts = trimmed.split("|").map((p) => p.trim());
  // If line starts with | and ends with |, the first and last parts are empty
  const cells = parts.slice(
    trimmed.startsWith("|") ? 1 : 0,
    trimmed.endsWith("|") ? parts.length - 1 : parts.length
  );

  if (cells.length === 0) return null;

  const alignments: Array<"left" | "center" | "right"> = [];
  for (const cell of cells) {
    if (!/^:?-+:?$/.test(cell)) return null;
    const left = cell.startsWith(":");
    const right = cell.endsWith(":");
    if (left && right) {
      alignments.push("center");
    } else if (right) {
      alignments.push("right");
    } else {
      alignments.push("left");
    }
  }

  return alignments;
}

function splitTableRow(line: string): string[] {
  const trimmed = line.trim();
  const parts = trimmed.split("|").map((p) => p.trim());
  return parts.slice(
    trimmed.startsWith("|") ? 1 : 0,
    trimmed.endsWith("|") ? parts.length - 1 : parts.length
  );
}

/**
 * Main block parser.
 * Handles headings, code fences, blockquotes, lists, tables, hr, and paragraphs.
 */
export function parseMarkdown(source: string): BlockNode[] {
  if (!source || typeof source !== "string") return [];

  const lines = source.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
  const blocks: BlockNode[] = [];
  let i = 0;
  const total = lines.length;

  while (i < total) {
    const line = lines[i];
    const trimmed = line.trim();

    // 1. Skip empty lines
    if (!trimmed) {
      i++;
      continue;
    }

    // 2. Fenced Code Block: ```lang
    if (trimmed.startsWith("```")) {
      const language = trimmed.slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < total && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      if (i < total && lines[i].trim().startsWith("```")) {
        i++; // skip closing ```
      }
      blocks.push({
        type: "codeBlock",
        language,
        code: codeLines.join("\n"),
      });
      continue;
    }

    // 3. Horizontal Rule: ---, ***, ___
    if (/^(?:---|\*\*\*|___)\s*$/.test(trimmed)) {
      blocks.push({ type: "horizontalRule" });
      i++;
      continue;
    }

    // 4. Headings: # through ######
    const headingMatch = trimmed.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      const level = headingMatch[1].length as 1 | 2 | 3 | 4 | 5 | 6;
      const headingContent = headingMatch[2].trim();
      blocks.push({
        type: "heading",
        level,
        children: parseInline(headingContent),
      });
      i++;
      continue;
    }

    // 5. Blockquote: > text
    if (trimmed.startsWith(">")) {
      const quoteLines: string[] = [];
      while (i < total && lines[i].trim().startsWith(">")) {
        quoteLines.push(lines[i].trim().replace(/^>\s?/, ""));
        i++;
      }
      const quoteContent = quoteLines.join("\n");
      const innerBlocks = parseMarkdown(quoteContent);
      blocks.push({
        type: "blockquote",
        blocks: innerBlocks.length > 0 ? innerBlocks : [{ type: "paragraph", children: parseInline(quoteContent) }],
      });
      continue;
    }

    // 6. Tables: check if current line has | and next line is a delimiter
    if (trimmed.includes("|") && i + 1 < total) {
      const nextLine = lines[i + 1].trim();
      const alignments = parseTableDelimiter(nextLine);
      if (alignments) {
        const headerCells = splitTableRow(trimmed);
        const headers: TableRow = {
          isHeader: true,
          cells: headerCells.map((c, colIdx) => ({
            children: parseInline(c),
            align: alignments[colIdx] || "left",
          })),
        };

        i += 2; // skip header and delimiter lines
        const rows: TableRow[] = [];
        while (i < total && lines[i].trim().includes("|") && lines[i].trim().length > 0) {
          const rowCells = splitTableRow(lines[i]);
          rows.push({
            isHeader: false,
            cells: rowCells.map((c, colIdx) => ({
              children: parseInline(c),
              align: alignments[colIdx] || "left",
            })),
          });
          i++;
        }

        blocks.push({ type: "table", headers, rows });
        continue;
      }
    }

    // 7. Lists (ordered: 1. or unordered: - / * / +)
    const listMatch = line.match(/^(\s*)([-*+]|\d+\.)\s+(.*)$/);
    if (listMatch) {
      const isOrdered = /^\d+\./.test(listMatch[2]);
      const baseIndent = listMatch[1].length;
      const items: ListItemNode[] = [];

      while (i < total) {
        const curLine = lines[i];
        const curMatch = curLine.match(/^(\s*)([-*+]|\d+\.)\s+(.*)$/);

        if (!curMatch) {
          // If continuation line indented further
          if (curLine.trim() && curLine.search(/\S/) > baseIndent && items.length > 0) {
            const lastItem = items[items.length - 1];
            lastItem.children.push({ type: "lineBreak" });
            lastItem.children.push(...parseInline(curLine.trim()));
            i++;
            continue;
          }
          break;
        }

        const curIndent = curMatch[1].length;
        const curOrdered = /^\d+\./.test(curMatch[2]);

        // If indent is deeper, parse nested sub-list
        if (curIndent > baseIndent && items.length > 0) {
          const subLines: string[] = [];
          while (i < total) {
            const subLine = lines[i];
            if (!subLine.trim()) break;
            const subIndent = subLine.search(/\S/);
            if (subIndent > baseIndent) {
              subLines.push(subLine);
              i++;
            } else {
              break;
            }
          }
          const subBlocks = parseMarkdown(subLines.join("\n"));
          const firstSubList = subBlocks.find((b): b is BlockNode & { type: "list" } => b.type === "list");
          if (firstSubList) {
            items[items.length - 1].subList = firstSubList;
          }
          continue;
        }

        // Same level item
        if (curOrdered === isOrdered) {
          items.push({
            children: parseInline(curMatch[3]),
          });
          i++;
        } else {
          // Different list type on same level ends this list
          break;
        }
      }

      blocks.push({
        type: "list",
        ordered: isOrdered,
        items,
      });
      continue;
    }

    // 8. Paragraph: accumulate consecutive lines that are not other block types
    const paraLines: string[] = [];
    while (i < total) {
      const cur = lines[i];
      const curTrimmed = cur.trim();
      if (!curTrimmed) break;
      if (
        curTrimmed.startsWith("```") ||
        curTrimmed.startsWith("#") ||
        curTrimmed.startsWith(">") ||
        /^(?:---|\*\*\*|___)\s*$/.test(curTrimmed) ||
        /^(\s*)([-*+]|\d+\.)\s+/.test(cur) ||
        (curTrimmed.includes("|") && i + 1 < total && parseTableDelimiter(lines[i + 1]))
      ) {
        break;
      }
      paraLines.push(curTrimmed);
      i++;
    }

    if (paraLines.length > 0) {
      blocks.push({
        type: "paragraph",
        children: parseInline(paraLines.join(" ")),
      });
    }
  }

  return blocks;
}
