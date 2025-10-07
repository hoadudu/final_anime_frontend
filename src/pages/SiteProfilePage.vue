<template>
  <q-page padding>
    <div class="row q-col-gutter-md">
      <div class="col-12 col-md-8">
        <q-card>
          <q-card-section>
            <div class="text-h6">Profile</div>
            <div class="text-subtitle2 text-grey">Basic account information</div>
          </q-card-section>
          <q-separator />
          <q-card-section>
            <div class="row items-center q-col-gutter-md">
              <div class="col-auto">
                <q-avatar size="64px">
                  <img :src="user?.avatarUrl || 'https://cdn.quasar.dev/img/boy-avatar.png'" />
                </q-avatar>
              </div>
              <div class="col">
                <div class="text-subtitle1">{{ user?.name || user?.email }}</div>
                <div class="text-caption">{{ user?.email }}</div>
                <div class="text-caption">ID: {{ user?.id }}</div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuth } from 'src/composables/auth/useAuth'

const { user, isAuthenticated, loadProfile } = useAuth()

onMounted(() => {
  if (isAuthenticated.value && !user.value) {
    loadProfile().catch(() => {})
  }
})
</script>
