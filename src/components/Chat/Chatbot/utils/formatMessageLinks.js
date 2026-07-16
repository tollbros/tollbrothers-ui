/**
 * Formats a message to convert phone numbers and URLs into markdown links
 * @param {string} message - The message text to format
 * @returns {string} - The formatted message with markdown links
 */
export const formatMessageLinks = (message) => {
  if (!message) return message

  let formattedMessage = message

  // Phone number regex - matches various formats:
  // (123) 456-7890, 123-456-7890, 123.456.7890, 1234567890
  // Also handles +1 country codes
  const phoneRegex = /(\+?1?[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g

  // URL regex - matches URLs with or without http(s)://
  // Matches: https://example.com, http://example.com, www.example.com, example.com/path
  // Only match URLs that aren't already part of markdown links or tel: links
  const urlRegex =
    /(?<!\[)(?<!\()(?<!tel:)(?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+(?:\/[^\s)]*)?(?!\))/g

  // Replace phone numbers with tel: markdown links
  formattedMessage = formattedMessage.replace(phoneRegex, (match) => {
    // Trim any leading/trailing whitespace from the match
    const trimmedMatch = match.trim()
    const leadingSpace = match.match(/^\s*/)[0]
    const trailingSpace = match.match(/\s*$/)[0]

    // Clean the phone number for the href (remove spaces, dots, dashes, parentheses, plus)
    const cleanNumber = trimmedMatch.replace(/[-.\s()+]/g, '')

    // Only create link if we have a valid phone number
    if (cleanNumber.length >= 10) {
      return `${leadingSpace}[${trimmedMatch}](tel:${cleanNumber})${trailingSpace}`
    }
    return match
  })

  // Replace URLs with markdown links, but only for tollbrothers.com domains
  // This supports all subdomains: www.tollbrothers.com, home.tollbrothers.com, qa.tollbrothers.com, etc.
  formattedMessage = formattedMessage.replace(urlRegex, (match) => {
    // Only create links for URLs containing tollbrothers.com (with or without subdomain)
    if (match.includes('tollbrothers.com')) {
      // Add https:// if no protocol is present
      let url = match
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = `https://${url}`
      } else if (url.startsWith('http://')) {
        // Convert http:// to https:// for security
        url = url.replace(/^http:\/\//i, 'https://')
      }
      return `[${match}](${url})`
    }
    // If not a tollbrothers.com URL, leave it as is
    return match
  })

  return formattedMessage
}
