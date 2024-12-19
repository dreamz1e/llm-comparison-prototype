import { Message } from "@/types/messages";

interface TokenInfoProps {
  tokenUtils?: Message["tokenUtils"];
  role: "user" | "assistant";
}

export const TokenInfo = ({ tokenUtils, role }: TokenInfoProps) => {
  if (!tokenUtils) return null;

  return (
    <div className="text-xs mt-2" style={{ opacity: 0.7 }}>
      {role === "user" ? (
        <span>Prompt tokens: {tokenUtils.promptTokens}</span>
      ) : (
        <span>Completion tokens: {tokenUtils.completionTokens}</span>
      )}
    </div>
  );
};
