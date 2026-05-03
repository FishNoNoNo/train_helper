<script setup lang="ts">
import WindowFrame from '@/components/WindowFrame.vue'
import eventHandler from '@/hook/eventHandler'
import { init } from '@/service/app.service'
import { onMounted, onUnmounted } from 'vue'

onMounted(async () => {
  eventHandler.init()
  localStorage.clear()
  await init()
})

onUnmounted(() => {
  eventHandler.destroy()
})
</script>

<template>
  <WindowFrame>
    <div class="h-full bg-slate-100 text-slate-900 box-border">
      <router-view v-slot="{ Component, route }">
        <keep-alive>
          <component :is="Component" v-if="route.meta.keepAlive" :key="route.path" />
        </keep-alive>
        <component :is="Component" v-if="!route.meta.keepAlive" :key="route.path" />
      </router-view>
    </div>
  </WindowFrame>
</template>
