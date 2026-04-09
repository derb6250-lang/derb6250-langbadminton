<template>
  <div class="test">
    <h1>测试页面</h1>
    <p>如果你能看到这个页面，说明Vue应用正在正常工作！</p>
    <el-button type="primary" @click="testMessage">测试消息</el-button>
  </div>
</template>

<script setup>
import { ElMessage } from 'element-plus'

const testMessage = () => {
  ElMessage.success('Vue应用运行正常！')
}
</script>

<style scoped>
.test {
  text-align: center;
  padding: 50px;
}

h1 {
  color: #409eff;
  margin-bottom: 20px;
}

p {
  font-size: 18px;
  margin-bottom: 30px;
}
</style>
