<template>
  <div class="profile-settings">
    <q-card flat bordered class="settings-card">
      <q-card-section>
        <h3 class="text-h5 text-weight-bold q-mb-lg">{{ t('profile.settings') }}</h3>

        <!-- ========== PROFILE INFO FORM ========== -->
        <q-form @submit="updateProfile" class="setting-section">
          <h4 class="text-h6 q-mb-md">{{ t('profile.profileInfo') }}</h4>

          <div class="row q-col-gutter-md">
            <!-- Username (Read-only) -->
            <div class="col-12 col-md-6">
              <q-input
                :model-value="profileData?.user?.username"
                :label="t('profile.username')"
                outlined
                readonly
                :hint="t('profile.usernameCannotChange')"
              >
                <template v-slot:prepend>
                  <q-icon name="person" />
                </template>
              </q-input>
            </div>

            <!-- Email (Read-only) -->
            <div class="col-12 col-md-6">
              <q-input
                :model-value="profileData?.user?.email"
                :label="t('profile.email')"
                outlined
                readonly
                :hint="t('profile.emailCannotChange')"
              >
                <template v-slot:prepend>
                  <q-icon name="email" />
                </template>
              </q-input>
            </div>

            <!-- Display Name -->
            <div class="col-12 col-md-6">
              <q-input
                v-model="profileForm.name"
                :label="t('profile.displayName')"
                outlined
                :rules="[(val) => !!val || t('profile.nameRequired')]"
              >
                <template v-slot:prepend>
                  <q-icon name="badge" />
                </template>
              </q-input>
            </div>

            <!-- Bio -->
            <div class="col-12">
              <q-input
                v-model="profileForm.bio"
                :label="t('profile.bio')"
                outlined
                type="textarea"
                rows="3"
                :hint="t('profile.bioHint')"
              >
                <template v-slot:prepend>
                  <q-icon name="description" />
                </template>
              </q-input>
            </div>
          </div>

          <!-- Submit Button -->
          <div class="q-mt-lg">
            <q-btn
              type="submit"
              color="primary"
              :label="t('profile.updateProfile')"
              :loading="isUpdatingProfile"
              :disable="!hasProfileChanges"
              unelevated
              rounded
            />
          </div>
        </q-form>

        <!-- ========== CHANGE PASSWORD FORM ========== -->
        <q-form @submit="changePassword" class="setting-section q-mt-xl">
          <h4 class="text-h6 q-mb-md">{{ t('profile.changePassword') }}</h4>

          <div class="row q-col-gutter-md">
            <!-- Current Password -->
            <div class="col-12 col-md-6">
              <q-input
                v-model="passwordForm.currentPassword"
                :label="t('profile.currentPassword')"
                outlined
                type="password"
                :rules="[(val) => !!val || t('profile.passwordRequired')]"
              >
                <template v-slot:prepend>
                  <q-icon name="lock" />
                </template>
              </q-input>
            </div>

            <!-- New Password -->
            <div class="col-12 col-md-6">
              <q-input
                v-model="passwordForm.newPassword"
                :label="t('profile.newPassword')"
                outlined
                type="password"
                :rules="[
                  (val) => !!val || t('profile.passwordRequired'),
                  (val) => val.length >= 6 || t('profile.passwordMinLength'),
                ]"
              >
                <template v-slot:prepend>
                  <q-icon name="lock_outline" />
                </template>
              </q-input>
            </div>

            <!-- Confirm Password -->
            <div class="col-12 col-md-6">
              <q-input
                v-model="passwordForm.confirmPassword"
                :label="t('profile.confirmPassword')"
                outlined
                type="password"
                :rules="[
                  (val) => !!val || t('profile.passwordRequired'),
                  (val) => val === passwordForm.newPassword || t('profile.passwordsDoNotMatch'),
                ]"
              >
                <template v-slot:prepend>
                  <q-icon name="lock_outline" />
                </template>
              </q-input>
            </div>
          </div>

          <!-- Submit Button -->
          <div class="q-mt-lg">
            <q-btn
              type="submit"
              color="primary"
              :label="t('profile.changePassword')"
              :loading="isChangingPassword"
              :disable="!hasPasswordChanges"
              unelevated
              rounded
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'
import {
  useUpdateProfileSettings,
  useChangePassword,
} from 'src/composables/profile-page/useProfileSettings.js'

// ========== PROPS ==========
const props = defineProps({
  profileData: {
    type: Object,
    default: () => ({}),
  },
})

// ========== COMPOSABLES ==========
const { t } = useI18n()
const $q = useQuasar()

// ========== REACTIVE DATA ==========
const profileForm = ref({
  name: '',
  bio: '',
})
const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

// ========== QUERIES & MUTATIONS ==========
const { mutate: updateProfileMutation, isPending: isUpdatingProfile } = useUpdateProfileSettings()

const { mutate: changePasswordMutation, isPending: isChangingPassword } = useChangePassword()

// ========== COMPUTED ==========
const hasProfileChanges = computed(() => {
  return (
    profileForm.value.name !== props.profileData?.user?.name ||
    profileForm.value.bio !== props.profileData?.user?.bio
  )
})

const hasPasswordChanges = computed(() => {
  return (
    passwordForm.value.currentPassword &&
    passwordForm.value.newPassword &&
    passwordForm.value.confirmPassword
  )
})

// ========== WATCHERS ==========
watch(
  () => props.profileData,
  (newData) => {
    if (newData?.user) {
      profileForm.value.name = newData.user.name || ''
      profileForm.value.bio = newData.user.bio || ''
    }
  },
  { immediate: true, deep: true },
)

// ========== METHODS ==========
const updateProfile = () => {
  const payload = {
    name: profileForm.value.name,
    bio: profileForm.value.bio,
  }

  updateProfileMutation(payload, {
    onSuccess: (data) => {
      console.log('Profile update success in component:', data)
      $q.notify({
        type: 'positive',
        message: t('profile.profileUpdated'),
        position: 'top',
        timeout: 2000,
      })
    },
    onError: (error) => {
      console.error('Profile update error in component:', error)

      // Don't show error for blocked OPTIONS requests
      if (error.message?.includes('Unnecessary OPTIONS request blocked')) {
        console.log('Skipping error notification for blocked OPTIONS request')
        return
      }

      $q.notify({
        type: 'negative',
        message: error.response?.data?.message || t('profile.updateError'),
        position: 'top',
        timeout: 3000,
      })
    },
  })
}

const changePassword = () => {
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    $q.notify({
      type: 'negative',
      message: t('profile.passwordsDoNotMatch'),
      position: 'top',
    })
    return
  }

  const payload = {
    current_password: passwordForm.value.currentPassword,
    new_password: passwordForm.value.newPassword,
  }

  changePasswordMutation(payload, {
    onSuccess: (data) => {
      console.log('Password change success in component:', data)
      $q.notify({
        type: 'positive',
        message: t('profile.passwordChanged'),
        position: 'top',
        timeout: 2000,
      })
      // Reset password form
      passwordForm.value = {
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }
    },
    onError: (error) => {
      console.error('Password change error in component:', error)

      // Don't show error for blocked OPTIONS requests
      if (error.message?.includes('Unnecessary OPTIONS request blocked')) {
        console.log('Skipping error notification for blocked OPTIONS request')
        return
      }

      $q.notify({
        type: 'negative',
        message: error.response?.data?.message || t('profile.passwordChangeError'),
        position: 'top',
        timeout: 3000,
      })
    },
  })
}
</script>

<style lang="scss" scoped>
.profile-settings {
  .settings-card {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 12px;
    overflow: hidden;
  }

  .setting-section {
    padding-bottom: 24px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);

    &:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }

    h4 {
      color: rgba(255, 255, 255, 0.95);
    }
  }

  :deep(.q-field__control) {
    background: rgba(255, 255, 255, 0.03);
    color: rgba(255, 255, 255, 0.9);
  }

  :deep(.q-field__native) {
    color: rgba(255, 255, 255, 0.9);
  }

  :deep(.q-field__label) {
    color: rgba(255, 255, 255, 0.6);
  }

  :deep(.q-field--readonly .q-field__control) {
    background: rgba(255, 255, 255, 0.01);
    opacity: 0.7;
  }

  :deep(.q-skeleton) {
    background: rgba(255, 255, 255, 0.05);

    &::after {
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.08), transparent);
    }
  }
}
</style>
