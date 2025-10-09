const routes = [
  {
    path: '/',
    redirect: '/home',
  },
  {
    path: '/xem/:slug',
    name: 'watch-base',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: 'ep-:number-:id',
        name: 'site-watch',
        component: () => import('src/pages/SiteWatchPage.vue')
      }
    ]
  },
  {
    path: '/home',
    name: 'home',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', name: 'site-home', component: () => import('src/pages/SiteHomePage.vue') }],
  },
  {
    path: '/thong-tin/:slugWithId',
    name: 'anime',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', name: 'site-anime', component: () => import('src/pages/SiteAnimePage.vue') }],
  },
  {
    path: '/the-loai/:slug',
    name: 'genres',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', name: 'site-genres', component: () => import('src/pages/SiteGenresPage.vue') }],
  },
  {
    path: '/search',
    name: 'search',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', name: 'site-search', component: () => import('src/pages/SiteSearchPage.vue') }],
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        name: 'site-profile',
        component: () => import('src/pages/SiteProfilePage.vue'),
        meta: { requiresAuth: true },
      },
    ],
  },
  {
    path: '/filter',
    name: 'filter',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', name: 'site-filter', component: () => import('src/pages/SiteAnimeFilter.vue') }],
  },
  {
    path: '/reset-password',
    name: 'reset-password',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: ':encodedData',
        name: 'site-reset-password',
        component: () => import('src/pages/SiteResetPasswordPage.vue'),
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
