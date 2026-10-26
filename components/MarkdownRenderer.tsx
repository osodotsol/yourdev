"use client";

import React, { useState } from "react";
import {
  parseMarkdown,
  parseInline,
  BlockNode,
  InlineNode,
  ListItemNode,
  TableRow,
} from "@/lib/markdownParser";
import { Copy, Check, ExternalLink } from "lucide-react";

interface MarkdownContentProps {
  content: string;
  className?: string;
  style?: React.CSSProperties;
}

interface InlineMarkdownProps {
  text: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Render inline AST nodes to pure React Virtual DOM elements
 */
export function renderInlineNodes(nodes: InlineNode[], keyPrefix = "inline"): React.ReactNode[] {
  return nodes.map((node, idx) => {
    const key = `${keyPrefix}-${idx}`;

    switch (node.type) {
      case "text":
        return <React.Fragment key={key}>{node.value}</React.Fragment>;

      case "strong":
        return (
          <strong key={key} className="yd-strong">
            {renderInlineNodes(node.children, key)}
          </strong>
        );

      case "emphasis":
        return (
          <em key={key} className="yd-em">
            {renderInlineNodes(node.children, key)}
          </em>
        );

      case "inlineCode":
        return (
          <code key={key} className="yd-inline-code">
            {node.value}
          </code>
        );

      case "link":
        return (
          <a
            key={key}
            href={node.url}
            target={node.url.startsWith("#") ? undefined : "_blank"}
            rel={node.url.startsWith("#") ? undefined : "noopener noreferrer"}
            className="yd-link"
          >
            <span>{node.text}</span>
            {!node.url.startsWith("#") && (
              <ExternalLink className="inline-block w-3 h-3 ml-0.5 opacity-60" />
            )}
          </a>
        );

      case "lineBreak":
        return <br key={key} />;

      default:
        return null;
    }
  });
}

function CodeBlockRenderer({ language, code }: { language: string; code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback if clipboard API is blocked
    }
  };

  const displayLang = language ? language.toUpperCase() : "CODE";

  return (
    <div className="yd-code-block-wrapper">
      <div className="yd-code-block-header">
        <span className="yd-code-lang">{displayLang}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="yd-code-copy-btn"
          aria-label="Copy code snippet"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="yd-code-pre">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function ListRenderer({
  node,
  keyPrefix,
}: {
  node: BlockNode & { type: "list" };
  keyPrefix: string;
}) {
  const Tag = node.ordered ? "ol" : "ul";

  return (
    <Tag className={`yd-list ${node.ordered ? "yd-list-ordered" : "yd-list-unordered"}`}>
      {node.items.map((item: ListItemNode, idx: number) => {
        const itemKey = `${keyPrefix}-item-${idx}`;
        return (
          <li key={itemKey} className="yd-list-item">
            <span className="yd-list-content">
              {renderInlineNodes(item.children, itemKey)}
            </span>
            {item.subList && (
              <ListRenderer node={item.subList} keyPrefix={`${itemKey}-sub`} />
            )}
          </li>
        );
      })}
    </Tag>
  );
}

function TableRenderer({
  headers,
  rows,
  keyPrefix,
}: {
  headers: TableRow;
  rows: TableRow[];
  keyPrefix: string;
}) {
  return (
    <div className="yd-table-container">
      <table className="yd-table">
        <thead>
          <tr>
            {headers.cells.map((cell, idx) => (
              <th
                key={`${keyPrefix}-th-${idx}`}
                style={{ textAlign: cell.align || "left" }}
                className="yd-th"
              >
                {renderInlineNodes(cell.children, `${keyPrefix}-th-${idx}`)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rIdx) => (
            <tr key={`${keyPrefix}-tr-${rIdx}`}>
              {row.cells.map((cell, cIdx) => (
                <td
                  key={`${keyPrefix}-td-${rIdx}-${cIdx}`}
                  style={{ textAlign: cell.align || "left" }}
                  className="yd-td"
                >
                  {renderInlineNodes(cell.children, `${keyPrefix}-td-${rIdx}-${cIdx}`)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function renderBlockNodes(blocks: BlockNode[], keyPrefix = "block"): React.ReactNode[] {
  return blocks.map((block, idx) => {
    const key = `${keyPrefix}-${idx}`;

    switch (block.type) {
      case "heading": {
        const HeadingTag = `h${block.level}` as keyof JSX.IntrinsicElements;
        return (
          <HeadingTag key={key} className={`yd-heading yd-h${block.level}`}>
            {renderInlineNodes(block.children, key)}
          </HeadingTag>
        );
      }

      case "paragraph":
        return (
          <p key={key} className="yd-p">
            {renderInlineNodes(block.children, key)}
          </p>
        );

      case "codeBlock":
        return (
          <CodeBlockRenderer
            key={key}
            language={block.language}
            code={block.code}
          />
        );

      case "blockquote":
        return (
          <blockquote key={key} className="yd-blockquote">
            {renderBlockNodes(block.blocks, `${key}-inner`)}
          </blockquote>
        );

      case "list":
        return <ListRenderer key={key} node={block} keyPrefix={key} />;

      case "table":
        return (
          <TableRenderer
            key={key}
            headers={block.headers}
            rows={block.rows}
            keyPrefix={key}
          />
        );

      case "horizontalRule":
        return <hr key={key} className="yd-hr" />;

      default:
        return null;
    }
  });
}

/**
 * High-level component for rendering rich multi-line Markdown documents
 */
export function MarkdownContent({
  content,
  className = "",
  style,
}: MarkdownContentProps) {
  if (!content) return null;
  const blocks = parseMarkdown(content);

  return (
    <div className={`yd-markdown-body ${className}`} style={style}>
      {renderBlockNodes(blocks)}
    </div>
  );
}

/**
 * Lightweight component for rendering single-line inline Markdown strings
 */
export function InlineMarkdown({
  text,
  className = "",
  style,
}: InlineMarkdownProps) {
  if (!text) return null;
  const nodes = parseInline(text);

  return (
    <span className={`yd-inline-markdown ${className}`} style={style}>
      {renderInlineNodes(nodes)}
    </span>
  );
}
