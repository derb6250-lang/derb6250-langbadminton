<template>
  <div class="admin">
    <div class="admin-header">
      <h1>管理后台</h1>
      <el-button type="primary" @click="showAddProduct = true">
        添加商品
      </el-button>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-cards">
      <div class="stat-card">
        <div class="stat-icon">
          <el-icon><Box /></el-icon>
        </div>
        <div class="stat-content">
          <h3>{{ productsStore.products.length }}</h3>
          <p>商品总数</p>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">
          <el-icon><ShoppingCart /></el-icon>
        </div>
        <div class="stat-content">
          <h3>{{ ordersStore.orders.length }}</h3>
          <p>订单总数</p>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">
          <el-icon><Money /></el-icon>
        </div>
        <div class="stat-content">
          <h3>¥{{ totalRevenue.toFixed(2) }}</h3>
          <p>总销售额</p>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">
          <el-icon><User /></el-icon>
        </div>
        <div class="stat-content">
          <h3>{{ uniqueUsers }}</h3>
          <p>用户数量</p>
        </div>
      </div>
    </div>

    <!-- 标签页 -->
    <el-tabs v-model="activeTab" class="admin-tabs">
      <el-tab-pane label="商品管理" name="products">
        <div class="products-management">
          <div class="table-toolbar">
            <el-input
              v-model="productSearchQuery"
              placeholder="搜索商品..."
              style="width: 300px"
              clearable
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </div>
          
          <el-table :data="filteredProducts" style="width: 100%">
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="name" label="商品名称" min-width="200" />
            <el-table-column prop="category" label="分类" width="100" />
            <el-table-column prop="brand" label="品牌" width="100" />
            <el-table-column prop="price" label="价格" width="100">
              <template #default="scope">
                ¥{{ scope.row.price }}
              </template>
            </el-table-column>
            <el-table-column prop="stock" label="库存" width="100" />
            <el-table-column prop="rating" label="评分" width="100">
              <template #default="scope">
                <el-rate v-model="scope.row.rating" disabled show-score />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200">
              <template #default="scope">
                <el-button size="small" @click="editProduct(scope.row)">
                  编辑
                </el-button>
                <el-button 
                  size="small" 
                  type="danger" 
                  @click="deleteProduct(scope.row.id)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>
      
      <el-tab-pane label="订单管理" name="orders">
        <div class="orders-management">
          <div class="table-toolbar">
            <el-select v-model="orderStatusFilter" placeholder="筛选状态" clearable>
              <el-option label="全部" value="" />
              <el-option label="待处理" value="pending" />
              <el-option label="处理中" value="processing" />
              <el-option label="已发货" value="shipped" />
              <el-option label="已送达" value="delivered" />
              <el-option label="已取消" value="cancelled" />
            </el-select>
          </div>
          
          <el-table :data="filteredOrders" style="width: 100%">
            <el-table-column prop="id" label="订单号" width="120" />
            <el-table-column prop="userName" label="用户" width="100" />
            <el-table-column prop="totalAmount" label="金额" width="100">
              <template #default="scope">
                ¥{{ scope.row.totalAmount.toFixed(2) }}
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="scope">
                <el-tag :type="getStatusType(scope.row.status)">
                  {{ getStatusText(scope.row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="createdAt" label="下单时间" width="180">
              <template #default="scope">
                {{ formatDate(scope.row.createdAt) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200">
              <template #default="scope">
                <el-button size="small" @click="viewOrder(scope.row)">
                  查看
                </el-button>
                <el-button 
                  v-if="scope.row.status === 'pending'"
                  size="small" 
                  type="success"
                  @click="updateOrderStatus(scope.row.id, 'processing')"
                >
                  处理
                </el-button>
                <el-button 
                  v-if="scope.row.status === 'processing'"
                  size="small" 
                  type="primary"
                  @click="updateOrderStatus(scope.row.id, 'shipped')"
                >
                  发货
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- 添加/编辑商品对话框 -->
    <el-dialog 
      v-model="showAddProduct" 
      :title="editingProduct ? '编辑商品' : '添加商品'"
      width="600px"
    >
      <el-form :model="productForm" :rules="productRules" ref="productFormRef" label-width="100px">
        <el-form-item label="商品名称" prop="name">
          <el-input v-model="productForm.name" placeholder="请输入商品名称" />
        </el-form-item>
        
        <el-form-item label="分类" prop="category">
          <el-select v-model="productForm.category" placeholder="选择分类">
            <el-option 
              v-for="category in productsStore.categories" 
              :key="category"
              :label="category" 
              :value="category" 
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="品牌" prop="brand">
          <el-select v-model="productForm.brand" placeholder="选择品牌">
            <el-option 
              v-for="brand in productsStore.brands" 
              :key="brand"
              :label="brand" 
              :value="brand" 
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="价格" prop="price">
          <el-input-number 
            v-model="productForm.price" 
            :min="0" 
            :precision="2"
            style="width: 100%"
          />
        </el-form-item>
        
        <el-form-item label="库存" prop="stock">
          <el-input-number v-model="productForm.stock" :min="0" style="width: 100%" />
        </el-form-item>
        
        <el-form-item label="评分" prop="rating">
          <el-rate v-model="productForm.rating" :max="5" />
        </el-form-item>
        
        <el-form-item label="描述" prop="description">
          <el-input 
            v-model="productForm.description" 
            type="textarea" 
            :rows="3"
            placeholder="请输入商品描述"
          />
        </el-form-item>
        
        <el-form-item label="图片" prop="image">
          <el-input v-model="productForm.image" placeholder="请输入图片URL" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="cancelEdit">取消</el-button>
        <el-button type="primary" @click="saveProduct" :loading="saving">
          {{ editingProduct ? '更新' : '添加' }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 订单详情对话框 -->
    <el-dialog v-model="showOrderDetail" title="订单详情" width="800px">
      <div v-if="selectedOrder" class="order-detail">
        <!-- 订单详情内容与Orders.vue中的类似 -->
        <div class="detail-section">
          <h3>订单信息</h3>
          <div class="detail-row">
            <span>订单号:</span>
            <span>{{ selectedOrder.id }}</span>
          </div>
          <div class="detail-row">
            <span>下单时间:</span>
            <span>{{ formatDate(selectedOrder.createdAt) }}</span>
          </div>
          <div class="detail-row">
            <span>订单状态:</span>
            <el-tag :type="getStatusType(selectedOrder.status)">
              {{ getStatusText(selectedOrder.status) }}
            </el-tag>
          </div>
        </div>
        
        <div class="detail-section">
          <h3>收货信息</h3>
          <div class="detail-row">
            <span>收货人:</span>
            <span>{{ selectedOrder.shippingInfo.name }}</span>
          </div>
          <div class="detail-row">
            <span>联系电话:</span>
            <span>{{ selectedOrder.shippingInfo.phone }}</span>
          </div>
          <div class="detail-row">
            <span>收货地址:</span>
            <span>{{ selectedOrder.shippingInfo.address }}</span>
          </div>
        </div>
        
        <div class="detail-section">
          <h3>商品清单</h3>
          <div class="detail-items">
            <div 
              v-for="item in selectedOrder.items" 
              :key="item.productId"
              class="detail-item"
            >
              <img :src="item.image" :alt="item.name" />
              <div class="item-details">
                <h4>{{ item.name }}</h4>
                <p>单价: ¥{{ item.price }}</p>
                <p>数量: {{ item.quantity }}</p>
                <p>小计: ¥{{ (item.price * item.quantity).toFixed(2) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useProductsStore } from '../stores/products'
import { useOrdersStore } from '../stores/orders'
import { useUserStore } from '../stores/user'
import { Box, ShoppingCart, Money, User, Search } from '@element-plus/icons-vue'

const productsStore = useProductsStore()
const ordersStore = useOrdersStore()
const userStore = useUserStore()

const activeTab = ref('products')
const showAddProduct = ref(false)
const showOrderDetail = ref(false)
const editingProduct = ref(null)
const saving = ref(false)
const productSearchQuery = ref('')
const orderStatusFilter = ref('')
const selectedOrder = ref(null)
const productFormRef = ref()

const productForm = ref({
  name: '',
  category: '',
  brand: '',
  price: 0,
  stock: 0,
  rating: 5,
  description: '',
  image: ''
})

const productRules = {
  name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
  category: [{ required: true, message: '请选择分类', trigger: 'change' }],
  brand: [{ required: true, message: '请选择品牌', trigger: 'change' }],
  price: [{ required: true, message: '请输入价格', trigger: 'blur' }],
  stock: [{ required: true, message: '请输入库存', trigger: 'blur' }]
}

const filteredProducts = computed(() => {
  let products = productsStore.products
  
  if (productSearchQuery.value) {
    products = products.filter(product => 
      product.name.toLowerCase().includes(productSearchQuery.value.toLowerCase())
    )
  }
  
  return products
})

const filteredOrders = computed(() => {
  let orders = ordersStore.orders
  
  if (orderStatusFilter.value) {
    orders = orders.filter(order => order.status === orderStatusFilter.value)
  }
  
  return orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
})

const totalRevenue = computed(() => {
  return ordersStore.orders.reduce((total, order) => {
    return order.status !== 'cancelled' ? total + order.totalAmount : total
  }, 0)
})

const uniqueUsers = computed(() => {
  const userIds = new Set(ordersStore.orders.map(order => order.userId))
  return userIds.size
})

const getStatusType = (status) => {
  const statusMap = {
    pending: 'warning',
    processing: 'primary',
    shipped: 'info',
    delivered: 'success',
    cancelled: 'danger'
  }
  return statusMap[status] || 'info'
}

const getStatusText = (status) => {
  const statusMap = {
    pending: '待处理',
    processing: '处理中',
    shipped: '已发货',
    delivered: '已送达',
    cancelled: '已取消'
  }
  return statusMap[status] || status
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN')
}

const editProduct = (product) => {
  editingProduct.value = product
  productForm.value = { ...product }
  showAddProduct.value = true
}

const deleteProduct = async (productId) => {
  try {
    await ElMessageBox.confirm('确定要删除这个商品吗？', '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    productsStore.deleteProduct(productId)
    ElMessage.success('商品已删除')
  } catch {
    // 用户取消操作
  }
}

const saveProduct = async () => {
  if (!productFormRef.value) return
  
  await productFormRef.value.validate(async (valid) => {
    if (valid) {
      saving.value = true
      
      try {
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 500))
        
        if (editingProduct.value) {
          productsStore.updateProduct(editingProduct.value.id, productForm.value)
          ElMessage.success('商品已更新')
        } else {
          productsStore.addProduct(productForm.value)
          ElMessage.success('商品已添加')
        }
        
        cancelEdit()
        
      } catch (error) {
        ElMessage.error('操作失败，请重试')
      } finally {
        saving.value = false
      }
    }
  })
}

const cancelEdit = () => {
  showAddProduct.value = false
  editingProduct.value = null
  productForm.value = {
    name: '',
    category: '',
    brand: '',
    price: 0,
    stock: 0,
    rating: 5,
    description: '',
    image: ''
  }
}

const viewOrder = (order) => {
  selectedOrder.value = order
  showOrderDetail.value = true
}

const updateOrderStatus = async (orderId, status) => {
  try {
    await ElMessageBox.confirm(`确定要将订单状态更新为"${getStatusText(status)}"吗？`, '确认更新', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    ordersStore.updateOrderStatus(orderId, status)
    ElMessage.success('订单状态已更新')
  } catch {
    // 用户取消操作
  }
}

onMounted(() => {
  ordersStore.loadFromLocalStorage()
})
</script>

<style scoped>
.admin {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.admin-header h1 {
  font-size: 32px;
  color: #333;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 30px;
  display: flex;
  align-items: center;
  gap: 20px;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #409eff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.stat-content h3 {
  font-size: 32px;
  color: #333;
  margin-bottom: 5px;
}

.stat-content p {
  color: #666;
  font-size: 14px;
}

.admin-tabs {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.table-toolbar {
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.order-detail {
  max-height: 600px;
  overflow-y: auto;
}

.detail-section {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.detail-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.detail-section h3 {
  font-size: 18px;
  color: #333;
  margin-bottom: 15px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  padding: 5px 0;
}

.detail-items {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.detail-item {
  display: flex;
  gap: 15px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
}

.detail-item img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
}

.item-details h4 {
  font-size: 16px;
  color: #333;
  margin-bottom: 8px;
}

.item-details p {
  color: #666;
  margin-bottom: 5px;
  font-size: 14px;
}

@media (max-width: 768px) {
  .admin-header {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }
  
  .stats-cards {
    grid-template-columns: 1fr;
  }
  
  .stat-card {
    flex-direction: column;
    text-align: center;
  }
  
  .table-toolbar {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }
}
</style>
