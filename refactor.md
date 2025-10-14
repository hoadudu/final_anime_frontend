### ⚠️ **VẤN ĐỀ CẦN SỬA NGAY**

#### 🔴 **1. INCONSISTENT API NAMING (Critical)**

```javascript
// ❌ VẤN ĐỀ: Dùng cả cacheTime (v4) và gcTime (v5)
// Bạn đang dùng @tanstack/vue-query v5.90.2 → CHỈ dùng gcTime

// File: src/boot/vue-query.js (dòng 13)
cacheTime: 1000 * 60 * 60 * 24,  // ❌ DEPRECATED trong v5

// Nhiều composables vẫn dùng cacheTime:
// - useHomePageData.js (17 chỗ)
// - useAnimeInfoPageData.js
// - useSearchPageData.js
// ...etc
```

**✅ GIẢI PHÁP:**

```javascript
// src/boot/vue-query.js
export default defineBoot(({ app }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        gcTime: 1000 * 60 * 60 * 24, // ✅ Đổi thành gcTime
        staleTime: 0, // Thêm default staleTime
        retry: 3, // Thêm default retry
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      },
    },
  })
  // ... rest
})
```

#### 🔴 **2. MISSING RETRY LOGIC**

Chỉ có `useHomePageHeroSectionData` có retry config:

```javascript
// ✅ Chỉ 1 query có:
retry: 2,
retryDelay: 1000,

// ❌ Tất cả queries khác KHÔNG có retry
```

**✅ GIẢI PHÁP:** Thêm vào **TẤT CẢ** queries:

```javascript
export function useAnimeInfoPageData(animeId) {
  return useQuery({
    queryKey: ['anime-info', animeId],
    queryFn: async () => {
      /* ... */
    },
    retry: 3, // ✅ THÊM
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // ✅ Exponential backoff
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60 * 2, // ✅ Đổi từ cacheTime
    enabled: !!animeId && process.env.CLIENT,
    meta: { persist: false },
  })
}
```

#### 🔴 **3. MISSING ERROR BOUNDARIES**

Không có global error handling cho queries:

**✅ GIẢI PHÁP:** Thêm vào QueryClient config:

```javascript
// src/boot/vue-query.js
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // ... existing config
      throwOnError: false, // Tránh crash app
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 2,
      onError: (error) => {
        console.error('Mutation error:', error)
        // Có thể thêm global error notification ở đây
      },
    },
  },
  // ✅ THÊM query/mutation cache để debug
  queryCache: new QueryCache({
    onError: (error, query) => {
      console.error('Query error:', error, 'Key:', query.queryKey)
    },
  }),
  mutationCache: new MutationCache({
    onError: (error, variables, context, mutation) => {
      console.error('Mutation error:', error)
    },
  }),
})
```

#### 🔴 **4. REFETCH CONFIGURATION CONFLICTS**

```javascript
// ❌ Global config:
refetchOnWindowFocus: false,

// ❌ Nhưng một số queries override:
refetchOnMount: false,
refetchOnWindowFocus: false,
refetchOnReconnect: false,
```

**Vấn đề:** Inconsistent behavior giữa các queries.

**✅ GIẢI PHÁP:** Chuẩn hóa theo loại data:

```javascript
// STATIC DATA (home page, trending, etc) - Cache lâu
export const STATIC_QUERY_CONFIG = {
  staleTime: 1000 * 60 * 60, // 1 giờ
  gcTime: 1000 * 60 * 60 * 24, // 24 giờ
  refetchOnMount: false,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  retry: 3,
  retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
}

// DYNAMIC DATA (search, filter, etc) - Cache ngắn
export const DYNAMIC_QUERY_CONFIG = {
  staleTime: 1000 * 60 * 5, // 5 phút
  gcTime: 1000 * 60 * 30, // 30 phút
  refetchOnMount: 'always',
  refetchOnWindowFocus: true,
  retry: 3,
  retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  meta: { persist: false },
}

// USER-SPECIFIC DATA (reactions, list, etc) - Cache ngắn + không persist
export const USER_QUERY_CONFIG = {
  staleTime: 1000 * 60 * 2, // 2 phút
  gcTime: 1000 * 60 * 15, // 15 phút
  refetchOnMount: true,
  refetchOnWindowFocus: true,
  retry: 2,
  meta: { persist: false },
}

// Sử dụng:
export function useHomePageHeroSectionData() {
  return useQuery({
    queryKey: ['home-page-hero-section'],
    queryFn: async () => {
      /* ... */
    },
    ...STATIC_QUERY_CONFIG, // ✅ Reuse config
  })
}
```

#### 🟡 **5. MISSING QUERY KEY FACTORIES**

Hiện tại queryKeys không được quản lý tập trung:

**✅ GIẢI PHÁP:** Tạo file `src/utils/queryKeys.js`:

```javascript
// src/utils/queryKeys.js
export const queryKeys = {
  // Home page
  home: {
    all: ['home'],
    heroSection: () => [...queryKeys.home.all, 'hero-section'],
    trending: () => [...queryKeys.home.all, 'trending-carousel'],
    topAiring: () => [...queryKeys.home.all, 'top-airing'],
    latestEpisodes: () => [...queryKeys.home.all, 'latest-episode-posts'],
  },

  // Anime
  anime: {
    all: ['anime'],
    info: (id) => [...queryKeys.anime.all, 'info', id],
    recommendations: (id) => [...queryKeys.anime.all, 'recommendations', id],
    characters: (id) => [...queryKeys.anime.all, 'characters', id],
    episodes: (id) => [...queryKeys.anime.all, 'episodes', id],
  },

  // Watch
  watch: {
    all: ['watch'],
    episode: (id) => [...queryKeys.watch.all, 'episode', id],
    episodeList: (postId) => [...queryKeys.watch.all, 'episodes', postId],
  },

  // Search & Filter
  search: (keyword, page) => ['search', keyword, page],
  filter: (filters) => ['anime-filter', filters],

  // User
  user: {
    reactions: (postId) => ['post-reactions', postId],
    profile: (userId) => ['user-profile', userId],
  },
}

// Sử dụng:
export function useHomePageHeroSectionData() {
  return useQuery({
    queryKey: queryKeys.home.heroSection(), // ✅ Type-safe & centralized
    queryFn: async () => {
      /* ... */
    },
    ...STATIC_QUERY_CONFIG,
  })
}
```

#### 🟡 **6. MISSING PREFETCHING**

Không có prefetch cho route transitions:

**✅ GIẢI PHÁP:** Thêm prefetch vào router guards:

```javascript
// src/router/index.js
import { useQueryClient } from '@tanstack/vue-query'
import { queryKeys } from 'src/utils/queryKeys'

router.beforeEach(async (to, from, next) => {
  const queryClient = useQueryClient()

  // Prefetch anime info khi hover vào link
  if (to.name === 'watch' && to.params.slug) {
    queryClient.prefetchQuery({
      queryKey: queryKeys.anime.info(to.params.slug),
      queryFn: () => fetchAnimeInfo(to.params.slug),
    })
  }

  next()
})
```

#### 🟡 **7. PERSISTENCE STRATEGY CẦN CẢI THIỆN**

```javascript
// ❌ Hiện tại: Tất cả queries đều persist trừ khi có meta.persist = false
dehydrateOptions: {
    shouldDehydrateQuery: (query) => {
        return query.meta?.persist !== false
    },
}
```

**Vấn đề:** User-specific data có thể bị persist cho user khác nếu quên set `meta.persist = false`

**✅ GIẢI PHÁP:** Đảo ngược logic - opt-in thay vì opt-out:

```javascript
// src/boot/vue-query.js
dehydrateOptions: {
    shouldDehydrateQuery: (query) => {
        // ✅ CHỈ persist nếu EXPLICITLY được đánh dấu
        return query.meta?.persist === true
    },
}

// Sau đó mark queries cần persist:
export function useHomePageHeroSectionData() {
  return useQuery({
    queryKey: ['home-page-hero-section'],
    queryFn: async () => { /* ... */ },
    meta: { persist: true }, // ✅ Opt-in
    ...STATIC_QUERY_CONFIG
  })
}
```

#### 🟡 **8. MISSING STALE-WHILE-REVALIDATE**

Queries static nên dùng SWR pattern:

**✅ GIẢI PHÁP:**

```javascript
// Static data
export const STATIC_QUERY_CONFIG = {
  staleTime: 1000 * 60 * 60, // 1 giờ
  gcTime: 1000 * 60 * 60 * 24, // 24 giờ
  refetchOnMount: 'stale', // ✅ Chỉ refetch khi stale
  refetchOnWindowFocus: false,
  refetchOnReconnect: 'stale', // ✅ Refetch khi reconnect nếu stale
  retry: 3,
}
```

---

### 📝 **CHECKLIST PRODUCTION-READY**

#### ✅ **ĐÃ CÓ:**

- [x] Persistence với localStorage
- [x] Optimistic updates (mutations)
- [x] Offline queue
- [x] Debouncing
- [x] Some error handling
- [x] Query invalidation

#### ❌ **THIẾU/CẦN SỬA:**

- [ ] **Chuẩn hóa cacheTime → gcTime** (v5 API)
- [ ] **Thêm retry logic cho TẤT CẢ queries**
- [ ] **Global error boundaries**
- [ ] **Query key factories**
- [ ] **Config presets (STATIC/DYNAMIC/USER)**
- [ ] **Prefetching strategy**
- [ ] **Đảo ngược persistence logic** (opt-in)
- [ ] **Stale-while-revalidate pattern**
- [ ] **DevTools integration** (development only)
- [ ] **Monitoring/Analytics** cho query performance

---

### 🚀 **KẾ HOẠCH TRIỂN KHAI**

#### **Phase 1: Critical Fixes (1-2 days)**

1. Đổi tất cả `cacheTime` → `gcTime`
2. Thêm retry logic vào tất cả queries
3. Thêm global error handling

#### **Phase 2: Optimization (2-3 days)**

4. Tạo query key factories
5. Tạo config presets (STATIC/DYNAMIC/USER)
6. Refactor tất cả composables dùng presets

#### **Phase 3: Advanced Features (3-5 days)**

7. Implement prefetching
8. Đảo ngược persistence logic
9. Thêm DevTools
10. Performance monitoring

---

### 📄 **CODE MẪU ĐỂ REFACTOR**

Tôi có thể cung cấp code đầy đủ cho:

1. `src/utils/queryKeys.js` - Query key factory
2. `src/utils/queryConfig.js` - Config presets
3. `src/boot/vue-query.js` - Updated QueryClient config
4. Refactored composables examples

Bạn muốn tôi tạo các file này không?

```javascript
// ❌ VẤN ĐỀ: Dùng cả cacheTime (v4) và gcTime (v5)
// Bạn đang dùng @tanstack/vue-query v5.90.2 → CHỈ dùng gcTime

// File: src/boot/vue-query.js (dòng 13)
cacheTime: 1000 * 60 * 60 * 24,  // ❌ DEPRECATED trong v5

// Nhiều composables vẫn dùng cacheTime:
// - useHomePageData.js (17 chỗ)
// - useAnimeInfoPageData.js
// - useSearchPageData.js
// ...etc
```

```javascript
// src/boot/vue-query.js
export default defineBoot(({ app }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        gcTime: 1000 * 60 * 60 * 24, // ✅ Đổi thành gcTime
        staleTime: 0, // Thêm default staleTime
        retry: 3, // Thêm default retry
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      },
    },
  })
  // ... rest
})
```

```javascript
// ✅ Chỉ 1 query có:
retry: 2,
retryDelay: 1000,

// ❌ Tất cả queries khác KHÔNG có retry
```

```javascript
export function useAnimeInfoPageData(animeId) {
  return useQuery({
    queryKey: ['anime-info', animeId],
    queryFn: async () => {
      /* ... */
    },
    retry: 3, // ✅ THÊM
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // ✅ Exponential backoff
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60 * 2, // ✅ Đổi từ cacheTime
    enabled: !!animeId && process.env.CLIENT,
    meta: { persist: false },
  })
}
```

```javascript
// src/boot/vue-query.js
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // ... existing config
      throwOnError: false, // Tránh crash app
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 2,
      onError: (error) => {
        console.error('Mutation error:', error)
        // Có thể thêm global error notification ở đây
      },
    },
  },
  // ✅ THÊM query/mutation cache để debug
  queryCache: new QueryCache({
    onError: (error, query) => {
      console.error('Query error:', error, 'Key:', query.queryKey)
    },
  }),
  mutationCache: new MutationCache({
    onError: (error, variables, context, mutation) => {
      console.error('Mutation error:', error)
    },
  }),
})
```

```javascript
// ❌ Global config:
refetchOnWindowFocus: false,

// ❌ Nhưng một số queries override:
refetchOnMount: false,
refetchOnWindowFocus: false,
refetchOnReconnect: false,
```

```javascript
// STATIC DATA (home page, trending, etc) - Cache lâu
export const STATIC_QUERY_CONFIG = {
  staleTime: 1000 * 60 * 60, // 1 giờ
  gcTime: 1000 * 60 * 60 * 24, // 24 giờ
  refetchOnMount: false,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  retry: 3,
  retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
}

// DYNAMIC DATA (search, filter, etc) - Cache ngắn
export const DYNAMIC_QUERY_CONFIG = {
  staleTime: 1000 * 60 * 5, // 5 phút
  gcTime: 1000 * 60 * 30, // 30 phút
  refetchOnMount: 'always',
  refetchOnWindowFocus: true,
  retry: 3,
  retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  meta: { persist: false },
}

// USER-SPECIFIC DATA (reactions, list, etc) - Cache ngắn + không persist
export const USER_QUERY_CONFIG = {
  staleTime: 1000 * 60 * 2, // 2 phút
  gcTime: 1000 * 60 * 15, // 15 phút
  refetchOnMount: true,
  refetchOnWindowFocus: true,
  retry: 2,
  meta: { persist: false },
}

// Sử dụng:
export function useHomePageHeroSectionData() {
  return useQuery({
    queryKey: ['home-page-hero-section'],
    queryFn: async () => {
      /* ... */
    },
    ...STATIC_QUERY_CONFIG, // ✅ Reuse config
  })
}
```

```javascript
// src/utils/queryKeys.js
export const queryKeys = {
  // Home page
  home: {
    all: ['home'],
    heroSection: () => [...queryKeys.home.all, 'hero-section'],
    trending: () => [...queryKeys.home.all, 'trending-carousel'],
    topAiring: () => [...queryKeys.home.all, 'top-airing'],
    latestEpisodes: () => [...queryKeys.home.all, 'latest-episode-posts'],
  },

  // Anime
  anime: {
    all: ['anime'],
    info: (id) => [...queryKeys.anime.all, 'info', id],
    recommendations: (id) => [...queryKeys.anime.all, 'recommendations', id],
    characters: (id) => [...queryKeys.anime.all, 'characters', id],
    episodes: (id) => [...queryKeys.anime.all, 'episodes', id],
  },

  // Watch
  watch: {
    all: ['watch'],
    episode: (id) => [...queryKeys.watch.all, 'episode', id],
    episodeList: (postId) => [...queryKeys.watch.all, 'episodes', postId],
  },

  // Search & Filter
  search: (keyword, page) => ['search', keyword, page],
  filter: (filters) => ['anime-filter', filters],

  // User
  user: {
    reactions: (postId) => ['post-reactions', postId],
    profile: (userId) => ['user-profile', userId],
  },
}

// Sử dụng:
export function useHomePageHeroSectionData() {
  return useQuery({
    queryKey: queryKeys.home.heroSection(), // ✅ Type-safe & centralized
    queryFn: async () => {
      /* ... */
    },
    ...STATIC_QUERY_CONFIG,
  })
}
```

```javascript
// src/router/index.js
import { useQueryClient } from '@tanstack/vue-query'
import { queryKeys } from 'src/utils/queryKeys'

router.beforeEach(async (to, from, next) => {
  const queryClient = useQueryClient()

  // Prefetch anime info khi hover vào link
  if (to.name === 'watch' && to.params.slug) {
    queryClient.prefetchQuery({
      queryKey: queryKeys.anime.info(to.params.slug),
      queryFn: () => fetchAnimeInfo(to.params.slug),
    })
  }

  next()
})
```

```javascript
// ❌ Hiện tại: Tất cả queries đều persist trừ khi có meta.persist = false
dehydrateOptions: {
    shouldDehydrateQuery: (query) => {
        return query.meta?.persist !== false
    },
}
```

```javascript
// src/boot/vue-query.js
dehydrateOptions: {
    shouldDehydrateQuery: (query) => {
        // ✅ CHỈ persist nếu EXPLICITLY được đánh dấu
        return query.meta?.persist === true
    },
}

// Sau đó mark queries cần persist:
export function useHomePageHeroSectionData() {
  return useQuery({
    queryKey: ['home-page-hero-section'],
    queryFn: async () => { /* ... */ },
    meta: { persist: true }, // ✅ Opt-in
    ...STATIC_QUERY_CONFIG
  })
}
```

```javascript
// Static data
export const STATIC_QUERY_CONFIG = {
  staleTime: 1000 * 60 * 60, // 1 giờ
  gcTime: 1000 * 60 * 60 * 24, // 24 giờ
  refetchOnMount: 'stale', // ✅ Chỉ refetch khi stale
  refetchOnWindowFocus: false,
  refetchOnReconnect: 'stale', // ✅ Refetch khi reconnect nếu stale
  retry: 3,
}
```
