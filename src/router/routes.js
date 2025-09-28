const routes = [
  {
    path: '/',
    redirect: '/home',
  },
  {
    path: '/home',
    name: 'home',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', name: 'site-home', component: () => import('src/pages/SiteHomePage.vue') }],
  },
  {
    path: '/anime/:slugWithId',
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
