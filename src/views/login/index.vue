<template>
  <div class="login-container" @click="createFirework">
    <div id="stars-container">
      <div class="stars"></div>
      <div class="wave"></div>
      <div class="wave"></div>
      <div class="wave"></div>
    </div>
    
    <div id="cursor-trails-container"></div>
    <div id="fireworks-container"></div>
    
    <div class="login-box">
      <h2 class="login-title">教师管理系统</h2>
      <el-form :model="loginForm" :rules="loginRules" ref="loginFormRef" class="login-form">
        <el-form-item prop="username">
          <el-input 
            v-model="loginForm.username"
            placeholder="请输入账号"
            prefix-icon="User"
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input 
            v-model="loginForm.password"
            placeholder="请输入密码"
            prefix-icon="Lock"
            type="password"
            show-password
          />
        </el-form-item>
        <el-form-item prop="userType">
          <el-select 
            v-model="loginForm.userType" 
            placeholder="请选择身份"
            style="width: 100%"
          >
            <el-option label="管理员" value="admin" />
            <el-option label="教师" value="teacher" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button 
            type="primary" 
            style="width: 100%"
            :loading="loading"
            @click="handleLogin"
            class="login-button"
          >
            登 录
          </el-button>
        </el-form-item>
        <div class="login-options">
          <el-link type="primary" href="javascript:;">忘记密码？</el-link>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '../../store/user'
import '../../assets/images/background.css'

const router = useRouter()
const userStore = useUserStore()
const loginFormRef = ref(null)
const loading = ref(false)

const loginForm = reactive({
  username: '',
  password: '',
  userType: 'admin'
})

const loginRules = {
  username: [
    { required: true, message: '请输入账号', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码不能少于6位', trigger: 'blur' }
  ],
  userType: [
    { required: true, message: '请选择身份', trigger: 'change' }
  ]
}

const handleLogin = async () => {
  try {
    // 表单验证
    await loginFormRef.value.validate()
    
    loading.value = true
    
    // 模拟API请求，实际应替换为axios调用后端接口
    setTimeout(() => {
      // 模拟登录成功
      const token = 'mock-token-' + Date.now()
      const userInfo = {
        id: 1,
        username: loginForm.username,
        name: loginForm.username === 'admin' ? '管理员' : '教师用户',
        role: loginForm.userType
      }
      
      // 保存用户状态
      userStore.setToken(token)
      userStore.setUserType(loginForm.userType)
      userStore.setUserInfo(userInfo)
      
      // 提示登录成功
      ElMessage.success('登录成功')
      
      // 登录成功后的礼花效果
      createCelebrationFireworks()
      
      // 延迟跳转，给用户时间看到礼花效果
      setTimeout(() => {
        // 跳转到管理页面
        router.push('/admin/teacher')
      }, 1500)
      
      loading.value = false
    }, 1000)
  } catch (error) {
    console.log('登录验证失败', error)
  }
}

// 创建星星效果
onMounted(() => {
  createStars()
  initMouseEffects()
})

onUnmounted(() => {
  cleanupMouseEffects()
})

// 创建星星的函数
const createStars = () => {
  const starsContainer = document.querySelector('.stars')
  if (!starsContainer) return
  
  // 清空已有星星
  starsContainer.innerHTML = ''
  
  // 创建新星星
  const numberOfStars = window.innerWidth < 768 ? 30 : 60 // 减少星星数量，使效果更柔和
  
  for (let i = 0; i < numberOfStars; i++) {
    const star = document.createElement('div')
    star.className = 'star'
    
    // 随机位置和大小
    star.style.top = `${Math.random() * 100}%`
    star.style.left = `${Math.random() * 100}%`
    star.style.width = `${Math.random() * 2.5 + 0.5}px` // 稍微减小星星大小
    star.style.height = star.style.width
    star.style.animationDelay = `${Math.random() * 4}s`
    
    starsContainer.appendChild(star)
  }
}

// 鼠标特效相关变量
let mouseX = 0
let mouseY = 0
let trailElements = []
let mouseMoveListener = null
let mouseClickListener = null

// 初始化鼠标效果
const initMouseEffects = () => {
  // 创建鼠标拖尾容器
  const trailsContainer = document.getElementById('cursor-trails-container')
  
  // 监听鼠标移动
  mouseMoveListener = (e) => {
    mouseX = e.clientX
    mouseY = e.clientY
    createTrailElement()
  }
  
  // 添加事件监听器
  document.addEventListener('mousemove', mouseMoveListener)
}

// 清理鼠标效果
const cleanupMouseEffects = () => {
  if (mouseMoveListener) {
    document.removeEventListener('mousemove', mouseMoveListener)
  }
  trailElements = []
}

// 创建鼠标拖尾元素
const createTrailElement = () => {
  const trailsContainer = document.getElementById('cursor-trails-container')
  if (!trailsContainer) return
  
  const trail = document.createElement('div')
  trail.className = 'cursor-trail'
  trail.style.left = `${mouseX}px`
  trail.style.top = `${mouseY}px`
  
  // 随机颜色
  const hue = Math.floor(Math.random() * 30) + 30 // 30-60的色相，偏黄棕色调
  trail.style.backgroundColor = `hsla(${hue}, 70%, 60%, 0.4)`
  
  trailsContainer.appendChild(trail)
  trailElements.push(trail)
  
  // 渐隐效果
  setTimeout(() => {
    trail.style.opacity = '0'
  }, 10)
  
  // 移除元素
  setTimeout(() => {
    if (trail.parentNode) {
      trail.parentNode.removeChild(trail)
    }
    trailElements = trailElements.filter(el => el !== trail)
  }, 800)
}

// 创建点击烟花效果
const createFirework = (e) => {
  // 不在登录框内点击时才触发烟花
  if (e.target.closest('.login-box')) return
  
  const fireworksContainer = document.getElementById('fireworks-container')
  if (!fireworksContainer) return
  
  const firework = document.createElement('div')
  firework.className = 'firework'
  firework.style.left = `${e.clientX}px`
  firework.style.top = `${e.clientY}px`
  
  fireworksContainer.appendChild(firework)
  
  // 创建粒子
  const particleCount = 30
  const angleStep = (Math.PI * 2) / particleCount
  
  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div')
    particle.className = 'firework-particle'
    
    // 随机颜色 - 使用暖色调
    const hue = Math.floor(Math.random() * 60) + 20 // 20-80的色相，主要是黄棕色调
    particle.style.backgroundColor = `hsl(${hue}, 70%, 60%)`
    
    firework.appendChild(particle)
    
    // 粒子爆炸动画
    const angle = angleStep * i
    const velocity = 2 + Math.random() * 3
    const velocityX = Math.cos(angle) * velocity
    const velocityY = Math.sin(angle) * velocity
    
    let posX = 0
    let posY = 0
    let opacity = 1
    let scale = 1
    
    // 动画帧
    const animate = () => {
      if (opacity <= 0) {
        if (particle.parentNode) {
          particle.parentNode.removeChild(particle)
        }
        return
      }
      
      posX += velocityX
      posY += velocityY
      opacity -= 0.02
      scale -= 0.01
      
      particle.style.transform = `translate(${posX}px, ${posY}px) scale(${scale})`
      particle.style.opacity = opacity
      
      requestAnimationFrame(animate)
    }
    
    requestAnimationFrame(animate)
  }
  
  // 移除烟花元素
  setTimeout(() => {
    if (firework.parentNode) {
      firework.parentNode.removeChild(firework)
    }
  }, 2000)
}

// 登录成功的礼花效果
const createCelebrationFireworks = () => {
  const fireworksContainer = document.getElementById('fireworks-container')
  if (!fireworksContainer) return
  
  // 创建多个烟花
  const fireworkCount = 5
  
  for (let i = 0; i < fireworkCount; i++) {
    setTimeout(() => {
      // 随机位置
      const x = Math.random() * window.innerWidth
      const y = Math.random() * (window.innerHeight * 0.6) // 上半部分
      
      const firework = document.createElement('div')
      firework.className = 'firework'
      firework.style.left = `${x}px`
      firework.style.top = `${y}px`
      
      fireworksContainer.appendChild(firework)
      
      // 创建粒子
      const particleCount = 40 // 更多粒子
      const angleStep = (Math.PI * 2) / particleCount
      
      for (let j = 0; j < particleCount; j++) {
        const particle = document.createElement('div')
        particle.className = 'firework-particle'
        
        // 随机礼花颜色 - 更加缤纷
        const hue = Math.floor(Math.random() * 360)
        particle.style.backgroundColor = `hsl(${hue}, 80%, 60%)`
        
        firework.appendChild(particle)
        
        // 粒子爆炸动画
        const angle = angleStep * j
        const velocity = 2 + Math.random() * 4
        const velocityX = Math.cos(angle) * velocity
        const velocityY = Math.sin(angle) * velocity
        
        let posX = 0
        let posY = 0
        let opacity = 1
        let scale = 1.2
        
        // 动画帧
        const animate = () => {
          if (opacity <= 0) {
            if (particle.parentNode) {
              particle.parentNode.removeChild(particle)
            }
            return
          }
          
          // 添加重力效果
          posX += velocityX
          posY += velocityY + 0.1 // 重力加速度
          opacity -= 0.01 // 慢一点消失
          scale -= 0.005
          
          particle.style.transform = `translate(${posX}px, ${posY}px) scale(${scale})`
          particle.style.opacity = opacity
          
          requestAnimationFrame(animate)
        }
        
        requestAnimationFrame(animate)
      }
      
      // 移除烟花元素
      setTimeout(() => {
        if (firework.parentNode) {
          firework.parentNode.removeChild(firework)
        }
      }, 3000)
    }, i * 300) // 间隔时间
  }
}

// 窗口大小改变时重新创建星星
window.addEventListener('resize', createStars)
</script>

<style scoped>
.login-container {
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;
}

.login-box {
  width: 90%;
  max-width: 420px;
  padding: 50px 40px;
  background-color: rgba(255, 255, 255, 0.92);
  border-radius: 16px;
  z-index: 10;
  transition: all 0.3s ease;
  transform: translateY(-20px);
}

.login-title {
  text-align: center;
  margin-bottom: 40px;
  color: #6b5a3e;
  font-size: 32px;
  font-weight: 600;
  letter-spacing: 1px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.login-form {
  margin-top: 20px;
}

.login-options {
  display: flex;
  justify-content: flex-end;
  margin-top: 25px;
}

.login-button {
  height: 48px;
  font-size: 18px;
  font-weight: 500;
  letter-spacing: 1px;
  background: linear-gradient(to right, #a68b5b, #d4c9a8);
  border: none;
  transition: all 0.3s ease;
  margin-top: 10px;
}

.login-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(166, 139, 91, 0.3);
}

:deep(.el-input__wrapper),
:deep(.el-select .el-input__wrapper) {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  padding: 9px 15px;
  border-radius: 10px;
  margin-bottom: 8px;
  background-color: rgba(255, 255, 255, 0.8);
  border: 1px solid #e6e2d3;
}

:deep(.el-input__prefix-inner) {
  font-size: 20px;
  margin-right: 12px;
  color: #a68b5b;
}

:deep(.el-form-item) {
  margin-bottom: 25px;
}

:deep(.el-form-item__error) {
  padding-top: 5px;
}

/* 移动端响应式样式 */
@media screen and (max-width: 768px) {
  .login-box {
    padding: 40px 30px;
  }
  
  .login-title {
    font-size: 28px;
  }
}

@media screen and (max-width: 480px) {
  .login-box {
    padding: 35px 25px;
    width: 95%;
  }
  
  .login-title {
    font-size: 26px;
    margin-bottom: 30px;
  }
  
  .login-button {
    height: 44px;
  }
  
  :deep(.el-form-item) {
    margin-bottom: 20px;
  }
}

/* 横屏手机适配 */
@media screen and (max-height: 480px) {
  .login-box {
    padding: 25px 20px;
    transform: translateY(-10px);
  }
  
  .login-title {
    font-size: 24px;
    margin-bottom: 20px;
  }
  
  :deep(.el-form-item) {
    margin-bottom: 15px;
  }
}
</style> 