<script setup>
// 不需要引入组件
</script>

<template>
  <router-view />
</template>

<style>
/* 重置浏览器默认样式 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
  overflow: hidden; /* 防止出现滚动条 */
  position: fixed; /* 防止移动端浏览器地址栏影响高度 */
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #1a56b0 0%, #5b21a6 100%);
  background-attachment: fixed;
  background-size: cover;
}

#app {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 添加一些全局样式变量 */
:root {
  --primary-color: #409EFF;
  --success-color: #67C23A;
  --warning-color: #E6A23C;
  --danger-color: #F56C6C;
  --info-color: #909399;
  --main-background: linear-gradient(135deg, #1a56b0 0%, #5b21a6 100%);
  
  /* 移动端断点 */
  --mobile-breakpoint: 768px;
  --small-mobile-breakpoint: 480px;
}

/* 移动端适配基础样式 */
@media screen and (max-width: 768px) {
  html {
    font-size: 14px; /* 缩小基础字体大小 */
  }
  
  .el-dialog {
    width: 90% !important;
    margin: 10px auto !important;
  }
  
  .el-form-item {
    margin-bottom: 15px !important;
  }
}

@media screen and (max-width: 480px) {
  html {
    font-size: 12px; /* 更小屏幕进一步缩小字体 */
  }
  
  .el-table {
    font-size: 12px !important;
  }
}
</style>
