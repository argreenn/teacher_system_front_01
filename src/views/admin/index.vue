<template>
  <div class="teacher-container">
    <div class="search-bar">
      <el-form :inline="true" :model="searchForm" class="form-inline search-form">
        <el-form-item>
          <el-input v-model="searchForm.keyword" placeholder="请输入教师姓名或工号" clearable>
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button type="success" @click="handleAdd">新增教师</el-button>
        </el-form-item>
      </el-form>
    </div>
    
    <el-table
      :data="tableData"
      style="width: 100%"
      border
      v-loading="loading"
      highlight-current-row
    >
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="姓名" width="120" />
      <el-table-column prop="teacherId" label="工号" width="120" />
      <el-table-column prop="department" label="所属学院" width="150" />
      <el-table-column prop="title" label="职称" width="120" />
      <el-table-column prop="phone" label="联系电话" width="150" />
      <el-table-column prop="email" label="邮箱" width="180" />
      <el-table-column prop="updateTime" label="更新时间" width="180" sortable />
      <el-table-column label="操作" width="150" fixed="right" class-name="operation-column">
        <template #default="scope">
          <el-button type="primary" size="small" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button type="danger" size="small" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <div class="pagination-container">
      <el-pagination
        background
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        :current-page="currentPage"
        :page-size="pageSize"
        :page-sizes="[10, 15, 30, 50]"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
    
    <!-- 教师表单对话框 -->
    <el-dialog
      :title="dialogTitle"
      v-model="dialogVisible"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form :model="teacherForm" :rules="formRules" ref="teacherFormRef" label-width="100px">
        <el-form-item label="姓名" prop="name">
          <el-input v-model="teacherForm.name" />
        </el-form-item>
        <el-form-item label="工号" prop="teacherId">
          <el-input v-model="teacherForm.teacherId" />
        </el-form-item>
        <el-form-item label="所属学院" prop="department">
          <el-select v-model="teacherForm.department" placeholder="请选择学院" style="width: 100%">
            <el-option label="计算机学院" value="计算机学院" />
            <el-option label="电子信息学院" value="电子信息学院" />
            <el-option label="经济管理学院" value="经济管理学院" />
            <el-option label="外国语学院" value="外国语学院" />
          </el-select>
        </el-form-item>
        <el-form-item label="职称" prop="title">
          <el-select v-model="teacherForm.title" placeholder="请选择职称" style="width: 100%">
            <el-option label="教授" value="教授" />
            <el-option label="副教授" value="副教授" />
            <el-option label="讲师" value="讲师" />
            <el-option label="助教" value="助教" />
          </el-select>
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="teacherForm.phone" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="teacherForm.email" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 表格数据
const allData = ref([])
const tableData = ref([])
const loading = ref(false)
const total = ref(0)
const pageSize = ref(10)
const currentPage = ref(1)

// 搜索表单
const searchForm = reactive({
  keyword: ''
})

// 教师表单
const dialogTitle = ref('新增教师')
const dialogVisible = ref(false)
const teacherFormRef = ref(null)
const teacherForm = reactive({
  id: null,
  name: '',
  teacherId: '',
  department: '',
  title: '',
  phone: '',
  email: '',
})

// 表单验证规则
const formRules = {
  name: [{ required: true, message: '请输入教师姓名', trigger: 'blur' }],
  teacherId: [{ required: true, message: '请输入工号', trigger: 'blur' }],
  department: [{ required: true, message: '请选择所属学院', trigger: 'change' }],
  title: [{ required: true, message: '请选择职称', trigger: 'change' }],
  phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ]
}

// 生命周期钩子
onMounted(() => {
  generateMockData()
})

// 生成模拟数据
const generateMockData = () => {
  loading.value = true
  
  // 生成模拟数据
  const mockData = []
  for (let i = 1; i <= 65; i++) {
    mockData.push({
      id: i,
      name: `教师${i}`,
      teacherId: `T${String(2024000 + i).padStart(6, '0')}`,
      department: ['计算机学院', '电子信息学院', '经济管理学院', '外国语学院'][Math.floor(Math.random() * 4)],
      title: ['教授', '副教授', '讲师', '助教'][Math.floor(Math.random() * 4)],
      phone: `1${Math.floor(Math.random() * 9) + 3}${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
      email: `teacher${i}@university.edu.cn`,
      updateTime: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toLocaleString()
    })
  }
  
  // 根据更新时间倒序排序
  mockData.sort((a, b) => new Date(b.updateTime) - new Date(a.updateTime))
  
  // 保存所有数据
  allData.value = mockData
  
  // 刷新筛选后的数据
  filterData()
  
  loading.value = false
}

// 筛选数据
const filterData = () => {
  const keyword = searchForm.keyword.toLowerCase()
  const filteredData = keyword
    ? allData.value.filter(item => 
        item.name.toLowerCase().includes(keyword) || 
        item.teacherId.toLowerCase().includes(keyword))
    : [...allData.value]
  
  total.value = filteredData.length
  
  // 更新分页数据
  updatePagedData(filteredData)
}

// 更新分页后的数据
const updatePagedData = (data) => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  tableData.value = data.slice(start, end)
}

// 获取教师列表数据（模拟API调用）
const getTeacherList = () => {
  loading.value = true
  
  // 模拟API请求延迟
  setTimeout(() => {
    filterData()
    loading.value = false
  }, 300)
}

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1
  getTeacherList()
}

// 处理分页大小改变
const handleSizeChange = (size) => {
  pageSize.value = size
  filterData()
}

// 处理页码改变
const handleCurrentChange = (page) => {
  currentPage.value = page
  filterData()
}

// 处理新增教师
const handleAdd = () => {
  dialogTitle.value = '新增教师'
  // 重置表单
  Object.keys(teacherForm).forEach(key => {
    teacherForm[key] = key === 'id' ? null : ''
  })
  dialogVisible.value = true
}

// 处理编辑教师
const handleEdit = (row) => {
  dialogTitle.value = '编辑教师'
  // 填充表单
  Object.keys(teacherForm).forEach(key => {
    teacherForm[key] = row[key]
  })
  dialogVisible.value = true
}

// 处理删除教师
const handleDelete = (row) => {
  ElMessageBox.confirm(`确定删除教师"${row.name}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 模拟删除操作
    const index = allData.value.findIndex(item => item.id === row.id)
    if (index !== -1) {
      allData.value.splice(index, 1)
      ElMessage.success('删除成功')
      
      // 重新筛选数据
      filterData()
    }
  }).catch(() => {})
}

// 提交表单
const handleSubmit = async () => {
  try {
    await teacherFormRef.value.validate()
    
    if (teacherForm.id) {
      // 编辑模式
      const index = allData.value.findIndex(item => item.id === teacherForm.id)
      if (index !== -1) {
        allData.value[index] = {
          ...teacherForm,
          updateTime: new Date().toLocaleString()
        }
        ElMessage.success('更新成功')
      }
    } else {
      // 新增模式
      const newTeacher = {
        ...teacherForm,
        id: allData.value.length > 0 ? Math.max(...allData.value.map(item => item.id)) + 1 : 1,
        updateTime: new Date().toLocaleString()
      }
      allData.value.unshift(newTeacher)
      ElMessage.success('添加成功')
    }
    
    // 重新筛选数据
    filterData()
    dialogVisible.value = false
  } catch (error) {
    console.log('表单验证失败', error)
  }
}
</script>

<style scoped>
.teacher-container {
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

.search-bar {
  margin-bottom: 20px;
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.search-bar:hover {
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  padding: 10px 0;
}

:deep(.el-table) {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  flex: 1;
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

:deep(.operation-column .cell) {
  display: flex;
  justify-content: center;
  gap: 8px;
}

/* 移动端响应式样式 */
@media screen and (max-width: 768px) {
  .search-bar {
    padding: 15px;
  }
  
  :deep(.el-form-item) {
    margin-bottom: 15px;
  }
  
  :deep(.search-form) {
    display: flex;
    flex-direction: column;
  }
  
  :deep(.search-form .el-form-item) {
    margin-right: 0;
  }
  
  :deep(.el-table--enable-row-hover .el-table__body tr:hover > td) {
    background-color: #f5f7fa;
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
  .teacher-container {
    padding: 10px;
  }
  
  .search-bar {
    padding: 10px;
    margin-bottom: 10px;
  }
  
  :deep(.el-table) {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
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