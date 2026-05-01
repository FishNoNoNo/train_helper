<script setup lang="ts">
import eventHandler from '@/hook/eventHandler'
import appService from '@/service/app.service'
import { onMounted, onUnmounted } from 'vue'

onMounted(() => {
  eventHandler.init()
  appService.checkLoginState()
})

onUnmounted(() => {
  eventHandler.destroy()
})
</script>

<template>
  <div class="flex flex-col zilio-scroll">
    <main>
      <router-view v-slot="{ Component, route }">
        <keep-alive>
          <component :is="Component" v-if="route.meta.keepAlive" :key="route.path" />
        </keep-alive>
        <component :is="Component" v-if="!route.meta.keepAlive" :key="route.path" />
      </router-view>
    </main>
  </div>
</template>
