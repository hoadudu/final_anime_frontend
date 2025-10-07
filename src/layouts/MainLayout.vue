<template>
  <q-layout view="hHh lpR fFf">
    <!--site header here  -->
    <SiteHeader @open-auth="openAuth" />
    <!-- site drawer here - đặt sau để đảm bảo drawer nằm trên cùng -->
    <SiteDrawer />

    <q-page-container>
      <router-view />
    </q-page-container>

    <AuthDialog v-model="showAuth" @success="onAuthSuccess" />
  </q-layout>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SiteHeader from 'src/components/site-header/SiteHeader.vue'
import SiteDrawer from 'src/components/site-drawer/SiteDrawer.vue'
import AuthDialog from 'src/components/modals/AuthDialog.vue'
import { useQuasar } from 'quasar'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()

const showAuth = ref(false)

function openAuth() {
  showAuth.value = true
}

function onAuthSuccess() {
  // nếu có redirect trên query, điều hướng sau khi đăng nhập/đăng ký thành công
  const redirect = route.query.redirect
  if (redirect && typeof redirect === 'string') {
    router.replace({ path: redirect, query: {} }).catch(() => {})
  }
  $q.notify({ type: 'positive', message: 'Logged in successfully' })
}

watch(
  () => route.query,
  (q) => {
    if (q && q.login === '1') {
      showAuth.value = true
      // loại bỏ tham số login khỏi URL để tránh mở lại khi back/forward
      const { login: _login, ...rest } = q
      void _login
      router.replace({ query: { ...rest } }).catch(() => {})
    }
  },
  { immediate: true },
)
</script>
