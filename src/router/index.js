import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/login/index.vue')
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('../layout/index.vue'),
    redirect: '/admin/teacher',
    children: [
      {
        path: 'teacher',
        name: 'TeacherManagement',
        component: () => import('../views/admin/index.vue'),
        meta: { title: '教师管理', icon: 'User' }
      },
      {
        path: 'performance',
        name: 'PerformanceManagement',
        component: () => import('../views/performance/index.vue'),
        meta: { title: '业绩管理', icon: 'DataAnalysis' }
      },
      {
        path: 'system',
        name: 'SystemManagement',
        component: () => import('../views/admin/system.vue'),
        meta: { title: '系统管理', icon: 'Setting' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 导航守卫
router.beforeEach((to, from, next) => {
  // 除了登录页，其他页面需要验证登录状态
  if (to.path !== '/login') {
    const token = localStorage.getItem('token')
    if (!token) {
      next('/login')
      return
    }
  }
  next()
})

export default router 