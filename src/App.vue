<template>
  <div id="app">
    <el-container>
      <el-header>
        <Header />
      </el-header>
      <el-main>
        <router-view />
      </el-main>
      <el-footer>
        <Footer />
      </el-footer>
    </el-container>
  </div>
</template>

<script setup>
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

.el-header {
  background-color: #409eff;
  color: white;
  text-align: center;
  line-height: 60px;
  padding: 0;
}

.el-main {
  min-height: calc(100vh - 120px);
  padding: 20px;
}

.el-footer {
  background-color: #f5f5f5;
  color: #666;
  text-align: center;
  line-height: 60px;
}
</style>
