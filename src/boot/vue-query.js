import { defineBoot } from '#q-app/wrappers'
import { VueQueryPlugin } from '@tanstack/vue-query'

export default defineBoot(({ app }) => {
    app.use(VueQueryPlugin, {
        queryClientConfig: {
            defaultOptions: {
                queries: {
                    refetchOnWindowFocus: false, // tránh refetch mỗi lần đổi tab
                },
            },
        },
    })

})
