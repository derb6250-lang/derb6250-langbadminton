<template>
  <div class="cart">
    <div class="cart-header">
      <h1>购物车</h1>
      <p v-if="cartStore.totalItems > 0">
        共 {{ cartStore.totalItems }} 件商品
      </p>
    </div>

    <!-- 空购物车 -->
    <div v-if="cartStore.items.length === 0" class="empty-cart">
      <el-empty description="购物车是空的">
        <el-button type="primary" @click="router.push('/products')">
          去购物
        </el-button>
      </el-empty>
    </div>

    <!-- 购物车内容 -->
    <div v-else class="cart-content">
      <div class="cart-items">
        <div 
          v-for="item in cartStore.items" 
          :key="item.id" 
          class="cart-item"
        >
          <div class="item-image">
            <img :src="item.image" :alt="item.name" />
          </div>
          
          <div class="item-info">
            <h3 class="item-name">{{ item.name }}</h3>
            <p class="item-price">¥{{ item.price }}</p>
            <p class="item-stock">库存: {{ item.stock }}</p>
          </div>
          
          <div class="item-quantity">
            <el-input-number
              v-model="item.quantity"
              :min="1"
              :max="item.stock"
              @change="updateQuantity(item.id, item.quantity)"
            />
          </div>
          
          <div class="item-total">
            <span class="total-price">¥{{ (item.price * item.quantity).toFixed(2) }}</span>
          </div>
          
          <div class="item-actions">
            <el-button 
              type="danger" 
              :icon="Delete" 
              circle 
              @click="removeItem(item.id)"
            />
          </div>
        </div>
      </div>

      <!-- 购物车汇总 -->
      <div class="cart-summary">
        <div class="summary-content">
          <div class="summary-row">
            <span>商品总数:</span>
            <span>{{ cartStore.totalItems }} 件</span>
          </div>
          <div class="summary-row">
            <span>商品总价:</span>
            <span>¥{{ cartStore.totalPrice.toFixed(2) }}</span>
          </div>
          <div class="summary-row">
            <span>运费:</span>
            <span>¥{{ shippingFee.toFixed(2) }}</span>
          </div>
          <el-divider />
          <div class="summary-row total">
            <span>应付总额:</span>
            <span>¥{{ (cartStore.totalPrice + shippingFee).toFixed(2) }}</span>
          </div>
        </div>
        
        <div class="summary-actions">
        <el-button @click="router.push('/products')">
          继续购物
        </el-button>
          <el-button 
            type="primary" 
            size="large"
            @click="checkout"
            :disabled="cartStore.items.length === 0"
          >
            立即结算
          </el-button>
        </div>
      </div>
    </div>

    <!-- 结算对话框 -->
    <el-dialog v-model="checkoutDialogVisible" title="确认订单" width="600px">
      <div class="checkout-form">
        <el-form :model="orderForm" label-width="100px">
          <el-form-item label="收货人">
            <el-input v-model="orderForm.name" placeholder="请输入收货人姓名" />
          </el-form-item>
          
          <el-form-item label="联系电话">
            <el-input v-model="orderForm.phone" placeholder="请输入联系电话" />
          </el-form-item>
          
          <el-form-item label="收货地址">
            <el-input 
              v-model="orderForm.address" 
              type="textarea" 
              :rows="3"
              placeholder="请输入详细收货地址"
            />
          </el-form-item>
          
          <el-form-item label="备注">
            <el-input 
              v-model="orderForm.notes" 
              type="textarea" 
              :rows="2"
              placeholder="订单备注（选填）"
            />
          </el-form-item>
        </el-form>
        
        <div class="order-summary">
          <h3>订单详情</h3>
          <div 
            v-for="item in cartStore.items" 
            :key="item.id"
            class="order-item"
          >
            <span>{{ item.name }} × {{ item.quantity }}</span>
            <span>¥{{ (item.price * item.quantity).toFixed(2) }}</span>
          </div>
          <el-divider />
          <div class="order-total">
            <span>总计: ¥{{ (cartStore.totalPrice + shippingFee).toFixed(2) }}</span>
          </div>
        </div>
      </div>
      
      <template #footer>
        <el-button @click="checkoutDialogVisible = false">取消</el-button>
        <el-button 
          type="primary" 
          @click="submitOrder"
          :loading="submitting"
        >
          确认下单
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useCartStore } from '../stores/cart'
import { useOrdersStore } from '../stores/orders'
import { useUserStore } from '../stores/user'
import { Delete } from '@element-plus/icons-vue'

const router = useRouter()
const cartStore = useCartStore()
const ordersStore = useOrdersStore()
const userStore = useUserStore()

const checkoutDialogVisible = ref(false)
const submitting = ref(false)

const orderForm = ref({
  name: '',
  phone: '',
  address: '',
  notes: ''
})

const shippingFee = computed(() => {
  // 满100免运费
  return cartStore.totalPrice >= 100 ? 0 : 10
})

const updateQuantity = (productId, quantity) => {
  cartStore.updateQuantity(productId, quantity)
}

const removeItem = (productId) => {
  cartStore.removeFromCart(productId)
  ElMessage.success('已从购物车中移除')
}

const checkout = () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  
  if (cartStore.items.length === 0) {
    ElMessage.warning('购物车是空的')
    return
  }
  
  checkoutDialogVisible.value = true
}

const submitOrder = async () => {
  if (!orderForm.value.name || !orderForm.value.phone || !orderForm.value.address) {
    ElMessage.error('请填写完整的收货信息')
    return
  }
  
  submitting.value = true
  
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const orderData = {
      userId: userStore.user.id,
      userName: userStore.user.name,
      items: cartStore.items.map(item => ({
        productId: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image
      })),
      totalAmount: cartStore.totalPrice + shippingFee.value,
      shippingFee: shippingFee.value,
      shippingInfo: {
        name: orderForm.value.name,
        phone: orderForm.value.phone,
        address: orderForm.value.address
      },
      notes: orderForm.value.notes
    }
    
    ordersStore.createOrder(orderData)
    cartStore.clearCart()
    
    ElMessage.success('订单提交成功！')
    checkoutDialogVisible.value = false
    
    // 跳转到订单页面
    router.push('/orders')
    
  } catch (error) {
    ElMessage.error('订单提交失败，请重试')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  cartStore.loadFromLocalStorage()
})
</script>

<style scoped>
.cart {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.cart-header {
  margin-bottom: 30px;
}

.cart-header h1 {
  font-size: 32px;
  color: #333;
  margin-bottom: 10px;
}

.cart-header p {
  color: #666;
  font-size: 16px;
}

.empty-cart {
  text-align: center;
  padding: 60px 20px;
}

.cart-content {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 30px;
}

.cart-items {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.cart-item {
  display: grid;
  grid-template-columns: 100px 1fr auto auto auto;
  gap: 20px;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.cart-item:last-child {
  border-bottom: none;
}

.item-image {
  width: 100px;
  height: 100px;
  border-radius: 8px;
  overflow: hidden;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-info {
  min-width: 0;
}

.item-name {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-price {
  font-size: 18px;
  color: #e74c3c;
  font-weight: bold;
  margin-bottom: 5px;
}

.item-stock {
  font-size: 14px;
  color: #666;
}

.item-quantity {
  width: 120px;
}

.item-total {
  text-align: right;
  min-width: 100px;
}

.total-price {
  font-size: 18px;
  font-weight: bold;
  color: #e74c3c;
}

.item-actions {
  width: 40px;
  text-align: center;
}

.cart-summary {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 20px;
  height: fit-content;
}

.summary-content {
  margin-bottom: 20px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 16px;
}

.summary-row.total {
  font-size: 20px;
  font-weight: bold;
  color: #e74c3c;
}

.summary-actions {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.checkout-form {
  max-height: 500px;
  overflow-y: auto;
}

.order-summary {
  margin-top: 20px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.order-summary h3 {
  margin-bottom: 15px;
  color: #333;
}

.order-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
}

.order-total {
  text-align: right;
  font-size: 18px;
  font-weight: bold;
  color: #e74c3c;
}

@media (max-width: 768px) {
  .cart-content {
    grid-template-columns: 1fr;
  }
  
  .cart-item {
    grid-template-columns: 80px 1fr;
    gap: 15px;
  }
  
  .item-image {
    width: 80px;
    height: 80px;
  }
  
  .item-quantity,
  .item-total,
  .item-actions {
    grid-column: 1 / -1;
    margin-top: 10px;
  }
  
  .item-quantity {
    width: 100px;
  }
  
  .item-total {
    text-align: left;
  }
}
</style>
