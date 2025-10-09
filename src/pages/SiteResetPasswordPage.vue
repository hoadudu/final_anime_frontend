<template>
  <q-page class="flex flex-center">
    <div class="q-pa-md" style="min-width: 400px; max-width: 500px">
      <q-card class="q-pa-lg">
        <q-card-section class="text-center">
          <div class="text-h5 q-mb-md">{{ t('auth.resetPasswordTitle') }}</div>
          <div class="text-body2 text-grey-7 q-mb-sm">{{ t('auth.resetPasswordDescription') }}</div>

          <!-- Warning if no token/email in URL -->
          <q-banner v-if="!token || !email" class="bg-warning text-dark q-mt-md" rounded dense>
            <template v-slot:avatar>
              <q-icon name="warning" color="warning" />
            </template>
            <div class="text-caption">
              Liên kết đặt lại mật khẩu không hợp lệ. Vui lòng truy cập từ email đặt lại mật khẩu.
            </div>
          </q-banner>
        </q-card-section>

        <q-card-section>
          <q-form @submit.prevent="onSubmitResetPassword" class="q-gutter-md">
            <!-- Display email (readonly) -->
            <q-input
              v-model="email"
              label="Email"
              outlined
              dense
              readonly
              :disable="!email"
              :hint="email ? 'Email của bạn' : 'Không có email trong liên kết'"
            >
              <template #prepend>
                <q-icon name="email" />
              </template>
            </q-input>

            <!-- Display token (masked) -->
            <q-input
              v-model="maskedToken"
              label="Token xác thực"
              outlined
              dense
              readonly
              :disable="!token"
              :hint="token ? 'Token đặt lại mật khẩu' : 'Không có token trong liên kết'"
            >
              <template #prepend>
                <q-icon name="vpn_key" />
              </template>
            </q-input>

            <q-separator class="q-my-md" />

            <q-input
              v-model="resetForm.password"
              :type="showPassword ? 'text' : 'password'"
              :label="t('auth.newPassword')"
              outlined
              dense
              autocomplete="new-password"
              :rules="[
                (val) => (val && val.length > 0) || t('auth.passwordRequired'),
                (val) => val.length >= 8 || t('auth.passwordMinLength'),
                (val) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(val) || t('auth.passwordStrength'),
              ]"
              required
            >
              <template #append>
                <q-icon
                  :name="showPassword ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="showPassword = !showPassword"
                />
              </template>
            </q-input>

            <q-input
              v-model="resetForm.passwordConfirmation"
              :type="showPassword ? 'text' : 'password'"
              label="Xác nhận mật khẩu mới"
              outlined
              dense
              autocomplete="new-password"
              :rules="[
                (val) => (val && val.length > 0) || 'Vui lòng xác nhận mật khẩu',
                (val) => val === resetForm.password || 'Mật khẩu xác nhận không khớp',
              ]"
              :error="
                resetForm.passwordConfirmation &&
                resetForm.password &&
                resetForm.passwordConfirmation !== resetForm.password
              "
              error-message="Mật khẩu xác nhận không khớp"
              required
            >
              <template #append>
                <q-icon
                  :name="showPassword ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="showPassword = !showPassword"
                />
              </template>
            </q-input>

            <q-btn type="submit" color="primary" class="full-width" :loading="isLoading" size="md">
              {{ t('auth.resetPassword') }}
            </q-btn>
          </q-form>
        </q-card-section>

        <q-card-section class="text-center">
          <q-btn flat color="primary" @click="goToLogin">
            {{ t('auth.backToLogin') }}
          </q-btn>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from 'src/composables/auth/useAuth'
import { useQuasar } from 'quasar'
import { decodeResetPasswordData } from 'src/utils/reset-password'
import { useReCaptcha } from 'vue-recaptcha-v3'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const $q = useQuasar()
const { resetPassword, isLoading } = useAuth()
const { executeRecaptcha, recaptchaLoaded } = useReCaptcha()

const showPassword = ref(false)
const resetForm = ref({
  password: '',
  passwordConfirmation: '',
})

// Decode base64 string from URL to get token and email
const decodedData = computed(() => {
  const encodedData = route.params.encodedData
  if (!encodedData) {
    // Fallback to query params for backward compatibility
    if (route.query.token && route.query.email) {
      return {
        token: route.query.token,
        email: route.query.email,
      }
    }
    return null
  }

  return decodeResetPasswordData(encodedData)
})

const token = computed(() => decodedData.value?.token || '')
const email = computed(() => decodedData.value?.email || '')

// Masked token for display (show first 10 and last 10 chars with dots in between)
const maskedToken = computed(() => {
  if (!token.value) return ''
  const tokenStr = token.value
  if (tokenStr.length <= 20) {
    // If token is short, show first few chars
    return tokenStr.substring(0, 8) + '...'
  }
  // Show first 10 and last 10 chars
  return tokenStr.substring(0, 10) + '...' + tokenStr.substring(tokenStr.length - 10)
})

// Watch for password changes to update confirmation field validation
watch(
  () => resetForm.value.password,
  () => {
    // Force re-validation of password confirmation field when password changes
    if (resetForm.value.passwordConfirmation) {
      resetForm.value = { ...resetForm.value }
    }
  },
)

async function onSubmitResetPassword() {
  try {
    // Validate token and email from URL
    if (!token.value || !email.value) {
      $q.notify({
        type: 'negative',
        message: 'Liên kết đặt lại mật khẩu không hợp lệ. Vui lòng kiểm tra email của bạn.',
      })
      return
    }

    // Validate password confirmation before submitting
    if (resetForm.value.password !== resetForm.value.passwordConfirmation) {
      $q.notify({ type: 'negative', message: 'Mật khẩu xác nhận không khớp' })
      return
    }

    // Get reCAPTCHA token
    await recaptchaLoaded()
    const recaptchaToken = await executeRecaptcha('reset_password')

    const payload = {
      token: token.value,
      email: email.value,
      password: resetForm.value.password,
      password_confirmation: resetForm.value.passwordConfirmation,
      recaptcha_token: recaptchaToken,
    }

    // Debug logging (only in development)
    if (process.env.NODE_ENV === 'development') {
      console.log('🔑 Reset password payload:', {
        ...payload,
        password: '***',
        password_confirmation: '***',
      })
    }

    await resetPassword(payload)
    $q.notify({ type: 'positive', message: t('auth.passwordResetSuccess') })

    // Redirect to login page after successful reset
    router.push({ name: 'home', query: { login: '1' } })
  } catch (e) {
    const errorData = e?.response?.data?.error
    let message = t('errors.dataLoadError')

    if (errorData) {
      // Map backend error codes to user-friendly messages
      switch (errorData.code) {
        case 'INVALID_TOKEN':
          message = 'Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn'
          break
        case 'USER_NOT_FOUND':
          message = 'Không tìm thấy tài khoản với thông tin này'
          break
        case 'WEAK_PASSWORD':
          message = 'Mật khẩu quá yếu. Vui lòng chọn mật khẩu mạnh hơn'
          break
        case 'PASSWORD_CONFIRMATION_MISMATCH':
          message = 'Mật khẩu xác nhận không khớp'
          break
        default:
          message = errorData.message || t('errors.dataLoadError')
      }
    }

    // Debug logging (only in development)
    if (process.env.NODE_ENV === 'development') {
      console.log('🚨 Reset password error:', e?.response?.data)
      console.log('📢 Final error message:', message)
    }

    $q.notify({ type: 'negative', message })
  }
}

function goToLogin() {
  router.push({ name: 'home', query: { login: '1' } })
}
</script>

<style scoped>
.full-width {
  width: 100%;
}
</style>
