// src/utils/queryConfig.js
/**
 * Query Configuration Presets
 * Định nghĩa các config chuẩn cho các loại query khác nhau
 */

/**
 * STATIC DATA - Dữ liệu ít thay đổi (home page, trending, etc)
 * - Cache lâu (1 giờ stale, 24 giờ gc)
 * - Chỉ refetch khi stale
 * - Persist vào localStorage
 */
export const STATIC_QUERY_CONFIG = {
    staleTime: 1000 * 60 * 60, // 1 giờ
    gcTime: 1000 * 60 * 60 * 24, // 24 giờ
    refetchOnMount: 'stale', // Chỉ refetch khi stale
    refetchOnWindowFocus: false,
    refetchOnReconnect: 'stale', // Refetch khi reconnect nếu stale
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    meta: { persist: true }, // Persist vào localStorage
}

/**
 * DYNAMIC DATA - Dữ liệu thường xuyên thay đổi (search, filter, etc)
 * - Cache ngắn (5 phút stale, 30 phút gc)
 * - Refetch tích cực hơn
 * - KHÔNG persist
 */
export const DYNAMIC_QUERY_CONFIG = {
    staleTime: 1000 * 60 * 5, // 5 phút
    gcTime: 1000 * 60 * 30, // 30 phút
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    meta: { persist: false }, // Không persist
}

/**
 * USER-SPECIFIC DATA - Dữ liệu user (reactions, lists, profile)
 * - Cache rất ngắn (2 phút stale, 15 phút gc)
 * - Refetch thường xuyên
 * - KHÔNG persist (tránh data leak giữa users)
 */
export const USER_QUERY_CONFIG = {
    staleTime: 1000 * 60 * 2, // 2 phút
    gcTime: 1000 * 60 * 15, // 15 phút
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(500 * 2 ** attemptIndex, 10000),
    meta: { persist: false }, // KHÔNG persist user data
}

/**
 * CONTENT DATA - Dữ liệu content cụ thể (anime info, episodes, etc)
 * - Cache trung bình (30 phút stale, 2 giờ gc)
 * - Refetch khi stale
 * - KHÔNG persist (data có thể lớn)
 */
export const CONTENT_QUERY_CONFIG = {
    staleTime: 1000 * 60 * 30, // 30 phút
    gcTime: 1000 * 60 * 60 * 2, // 2 giờ
    refetchOnMount: 'stale',
    refetchOnWindowFocus: false,
    refetchOnReconnect: 'stale',
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    meta: { persist: false }, // Không persist content lớn
}

/**
 * REALTIME DATA - Dữ liệu realtime (latest episodes, etc)
 * - Cache rất ngắn (1 phút stale, 5 phút gc)
 * - Refetch tích cực
 * - KHÔNG persist
 */
export const REALTIME_QUERY_CONFIG = {
    staleTime: 1000 * 60, // 1 phút
    gcTime: 1000 * 60 * 5, // 5 phút
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(500 * 2 ** attemptIndex, 10000),
    meta: { persist: false },
}

