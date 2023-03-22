export default function isSentence(text: string) {
  const trimmedText = text.trim();

  return (
    trimmedText.endsWith(".") ||
    trimmedText.endsWith("!") ||
    trimmedText.endsWith("?")
  );
}
