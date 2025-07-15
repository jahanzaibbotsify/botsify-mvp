<script setup lang="ts">
import { ref, watch } from 'vue'
import Datepicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import moment from 'moment'

const props = defineProps<{
  fromDate?: Date
  toDate?: Date
  getFromDate: (range: { startDate: Date; endDate: Date }) => void
  autoPlay?: boolean
  opens?: string
}>()

const dateRange = ref<[Date, Date]>([
  moment().subtract(1, 'months').toDate(),
  new Date()
])

watch(dateRange, (range) => {
  if (range && range.length === 2) {
    const [startDate, endDate] = range
    props.getFromDate({ startDate, endDate })
  }
})
</script>


<template>
  <Datepicker
    v-model="dateRange"
    range
    :enable-time-picker="false"
    format="yyyy-MM-dd"
    placeholder="Select date range"
  />
</template>

<style scoped>
/* Custom styling if needed */
.vue3-date-time-picker {
  width: 100%;
}

.vue3-date-time-picker input {
  padding: 0.6rem 0.75rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}
</style>
