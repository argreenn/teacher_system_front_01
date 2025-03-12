import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    userInfo: null,
    token: localStorage.getItem('token') || '',
    userType: localStorage.getItem('userType') || '' // 'admin' 或 'teacher'
  }),
  
  getters: {
    isLoggedIn: (state) => !!state.token,
    isAdmin: (state) => state.userType === 'admin',
    isTeacher: (state) => state.userType === 'teacher'
  },
  
  actions: {
    setUserInfo(userInfo) {
      this.userInfo = userInfo
    },
    
    setToken(token) {
      this.token = token
      localStorage.setItem('token', token)
    },
    
    setUserType(type) {
      this.userType = type
      localStorage.setItem('userType', type)
    },
    
    logout() {
      this.userInfo = null
      this.token = ''
      this.userType = ''
      localStorage.removeItem('token')
      localStorage.removeItem('userType')
    }
  }
}) 