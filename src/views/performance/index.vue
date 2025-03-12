<template>
  <div class="performance-container">
    <div class="filter-panel">
      <el-form :inline="true" :model="filterForm" class="form-inline">
        <el-form-item label="学院">
          <el-select 
            v-model="filterForm.department" 
            placeholder="请选择学院"
            clearable
            @change="handleDepartmentChange"
          >
            <el-option label="全部学院" value="" />
            <el-option label="计算机学院" value="计算机学院" />
            <el-option label="电子信息学院" value="电子信息学院" />
            <el-option label="经济管理学院" value="经济管理学院" />
            <el-option label="外国语学院" value="外国语学院" />
          </el-select>
        </el-form-item>
        <el-form-item label="年份">
          <el-select 
            v-model="filterForm.year" 
            placeholder="请选择年份"
            @change="fetchData"
          >
            <el-option label="2023年" value="2023" />
            <el-option label="2022年" value="2022" />
            <el-option label="2021年" value="2021" />
          </el-select>
        </el-form-item>
        <el-form-item label="学期">
          <el-select 
            v-model="filterForm.semester" 
            placeholder="请选择学期"
            @change="fetchData"
          >
            <el-option label="全学年" value="" />
            <el-option label="第一学期" value="1" />
            <el-option label="第二学期" value="2" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="fetchData">查询</el-button>
          <el-button type="success" @click="exportData">导出数据</el-button>
        </el-form-item>
      </el-form>
    </div>
    
    <!-- 数据统计卡片 -->
    <div class="stats-cards">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card shadow="hover">
            <template #header>
              <div class="card-header">
                <span>总课时数</span>
                <el-tag type="success">统计</el-tag>
              </div>
            </template>
            <div class="card-content">
              <div class="card-value">{{ totalHours }}</div>
              <div class="card-footer">
                <span>较上期</span>
                <span :class="hoursTrend > 0 ? 'text-success' : 'text-danger'">
                  {{ hoursTrend > 0 ? '+' : '' }}{{ hoursTrend }}%
                </span>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover">
            <template #header>
              <div class="card-header">
                <span>参与教师</span>
                <el-tag type="primary">人员</el-tag>
              </div>
            </template>
            <div class="card-content">
              <div class="card-value">{{ totalTeachers }}</div>
              <div class="card-footer">
                <span>较上期</span>
                <span :class="teachersTrend > 0 ? 'text-success' : 'text-danger'">
                  {{ teachersTrend > 0 ? '+' : '' }}{{ teachersTrend }}%
                </span>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover">
            <template #header>
              <div class="card-header">
                <span>课程数量</span>
                <el-tag type="warning">课程</el-tag>
              </div>
            </template>
            <div class="card-content">
              <div class="card-value">{{ totalCourses }}</div>
              <div class="card-footer">
                <span>较上期</span>
                <span :class="coursesTrend > 0 ? 'text-success' : 'text-danger'">
                  {{ coursesTrend > 0 ? '+' : '' }}{{ coursesTrend }}%
                </span>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover">
            <template #header>
              <div class="card-header">
                <span>平均工作量</span>
                <el-tag type="info">均值</el-tag>
              </div>
            </template>
            <div class="card-content">
              <div class="card-value">{{ averageHours }}</div>
              <div class="card-footer">
                <span>较上期</span>
                <span :class="averageTrend > 0 ? 'text-success' : 'text-danger'">
                  {{ averageTrend > 0 ? '+' : '' }}{{ averageTrend }}%
                </span>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
    
    <!-- 柱状图 -->
    <el-card class="chart-card">
      <template #header>
        <div class="card-header">
          <span>教师工作量统计（课时）</span>
          <div>
            <el-radio-group v-model="chartView" size="small" @change="updateChart">
              <el-radio-button label="department">按学院</el-radio-button>
              <el-radio-button label="teacher">按教师</el-radio-button>
            </el-radio-group>
          </div>
        </div>
      </template>
      <div ref="chartContainer" class="chart-container"></div>
    </el-card>
    
    <!-- 表格数据 -->
    <el-card class="data-card">
      <template #header>
        <div class="card-header">
          <span>业绩详细数据</span>
          <el-input
            v-model="searchText"
            placeholder="搜索教师或课程"
            style="width: 200px"
            clearable
            @input="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
      </template>
      <el-table
        :data="filteredTableData"
        style="width: 100%"
        border
        v-loading="loading"
        :default-sort="{ prop: 'updateTime', order: 'descending' }"
      >
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="teacherName" label="教师姓名" width="120" sortable />
        <el-table-column prop="department" label="所属学院" width="150" sortable />
        <el-table-column prop="courseName" label="课程名称" width="180" sortable />
        <el-table-column prop="courseType" label="课程类型" width="120">
          <template #default="scope">
            <el-tag :type="getTagType(scope.row.courseType)">{{ scope.row.courseType }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="classHours" label="课时数" width="100" sortable />
        <el-table-column prop="studentCount" label="学生人数" width="100" sortable />
        <el-table-column prop="semester" label="学期" width="100">
          <template #default="scope">
            {{ scope.row.year }}年{{ scope.row.semester ? `第${scope.row.semester}学期` : '全年' }}
          </template>
        </el-table-column>
        <el-table-column prop="updateTime" label="更新时间" width="180" sortable />
        <el-table-column label="操作" width="150" fixed="right">
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
          :total="totalItems"
          :page-size="pageSize"
          :page-sizes="[15, 30, 50, 100]"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
    
    <!-- 编辑对话框 -->
    <el-dialog
      :title="dialogTitle"
      v-model="dialogVisible"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form :model="performanceForm" :rules="formRules" ref="performanceFormRef" label-width="100px">
        <el-form-item label="教师姓名" prop="teacherName">
          <el-input v-model="performanceForm.teacherName" />
        </el-form-item>
        <el-form-item label="所属学院" prop="department">
          <el-select v-model="performanceForm.department" placeholder="请选择学院" style="width: 100%">
            <el-option label="计算机学院" value="计算机学院" />
            <el-option label="电子信息学院" value="电子信息学院" />
            <el-option label="经济管理学院" value="经济管理学院" />
            <el-option label="外国语学院" value="外国语学院" />
          </el-select>
        </el-form-item>
        <el-form-item label="课程名称" prop="courseName">
          <el-input v-model="performanceForm.courseName" />
        </el-form-item>
        <el-form-item label="课程类型" prop="courseType">
          <el-select v-model="performanceForm.courseType" placeholder="请选择课程类型" style="width: 100%">
            <el-option label="必修课" value="必修课" />
            <el-option label="选修课" value="选修课" />
            <el-option label="实验课" value="实验课" />
            <el-option label="实践课" value="实践课" />
          </el-select>
        </el-form-item>
        <el-form-item label="课时数" prop="classHours">
          <el-input-number v-model="performanceForm.classHours" :min="0" :max="500" />
        </el-form-item>
        <el-form-item label="学生人数" prop="studentCount">
          <el-input-number v-model="performanceForm.studentCount" :min="0" :max="500" />
        </el-form-item>
        <el-form-item label="年份" prop="year">
          <el-select v-model="performanceForm.year" placeholder="请选择年份" style="width: 100%">
            <el-option label="2023年" value="2023" />
            <el-option label="2022年" value="2022" />
            <el-option label="2021年" value="2021" />
          </el-select>
        </el-form-item>
        <el-form-item label="学期" prop="semester">
          <el-select v-model="performanceForm.semester" placeholder="请选择学期" style="width: 100%">
            <el-option label="第一学期" value="1" />
            <el-option label="第二学期" value="2" />
          </el-select>
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
import { ref, reactive, onMounted, nextTick } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as echarts from 'echarts'

// 图表实例
let chartInstance = null

// 表格数据和分页
const tableData = ref([])
const filteredTableData = ref([])
const loading = ref(false)
const totalItems = ref(0)
const pageSize = ref(15)
const currentPage = ref(1)
const searchText = ref('')

// 统计数据
const totalHours = ref(0)
const totalTeachers = ref(0)
const totalCourses = ref(0)
const averageHours = ref(0)
const hoursTrend = ref(5.2)
const teachersTrend = ref(3.1)
const coursesTrend = ref(-1.5)
const averageTrend = ref(2.3)

// 筛选表单
const filterForm = reactive({
  department: '',
  year: '2023',
  semester: ''
})

// 图表视图类型
const chartView = ref('department')
const chartContainer = ref(null)

// 编辑对话框
const dialogVisible = ref(false)
const dialogTitle = ref('新增业绩记录')
const performanceFormRef = ref(null)
const performanceForm = reactive({
  id: null,
  teacherName: '',
  department: '',
  courseName: '',
  courseType: '',
  classHours: 0,
  studentCount: 0,
  year: '2023',
  semester: '1',
  updateTime: ''
})

// 表单验证规则
const formRules = {
  teacherName: [{ required: true, message: '请输入教师姓名', trigger: 'blur' }],
  department: [{ required: true, message: '请选择所属学院', trigger: 'change' }],
  courseName: [{ required: true, message: '请输入课程名称', trigger: 'blur' }],
  courseType: [{ required: true, message: '请选择课程类型', trigger: 'change' }],
  classHours: [{ required: true, message: '请输入课时数', trigger: 'blur' }],
  studentCount: [{ required: true, message: '请输入学生人数', trigger: 'blur' }],
  year: [{ required: true, message: '请选择年份', trigger: 'change' }],
  semester: [{ required: true, message: '请选择学期', trigger: 'change' }]
}

// 生命周期钩子
onMounted(() => {
  fetchData()
  nextTick(() => {
    initChart()
  })
})

// 获取数据
const fetchData = () => {
  loading.value = true
  
  // 模拟API请求，实际应替换为axios调用后端接口
  setTimeout(() => {
    // 生成模拟数据
    const mockData = []
    const departments = ['计算机学院', '电子信息学院', '经济管理学院', '外国语学院']
    const courseTypes = ['必修课', '选修课', '实验课', '实践课']
    const teachers = {}
    
    // 确保每个学院都有教师
    departments.forEach((dept, deptIndex) => {
      for (let i = 1; i <= 5 + deptIndex; i++) {
        const teacherName = `${dept.substring(0, 1)}教师${i}`
        teachers[teacherName] = dept
      }
    })
    
    // 生成课程数据
    let id = 1
    Object.keys(teachers).forEach(teacher => {
      const dept = teachers[teacher]
      const coursesCount = Math.floor(Math.random() * 3) + 1 // 每位教师1-3门课程
      
      for (let i = 0; i < coursesCount; i++) {
        const courseType = courseTypes[Math.floor(Math.random() * courseTypes.length)]
        const classHours = Math.floor(Math.random() * 50) + 30 // 30-80课时
        const studentCount = Math.floor(Math.random() * 100) + 20 // 20-120学生
        
        mockData.push({
          id: id++,
          teacherName: teacher,
          department: dept,
          courseName: `${dept}专业课程${i + 1}`,
          courseType,
          classHours,
          studentCount,
          year: filterForm.year,
          semester: filterForm.semester || (Math.random() > 0.5 ? '1' : '2'),
          updateTime: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toLocaleString()
        })
      }
    })
    
    // 筛选数据
    let filteredData = [...mockData]
    
    if (filterForm.department) {
      filteredData = filteredData.filter(item => item.department === filterForm.department)
    }
    
    if (filterForm.semester) {
      filteredData = filteredData.filter(item => item.semester === filterForm.semester)
    }
    
    // 根据更新时间倒序排序
    filteredData.sort((a, b) => new Date(b.updateTime) - new Date(a.updateTime))
    
    // 计算统计数据
    totalHours.value = filteredData.reduce((sum, item) => sum + item.classHours, 0)
    
    // 统计不重复教师数量
    const uniqueTeachers = new Set(filteredData.map(item => item.teacherName))
    totalTeachers.value = uniqueTeachers.size
    
    // 统计不重复课程数量
    const uniqueCourses = new Set(filteredData.map(item => item.courseName))
    totalCourses.value = uniqueCourses.size
    
    // 计算平均工作量
    averageHours.value = totalTeachers.value ? Math.round(totalHours.value / totalTeachers.value) : 0
    
    // 存储总数据
    tableData.value = filteredData
    totalItems.value = filteredData.length
    
    // 分页
    updatePagedData()
    
    // 更新图表
    updateChart()
    
    loading.value = false
  }, 500)
}

// 更新分页数据
const updatePagedData = () => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  filteredTableData.value = tableData.value.slice(start, end)
}

// 处理搜索
const handleSearch = () => {
  const keyword = searchText.value.toLowerCase()
  if (keyword) {
    filteredTableData.value = tableData.value.filter(item => 
      item.teacherName.toLowerCase().includes(keyword) ||
      item.courseName.toLowerCase().includes(keyword)
    ).slice(0, pageSize.value)
  } else {
    updatePagedData()
  }
}

// 处理分页大小改变
const handleSizeChange = (size) => {
  pageSize.value = size
  updatePagedData()
}

// 处理页码改变
const handleCurrentChange = (page) => {
  currentPage.value = page
  updatePagedData()
}

// 处理学院变更
const handleDepartmentChange = () => {
  fetchData()
}

// 处理编辑
const handleEdit = (row) => {
  dialogTitle.value = '编辑业绩记录'
  // 填充表单
  Object.keys(performanceForm).forEach(key => {
    performanceForm[key] = row[key]
  })
  dialogVisible.value = true
}

// 处理删除
const handleDelete = (row) => {
  ElMessageBox.confirm(`确定删除"${row.teacherName}"的"${row.courseName}"课程记录吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 模拟删除操作
    const index = tableData.value.findIndex(item => item.id === row.id)
    if (index !== -1) {
      tableData.value.splice(index, 1)
      totalItems.value--
      updatePagedData()
      ElMessage.success('删除成功')
    }
  }).catch(() => {})
}

// 提交表单
const handleSubmit = async () => {
  try {
    await performanceFormRef.value.validate()
    
    if (performanceForm.id) {
      // 编辑模式
      const index = tableData.value.findIndex(item => item.id === performanceForm.id)
      if (index !== -1) {
        tableData.value[index] = {
          ...performanceForm,
          updateTime: new Date().toLocaleString()
        }
        ElMessage.success('更新成功')
      }
    } else {
      // 新增模式
      const newRecord = {
        ...performanceForm,
        id: tableData.value.length > 0 ? Math.max(...tableData.value.map(item => item.id)) + 1 : 1,
        updateTime: new Date().toLocaleString()
      }
      tableData.value.unshift(newRecord)
      totalItems.value++
      ElMessage.success('添加成功')
    }
    
    updatePagedData()
    dialogVisible.value = false
  } catch (error) {
    console.log('表单验证失败', error)
  }
}

// 导出数据
const exportData = () => {
  ElMessage.success('导出功能已触发，实际项目中应导出Excel文件')
}

// 获取标签类型
const getTagType = (type) => {
  const typeMap = {
    '必修课': 'danger',
    '选修课': 'primary',
    '实验课': 'warning',
    '实践课': 'success'
  }
  return typeMap[type] || 'info'
}

// 初始化图表
const initChart = () => {
  if (chartInstance) {
    chartInstance.dispose()
  }
  
  chartInstance = echarts.init(chartContainer.value)
  updateChart()
  
  // 响应窗口大小变化
  window.addEventListener('resize', () => {
    chartInstance.resize()
  })
}

// 更新图表数据
const updateChart = () => {
  if (!chartInstance) return
  
  let option = {}
  
  if (chartView.value === 'department') {
    // 按学院统计
    const departments = [...new Set(tableData.value.map(item => item.department))]
    const departmentData = departments.map(dept => {
      const deptItems = tableData.value.filter(item => item.department === dept)
      return {
        name: dept,
        value: deptItems.reduce((sum, item) => sum + item.classHours, 0)
      }
    })
    
    departmentData.sort((a, b) => b.value - a.value)
    
    option = {
      title: {
        text: '各学院工作量统计',
        left: 'center'
      },
      tooltip: {
        trigger: 'axis',
        formatter: '{b}: {c} 课时'
      },
      xAxis: {
        type: 'category',
        data: departmentData.map(item => item.name),
        axisLabel: {
          interval: 0,
          rotate: 30
        }
      },
      yAxis: {
        type: 'value',
        name: '课时数'
      },
      series: [
        {
          name: '工作量',
          type: 'bar',
          data: departmentData.map(item => item.value),
          itemStyle: {
            color: function(params) {
              const colors = ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de']
              return colors[params.dataIndex % colors.length]
            }
          },
          label: {
            show: true,
            position: 'top'
          }
        }
      ]
    }
  } else {
    // 按教师统计
    const teacherData = []
    const teacherHours = {}
    const teacherDept = {}
    
    tableData.value.forEach(item => {
      if (!teacherHours[item.teacherName]) {
        teacherHours[item.teacherName] = 0
        teacherDept[item.teacherName] = item.department
      }
      teacherHours[item.teacherName] += item.classHours
    })
    
    Object.keys(teacherHours).forEach(teacher => {
      teacherData.push({
        name: teacher,
        value: teacherHours[teacher],
        department: teacherDept[teacher]
      })
    })
    
    teacherData.sort((a, b) => b.value - a.value)
    
    // 只显示前15名，避免图表过于拥挤
    const topTeachers = teacherData.slice(0, 15)
    
    option = {
      title: {
        text: '教师工作量排名（前15名）',
        left: 'center'
      },
      tooltip: {
        trigger: 'axis',
        formatter: function(params) {
          const data = params[0]
          return `${data.name}<br/>学院: ${teacherDept[data.name]}<br/>工作量: ${data.value} 课时`
        }
      },
      xAxis: {
        type: 'category',
        data: topTeachers.map(item => item.name),
        axisLabel: {
          interval: 0,
          rotate: 45
        }
      },
      yAxis: {
        type: 'value',
        name: '课时数'
      },
      series: [
        {
          name: '工作量',
          type: 'bar',
          data: topTeachers.map(item => item.value),
          itemStyle: {
            color: function(params) {
              // 根据学院设置不同颜色
              const deptColors = {
                '计算机学院': '#5470c6',
                '电子信息学院': '#91cc75',
                '经济管理学院': '#fac858',
                '外国语学院': '#ee6666'
              }
              const teacher = topTeachers[params.dataIndex].name
              return deptColors[teacherDept[teacher]] || '#73c0de'
            }
          },
          label: {
            show: true,
            position: 'top'
          }
        }
      ]
    }
  }
  
  chartInstance.setOption(option)
}
</script>

<style scoped>
.performance-container {
  padding: 20px;
  font-size: clamp(14px, 1vw, 16px); /* 弹性基础字体大小 */
}

.filter-panel {
  margin-bottom: 20px;
  background-color: #fff;
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
}

.stats-cards {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header span {
  font-size: clamp(15px, 1.2vw, 18px); /* 弹性标题字体大小 */
  font-weight: 500;
}

.card-content {
  text-align: center;
}

.card-value {
  font-size: clamp(22px, 2vw, 28px); /* 弹性大数值字体大小 */
  font-weight: bold;
  margin: 10px 0;
}

.card-footer {
  font-size: clamp(12px, 0.9vw, 14px); /* 弹性小字体大小 */
  color: #909399;
  display: flex;
  justify-content: center;
  gap: 5px;
}

.text-success {
  color: #67c23a;
}

.text-danger {
  color: #f56c6c;
}

.chart-card,
.data-card {
  margin-bottom: 20px;
}

.chart-container {
  height: 400px;
  width: 100%;
}

/* 表格文本弹性设置 */
:deep(.el-table) {
  font-size: clamp(13px, 0.95vw, 15px);
}

:deep(.el-table th) {
  font-size: clamp(14px, 1vw, 16px);
  font-weight: 600;
}

/* 弹性按钮文本 */
:deep(.el-button) {
  font-size: clamp(13px, 0.9vw, 15px);
}

/* 弹性输入框文本 */
:deep(.el-input) {
  font-size: clamp(13px, 0.95vw, 15px);
}

/* 弹性选择器文本 */
:deep(.el-select) {
  font-size: clamp(13px, 0.95vw, 15px);
}

/* 弹性标签文本 */
:deep(.el-tag) {
  font-size: clamp(12px, 0.85vw, 14px);
}

/* 弹性对话框文本 */
:deep(.el-dialog__title) {
  font-size: clamp(16px, 1.25vw, 20px);
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

:deep(.el-pagination) {
  font-size: clamp(13px, 0.9vw, 15px);
}

/* 响应式媒体查询 */
@media screen and (max-width: 768px) {
  .performance-container {
    padding: 15px;
  }
  
  .card-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .card-header span {
    margin-bottom: 8px;
  }
  
  :deep(.el-table) {
    font-size: clamp(12px, 3.5vw, 14px);
  }
  
  .filter-panel {
    padding: 15px;
  }
  
  .card-value {
    font-size: clamp(18px, 5vw, 24px);
  }
}

@media screen and (max-width: 480px) {
  .performance-container {
    padding: 10px;
  }
  
  .filter-panel {
    padding: 12px;
  }
  
  .chart-container {
    height: 300px;
  }
  
  :deep(.el-form-item__label) {
    font-size: clamp(12px, 3.5vw, 14px);
  }
  
  :deep(.el-pagination button) {
    min-width: 24px;
  }
}
</style> 