<template>
  <div class="header">
    <div class="header-content">
      <div class="logo">
        <el-icon><Trophy /></el-icon>
        <span>羽毛球销售系统</span>
      </div>
      
      <nav class="nav-menu">
        <router-link to="/" class="nav-item">首页</router-link>
        <router-link to="/products" class="nav-item">商品</router-link>
        <router-link to="/cart" class="nav-item">
          购物车
          <el-badge :value="cartStore.totalItems" v-if="cartStore.totalItems > 0" />
        </router-link>
        <router-link to="/orders" class="nav-item" v-if="userStore.isLoggedIn">订单</router-link>
        <router-link to="/admin" class="nav-item" v-if="userStore.isAdmin">管理</router-link>
      </nav>
      
      <div class="user-actions">
        <template v-if="userStore.isLoggedIn">
          <span class="welcome">欢迎，{{ userStore.user.name }}</span>
          <el-button type="text" @click="logout">退出</el-button>
        </template>
        <template v-else>
          <el-button type="primary" @click="router.push('/login')">登录</el-button>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { useCartStore } from '../stores/cart'

const router = useRouter()
const userStore = useUserStore()
const cartStore = useCartStore()

const logout = () => {
  userStore.logout()
  cartStore.clearCart()
  // 如果当前在需要登录的页面，跳转到首页
  if (['/orders', '/admin'].includes(router.currentRoute.value.path)) {
    router.push('/')
  }
}
</script>

<style scoped>
.header {
  background-color: #409eff;
  color: white;
  height: 60px;
  display: flex;
  align-items: center;
}

.header-content {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}

.logo {
  display: flex;
  align-items: center;
  font-size: 20px;
  font-weight: bold;
}

.logo .el-icon {
  margin-right: 8px;
  font-size: 24px;
}

.nav-menu {
  display: flex;
  gap: 30px;
}

.nav-item {
  color: white;
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 4px;
  transition: background-color 0.3s;
  position: relative;
}

.nav-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.nav-item.router-link-active {
  background-color: rgba(255, 255, 255, 0.2);
}

.user-actions {
  display: flex;
  align-items: center;
  gap: 15px;
}

.welcome {
  color: white;
  font-size: 14px;
}

.el-button--text {
  color: white;
}

.el-button--text:hover {
  color: #f0f0f0;
}
</style>
