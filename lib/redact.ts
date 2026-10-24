/**
 * Centralized, shared redaction helper for logging and error reporting.
 * Prevents API keys, access tokens, and sensitive credential query parameters
 * from being written to server console logs, monitoring outputs, or diagnostics.
 */

/**
 * Redacts known sensitive credential patterns from strings.
 * Explicitly targets Google Gemini API key URLs (?key=..., &key=..., key=...),
 * authorization headers, and token assignments.
 */
export function redactSensitive(text: string): string {
  if (!text || typeof text !== "string") {
    return "";
  }

  return text
    // Replace URL query params: ?key=AIza... or &key=AIza...
    .replace(/([?&]key=)[^&\s"'`]+/gi, "$1[REDACTED]")
    // Replace standalone key=... or api_key=...
    .replace(/(?:^|[\s,;{}()[\]])(key|api[_-]?key|token|secret)=([^\s&"'`]+)/gi, (match, prefix, val) => {
      return match.replace(val, "[REDACTED]");
    })
    // Replace Authorization headers (Bearer, Basic)
    .replace(/(Bearer\s+)[a-zA-Z0-9_\-\.]+/gi, "$1[REDACTED]")
    // Replace AIza Google API key pattern directly if found in freeform text
    .replace(/\bAIza[0-9A-Za-z\-_]{20,50}\b/g, "[REDACTED_API_KEY]");
}

/**
 * Formats an unknown error or object into a bounded, safely redacted string for server logging.
 */
export function sanitizeLogMessage(err: unknown, maxLength = 250): string {
  if (err === null || err === undefined) {
    return "";
  }

  let message = "";
  if (err instanceof Error) {
    message = err.message || err.toString();
  } else if (typeof err === "object") {
    try {
      message = JSON.stringify(err);
    } catch {
      message = String(err);
    }
  } else {
    message = String(err);
  }

  const redacted = redactSensitive(message);
  return redacted.length > maxLength ? `${redacted.slice(0, maxLength)}...` : redacted;
}
