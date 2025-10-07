<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="emit('update:modelValue', $event)"
    persistent
    maximized="false"
  >
    <q-card class="q-pa-md" style="min-width: 360px; max-width: 420px">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">
          {{ activeTab === 'login' ? t('auth.login') : t('auth.register') }}
        </div>
        <q-space />
        <q-btn icon="close" flat round dense @click="close" />
      </q-card-section>

      <q-tabs v-model="activeTab" class="text-primary q-mt-sm" dense align="justify">
        <q-tab name="login" :label="t('auth.loginTab')" icon="login" />
        <q-tab name="register" :label="t('auth.registerTab')" icon="person_add" />
      </q-tabs>

      <q-separator />

      <q-tab-panels v-model="activeTab" animated>
        <q-tab-panel name="login">
          <q-form @submit.prevent="onSubmitLogin" class="q-gutter-md">
            <q-input
              v-model="loginForm.email"
              type="email"
              :label="t('auth.email')"
              outlined
              dense
              autocomplete="email"
              :rules="[
                (val) => (val && val.length > 0) || 'Email không được để trống',
                (val) => /.+@.+\..+/.test(val) || 'Email không hợp lệ',
              ]"
              required
            />
            <q-input
              v-model="loginForm.password"
              :type="showPassword ? 'text' : 'password'"
              :label="t('auth.password')"
              outlined
              dense
              autocomplete="current-password"
              :rules="[
                (val) => (val && val.length > 0) || 'Mật khẩu không được để trống',
                (val) => val.length >= 6 || 'Mật khẩu phải có ít nhất 6 ký tự',
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
            <div class="row items-center q-col-gutter-sm">
              <div class="col-12">
                <q-toggle
                  v-model="loginForm.remember"
                  color="primary"
                  :label="t('auth.rememberMe')"
                />
              </div>
            </div>
            <q-btn type="submit" color="primary" class="full-width" :loading="isLoading">{{
              t('auth.login')
            }}</q-btn>
          </q-form>
        </q-tab-panel>

        <q-tab-panel name="register">
          <q-form @submit.prevent="onSubmitRegister" class="q-gutter-md">
            <q-input
              v-model="registerForm.name"
              :label="t('auth.name')"
              outlined
              dense
              autocomplete="name"
              :rules="[
                (val) => (val && val.length > 0) || 'Tên không được để trống',
                (val) => val.length >= 2 || 'Tên phải có ít nhất 2 ký tự',
              ]"
            />
            <q-input
              v-model="registerForm.email"
              type="email"
              :label="t('auth.email')"
              outlined
              dense
              autocomplete="email"
              :rules="[
                (val) => (val && val.length > 0) || 'Email không được để trống',
                (val) => /.+@.+\..+/.test(val) || 'Email không hợp lệ',
              ]"
              required
            />
            <q-input
              v-model="registerForm.password"
              :type="showPassword ? 'text' : 'password'"
              :label="t('auth.password')"
              outlined
              dense
              autocomplete="new-password"
              :rules="[
                (val) => (val && val.length > 0) || 'Mật khẩu không được để trống',
                (val) => val.length >= 8 || 'Mật khẩu phải có ít nhất 8 ký tự',
                (val) =>
                  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(val) ||
                  'Mật khẩu phải chứa chữ hoa, chữ thường và số',
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
              v-model="registerForm.passwordConfirmation"
              :type="showPassword ? 'text' : 'password'"
              label="Xác nhận mật khẩu"
              outlined
              dense
              autocomplete="new-password"
              :rules="[
                (val) => (val && val.length > 0) || 'Vui lòng xác nhận mật khẩu',
                (val) => {
                  // Real-time validation - chỉ kiểm tra khi cả hai field đều có giá trị
                  if (!val || !registerForm.password) return true
                  return val === registerForm.password || 'Mật khẩu xác nhận không khớp'
                },
              ]"
              :error="
                registerForm.passwordConfirmation &&
                registerForm.password &&
                registerForm.passwordConfirmation !== registerForm.password
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
            <q-btn type="submit" color="primary" class="full-width" :loading="isLoading">{{
              t('auth.register')
            }}</q-btn>
          </q-form>
        </q-tab-panel>
      </q-tab-panels>

      <q-card-actions align="between" class="q-pt-none">
        <div class="text-caption text-grey-7">{{ helperText }}</div>
        <q-btn flat color="primary" @click="toggleTab">
          {{ activeTab === 'login' ? t('auth.toRegister') : t('auth.toLogin') }}
        </q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuth } from 'src/composables/auth/useAuth'
import { useQuasar } from 'quasar'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  defaultTab: { type: String, default: 'login' },
})
const emit = defineEmits(['update:modelValue', 'success'])

const { t } = useI18n()
const $q = useQuasar()
const { login, register, isLoading } = useAuth()

const activeTab = ref(props.defaultTab)
const showPassword = ref(false)

const loginForm = ref({ email: '', password: '', remember: true })
const registerForm = ref({ name: '', email: '', password: '', passwordConfirmation: '' })

const helperText = computed(() =>
  activeTab.value === 'login' ? t('auth.noAccountYet') : t('auth.haveAccount'),
)

watch(
  () => props.modelValue,
  (v) => {
    if (!v) return
    // reset forms when dialog opens
    loginForm.value = { email: '', password: '', remember: true }
    registerForm.value = { name: '', email: '', password: '', passwordConfirmation: '' }
    showPassword.value = false
  },
)

// Watch for password changes to update confirmation field validation
watch(
  () => registerForm.value.password,
  () => {
    // Force re-validation of password confirmation field when password changes
    if (registerForm.value.passwordConfirmation) {
      // This will trigger the validation rules to re-run
      registerForm.value = { ...registerForm.value }
    }
  },
)

function close() {
  emit('update:modelValue', false)
}

function toggleTab() {
  activeTab.value = activeTab.value === 'login' ? 'register' : 'login'
}

async function onSubmitLogin() {
  try {
    const payload = { ...loginForm.value }

    // Debug logging để kiểm tra remember value (chỉ trong development)
    if (process.env.NODE_ENV === 'development') {
      console.log('🚀 Login payload before submit:', payload)
    }

    const res = await login(payload)
    $q.notify({ type: 'positive', message: t('auth.loginSuccess') })
    emit('success', { type: 'login', response: res })
    close()
  } catch (e) {
    let message = t('errors.dataLoadError')

    // Handle Laravel-style validation errors: {"email": ["The email has already been taken."]}
    const responseData = e?.response?.data

    // Debug logging (only in development)
    if (process.env.NODE_ENV === 'development') {
      console.log('🚨 Processing error response:', responseData)
    }

    if (responseData) {
      // Check if it's Laravel validation errors format: {"errors": {"email": ["..."]}}
      if (responseData.errors && typeof responseData.errors === 'object') {
        const errors = responseData.errors
        const firstError = Object.values(errors)[0]
        if (Array.isArray(firstError) && firstError.length > 0) {
          message = firstError[0] // Take first error message
        }
      }
      // Handle direct field errors: {"email": ["The email has already been taken."]}
      else if (typeof responseData === 'object') {
        const firstError = Object.values(responseData)[0]
        if (Array.isArray(firstError) && firstError.length > 0) {
          message = firstError[0] // Take first error message
        }
      }
      // Handle nested error structure: {"error": {"email": ["The email has already been taken."]}}
      else if (responseData.error && typeof responseData.error === 'object') {
        const errorData = responseData.error

        // Check if error contains field-specific errors
        if (errorData.email || errorData.password) {
          const fieldErrors = errorData.email || errorData.password
          if (Array.isArray(fieldErrors) && fieldErrors.length > 0) {
            message = fieldErrors[0]
          }
        }
        // Handle standard error codes
        else {
          switch (errorData.code) {
            case 'INVALID_CREDENTIALS':
            case 'INVALID_EMAIL_PASSWORD':
              message = 'Email hoặc mật khẩu không đúng'
              break
            case 'USER_NOT_FOUND':
              message = 'Tài khoản không tồn tại'
              break
            case 'EMAIL_ALREADY_EXISTS':
            case 'USER_ALREADY_EXISTS':
              message = 'Email đã được sử dụng'
              break
            case 'WEAK_PASSWORD':
              message = 'Mật khẩu quá yếu. Vui lòng chọn mật khẩu mạnh hơn'
              break
            case 'INVALID_EMAIL':
              message = 'Định dạng email không hợp lệ'
              break
            case 'TOO_MANY_ATTEMPTS':
            case 'RATE_LIMIT_EXCEEDED':
              message = 'Quá nhiều lần thử đăng nhập. Vui lòng thử lại sau'
              break
            case 'ACCOUNT_LOCKED':
              message = 'Tài khoản đã bị khóa. Vui lòng liên hệ hỗ trợ'
              break
            case 'EMAIL_NOT_VERIFIED':
              message = 'Vui lòng xác thực email trước khi đăng nhập'
              break
            default:
              // Use backend message if available, otherwise fallback
              message = errorData.message || t('errors.dataLoadError')
          }
        }
      }
      // Handle simple string error
      else if (typeof responseData === 'string') {
        message = responseData
      }
      // Handle error message in response
      else if (responseData.message) {
        message = responseData.message
      }
    }

    // Debug logging (only in development)
    if (process.env.NODE_ENV === 'development') {
      console.log('📢 Final error message:', message)
    }

    $q.notify({ type: 'negative', message })
  }
}

async function onSubmitRegister() {
  try {
    // Validate password confirmation before submitting
    if (registerForm.value.password !== registerForm.value.passwordConfirmation) {
      $q.notify({ type: 'negative', message: 'Mật khẩu xác nhận không khớp' })
      return
    }

    const payload = {
      name: registerForm.value.name,
      email: registerForm.value.email,
      password: registerForm.value.password,
      password_confirmation: registerForm.value.passwordConfirmation,
    }

    const res = await register(payload)
    // Sau khi đăng ký thành công có thể tự động chuyển sang login
    activeTab.value = 'login'
    $q.notify({ type: 'positive', message: t('auth.registerSuccess') })
    emit('success', { type: 'register', response: res })
  } catch (e) {
    let message = t('errors.dataLoadError')

    // Handle Laravel-style validation errors: {"email": ["The email has already been taken."]}
    const responseData = e?.response?.data

    // Debug logging (only in development)
    if (process.env.NODE_ENV === 'development') {
      console.log('🚨 Processing error response:', responseData)
    }

    if (responseData) {
      // Check if it's Laravel validation errors format: {"errors": {"email": ["..."]}}
      if (responseData.errors && typeof responseData.errors === 'object') {
        const errors = responseData.errors
        const firstError = Object.values(errors)[0]
        if (Array.isArray(firstError) && firstError.length > 0) {
          message = firstError[0] // Take first error message
        }
      }
      // Handle direct field errors: {"email": ["The email has already been taken."]}
      else if (typeof responseData === 'object') {
        const firstError = Object.values(responseData)[0]
        if (Array.isArray(firstError) && firstError.length > 0) {
          message = firstError[0] // Take first error message
        }
      }
      // Handle nested error structure: {"error": {"email": ["The email has already been taken."]}}
      else if (responseData.error && typeof responseData.error === 'object') {
        const errorData = responseData.error

        // Check if error contains field-specific errors
        if (
          errorData.email ||
          errorData.password ||
          errorData.name ||
          errorData.password_confirmation
        ) {
          const fieldErrors =
            errorData.email ||
            errorData.password ||
            errorData.name ||
            errorData.password_confirmation
          if (Array.isArray(fieldErrors) && fieldErrors.length > 0) {
            message = fieldErrors[0]
          }
        }
        // Handle standard error codes
        else {
          switch (errorData.code) {
            case 'INVALID_CREDENTIALS':
            case 'INVALID_EMAIL_PASSWORD':
              message = 'Email hoặc mật khẩu không đúng'
              break
            case 'USER_NOT_FOUND':
              message = 'Tài khoản không tồn tại'
              break
            case 'EMAIL_ALREADY_EXISTS':
            case 'USER_ALREADY_EXISTS':
              message = 'Email đã được sử dụng'
              break
            case 'WEAK_PASSWORD':
              message = 'Mật khẩu quá yếu. Vui lòng chọn mật khẩu mạnh hơn'
              break
            case 'INVALID_EMAIL':
              message = 'Định dạng email không hợp lệ'
              break
            case 'TOO_MANY_ATTEMPTS':
            case 'RATE_LIMIT_EXCEEDED':
              message = 'Quá nhiều lần thử đăng nhập. Vui lòng thử lại sau'
              break
            case 'ACCOUNT_LOCKED':
              message = 'Tài khoản đã bị khóa. Vui lòng liên hệ hỗ trợ'
              break
            case 'EMAIL_NOT_VERIFIED':
              message = 'Vui lòng xác thực email trước khi đăng nhập'
              break
            case 'PASSWORD_CONFIRMATION_MISMATCH':
              message = 'Mật khẩu xác nhận không khớp'
              break
            default:
              // Use backend message if available, otherwise fallback
              message = errorData.message || t('errors.dataLoadError')
          }
        }
      }
      // Handle simple string error
      else if (typeof responseData === 'string') {
        message = responseData
      }
      // Handle error message in response
      else if (responseData.message) {
        message = responseData.message
      }
    }

    // Debug logging (only in development)
    if (process.env.NODE_ENV === 'development') {
      console.log('📢 Final error message:', message)
    }

    $q.notify({ type: 'negative', message })
  }
}
</script>

<style scoped>
.full-width {
  width: 100%;
}
</style>
