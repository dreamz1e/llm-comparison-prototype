export const formatLLMResponse = (text: string): string => {
  if (!text) {
    return "";
  }

  // Extract and process code blocks first
  const processCodeBlocks = (input: string): string => {
    // Handle fenced code blocks with language specification
    input = input.replace(/```(\w+)?\n([\s\S]*?)```/g, (_, language, code) => {
      const lang = language || "text";
      const trimmedCode = code.trim();
      return `\`\`\`${lang}\n${trimmedCode}\n\`\`\``;
    });

    // Handle inline code blocks, but ignore if they're inside code blocks
    input = input.replace(/(?<!`)(`[^`]+`)(?!`)/g, (match, code) => {
      return code.trim();
    });

    return input;
  };

  // Process markdown formatting
  const processMarkdown = (input: string): string => {
    // Ensure proper spacing around headers
    input = input.replace(/(?<=\n)(#{1,6}\s.*?)(?=\n)/g, "\n$1\n");

    // Ensure proper spacing around lists
    input = input.replace(/(?<=\n)(-|\*|\+|\d+\.)\s/g, "\n$&");

    // Ensure proper spacing around blockquotes
    input = input.replace(/(?<=\n)>\s(.*?)(?=\n)/g, "\n> $1\n");

    // Remove excessive line breaks (more than 2)
    input = input.replace(/\n{3,}/g, "\n\n");

    return input;
  };

  // Process the text in the correct order
  let formattedText = text;
  formattedText = processCodeBlocks(formattedText);
  formattedText = processMarkdown(formattedText);

  // Ensure the text starts and ends cleanly
  formattedText = formattedText.trim();

  return formattedText;
};
