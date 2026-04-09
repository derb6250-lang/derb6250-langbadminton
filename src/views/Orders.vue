<template>
  <div class="orders">
    <div class="orders-header">
      <h1>我的订单</h1>
      <el-button type="primary" @click="router.push('/products')">
        继续购物
      </el-button>
    </div>

    <!-- 订单状态筛选 -->
    <div class="order-filters">
      <el-radio-group v-model="statusFilter" @change="handleStatusFilter">
        <el-radio-button label="all">全部订单</el-radio-button>
        <el-radio-button label="pending">待处理</el-radio-button>
        <el-radio-button label="processing">处理中</el-radio-button>
        <el-radio-button label="shipped">已发货</el-radio-button>
        <el-radio-button label="delivered">已送达</el-radio-button>
        <el-radio-button label="cancelled">已取消</el-radio-button>
      </el-radio-group>
    </div>

    <!-- 订单列表 -->
    <div class="orders-list" v-loading="loading">
      <div v-if="filteredOrders.length === 0" class="empty-orders">
        <el-empty description="暂无订单">
          <el-button type="primary" @click="router.push('/products')">
            去购物
          </el-button>
        </el-empty>
      </div>

      <div v-else>
        <div 
          v-for="order in filteredOrders" 
          :key="order.id" 
          class="order-card"
        >
          <div class="order-header">
            <div class="order-info">
              <span class="order-number">订单号: {{ order.id }}</span>
              <span class="order-date">{{ formatDate(order.createdAt) }}</span>
            </div>
            <div class="order-status">
              <el-tag :type="getStatusType(order.status)">
                {{ getStatusText(order.status) }}
              </el-tag>
            </div>
          </div>

          <div class="order-items">
            <div 
              v-for="item in order.items" 
              :key="item.productId"
              class="order-item"
            >
              <div class="item-image">
                <img :src="item.image" :alt="item.name" />
              </div>
              <div class="item-info">
                <h4 class="item-name">{{ item.name }}</h4>
                <p class="item-price">¥{{ item.price }}</p>
                <p class="item-quantity">数量: {{ item.quantity }}</p>
              </div>
            </div>
          </div>

          <div class="order-footer">
            <div class="order-total">
              <span>订单总额: ¥{{ order.totalAmount.toFixed(2) }}</span>
            </div>
            <div class="order-actions">
              <el-button @click="viewOrderDetail(order)">查看详情</el-button>
              <el-button 
                v-if="order.status === 'pending'"
                type="danger" 
                @click="cancelOrder(order.id)"
              >
                取消订单
              </el-button>
              <el-button 
                v-if="order.status === 'delivered'"
                type="success"
                @click="confirmReceipt(order.id)"
              >
                确认收货
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 订单详情对话框 -->
    <el-dialog v-model="detailDialogVisible" title="订单详情" width="800px">
      <div v-if="selectedOrder" class="order-detail">
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

        <div class="detail-section">
          <h3>费用明细</h3>
          <div class="detail-row">
            <span>商品总价:</span>
            <span>¥{{ (selectedOrder.totalAmount - selectedOrder.shippingFee).toFixed(2) }}</span>
          </div>
          <div class="detail-row">
            <span>运费:</span>
            <span>¥{{ selectedOrder.shippingFee.toFixed(2) }}</span>
          </div>
          <div class="detail-row total">
            <span>订单总额:</span>
            <span>¥{{ selectedOrder.totalAmount.toFixed(2) }}</span>
          </div>
        </div>

        <div v-if="selectedOrder.notes" class="detail-section">
          <h3>订单备注</h3>
          <p>{{ selectedOrder.notes }}</p>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useOrdersStore } from '../stores/orders'
import { useUserStore } from '../stores/user'

const router = useRouter()
const ordersStore = useOrdersStore()
const userStore = useUserStore()

const loading = ref(false)
const statusFilter = ref('all')
const detailDialogVisible = ref(false)
const selectedOrder = ref(null)

const filteredOrders = computed(() => {
  let orders = ordersStore.getUserOrders(userStore.user?.id || 0)
  
  if (statusFilter.value !== 'all') {
    orders = orders.filter(order => order.status === statusFilter.value)
  }
  
  return orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
})

const handleStatusFilter = () => {
  // 状态筛选逻辑已在computed中处理
}

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

const viewOrderDetail = (order) => {
  selectedOrder.value = order
  detailDialogVisible.value = true
}

const cancelOrder = async (orderId) => {
  try {
    await ElMessageBox.confirm('确定要取消这个订单吗？', '确认取消', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    ordersStore.updateOrderStatus(orderId, 'cancelled')
    ElMessage.success('订单已取消')
  } catch {
    // 用户取消操作
  }
}

const confirmReceipt = async (orderId) => {
  try {
    await ElMessageBox.confirm('确认已收到商品吗？', '确认收货', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'success'
    })
    
    ordersStore.updateOrderStatus(orderId, 'delivered')
    ElMessage.success('已确认收货')
  } catch {
    // 用户取消操作
  }
}

onMounted(() => {
  ordersStore.loadFromLocalStorage()
})
</script>

<style scoped>
.orders {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.orders-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.orders-header h1 {
  font-size: 32px;
  color: #333;
}

.order-filters {
  margin-bottom: 30px;
  text-align: center;
}

.orders-list {
  min-height: 400px;
}

.empty-orders {
  text-align: center;
  padding: 60px 20px;
}

.order-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  overflow: hidden;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.order-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.order-number {
  font-weight: bold;
  color: #333;
}

.order-date {
  color: #666;
  font-size: 14px;
}

.order-items {
  padding: 20px;
}

.order-item {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #f0f0f0;
}

.order-item:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.item-image {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-info {
  flex: 1;
}

.item-name {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
}

.item-price {
  color: #e74c3c;
  font-weight: bold;
  margin-bottom: 5px;
}

.item-quantity {
  color: #666;
  font-size: 14px;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: #f8f9fa;
}

.order-total {
  font-size: 18px;
  font-weight: bold;
  color: #e74c3c;
}

.order-actions {
  display: flex;
  gap: 10px;
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

.detail-row.total {
  font-weight: bold;
  font-size: 16px;
  color: #e74c3c;
  border-top: 1px solid #e9ecef;
  padding-top: 10px;
  margin-top: 10px;
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
  .orders-header {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }
  
  .order-header {
    flex-direction: column;
    gap: 10px;
    align-items: stretch;
  }
  
  .order-footer {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }
  
  .order-actions {
    justify-content: center;
  }
  
  .detail-item {
    flex-direction: column;
    text-align: center;
  }
}
</style>
