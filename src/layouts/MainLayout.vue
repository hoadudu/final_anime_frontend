<template>
  <q-layout style="max-width: 1920px; margin: auto;">
    <!--site header here  -->
    <SiteHeader />
    <!-- site drawer here - đặt sau để đảm bảo drawer nằm trên cùng -->
    <SiteDrawer />

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import SiteHeader from 'src/components/site-header/SiteHeader.vue'
import SiteDrawer from 'src/components/site-drawer/SiteDrawer.vue'


// import { comment } from 'postcss'


</script>
