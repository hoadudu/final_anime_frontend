/**
 * Utility functions for reset password token encoding/decoding
 */

/**
 * Encode token and email into base64 URL-safe string
 * @param {string} token - Reset password token
 * @param {string} email - User email
 * @returns {string} Base64 encoded string
 */
export function encodeResetPasswordData(token, email) {
  // Create query string format
  const queryString = `?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`

  // Encode to base64
  const base64String = btoa(queryString)

  // Make URL-safe (replace +, /, = characters)
  return base64String.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

/**
 * Decode base64 string to get token and email
 * @param {string} base64String - Base64 encoded string from URL
 * @returns {Object} Object containing token and email, or null if invalid
 */
export function decodeResetPasswordData(base64String) {
  try {
    // Make base64 string standard (reverse URL-safe encoding)
    let standardBase64 = base64String.replace(/-/g, '+').replace(/_/g, '/')

    // Add padding if needed
    while (standardBase64.length % 4) {
      standardBase64 += '='
    }

    // Decode from base64
    const decodedString = atob(standardBase64)

    // Parse query string
    // Expected format: ?token=xxx&email=yyy
    const urlParams = new URLSearchParams(decodedString)
    const token = urlParams.get('token')
    const email = urlParams.get('email')

    if (!token || !email) {
      return null
    }

    return { token, email }
  } catch (error) {
    console.error('Error decoding reset password data:', error)
    return null
  }
}

/**
 * Generate reset password link
 * @param {string} baseUrl - Base URL of the application
 * @param {string} token - Reset password token
 * @param {string} email - User email
 * @returns {string} Full reset password URL
 */
export function generateResetPasswordLink(baseUrl, token, email) {
  const encodedData = encodeResetPasswordData(token, email)
  return `${baseUrl}/#/reset-password/${encodedData}`
}
