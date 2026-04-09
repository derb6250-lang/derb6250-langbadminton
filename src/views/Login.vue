<template>
  <div class="login">
    <div class="login-container">
      <div class="login-form">
        <div class="login-header">
          <h1>登录</h1>
          <p>欢迎来到羽毛球销售系统</p>
        </div>

        <el-form 
          :model="loginForm" 
          :rules="rules" 
          ref="loginFormRef"
          @submit.prevent="handleLogin"
        >
          <el-form-item prop="username">
            <el-input
              v-model="loginForm.username"
              placeholder="请输入用户名"
              size="large"
              :prefix-icon="User"
            />
          </el-form-item>

          <el-form-item prop="password">
            <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码"
              size="large"
              :prefix-icon="Lock"
              show-password
            />
          </el-form-item>

          <el-form-item>
            <el-checkbox v-model="loginForm.remember">
              记住我
            </el-checkbox>
          </el-form-item>

          <el-form-item>
            <el-button 
              type="primary" 
              size="large" 
              :loading="loading"
              @click="handleLogin"
              class="login-button"
            >
              登录
            </el-button>
          </el-form-item>
        </el-form>

        <div class="login-footer">
          <p>还没有账号？<a href="#" @click="showRegister = true">立即注册</a></p>
        </div>
      </div>

      <!-- 快速登录选项 -->
      <div class="quick-login">
        <h3>快速登录</h3>
        <div class="quick-options">
          <el-button @click="quickLogin('admin')" type="primary">
            管理员登录
          </el-button>
          <el-button @click="quickLogin('user')" type="success">
            普通用户登录
          </el-button>
        </div>
      </div>
    </div>

    <!-- 注册对话框 -->
    <el-dialog v-model="showRegister" title="注册新账号" width="400px">
      <el-form :model="registerForm" :rules="registerRules" ref="registerFormRef">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="registerForm.username" placeholder="请输入用户名" />
        </el-form-item>
        
        <el-form-item label="密码" prop="password">
          <el-input 
            v-model="registerForm.password" 
            type="password" 
            placeholder="请输入密码"
            show-password
          />
        </el-form-item>
        
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input 
            v-model="registerForm.confirmPassword" 
            type="password" 
            placeholder="请再次输入密码"
            show-password
          />
        </el-form-item>
        
        <el-form-item label="姓名" prop="name">
          <el-input v-model="registerForm.name" placeholder="请输入真实姓名" />
        </el-form-item>
        
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="registerForm.email" placeholder="请输入邮箱地址" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="showRegister = false">取消</el-button>
        <el-button type="primary" @click="handleRegister" :loading="registerLoading">
          注册
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { User, Lock } from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()

const loading = ref(false)
const registerLoading = ref(false)
const showRegister = ref(false)
const loginFormRef = ref()
const registerFormRef = ref()

const loginForm = reactive({
  username: '',
  password: '',
  remember: false
})

const registerForm = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  name: '',
  email: ''
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ]
}

const registerRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== registerForm.password) {
          callback(new Error('两次输入密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  name: [
    { required: true, message: '请输入真实姓名', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      
      try {
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // 模拟用户数据
        const userData = {
          id: Date.now(),
          username: loginForm.username,
          name: loginForm.username === 'admin' ? '管理员' : '用户',
          email: `${loginForm.username}@example.com`,
          role: loginForm.username === 'admin' ? 'admin' : 'user'
        }
        
        userStore.login(userData)
        
        ElMessage.success('登录成功！')
        
        // 跳转到之前访问的页面或首页
        const redirect = router.currentRoute.value.query.redirect || '/'
        router.push(redirect)
        
      } catch (error) {
        ElMessage.error('登录失败，请检查用户名和密码')
      } finally {
        loading.value = false
      }
    }
  })
}

const handleRegister = async () => {
  if (!registerFormRef.value) return
  
  await registerFormRef.value.validate(async (valid) => {
    if (valid) {
      registerLoading.value = true
      
      try {
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // 模拟注册成功
        ElMessage.success('注册成功！请登录')
        showRegister.value = false
        
        // 清空注册表单
        Object.keys(registerForm).forEach(key => {
          registerForm[key] = ''
        })
        
      } catch (error) {
        ElMessage.error('注册失败，请重试')
      } finally {
        registerLoading.value = false
      }
    }
  })
}

const quickLogin = (type) => {
  if (type === 'admin') {
    loginForm.username = 'admin'
    loginForm.password = 'admin123'
  } else {
    loginForm.username = 'user'
    loginForm.password = 'user123'
  }
  handleLogin()
}
</script>

<style scoped>
.login {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.login-container {
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: flex;
  max-width: 800px;
  width: 100%;
}

.login-form {
  flex: 1;
  padding: 60px 40px;
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
}

.login-header h1 {
  font-size: 32px;
  color: #333;
  margin-bottom: 10px;
}

.login-header p {
  color: #666;
  font-size: 16px;
}

.login-button {
  width: 100%;
  height: 50px;
  font-size: 16px;
}

.login-footer {
  text-align: center;
  margin-top: 20px;
}

.login-footer a {
  color: #409eff;
  text-decoration: none;
}

.login-footer a:hover {
  text-decoration: underline;
}

.quick-login {
  background: #f8f9fa;
  padding: 60px 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-width: 300px;
}

.quick-login h3 {
  color: #333;
  margin-bottom: 30px;
  font-size: 20px;
}

.quick-options {
  display: flex;
  flex-direction: column;
  gap: 15px;
  width: 100%;
}

.quick-options .el-button {
  width: 100%;
  height: 45px;
}

@media (max-width: 768px) {
  .login-container {
    flex-direction: column;
  }
  
  .login-form {
    padding: 40px 30px;
  }
  
  .quick-login {
    padding: 30px;
    min-width: auto;
  }
  
  .quick-options {
    flex-direction: row;
  }
}
</style>
