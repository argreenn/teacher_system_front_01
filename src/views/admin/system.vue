<template>
  <div class="system-container">
    <el-tabs v-model="activeTab" type="card">
      <el-tab-pane label="系统设置" name="settings">
        <div class="settings-panel">
          <el-card header="基本设置">
            <el-form label-width="120px" :model="systemSettings" ref="settingsFormRef">
              <el-form-item label="系统名称">
                <el-input v-model="systemSettings.systemName" placeholder="请输入系统名称" />
              </el-form-item>
              <el-form-item label="学校名称">
                <el-input v-model="systemSettings.schoolName" placeholder="请输入学校名称" />
              </el-form-item>
              <el-form-item label="管理员邮箱">
                <el-input v-model="systemSettings.adminEmail" placeholder="请输入管理员邮箱" />
              </el-form-item>
              <el-form-item label="系统公告">
                <el-input 
                  v-model="systemSettings.announcement" 
                  type="textarea" 
                  rows="4"
                  placeholder="请输入系统公告内容"
                />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="saveSettings">保存设置</el-button>
                <el-button @click="resetSettings">重置</el-button>
              </el-form-item>
            </el-form>
          </el-card>
        </div>
      </el-tab-pane>
      
      <el-tab-pane label="用户管理" name="users">
        <div class="user-panel">
          <el-card>
            <template #header>
              <div class="card-header">
                <span>系统用户列表</span>
                <el-button type="primary" @click="handleAddUser">新增用户</el-button>
              </div>
            </template>
            
            <el-table :data="userList" border style="width: 100%">
              <el-table-column prop="id" label="ID" width="80" />
              <el-table-column prop="username" label="用户名" width="120" />
              <el-table-column prop="name" label="姓名" width="120" />
              <el-table-column prop="role" label="角色" width="100">
                <template #default="scope">
                  <el-tag :type="scope.row.role === 'admin' ? 'danger' : 'primary'">
                    {{ scope.row.role === 'admin' ? '管理员' : '教师' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="email" label="邮箱" />
              <el-table-column prop="lastLogin" label="最后登录时间" width="180" />
              <el-table-column prop="status" label="状态" width="100">
                <template #default="scope">
                  <el-switch
                    v-model="scope.row.status"
                    :active-value="1"
                    :inactive-value="0"
                    @change="(val) => handleStatusChange(val, scope.row)"
                  />
                </template>
              </el-table-column>
              <el-table-column label="操作" width="200" class-name="operation-column">
                <template #default="scope">
                  <el-button type="primary" size="small" @click="handleEditUser(scope.row)">
                    编辑
                  </el-button>
                  <el-button type="warning" size="small" @click="handleResetPassword(scope.row)">
                    重置密码
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
            
            <div class="pagination-container">
              <el-pagination
                background
                layout="total, prev, pager, next"
                :total="totalUsers"
                :page-size="10"
                :current-page="userCurrentPage"
                @current-change="handleUserPageChange"
              />
            </div>
          </el-card>
        </div>
      </el-tab-pane>
      
      <el-tab-pane label="日志记录" name="logs">
        <div class="log-panel">
          <el-card>
            <template #header>
              <div class="card-header">
                <span>系统操作日志</span>
                <div>
                  <el-date-picker
                    v-model="logDateRange"
                    type="daterange"
                    range-separator="至"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    format="YYYY-MM-DD"
                    value-format="YYYY-MM-DD"
                    @change="filterLogs"
                  />
                  <el-button type="danger" @click="clearLogs">清空日志</el-button>
                </div>
              </div>
            </template>
            
            <el-table :data="logList" border style="width: 100%">
              <el-table-column prop="id" label="ID" width="80" />
              <el-table-column prop="username" label="操作用户" width="120" />
              <el-table-column prop="action" label="操作类型" width="120" />
              <el-table-column prop="description" label="操作描述" />
              <el-table-column prop="ip" label="IP地址" width="140" />
              <el-table-column prop="time" label="操作时间" width="180" />
            </el-table>
            
            <div class="pagination-container">
              <el-pagination
                background
                layout="total, prev, pager, next"
                :total="totalLogs"
                :page-size="10"
                :current-page="logCurrentPage"
                @current-change="handleLogPageChange"
              />
            </div>
          </el-card>
        </div>
      </el-tab-pane>
    </el-tabs>
    
    <!-- 用户表单对话框 -->
    <el-dialog
      :title="userDialogTitle"
      v-model="userDialogVisible"
      width="500px"
    >
      <el-form :model="userForm" :rules="userRules" ref="userFormRef" label-width="100px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="userForm.username" :disabled="userForm.id !== null" />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="userForm.name" />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="userForm.role" placeholder="请选择角色" style="width: 100%">
            <el-option label="管理员" value="admin" />
            <el-option label="教师" value="teacher" />
          </el-select>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="userForm.email" />
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="!userForm.id">
          <el-input v-model="userForm.password" type="password" show-password />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword" v-if="!userForm.id">
          <el-input v-model="userForm.confirmPassword" type="password" show-password />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="userForm.status" :active-value="1" :inactive-value="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="userDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveUser">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 当前激活的标签页
const activeTab = ref('settings')

// 系统设置相关
const settingsFormRef = ref(null)
const systemSettings = reactive({
  systemName: '教师系统管理平台',
  schoolName: '某某大学',
  adminEmail: 'admin@university.edu.cn',
  announcement: '欢迎使用教师系统管理平台，该系统主要用于教师信息管理和教学业绩统计。'
})

// 用户管理相关
const userList = ref([])
const totalUsers = ref(0)
const userCurrentPage = ref(1)
const allUsers = ref([])

// 日志管理相关
const logList = ref([])
const totalLogs = ref(0)
const logDateRange = ref([])
const logCurrentPage = ref(1)
const allLogs = ref([])

// 用户表单
const userDialogVisible = ref(false)
const userDialogTitle = ref('新增用户')
const userFormRef = ref(null)
const userForm = reactive({
  id: null,
  username: '',
  name: '',
  role: 'teacher',
  email: '',
  password: '',
  confirmPassword: '',
  status: 1
})

// 用户表单验证规则
const userRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, message: '用户名长度不能小于3个字符', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur', required: (form) => !form.id },
    { min: 6, message: '密码长度不能小于6个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { 
      required: true, 
      message: '请再次输入密码', 
      trigger: 'blur',
      required: (form) => !form.id
    },
    { 
      validator: (rule, value, callback) => {
        if (value !== userForm.password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      }, 
      trigger: 'blur'
    }
  ]
}

// 生命周期钩子
onMounted(() => {
  getUsers()
  getLogs()
})

// 保存系统设置
const saveSettings = () => {
  // 实际项目中应调用API保存设置
  setTimeout(() => {
    ElMessage.success('系统设置保存成功')
  }, 300)
}

// 重置系统设置
const resetSettings = () => {
  systemSettings.systemName = '教师系统管理平台'
  systemSettings.schoolName = '某某大学'
  systemSettings.adminEmail = 'admin@university.edu.cn'
  systemSettings.announcement = '欢迎使用教师系统管理平台，该系统主要用于教师信息管理和教学业绩统计。'
  ElMessage.success('系统设置已重置')
}

// 获取用户列表
const getUsers = () => {
  // 模拟API请求，获取用户列表
  setTimeout(() => {
    const mockUsers = []
    for (let i = 1; i <= 25; i++) {
      mockUsers.push({
        id: i,
        username: i === 1 ? 'admin' : `teacher${i-1}`,
        name: i === 1 ? '系统管理员' : `教师${i-1}`,
        role: i === 1 ? 'admin' : 'teacher',
        email: i === 1 ? 'admin@university.edu.cn' : `teacher${i-1}@university.edu.cn`,
        lastLogin: new Date(Date.now() - i * 3600 * 1000).toLocaleString(),
        status: Math.random() > 0.2 ? 1 : 0
      })
    }
    
    allUsers.value = mockUsers
    totalUsers.value = mockUsers.length
    updateUserPage()
  }, 300)
}

// 更新用户分页数据
const updateUserPage = () => {
  const start = (userCurrentPage.value - 1) * 10
  const end = start + 10
  userList.value = allUsers.value.slice(start, end)
}

// 用户分页变化
const handleUserPageChange = (page) => {
  userCurrentPage.value = page
  updateUserPage()
}

// 获取日志列表
const getLogs = () => {
  // 模拟API请求，获取日志列表
  setTimeout(() => {
    const mockLogs = []
    for (let i = 1; i <= 30; i++) {
      mockLogs.push({
        id: i,
        username: i % 3 === 0 ? 'admin' : `teacher${i % 2 + 1}`,
        action: ['登录', '查询', '新增', '修改', '删除'][i % 5],
        description: `用户进行了${['登录系统', '查询数据', '新增记录', '修改信息', '删除数据'][i % 5]}操作`,
        ip: `192.168.1.${i % 255}`,
        time: new Date(Date.now() - i * 3600 * 1000).toLocaleString()
      })
    }
    
    allLogs.value = mockLogs
    totalLogs.value = mockLogs.length
    updateLogPage()
  }, 300)
}

// 更新日志分页数据
const updateLogPage = () => {
  const start = (logCurrentPage.value - 1) * 10
  const end = start + 10
  logList.value = allLogs.value.slice(start, end)
}

// 处理添加用户
const handleAddUser = () => {
  userDialogTitle.value = '新增用户'
  // 重置表单
  Object.keys(userForm).forEach(key => {
    userForm[key] = key === 'id' ? null : (key === 'role' ? 'teacher' : (key === 'status' ? 1 : ''))
  })
  userDialogVisible.value = true
}

// 处理编辑用户
const handleEditUser = (row) => {
  userDialogTitle.value = '编辑用户'
  // 填充表单
  Object.keys(userForm).forEach(key => {
    if (key !== 'password' && key !== 'confirmPassword') {
      userForm[key] = row[key]
    } else {
      userForm[key] = ''
    }
  })
  userDialogVisible.value = true
}

// 保存用户
const saveUser = async () => {
  try {
    await userFormRef.value.validate()
    
    if (userForm.id) {
      // 编辑模式
      const index = allUsers.value.findIndex(item => item.id === userForm.id)
      if (index !== -1) {
        allUsers.value[index] = {
          ...allUsers.value[index],
          name: userForm.name,
          role: userForm.role,
          email: userForm.email,
          status: userForm.status
        }
        ElMessage.success('更新用户成功')
      }
    } else {
      // 新增模式
      const newUser = {
        id: allUsers.value.length > 0 ? Math.max(...allUsers.value.map(item => item.id)) + 1 : 1,
        username: userForm.username,
        name: userForm.name,
        role: userForm.role,
        email: userForm.email,
        lastLogin: '-',
        status: userForm.status
      }
      allUsers.value.push(newUser)
      totalUsers.value++
      ElMessage.success('添加用户成功')
    }
    
    // 更新用户分页数据
    updateUserPage()
    userDialogVisible.value = false
  } catch (error) {
    console.log('表单验证失败', error)
  }
}

// 处理用户状态变更
const handleStatusChange = (val, row) => {
  const statusText = val === 1 ? '启用' : '禁用'
  
  // 更新用户状态
  const index = allUsers.value.findIndex(item => item.id === row.id)
  if (index !== -1) {
    allUsers.value[index].status = val
  }
  
  ElMessage.success(`已${statusText}用户: ${row.name}`)
}

// 重置密码
const handleResetPassword = (row) => {
  ElMessageBox.confirm(`确定要重置用户"${row.name}"的密码吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 实际项目中应调用API重置密码
    ElMessage.success(`已重置用户"${row.name}"的密码为: 123456`)
  }).catch(() => {})
}

// 筛选日志
const filterLogs = () => {
  if (logDateRange.value && logDateRange.value.length === 2) {
    const start = new Date(logDateRange.value[0]).getTime()
    const end = new Date(logDateRange.value[1]).getTime() + 24 * 60 * 60 * 1000 - 1 // 结束日期的最后一毫秒
    
    const filteredLogs = allLogs.value.filter(log => {
      const logTime = new Date(log.time).getTime()
      return logTime >= start && logTime <= end
    })
    
    totalLogs.value = filteredLogs.length
    logList.value = filteredLogs.slice(0, 10)
    logCurrentPage.value = 1
    
    ElMessage.success(`已筛选出 ${filteredLogs.length} 条日志记录`)
  } else {
    totalLogs.value = allLogs.value.length
    updateLogPage()
  }
}

// 清空日志
const clearLogs = () => {
  ElMessageBox.confirm('确定要清空所有日志记录吗？此操作不可恢复！', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    allLogs.value = []
    logList.value = []
    totalLogs.value = 0
    logCurrentPage.value = 1
    ElMessage.success('所有日志已清空')
  }).catch(() => {})
}

// 日志分页变化
const handleLogPageChange = (page) => {
  logCurrentPage.value = page
  updateLogPage()
}
</script>

<style scoped>
.system-container {
  padding: 20px;
  animation: fadeIn 0.8s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.settings-panel,
.user-panel,
.log-panel {
  margin-top: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  padding: 10px 0;
}

:deep(.el-tabs__header) {
  margin-bottom: 20px;
}

:deep(.el-tabs__item) {
  padding: 0 30px;
  height: 40px;
  line-height: 40px;
  font-size: 15px;
  transition: all 0.3s ease;
}

:deep(.el-tabs__item.is-active) {
  font-weight: bold;
}

:deep(.el-tabs__nav) {
  border-radius: 4px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

:deep(.el-card) {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
  border-radius: 8px;
  transition: all 0.3s;
  margin-bottom: 20px;
}

:deep(.el-card:hover) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12) !important;
}

:deep(.el-card__header) {
  border-bottom: 1px solid #ebeef5;
  padding: 18px 20px;
}

:deep(.el-table) {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

:deep(.el-dialog__header) {
  border-bottom: 1px solid #ebeef5;
  padding: 20px;
  margin-right: 0;
}

:deep(.el-dialog__body) {
  padding: 30px 20px;
}

:deep(.el-dialog__footer) {
  border-top: 1px solid #ebeef5;
  padding: 15px 20px;
}

:deep(.el-table th.el-table__cell) {
  background-color: #f5f7fa;
  color: #606266;
  font-weight: 600;
}

:deep(.el-button--primary) {
  transition: all 0.3s;
}

:deep(.el-button--primary:hover) {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
}

:deep(.el-button--danger:hover) {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(245, 108, 108, 0.3);
}

:deep(.el-tag) {
  padding: 0 10px;
  height: 26px;
  line-height: 26px;
  font-size: 12px;
  border-radius: 13px;
}

:deep(.operation-column .cell) {
  display: flex;
  justify-content: center;
  gap: 8px;
}

/* 移动端响应式样式 */
@media screen and (max-width: 768px) {
  :deep(.el-tabs__item) {
    padding: 0 15px;
    font-size: 14px;
  }
  
  :deep(.el-card__header) {
    padding: 15px;
  }
  
  :deep(.el-card__body) {
    padding: 15px;
  }
  
  .card-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .card-header .el-button-group {
    margin-top: 10px;
    align-self: flex-end;
  }
  
  :deep(.operation-column .cell) {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
  }
  
  :deep(.operation-column .el-button) {
    margin-left: 0;
    padding: 6px 10px;
    font-size: 12px;
  }
}

@media screen and (max-width: 480px) {
  .system-container {
    padding: 10px;
  }
  
  :deep(.el-tabs__item) {
    padding: 0 10px;
    font-size: 13px;
  }
  
  :deep(.el-tabs__header) {
    margin-bottom: 15px;
  }
  
  :deep(.el-card) {
    margin-bottom: 15px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08) !important;
  }
  
  :deep(.el-card__header) {
    padding: 12px 15px;
  }
  
  :deep(.el-card__body) {
    padding: 12px;
  }
  
  .pagination-container {
    margin-top: 10px;
  }
  
  :deep(.el-pagination) {
    justify-content: center;
    flex-wrap: wrap;
    row-gap: 10px;
  }
  
  :deep(.el-dialog) {
    width: 95% !important;
  }
}
</style> 