<template>
  <div class="notification-test">
    <q-card class="q-pa-md">
      <q-card-section>
        <div class="text-h6">Notification System Test</div>
        <div class="text-caption q-mb-md">
          Test the notification modal system with real API data
        </div>

        <div class="q-gutter-sm">
          <q-btn
            color="primary"
            label="Show Latest Notification"
            @click="showLatestNotification"
            :loading="isLoadingNotifications"
          />
          <q-btn
            color="secondary"
            label="Refresh Notifications"
            @click="refreshNotifications"
            :loading="isLoadingNotifications"
          />
          <q-btn
            color="positive"
            label="Mark All as Read"
            @click="markAllAsRead"
            :loading="isMarkingAllAsRead"
          />
        </div>

        <div class="q-mt-md">
          <div class="text-subtitle2">Notification Status:</div>
          <div class="text-body2">
            <strong>Total Notifications:</strong> {{ notifications.length }}<br />
            <strong>Unread Count:</strong> {{ unreadCount }}<br />
            <strong>Has Unread:</strong> {{ hasUnreadNotifications ? 'Yes' : 'No' }}
          </div>
        </div>

        <div v-if="latestNotification" class="q-mt-md">
          <div class="text-subtitle2">Latest Notification:</div>
          <q-card flat bordered class="q-pa-sm">
            <div class="text-weight-medium">{{ latestNotification.title }}</div>
            <div class="text-caption text-grey-6">{{ latestNotification.created_at }}</div>
            <div class="text-body2 q-mt-xs">{{ latestNotification.message }}</div>
            <div class="text-caption">
              <q-chip
                :color="latestNotification.read ? 'positive' : 'warning'"
                text-color="white"
                size="sm"
              >
                {{ latestNotification.read ? 'Read' : 'Unread' }}
              </q-chip>
            </div>
          </q-card>
        </div>

        <div v-if="notificationError" class="q-mt-md">
          <q-banner class="bg-negative text-white">
            <template v-slot:avatar>
              <q-icon name="error" />
            </template>
            <div>Error loading notifications: {{ notificationError.message }}</div>
          </q-banner>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { useNotification } from 'src/composables/useNotification'

const {
  notifications,
  unreadCount,
  hasUnreadNotifications,
  latestNotification,
  isLoadingNotifications,
  isMarkingAllAsRead,
  notificationError,
  showNotification,
  refreshNotifications,
  markAllAsRead,
} = useNotification()

const showLatestNotification = () => {
  if (latestNotification.value) {
    showNotification(latestNotification.value)
  }
}
</script>

<style scoped>
.notification-test {
  max-width: 600px;
  margin: 0 auto;
}
</style>
