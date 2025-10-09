// reCAPTCHA v3 Configuration
// Để lấy site key, truy cập: https://www.google.com/recaptcha/admin
// Chọn reCAPTCHA v3 và thêm domain của bạn

export const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '6LffheIrAAAAAMPxW9w5RhSfneMl37oKf0ktZo8O'

// Note: Key trên là test key của Google, chỉ dùng cho development
// Production cần thay bằng key thật từ Google reCAPTCHA Admin Console

export const RECAPTCHA_OPTIONS = {
  useRecaptchaNet: false,
  autoHideBadge: true, // Hiển thị badge theo quy định của Google
  explicitRenderParameters: {
    badge: 'bottomright', // Vị trí hiển thị badge: bottomright, bottomleft, inline
  },
}
