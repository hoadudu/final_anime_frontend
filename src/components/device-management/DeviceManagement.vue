<template>
  <q-card>
    <q-card-section>
      <div class="text-h6">{{ t('deviceManagement.title') }}</div>
      <div class="text-caption text-grey-7">{{ t('deviceManagement.subtitle') }}</div>
    </q-card-section>

    <q-separator />

    <!-- Loading State -->
    <q-card-section v-if="isLoading && devices.length === 0">
      <div class="row justify-center q-py-lg">
        <q-spinner color="primary" size="3em" />
      </div>
    </q-card-section>

    <!-- Error State -->
    <q-card-section v-else-if="error">
      <q-banner class="bg-negative text-white" rounded>
        <template v-slot:avatar>
          <q-icon name="error" color="white" />
        </template>
        {{ error }}
      </q-banner>
      <div class="row justify-center q-mt-md">
        <q-btn outline color="primary" @click="refresh">
          {{ t('common.retry') }}
        </q-btn>
      </div>
    </q-card-section>

    <!-- Device List -->
    <q-card-section v-else-if="sortedDevices.length > 0">
      <q-list separator>
        <q-item v-for="device in sortedDevices" :key="device.device_fingerprint">
          <q-item-section avatar>
            <q-avatar :color="device.is_current ? 'primary' : 'grey-5'" text-color="white">
              <q-icon :name="getDeviceIcon(device.device_name)" />
            </q-avatar>
          </q-item-section>

          <q-item-section>
            <q-item-label>
              {{ device.device_name }}
              <q-badge v-if="device.is_current" color="primary" class="q-ml-sm">
                {{ t('deviceManagement.currentDevice') }}
              </q-badge>
            </q-item-label>
            <q-item-label caption>
              <div>{{ t('deviceManagement.ipAddress') }}: {{ device.ip_address }}</div>
              <div>{{ t('deviceManagement.lastUsed') }}: {{ formatDate(device.last_used_at) }}</div>
              <div>{{ t('deviceManagement.createdAt') }}: {{ formatDate(device.created_at) }}</div>
            </q-item-label>
          </q-item-section>

          <q-item-section side v-if="!device.is_current">
            <q-btn
              flat
              round
              dense
              color="negative"
              icon="delete"
              @click="confirmRevokeDevice(device)"
              :loading="isLoading"
            >
              <q-tooltip>{{ t('deviceManagement.revokeDevice') }}</q-tooltip>
            </q-btn>
          </q-item-section>
        </q-item>
      </q-list>

      <!-- Actions -->
      <div class="row justify-end q-mt-md q-gutter-sm">
        <q-btn
          outline
          color="primary"
          icon="refresh"
          :label="t('common.refresh')"
          @click="refresh"
          :loading="isLoading"
        />
        <q-btn
          v-if="otherDevices.length > 0"
          outline
          color="negative"
          icon="logout"
          :label="t('deviceManagement.revokeAllOthers')"
          @click="confirmRevokeOthers"
          :loading="isLoading"
        />
      </div>
    </q-card-section>

    <!-- Empty State -->
    <q-card-section v-else>
      <div class="text-center text-grey-7 q-py-lg">
        <q-icon name="devices" size="4em" />
        <div class="text-subtitle1 q-mt-md">{{ t('deviceManagement.noDevices') }}</div>
      </div>
    </q-card-section>

    <!-- Token Stats (Optional) -->
    <q-separator v-if="tokenStats" />
    <q-card-section v-if="tokenStats" class="bg-grey-1">
      <div class="text-subtitle2 q-mb-sm">{{ t('deviceManagement.tokenStats') }}</div>
      <div class="row q-gutter-md">
        <div class="col">
          <div class="text-h6 text-primary">{{ tokenStats.valid }}</div>
          <div class="text-caption">{{ t('deviceManagement.activeDevices') }}</div>
        </div>
        <div class="col">
          <div class="text-h6">{{ tokenStats.expired }}</div>
          <div class="text-caption">{{ t('deviceManagement.expiredTokens') }}</div>
        </div>
        <div class="col">
          <div class="text-h6">{{ tokenStats.revoked }}</div>
          <div class="text-caption">{{ t('deviceManagement.revokedTokens') }}</div>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuasar, date } from 'quasar'
import { useDeviceManagement } from 'src/composables/device-management/useDeviceManagement'

const { t } = useI18n()
const $q = useQuasar()

const {
  devices,
  tokenStats,
  isLoading,
  error,
  sortedDevices,
  otherDevices,
  revokeDevice,
  revokeOtherDevices,
  refresh,
} = useDeviceManagement()

// Load data on mount
onMounted(() => {
  refresh()
})

// Get device icon based on device name
function getDeviceIcon(deviceName) {
  if (!deviceName) return 'devices'

  const name = deviceName.toLowerCase()

  if (name.includes('mobile') || name.includes('iphone') || name.includes('android')) {
    return 'smartphone'
  } else if (name.includes('tablet') || name.includes('ipad')) {
    return 'tablet'
  } else if (name.includes('desktop') || name.includes('windows') || name.includes('mac')) {
    return 'computer'
  } else {
    return 'devices'
  }
}

// Format date
function formatDate(dateString) {
  if (!dateString) return '-'
  return date.formatDate(new Date(dateString), 'DD/MM/YYYY HH:mm')
}

// Confirm revoke device
function confirmRevokeDevice(device) {
  $q.dialog({
    title: t('deviceManagement.confirmRevokeTitle'),
    message: t('deviceManagement.confirmRevokeMessage', { device: device.device_name }),
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      await revokeDevice(device.device_fingerprint)
      $q.notify({
        type: 'positive',
        message: t('deviceManagement.deviceRevoked'),
      })
    } catch {
      $q.notify({
        type: 'negative',
        message: t('errors.dataLoadError'),
      })
    }
  })
}

// Confirm revoke all other devices
function confirmRevokeOthers() {
  $q.dialog({
    title: t('deviceManagement.confirmRevokeAllTitle'),
    message: t('deviceManagement.confirmRevokeAllMessage', { count: otherDevices.value.length }),
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      const result = await revokeOtherDevices()
      $q.notify({
        type: 'positive',
        message: t('deviceManagement.devicesRevoked', { count: result.revoked_count }),
      })
    } catch {
      $q.notify({
        type: 'negative',
        message: t('errors.dataLoadError'),
      })
    }
  })
}
</script>

<style scoped>
.q-item {
  padding: 16px;
}
</style>
