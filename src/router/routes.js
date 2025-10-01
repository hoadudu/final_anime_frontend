const routes = [
  {
    path: '/',
    redirect: '/home',
  },
  {
    path: '/watch/:slug',
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

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
