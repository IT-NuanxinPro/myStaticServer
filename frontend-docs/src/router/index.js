import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/api-docs',
    },
    {
      path: '/api-docs',
      name: 'api-docs',
      component: () => import('../views/ApiDocs.vue')
    }
  ]
})

export default router
