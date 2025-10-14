// src/utils/queryKeys.js
/**
 * Centralized Query Key Factory
 * Quản lý tất cả query keys ở một nơi để dễ maintain và type-safe
 */

export const queryKeys = {
    // Home page queries
    home: {
        all: ['home'],
        heroSection: () => [...queryKeys.home.all, 'hero-section'],
        trending: () => [...queryKeys.home.all, 'trending-carousel'],
        topAiring: () => [...queryKeys.home.all, 'top-airing'],
        mostPopular: () => [...queryKeys.home.all, 'most-popular'],
        mostLiked: () => [...queryKeys.home.all, 'most-liked'],
        latestCompleted: () => [...queryKeys.home.all, 'latest-completed'],
        latestEpisodes: () => [...queryKeys.home.all, 'latest-episode-posts'],
    },

    // Anime queries
    anime: {
        all: ['anime'],
        info: (id) => [...queryKeys.anime.all, 'info', id],
        recommendations: (id) => [...queryKeys.anime.all, 'recommendations', id],
        characters: (id) => [...queryKeys.anime.all, 'characters', id],
        episodes: (id) => [...queryKeys.anime.all, 'episodes', id],
        filter: (filters) => [...queryKeys.anime.all, 'filter', filters],
    },

    // Watch page queries
    watch: {
        all: ['watch'],
        episode: (id) => [...queryKeys.watch.all, 'episode', id],
        episodeList: (postId) => [...queryKeys.watch.all, 'episodes', postId],
    },

    // Search queries
    search: {
        all: ['search'],
        full: (keyword, page) => [...queryKeys.search.all, 'full', keyword, page],
        live: (keyword) => [...queryKeys.search.all, 'live', keyword],
    },

    // Genre queries
    genre: {
        all: ['genre'],
        list: () => [...queryKeys.genre.all, 'list'],
        detail: (slug) => [...queryKeys.genre.all, 'detail', slug],
    },

    // Company queries (studios, producers, licensors)
    company: {
        all: ['company'],
        detail: (type, slug) => [...queryKeys.company.all, type, slug],
    },

    // User-related queries
    user: {
        all: ['user'],
        profile: (userId) => [...queryKeys.user.all, 'profile', userId],
        animeList: (userId, status) => [...queryKeys.user.all, 'anime-list', userId, status],
        reactions: (postId) => [...queryKeys.user.all, 'reactions', postId],
    },

    // Profile-specific queries
    profile: {
        all: ['profile'],
        data: (userId) => [...queryKeys.profile.all, 'data', userId],
        categories: () => [...queryKeys.profile.all, 'categories'],
        avatarList: (category) => [...queryKeys.profile.all, 'avatar-list', category],
    },

    // Sidebar queries
    sidebar: {
        all: ['sidebar'],
        topTen: (type) => [...queryKeys.sidebar.all, 'top-ten', type],
    },

    // Notification queries
    notifications: {
        all: ['notifications'],
        list: () => [...queryKeys.notifications.all, 'list'],
        unread: () => [...queryKeys.notifications.all, 'unread'],
        markAsRead: (id) => [...queryKeys.notifications.all, 'mark-as-read', id],
    },
}

