import { defineBoot } from '#q-app/wrappers'
import { persistQueryClient } from '@tanstack/query-persist-client-core'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import { MutationCache, QueryCache, QueryClient, VueQueryPlugin } from '@tanstack/vue-query'

export default defineBoot(({ app }) => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                // Default config cho tất cả queries
                refetchOnWindowFocus: false,
                gcTime: 1000 * 60 * 60 * 24, // 24 giờ (đổi từ cacheTime sang gcTime - v5 API)
                staleTime: 0, // Default: data luôn stale
                retry: 3, // Retry 3 lần khi fail
                retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
                throwOnError: false, // Không throw error để tránh crash app
            },
            mutations: {
                // Default config cho mutations
                retry: 2,
                retryDelay: (attemptIndex) => Math.min(500 * 2 ** attemptIndex, 10000),
            },
        },

        // Query cache - Global error handling cho queries
        queryCache: new QueryCache({
            onError: (error, query) => {
                console.error('[Query Error]', {
                    message: error.message,
                    queryKey: query.queryKey,
                    error,
                })

                // Có thể thêm global notification ở đây nếu cần
                // Example: if (error.response?.status === 401) { ... }
            },
            onSuccess: (data, query) => {
                // Log successful queries in development
                if (process.env.DEV) {
                    console.log('[Query Success]', {
                        queryKey: query.queryKey,
                        dataSize: JSON.stringify(data).length,
                    })
                }
            },
        }),

        // Mutation cache - Global error handling cho mutations
        mutationCache: new MutationCache({
            onError: (error, variables, context, mutation) => {
                console.error('[Mutation Error]', {
                    message: error.message,
                    variables,
                    error,
                    context,
                    mutation
                })
            },
            onSuccess: (data, variables, context, mutation) => {
                if (process.env.DEV) {
                    console.log('[Mutation Success]', { variables, context, mutation })
                }
            },
        }),
    })

    // Persistence - Chỉ trên client
    if (process.env.CLIENT) {
        const persister = createSyncStoragePersister({
            storage: window.localStorage,
            key: 'ANIME_QUERY_CACHE', // Custom key
        })

        persistQueryClient({
            queryClient,
            persister,
            maxAge: 1000 * 60 * 60 * 24, // 24 giờ
            dehydrateOptions: {
                shouldDehydrateQuery: (query) => {
                    // ✅ OPT-IN strategy: CHỈ persist nếu meta.persist === true
                    // Tránh persist user data hoặc sensitive data
                    return query.meta?.persist === true
                },
            },
            hydrateOptions: {
                // Deserialize khi restore từ localStorage
            },
        })
    }

    app.use(VueQueryPlugin, { queryClient })
})

