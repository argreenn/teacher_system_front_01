<template>
  <div class="app-container">
    <!-- 移动端遮罩层 -->
    <div 
      v-if="isMobile && !sidebarCollapsed" 
      class="mobile-mask" 
      @click="closeSidebar"
    ></div>
    
    <!-- 侧边栏 -->
    <div class="sidebar" :class="{ 
      collapsed: sidebarCollapsed,
      'mobile-sidebar': isMobile 
    }">
      <div class="logo">{{ sidebarCollapsed ? '教师系统' : '教师系统管理平台' }}</div>
      <el-menu 
        :default-active="activeMenu"
        class="sidebar-menu"
        background-color="#304156"
        text-color="#fff"
        active-text-color="#409EFF"
        router
        :collapse="sidebarCollapsed"
      >
        <el-menu-item index="/admin/teacher">
          <el-icon><User /></el-icon>
          <template #title>教师管理</template>
        </el-menu-item>
        <el-menu-item index="/admin/performance">
          <el-icon><DataAnalysis /></el-icon>
          <template #title>业绩管理</template>
        </el-menu-item>
        <el-menu-item index="/admin/system">
          <el-icon><Setting /></el-icon>
          <template #title>系统管理</template>
        </el-menu-item>
      </el-menu>
    </div>
    
    <!-- 主内容区 -->
    <div class="main-container">
      <!-- 顶部栏 -->
      <div class="header">
        <div class="left">
          <el-icon @click="toggleSidebar" :class="{ 'el-icon-rotate': sidebarCollapsed }">
            <Fold v-if="!sidebarCollapsed" />
            <Expand v-else />
          </el-icon>
        </div>
        <div class="middle">
          <h3 class="page-title">{{ pageTitle }}</h3>
        </div>
        <div class="right">
          <el-dropdown trigger="click">
            <span class="user-info">
              <img src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" class="user-avatar">
              <span class="user-name">{{ userInfo?.name || '用户' }}</span>
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>个人信息</el-dropdown-item>
                <el-dropdown-item divided @click="handleLogout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
      
      <!-- 内容区 -->
      <div class="content-container">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <keep-alive>
              <component :is="Component" />
            </keep-alive>
          </transition>
        </router-view>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '../store/user'
import { User, DataAnalysis, Setting, Fold, Expand, ArrowDown } from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// 用户信息
const userInfo = computed(() => userStore.userInfo)

// 获取当前激活的菜单项
const activeMenu = computed(() => route.path)

// 页面标题
const pageTitle = computed(() => {
  const titles = {
    '/admin/teacher': '教师管理',
    '/admin/performance': '业绩管理',
    '/admin/system': '系统管理'
  }
  return titles[route.path] || '教师系统管理平台'
})

// 控制侧边栏折叠
const sidebarCollapsed = ref(false)
const isMobile = ref(false)

// 检测是否是移动设备
const checkMobile = () => {
  isMobile.value = window.innerWidth < 768
  if (isMobile.value && !sidebarCollapsed.value) {
    sidebarCollapsed.value = true
  }
}

// 切换侧边栏
const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
  // 保存到本地存储，以便页面刷新后保持状态
  localStorage.setItem('sidebarStatus', sidebarCollapsed.value ? '1' : '0')
}

// 移动端点击遮罩层关闭侧边栏
const closeSidebar = () => {
  sidebarCollapsed.value = true
}

// 从本地存储中恢复侧边栏状态
const initSidebarStatus = () => {
  const status = localStorage.getItem('sidebarStatus')
  if (status) {
    sidebarCollapsed.value = status === '1'
  }
  
  // 初始化时检测是否是移动设备
  checkMobile()
  
  // 监听窗口大小变化
  window.addEventListener('resize', checkMobile)
}

// 在组件挂载后初始化
onMounted(() => {
  initSidebarStatus()
})

// 组件卸载前移除事件监听器
onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})

// 监听路由变化，在移动设备上自动折叠侧边栏
watch(route, () => {
  if (isMobile.value) {
    sidebarCollapsed.value = true
  }
})

// 处理退出登录
const handleLogout = () => {
  ElMessageBox.confirm('确定要退出登录吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    userStore.logout()
    router.push('/login')
  }).catch(() => {})
}
</script>

<style scoped>
.app-container {
  display: flex;
  height: 100%;
  width: 100%;
  overflow: hidden;
  background: linear-gradient(135deg, #1a56b0 0%, #5b21a6 100%);
  position: relative;
}

/* 移动端遮罩层 */
.mobile-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 5;
}

.sidebar {
  width: 220px;
  height: 100%;
  background-color: #304156;
  color: white;
  transition: all 0.3s ease;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
  z-index: 10;
  flex-shrink: 0;
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
}

.sidebar.collapsed {
  width: 64px;
}

/* 移动端侧边栏样式 */
.mobile-sidebar {
  position: fixed;
  left: 0;
  top: 0;
  height: 100%;
  z-index: 10;
  transform: translateX(0);
  transition: transform 0.3s ease;
}

.mobile-sidebar.collapsed {
  transform: translateX(-100%);
}

.logo {
  height: 60px;
  line-height: 60px;
  text-align: center;
  font-size: 18px;
  font-weight: bold;
  color: #fff;
  background-color: #2b2f3a;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.1);
}

.sidebar-menu {
  height: calc(100% - 60px);
  border-right: none;
  overflow-y: auto;
}

.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0; /* 防止flex项目overflow问题 */
  margin-left: 220px;
  width: calc(100% - 220px);
  transition: all 0.3s ease;
}

.sidebar.collapsed + .main-container {
  margin-left: 64px;
  width: calc(100% - 64px);
}

.header {
  height: 60px;
  background-color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  position: relative;
  z-index: 9;
}

.header .left {
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.header .middle {
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-title {
  margin: 0;
  font-size: 18px;
  color: #303133;
}

.header .left .el-icon {
  font-size: 20px;
  transition: transform 0.3s;
}

.el-icon-rotate {
  transform: rotate(180deg);
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 6px 10px;
  border-radius: 20px;
  transition: background-color 0.3s;
}

.user-info:hover {
  background-color: #f5f7fa;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  margin-right: 10px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.content-container {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 5px;
  margin: 10px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

/* 美化路由过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* 菜单项美化 */
:deep(.el-menu-item) {
  height: 56px;
  line-height: 56px;
  padding-left: 20px !important;
  border-left: 3px solid transparent;
}

:deep(.el-menu-item.is-active) {
  background-color: #263445;
  border-left: 3px solid #409EFF;
}

:deep(.el-menu-item:hover) {
  background-color: #263445;
}

:deep(.el-menu-item .el-icon) {
  margin-right: 10px;
  font-size: 18px;
}

/* 移动端响应式样式 */
@media screen and (max-width: 768px) {
  .user-name {
    display: none;
  }
  
  .content-container {
    padding: 10px;
    margin: 5px;
  }
  
  .header {
    padding: 0 10px;
  }
  
  .sidebar {
    position: fixed;
  }
  
  .main-container {
    margin-left: 0 !important;
    width: 100% !important;
  }
}

@media screen and (max-width: 480px) {
  .content-container {
    padding: 8px;
    margin: 4px;
  }
  
  .page-title {
    font-size: 16px;
  }
  
  .user-avatar {
    width: 28px;
    height: 28px;
  }
}
</style> 