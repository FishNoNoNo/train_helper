<!-- src/views/Home.vue -->

<script setup lang="ts">
import { ref } from 'vue'
import ShiftInfo from './components/ShiftInfo.vue'
import PassengerInfo from './components/PassengerInfo.vue'
import SearchPage from './components/SearchPage.vue'
import { trainService } from '@/service/train.service'
import { Shift } from '@/types/train'

const activeTab = ref('search') // 默认显示搜索页面

const navItems = [
  { id: 'search', label: '搜索', icon: '🔍' },
  { id: 'shift', label: '班次信息', icon: '🚌' },
  { id: 'passenger', label: '购票人信息', icon: '👤' },
]

const shifts = ref<Shift[]>([])

const handleSearchSuccess = (res: any) => {
  const result = trainService.parseSearchResult(res)
  console.log(result)
  shifts.value = result as Shift[]
  activeTab.value = 'shift'
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 导航栏 -->
    <nav class="bg-white shadow-md sticky top-0 z-10">
      <div class="max-w-7xl mx-auto px-4">
        <div class="flex justify-around items-center">
          <button
            v-for="item in navItems"
            :key="item.id"
            @click="activeTab = item.id"
            class="flex flex-col items-center py-4 px-6 transition-all duration-300 relative"
            :class="activeTab === item.id ? 'text-blue-600' : 'text-gray-600 hover:text-blue-500'"
          >
            <span class="text-2xl mb-1">{{ item.icon }}</span>
            <span class="text-sm font-medium">{{ item.label }}</span>
            <!-- 激活指示器 -->
            <div
              class="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 transition-all duration-300"
              :class="activeTab === item.id ? 'scale-x-100' : 'scale-x-0'"
            ></div>
          </button>
        </div>
      </div>
    </nav>

    <!-- 内容区域 - 带 Transition 过渡 -->
    <div class="max-w-7xl mx-auto px-4 py-8">
      <Transition name="fade-slide" mode="out-in">
        <div :key="activeTab">
          <!-- 班次信息 -->
          <ShiftInfo v-if="activeTab === 'shift'" :shifts="shifts" />

          <!-- 购票人信息 -->
          <PassengerInfo v-else-if="activeTab === 'passenger'" />

          <!-- 搜索页面 -->
          <SearchPage v-else-if="activeTab === 'search'" @search-success="handleSearchSuccess" />
        </div>
      </Transition>
    </div>
  </div>
</template>

<style lang="scss" scoped>
// Transition 动画样式
.fade-slide-enter-active {
  transition: all 0.4s ease-out;
}

.fade-slide-leave-active {
  transition: all 0.3s ease-in;
}

.fade-slide-enter-from {
  transform: translateX(20px);
  opacity: 0;
}

.fade-slide-leave-to {
  transform: translateX(-20px);
  opacity: 0;
}
</style>
