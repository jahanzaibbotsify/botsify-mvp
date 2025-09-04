<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { adminApi } from '@/services/adminApi'
import { useRouter } from 'vue-router'
import { useImpersonationStore } from '@/stores/impersonationStore'
import type { AdminUsersFilters, AdminUserItem } from '@/types/admin'
import { Table, TableHead, TableHeader, TableBody, TableCell, TableRow, Button, Badge, Pagination } from '@/components/ui'

const loading = ref(false)
const error = ref<string | null>(null)
const users = ref<AdminUserItem[]>([])
const total = ref<number>(0)
const totals = ref<{ customers?: number; fb_logins?: number }>({})
const router = useRouter()
const impersonationStore = useImpersonationStore()

// Pagination state
const currentPage = ref<number>(1)
const perPage = ref<number>(20)
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / (perPage.value || 1))))

// Filters
const registration_start_date = ref<string>('')
const registration_end_date = ref<string>('')
const identification = ref<string>('')
const type = ref<'all' | 'botsify' | 'appsumo'>('all')

async function fetchUsers(page = 1) {
  loading.value = true
  error.value = null
  try {
    const filters: AdminUsersFilters = {
      registration_start_date: registration_start_date.value,
      registration_end_date: registration_end_date.value,
      identification: identification.value,
      type: type.value,
      page,
      per_page: perPage.value
    }
    const res = await adminApi.getUsers(filters)
    // API response shape: { status: boolean, data: { users: {...}, total: {...} } }
    const payload: any = (res as any)?.data ?? res
    const usersPayload = payload?.users ?? {}
    users.value = usersPayload?.data ?? []
    total.value = usersPayload?.total ?? 0
    perPage.value = usersPayload?.per_page ?? perPage.value
    currentPage.value = usersPayload?.current_page ?? page
    totals.value = payload?.total || {}
  } catch (e: any) {
    error.value = e?.message || 'Failed to load users'
  } finally {
    loading.value = false
  }
}

function submitFilters(e: Event) {
  e.preventDefault()
  fetchUsers(1)
}

async function startImpersonation(userId: number) {
  try {
    loading.value = true
    const res = await impersonationStore.start(userId)
    if (res.status) {
      router.replace('/select-agent')
    } else if (res.message) {
      window.$toast?.error?.(res.message)
    }
  } catch (e: any) {
    window.$toast?.error?.(e?.message || 'Failed to impersonate')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchUsers(1)
})
</script>

<template>
  <div>
    <div class="page-header">
      <h1>Users (<span class="text-danger">{{ total }}</span>)</h1>
    </div>

    <div class="card mb-4">
      <div class="card-body">
        <div class="row mb-3">
          <div class="col-sm-3">
            <h3>Total Customers</h3>
            <p>{{ totals.customers ?? '-' }}</p>
          </div>
          <div class="col-sm-3">
            <h3>Total Facebook Logins</h3>
            <p>{{ totals.fb_logins ?? '-' }}</p>
          </div>
        </div>
        <div class="row">
          <div class="col-sm-12">
            <p>Note: Customer does not necessarily mean a paid customer; it includes anyone who entered payment information.</p>
          </div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-body">
        <form class="filters" @submit="submitFilters">
          <input type="date" v-model="registration_start_date" placeholder="Register start date" />
          <input type="date" v-model="registration_end_date" placeholder="Register end date" />
          <input type="text" v-model="identification" placeholder="User ID or Email" />
          <select v-model="type">
            <option value="all">All Users</option>
            <option value="botsify">Botsify Users</option>
            <option value="appsumo">AppSumo Users</option>
          </select>
          <button class="primary" type="submit">Apply</button>
        </form>

        <Table>
          <TableHead>
            <TableHeader width="60px">ID</TableHeader>
            <TableHeader width="220px">Name</TableHeader>
            <TableHeader width="260px">Email</TableHeader>
            <TableHeader width="160px">Phone Number</TableHeader>
            <TableHeader width="120px">Bot Count</TableHeader>
            <TableHeader width="220px">Package</TableHeader>
            <TableHeader width="120px">Whitelabel</TableHeader>
            <TableHeader width="180px">Registration Date</TableHeader>
            <TableHeader width="120px">Source</TableHeader>
            <TableHeader width="140px">Action</TableHeader>
          </TableHead>
          <TableBody>
            <TableRow v-if="loading">
              <TableCell skeleton skeleton-type="text"/>
              <TableCell skeleton skeleton-type="text"/>
              <TableCell skeleton skeleton-type="text"/>
              <TableCell skeleton skeleton-type="text"/>
              <TableCell skeleton skeleton-type="text"/>
              <TableCell skeleton skeleton-type="text"/>
              <TableCell skeleton skeleton-type="text"/>
              <TableCell skeleton skeleton-type="text"/>
              <TableCell skeleton skeleton-type="text"/>
              <TableCell skeleton skeleton-type="actions"/>
            </TableRow>
            <TableRow v-else-if="users.length === 0">
              <TableCell no-data colspan="10">No users found</TableCell>
            </TableRow>
            <TableRow v-else v-for="u in users" :key="u.id">
              <TableCell>{{ u.id }}</TableCell>
              <TableCell>{{ u.name }}</TableCell>
              <TableCell>{{ u.email }}</TableCell>
              <TableCell>{{ u.phone_number || 'N/A' }}</TableCell>
              <TableCell>{{ u.bots_count ?? '-' }}</TableCell>
              <TableCell>
                <span v-if="u.subs && (u as any).subs?.stripe_plan">
                  {{ (u as any).subs?.stripe_plan }} - {{ (u as any).subs?.stripe_id || 'N/A' }}
                </span>
                <span v-else>Not a Customer</span>
              </TableCell>
              <TableCell>
                <Badge :variant="(u.is_whitelabel === 1 || u.is_whitelabel === true) ? 'success' : 'secondary'">
                  {{ (u.is_whitelabel === 1 || u.is_whitelabel === true) ? 'Yes' : 'No' }}
                </Badge>
              </TableCell>
              <TableCell>{{ new Date(u.created_at).toLocaleString() }}</TableCell>
              <TableCell><b>{{ u.source || '-' }}</b></TableCell>
              <TableCell>
                <Button size="small" variant="primary" @click="startImpersonation(u.id)">Impersonate</Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>

        <div class="mt-3">
          <Pagination
            :current-page="currentPage"
            :total-pages="totalPages"
            :total-items="total"
            :items-per-page="perPage"
            @page-change="fetchUsers"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-header { margin-bottom: var(--space-4); }
.filters { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: var(--space-3); margin-bottom: var(--space-4); }
.card { background: var(--color-bg-secondary); border: 1px solid var(--color-border); border-radius: var(--radius-lg); }
.card-body { padding: var(--space-4); }
.text-danger { color: var(--color-error); }
</style>


