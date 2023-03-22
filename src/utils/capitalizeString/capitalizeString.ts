/**
 * Capitalize the first letter of a string.
 *
 * @param string - The string to capitalize.
 * @returns The capitalized string.
 */
export default function capitalizeString(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}
