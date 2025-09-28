<template>
    <div class="breadcrumb-container" v-if="animeInfo">
        <div class="breadcrumb-wrapper">
            <q-breadcrumbs class="breadcrumb-nav" active-color="primary">
                <q-breadcrumbs-el icon="home" label="Home" :to="{ name: 'site-home' }" class="breadcrumb-item" />
                <q-breadcrumbs-el :icon="getBreadcrumbIcon(animeInfo.type)" :label="getBreadcrumbType(animeInfo.type)"
                    :to="getBreadcrumbTypeLink(animeInfo.type)" class="breadcrumb-item" />
                <q-breadcrumbs-el :label="animeInfo.title" class="breadcrumb-current" />
            </q-breadcrumbs>
        </div>
    </div>
</template>

<script setup>
defineProps({
    animeInfo: {
        type: Object,
        required: true
    },
    mobile: {
        type: Boolean,
        default: false
    }
})

const getBreadcrumbIcon = (type) => {
    if (!type) return 'tv'
    const typeLower = type.toLowerCase()
    if (typeLower.includes('movie') || typeLower.includes('film')) return 'movie'
    if (typeLower.includes('tv') || typeLower.includes('series')) return 'tv'
    if (typeLower.includes('ova') || typeLower.includes('special')) return 'video_library'
    if (typeLower.includes('ona') || typeLower.includes('web')) return 'computer'
    return 'tv'
}

const getBreadcrumbType = (type) => {
    if (!type) return 'TV'
    const typeLower = type.toLowerCase()
    if (typeLower.includes('movie') || typeLower.includes('film')) return 'Movies'
    if (typeLower.includes('tv') || typeLower.includes('series')) return 'TV Shows'
    if (typeLower.includes('ova')) return 'OVA'
    if (typeLower.includes('ona')) return 'ONA'
    if (typeLower.includes('special')) return 'Specials'
    return 'TV Shows'
}

const getBreadcrumbTypeLink = (type) => {
    if (!type) return { name: 'site-home', query: { type: 'tv' } }
    const typeLower = type.toLowerCase()
    if (typeLower.includes('movie') || typeLower.includes('film')) {
        return { name: 'site-home', query: { type: 'movie' } }
    }
    if (typeLower.includes('ova')) {
        return { name: 'site-home', query: { type: 'ova' } }
    }
    if (typeLower.includes('ona')) {
        return { name: 'site-home', query: { type: 'ona' } }
    }
    if (typeLower.includes('special')) {
        return { name: 'site-home', query: { type: 'special' } }
    }
    return { name: 'site-home', query: { type: 'tv' } }
}
</script>
