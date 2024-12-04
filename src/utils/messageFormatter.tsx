import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { Components } from "react-markdown";
import { useState } from "react";
import { FullscreenCode } from "@/components/FullscreenCode";

interface CodeBlockProps {
  node?: unknown;
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
}

interface MessageFormatterProps {
  content: string;
}

const CodeBlock = ({
  inline,
  className,
  children,
  ...props
}: CodeBlockProps) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const match = /language-(\w+)/.exec(className || "");
  const language = match ? match[1] : "";

  if (inline) {
    return (
      <code
        className="bg-gray-100 dark:bg-gray-800 rounded px-1 py-0.5 font-mono text-sm"
        tabIndex={0}
        {...props}
      >
        {children}
      </code>
    );
  }

  return (
    <>
      <div className="not-prose my-4 relative group">
        <button
          onClick={() => setIsFullscreen(true)}
          className="absolute top-2 right-2 p-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-lg text-white opacity-90 group-hover:opacity-100 transition-all duration-200 border border-white/20 shadow-lg"
          aria-label="View code in fullscreen"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0 0l-5-5m-7 11h4m-4 0v4m0-4l5 5m5-9v4m0-4h-4m4 0l-5 5"
            />
          </svg>
        </button>
        <SyntaxHighlighter
          style={oneDark}
          language={language || "text"}
          PreTag="div"
          className="rounded-md"
          tabIndex={0}
          {...props}
        >
          {String(children).replace(/\n$/, "")}
        </SyntaxHighlighter>
      </div>
      {isFullscreen && (
        <FullscreenCode
          code={String(children)}
          language={language}
          onClose={() => setIsFullscreen(false)}
        />
      )}
    </>
  );
};

export const MessageFormatter = ({ content }: MessageFormatterProps) => {
  const components: Components = {
    code: CodeBlock as Components["code"],
    p: ({ children }) => <div className="mb-4">{children}</div>,
    li: ({ children }) => <li className="my-1">{children}</li>,
    pre: ({ children }) => <>{children}</>,
  };

  if (!content) {
    return null;
  }

  return (
    <article className="prose dark:prose-invert max-w-none">
      <ReactMarkdown components={components}>{content}</ReactMarkdown>
    </article>
  );
};
