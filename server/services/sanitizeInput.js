// Input sanitization to prevent HTML/script injection
function sanitizeInput(input) {
  try {
    if (typeof input !== "string") return "";

    return input
      .replace(/[<>]/g, "")
      .replace(/javascript:/gi, "")
      .replace(/on\w+=/gi, "")
      .trim();
  } catch (err) {
    console.error("Sanitization error:", err);
    return "";
  }
}

export { sanitizeInput };
