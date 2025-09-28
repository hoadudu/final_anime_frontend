import { defineBoot } from '#q-app/wrappers'
import { VueQueryPlugin, QueryClient } from '@tanstack/vue-query'
import { persistQueryClient } from '@tanstack/query-persist-client-core'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'


export default defineBoot(({ app }) => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                refetchOnWindowFocus: false,
                // thiết lập cacheTime >= thời gian bạn muốn giữ persist
                cacheTime: 1000 * 60 * 60 * 24,
            },
        },
    })

    const persister = createSyncStoragePersister({
        storage: window.localStorage,
    })

    persistQueryClient({
        queryClient,
        persister,
        maxAge: 1000 * 60 * 60 * 24, // 24 giờ
        dehydrateOptions: {
            shouldDehydrateQuery: (query) => {
                return query.meta?.persist !== false
            },
        },
    })

    app.use(VueQueryPlugin, { queryClient })
})

