<!-- src/components/PassengerInfo.vue -->
<script setup lang="ts">
import { onScroll } from '@/lib/utils/hook'
import appService from '@/service/app.service'
import { ref, computed, onMounted, onUnmounted } from 'vue'

// 乘客信息接口定义
export interface Passenger {
  // 基础信息
  passenger_uuid: string
  passenger_name: string
  sex_code: 'M' | 'F'
  sex_name: string
  born_date: string
  gat_born_date: string

  // 证件信息
  passenger_id_type_code: string
  passenger_id_type_name: string
  passenger_id_no: string

  // 联系方式
  mobile_no: string
  mobile_code: string
  phone_no: string
  email: string

  // 地址信息
  address: string
  postalcode: string

  // 乘客类型
  passenger_type: string
  passenger_type_name: string

  // 会员信息
  total_times: string
  member_level?: string

  // 状态标识
  isUserSelf: 'Y' | 'N'
  isAdult: 'Y' | 'N'
  isYongThan10: 'Y' | 'N'
  isYongThan14: 'Y' | 'N'
  isOldThan60: 'Y' | 'N'
  is_active: 'Y' | 'N'
  if_receive: 'Y' | 'N'
  is_buy_ticket: 'Y' | 'N'

  // 其他信息
  first_letter: string
  recordCount: string
  delete_time: string
  last_time: string
  allEncStr: string
  if_preferential: string
  gat_valid_date_start: string
  gat_valid_date_end: string
  gat_version: string
  temporay_age60: 'Y' | 'N'

  // 扩展字段
  country_code: string
}

// 添加乘客表单接口
export interface NewPassengerForm {
  name: string
  idType: string
  idNumber: string
  phone: string
  mobileCode: string
  gender: 'M' | 'F'
  passengerType: string
  email: string
  address: string
}

// 列表查询参数接口
export interface ListQueryParams {
  page: number
  pagesize: number
  total: number
}

const showForm = ref(false)
const showDetailModal = ref(false)
const selectedPassenger = ref<Passenger | null>(null)

const listData = ref<ListQueryParams>({
  page: 1,
  pagesize: 10,
  total: 0,
})

const passengers = ref<Passenger[]>([])

// 表单数据
const newPassenger = ref<NewPassengerForm>({
  name: '',
  idType: '1',
  idNumber: '',
  phone: '',
  mobileCode: '86',
  gender: 'M',
  passengerType: '3',
  email: '',
  address: '',
})

// 计算年龄
const calculateAge = (bornDate: string): number => {
  const birth = new Date(bornDate)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  return age
}

// 获取乘客类型标签样式
const getPassengerTypeStyle = (type: string) => {
  const styles: Record<string, string> = {
    '1': 'bg-purple-100 text-purple-700',
    '2': 'bg-green-100 text-green-700',
    '3': 'bg-blue-100 text-blue-700',
    '4': 'bg-orange-100 text-orange-700',
  }
  return styles[type] || 'bg-gray-100 text-gray-700'
}

// 获取性别标签样式
const getGenderStyle = (sex: string) => {
  return sex === 'M' ? 'text-blue-600' : 'text-pink-600'
}

// 格式化手机号（脱敏）
const formatMobile = (mobile: string): string => {
  if (!mobile) return ''
  return mobile.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}

// 格式化证件号（脱敏）
const formatIdNumber = (idNo: string): string => {
  if (!idNo || idNo.length < 10) return idNo
  return idNo.replace(/(.{4}).+(.{4})/, '$1****$2')
}

const addPassenger = () => {
  showForm.value = true
}

const cancelForm = () => {
  showForm.value = false
  resetForm()
}

const savePassenger = async () => {
  // 这里调用实际的API保存乘客信息
  console.log('保存乘客:', newPassenger.value)
  resetForm()
  showForm.value = false
  await getPassengers()
  alert('添加乘客成功！')
}

const resetForm = () => {
  newPassenger.value = {
    name: '',
    idType: '1',
    idNumber: '',
    phone: '',
    mobileCode: '86',
    gender: 'M',
    passengerType: '3',
    email: '',
    address: '',
  }
}

const removePassenger = async (uuid: string) => {
  if (confirm('确定要删除该乘客吗？')) {
    // 调用删除API
    console.log('删除乘客:', uuid)
    await getPassengers()
  }
}

const viewPassengerDetail = (passenger: Passenger) => {
  selectedPassenger.value = passenger
  showDetailModal.value = true
}

const getPassengers = async () => {
  try {
    const res = await appService.getPassengers(listData.value.page, listData.value.pagesize)
    if (res && res.data) {
      passengers.value = res.data.datas
      listData.value.total = res.data.pageTotal * listData.value.pagesize || 0
    }
    console.log('获取乘客列表成功:', res)
  } catch (error) {
    console.error('获取乘客列表失败:', error)
  }
}

const listRef = ref<HTMLElement | null>(null)
const handleScroll = () => {
  onScroll(listRef.value, listData.value, getPassengers)
}

// 证件类型映射
const idTypeMap: Record<string, string> = {
  '1': '居民身份证',
  '2': '护照',
  '3': '军官证',
}

onMounted(() => {
  getPassengers()
  if (listRef.value) {
    listRef.value.addEventListener('scroll', handleScroll)
  }
})

onUnmounted(() => {
  if (listRef.value) {
    listRef.value.removeEventListener('scroll', handleScroll)
  }
})
</script>

<template>
  <div class="space-y-6">
    <!-- 标题 -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h2 class="text-2xl font-bold text-gray-800">常用乘车人</h2>
        <p class="text-gray-500 text-sm mt-1">共 {{ listData.total }} 位乘车人</p>
      </div>
      <button
        @click="addPassenger"
        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 flex items-center gap-2"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 4v16m8-8H4"
          ></path>
        </svg>
        添加乘客
      </button>
    </div>

    <!-- 乘客列表 -->
    <div ref="listRef" class="space-y-4 max-h-[600px] overflow-y-auto">
      <div
        v-for="passenger in passengers"
        :key="passenger.passenger_uuid"
        class="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer"
        @click="viewPassengerDetail(passenger)"
      >
        <div class="p-6">
          <!-- 头部信息 -->
          <div class="flex justify-between items-start mb-4">
            <div class="flex items-center gap-3">
              <div>
                <div class="flex items-center gap-2">
                  <h3 class="text-lg font-semibold text-gray-800">
                    {{ passenger.passenger_name }}
                  </h3>
                  <span
                    :class="getPassengerTypeStyle(passenger.passenger_type)"
                    class="px-2 py-0.5 rounded-full text-xs font-medium"
                  >
                    {{ passenger.passenger_type_name }}
                  </span>
                  <span
                    v-if="passenger.isUserSelf === 'Y'"
                    class="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium"
                  >
                    本人
                  </span>
                </div>
                <p class="text-sm text-gray-500 mt-1">
                  {{ passenger.passenger_id_type_name }}:
                  {{ formatIdNumber(passenger.passenger_id_no) }}
                </p>
              </div>
            </div>
            <button
              @click.stop="removePassenger(passenger.passenger_uuid)"
              class="text-red-500 hover:text-red-700 transition-colors p-2 hover:bg-red-50 rounded-lg"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                ></path>
              </svg>
            </button>
          </div>

          <!-- 详细信息网格 -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div class="flex items-center gap-2">
              <svg
                class="w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                ></path>
              </svg>
              <span class="text-gray-500">性别：</span>
              <span :class="getGenderStyle(passenger.sex_code)" class="font-medium">
                {{ passenger.sex_name }}
              </span>
            </div>
            <div class="flex items-center gap-2">
              <svg
                class="w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                ></path>
              </svg>
              <span class="text-gray-500">出生日期：</span>
              <span class="text-gray-800">{{ passenger.gat_born_date }}</span>
            </div>
            <div class="flex items-center gap-2">
              <svg
                class="w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                ></path>
              </svg>
              <span class="text-gray-500">手机号：</span>
              <span class="text-gray-800">{{ formatMobile(passenger.mobile_no) }}</span>
            </div>
            <div class="flex items-center gap-2">
              <svg
                class="w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              <span class="text-gray-500">乘车次数：</span>
              <span class="text-orange-500 font-medium">{{ passenger.total_times }}次</span>
            </div>
          </div>

          <!-- 标签信息 -->
          <div class="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
            <span
              v-if="passenger.isAdult === 'Y'"
              class="px-2 py-1 bg-green-50 text-green-600 rounded-md text-xs flex items-center gap-1"
            >
              <span>✅</span> 成人
            </span>
            <span
              v-if="passenger.isOldThan60 === 'Y'"
              class="px-2 py-1 bg-orange-50 text-orange-600 rounded-md text-xs flex items-center gap-1"
            >
              <span>👴</span> 老年优惠
            </span>
            <span
              v-if="passenger.isYongThan14 === 'Y'"
              class="px-2 py-1 bg-blue-50 text-blue-600 rounded-md text-xs flex items-center gap-1"
            >
              <span>👶</span> 儿童优惠
            </span>
            <span
              v-if="passenger.if_receive === 'Y'"
              class="px-2 py-1 bg-purple-50 text-purple-600 rounded-md text-xs flex items-center gap-1"
            >
              <span>✉️</span> 接收通知
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 乘客详情弹窗 -->
    <div
      v-if="showDetailModal && selectedPassenger"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="showDetailModal = false"
    >
      <div
        class="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto"
      >
        <div
          class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center"
        >
          <h3 class="text-xl font-bold text-gray-800">乘客详情</h3>
          <button @click="showDetailModal = false" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
        </div>
        <div class="p-6 space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-sm text-gray-500">乘客姓名</label>
              <p class="font-medium">{{ selectedPassenger.passenger_name }}</p>
            </div>
            <div>
              <label class="text-sm text-gray-500">性别</label>
              <p class="font-medium">{{ selectedPassenger.sex_name }}</p>
            </div>
            <div>
              <label class="text-sm text-gray-500">出生日期</label>
              <p class="font-medium">{{ selectedPassenger.born_date }}</p>
            </div>
            <div>
              <label class="text-sm text-gray-500">年龄</label>
              <p class="font-medium">{{ calculateAge(selectedPassenger.born_date) }}岁</p>
            </div>
            <div>
              <label class="text-sm text-gray-500">证件类型</label>
              <p class="font-medium">{{ selectedPassenger.passenger_id_type_name }}</p>
            </div>
            <div>
              <label class="text-sm text-gray-500">证件号码</label>
              <p class="font-medium">{{ selectedPassenger.passenger_id_no }}</p>
            </div>
            <div>
              <label class="text-sm text-gray-500">手机号码</label>
              <p class="font-medium">
                +{{ selectedPassenger.mobile_code }} {{ selectedPassenger.mobile_no }}
              </p>
            </div>
            <div>
              <label class="text-sm text-gray-500">电子邮箱</label>
              <p class="font-medium">{{ selectedPassenger.email || '-' }}</p>
            </div>
            <div class="col-span-2">
              <label class="text-sm text-gray-500">通讯地址</label>
              <p class="font-medium">{{ selectedPassenger.address || '-' }}</p>
            </div>
            <div>
              <label class="text-sm text-gray-500">乘车次数</label>
              <p class="font-medium text-orange-600">{{ selectedPassenger.total_times }}次</p>
            </div>
            <div>
              <label class="text-sm text-gray-500">最后乘车时间</label>
              <p class="font-medium">{{ selectedPassenger.last_time || '-' }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 添加乘客表单 -->
    <div v-if="showForm" class="bg-white rounded-lg shadow-md p-6 mt-6">
      <h3 class="text-lg font-semibold text-gray-800 mb-4">添加新乘客</h3>
      <form @submit.prevent="savePassenger" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">姓名 *</label>
            <input
              v-model="newPassenger.name"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="请输入姓名"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">证件类型 *</label>
            <select
              v-model="newPassenger.idType"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="1">居民身份证</option>
              <option value="2">护照</option>
              <option value="3">军官证</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">证件号码 *</label>
            <input
              v-model="newPassenger.idNumber"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="请输入证件号码"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">手机号 *</label>
            <div class="flex gap-2">
              <select
                v-model="newPassenger.mobileCode"
                class="w-24 px-2 py-2 border border-gray-300 rounded-lg"
              >
                <option value="86">+86</option>
                <option value="1">+1</option>
                <option value="44">+44</option>
              </select>
              <input
                v-model="newPassenger.phone"
                type="tel"
                required
                class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="请输入手机号"
              />
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">性别 *</label>
            <select
              v-model="newPassenger.gender"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="M">男</option>
              <option value="F">女</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">乘客类型 *</label>
            <select
              v-model="newPassenger.passengerType"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="1">成人票</option>
              <option value="2">儿童票</option>
              <option value="3">学生票</option>
              <option value="4">老人票</option>
            </select>
          </div>
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-2">电子邮箱</label>
            <input
              v-model="newPassenger.email"
              type="email"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="请输入电子邮箱"
            />
          </div>
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-2">通讯地址</label>
            <input
              v-model="newPassenger.address"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="请输入通讯地址"
            />
          </div>
        </div>

        <div class="flex gap-3 justify-end">
          <button
            type="button"
            @click="cancelForm"
            class="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-all"
          >
            取消
          </button>
          <button
            type="submit"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
          >
            保存
          </button>
        </div>
      </form>
    </div>

    <!-- 统计信息 -->
    <div class="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg p-6 text-white">
      <div class="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div class="flex gap-8">
          <div>
            <p class="text-sm opacity-90">总计乘客</p>
            <p class="text-3xl font-bold">{{ passengers.length }} 人</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 自定义滚动条样式 */
.max-h-\[600px\]::-webkit-scrollbar {
  width: 6px;
}

.max-h-\[600px\]::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.max-h-\[600px\]::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 10px;
}

.max-h-\[600px\]::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
