import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { Components } from "react-markdown";

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
    <div className="not-prose my-4">
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
