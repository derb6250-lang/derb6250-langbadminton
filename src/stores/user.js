import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    isLoggedIn: false,
    isAdmin: false
  }),
  
  actions: {
    login(userInfo) {
      this.user = userInfo
      this.isLoggedIn = true
      this.isAdmin = userInfo.role === 'admin'
      localStorage.setItem('user', JSON.stringify(userInfo))
    },
    
    logout() {
      this.user = null
      this.isLoggedIn = false
      this.isAdmin = false
      localStorage.removeItem('user')
    },
    
    initUser() {
      const user = localStorage.getItem('user')
      if (user) {
        const userInfo = JSON.parse(user)
        this.user = userInfo
        this.isLoggedIn = true
        this.isAdmin = userInfo.role === 'admin'
      }
    }
  }
})
