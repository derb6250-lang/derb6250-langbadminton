<template>
  <div class="products">
    <div class="products-header">
      <h1>商品列表</h1>
      
      <!-- 搜索和筛选 -->
      <div class="filters">
        <div class="search-box">
          <el-input
            v-model="searchQuery"
            placeholder="搜索商品..."
            @input="handleSearch"
            clearable
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
        
        <div class="filter-controls">
          <el-select v-model="selectedCategory" placeholder="选择分类" clearable @change="handleCategoryChange">
            <el-option
              v-for="category in productsStore.categories"
              :key="category"
              :label="category"
              :value="category"
            />
          </el-select>
          
          <el-select v-model="selectedBrand" placeholder="选择品牌" clearable @change="handleBrandChange">
            <el-option
              v-for="brand in productsStore.brands"
              :key="brand"
              :label="brand"
              :value="brand"
            />
          </el-select>
          
          <el-select v-model="sortBy" placeholder="排序方式" @change="handleSortChange">
            <el-option label="默认排序" value="default" />
            <el-option label="价格从低到高" value="price-asc" />
            <el-option label="价格从高到低" value="price-desc" />
            <el-option label="评分最高" value="rating" />
            <el-option label="名称排序" value="name" />
          </el-select>
        </div>
      </div>
    </div>

    <!-- 商品网格 -->
    <div class="products-grid" v-loading="loading">
      <div 
        v-for="product in filteredProducts" 
        :key="product.id" 
        class="product-card"
      >
        <div class="product-image">
          <img :src="product.image" :alt="product.name" />
          <div class="product-badge" v-if="product.stock < 10">
            库存紧张
          </div>
        </div>
        
        <div class="product-info">
          <h3 class="product-name">{{ product.name }}</h3>
          <p class="product-brand">{{ product.brand }}</p>
          <p class="product-description">{{ product.description }}</p>
          
          <div class="product-rating">
            <el-rate v-model="product.rating" disabled show-score />
            <span class="rating-text">({{ product.rating }})</span>
          </div>
          
          <div class="product-price">
            <span class="price">¥{{ product.price }}</span>
            <span class="stock">库存: {{ product.stock }}</span>
          </div>
          
          <div class="product-actions">
            <el-button 
              type="primary" 
              @click="addToCart(product)"
              :disabled="product.stock === 0"
            >
              {{ product.stock === 0 ? '缺货' : '加入购物车' }}
            </el-button>
            <el-button @click="viewDetails(product)">查看详情</el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="filteredProducts.length === 0 && !loading" class="empty-state">
      <el-empty description="没有找到相关商品">
        <el-button type="primary" @click="clearFilters">清除筛选条件</el-button>
      </el-empty>
    </div>

    <!-- 商品详情对话框 -->
    <el-dialog v-model="detailDialogVisible" title="商品详情" width="600px">
      <div v-if="selectedProduct" class="product-detail">
        <div class="detail-image">
          <img :src="selectedProduct.image" :alt="selectedProduct.name" />
        </div>
        <div class="detail-info">
          <h2>{{ selectedProduct.name }}</h2>
          <p class="brand">{{ selectedProduct.brand }}</p>
          <p class="description">{{ selectedProduct.description }}</p>
          <div class="rating">
            <el-rate v-model="selectedProduct.rating" disabled show-score />
          </div>
          <div class="price">¥{{ selectedProduct.price }}</div>
          <div class="stock">库存: {{ selectedProduct.stock }}</div>
        </div>
      </div>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
        <el-button 
          type="primary" 
          @click="addToCart(selectedProduct)"
          :disabled="selectedProduct?.stock === 0"
        >
          加入购物车
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useProductsStore } from '../stores/products'
import { useCartStore } from '../stores/cart'
import { Search } from '@element-plus/icons-vue'

const route = useRoute()
const productsStore = useProductsStore()
const cartStore = useCartStore()

const loading = ref(false)
const searchQuery = ref('')
const selectedCategory = ref('')
const selectedBrand = ref('')
const sortBy = ref('default')
const detailDialogVisible = ref(false)
const selectedProduct = ref(null)

const filteredProducts = computed(() => productsStore.filteredProducts)

const handleSearch = (value) => {
  productsStore.setSearchQuery(value)
}

const handleCategoryChange = (value) => {
  productsStore.setSelectedCategory(value)
}

const handleBrandChange = (value) => {
  productsStore.setSelectedBrand(value)
}

const handleSortChange = (value) => {
  productsStore.setSortBy(value)
}

const clearFilters = () => {
  searchQuery.value = ''
  selectedCategory.value = ''
  selectedBrand.value = ''
  sortBy.value = 'default'
  productsStore.setSearchQuery('')
  productsStore.setSelectedCategory('')
  productsStore.setSelectedBrand('')
  productsStore.setSortBy('default')
}

const addToCart = (product) => {
  if (product.stock > 0) {
    cartStore.addToCart(product)
    ElMessage.success('已添加到购物车')
  }
}

const viewDetails = (product) => {
  selectedProduct.value = product
  detailDialogVisible.value = true
}

// 监听路由参数
watch(() => route.query, (newQuery) => {
  if (newQuery.category) {
    selectedCategory.value = newQuery.category
    productsStore.setSelectedCategory(newQuery.category)
  }
  if (newQuery.id) {
    const product = productsStore.products.find(p => p.id === parseInt(newQuery.id))
    if (product) {
      viewDetails(product)
    }
  }
}, { immediate: true })

onMounted(() => {
  // 初始化时加载购物车数据
  cartStore.loadFromLocalStorage()
})
</script>

<style scoped>
.products {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.products-header {
  margin-bottom: 30px;
}

.products-header h1 {
  font-size: 32px;
  color: #333;
  margin-bottom: 20px;
}

.filters {
  display: flex;
  gap: 20px;
  align-items: center;
  flex-wrap: wrap;
}

.search-box {
  flex: 1;
  min-width: 300px;
}

.filter-controls {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 30px;
  margin-top: 30px;
}

.product-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.3s, box-shadow 0.3s;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.product-image {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.product-image img {
  width: 300px;
  height: auto;
  object-fit: contain;
}

.product-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: #ff6b6b;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.product-info {
  padding: 20px;
}

.product-name {
  font-size: 18px;
  margin-bottom: 8px;
  color: #333;
  font-weight: bold;
}

.product-brand {
  color: #666;
  font-size: 14px;
  margin-bottom: 8px;
}

.product-description {
  color: #888;
  font-size: 14px;
  margin-bottom: 15px;
  line-height: 1.4;
}

.product-rating {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
}

.rating-text {
  color: #666;
  font-size: 14px;
}

.product-price {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.price {
  font-size: 24px;
  font-weight: bold;
  color: #e74c3c;
}

.stock {
  color: #666;
  font-size: 14px;
}

.product-actions {
  display: flex;
  gap: 10px;
}

.product-actions .el-button {
  flex: 1;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.product-detail {
  display: flex;
  gap: 20px;
}

.detail-image {
  flex: 1;
}

.detail-image img {
  width: 100%;
  height: 300px;
  object-fit: cover;
  border-radius: 8px;
}

.detail-info {
  flex: 1;
}

.detail-info h2 {
  font-size: 24px;
  margin-bottom: 10px;
  color: #333;
}

.brand {
  color: #666;
  font-size: 16px;
  margin-bottom: 15px;
}

.description {
  color: #888;
  line-height: 1.6;
  margin-bottom: 20px;
}

.rating {
  margin-bottom: 20px;
}

.price {
  font-size: 28px;
  font-weight: bold;
  color: #e74c3c;
  margin-bottom: 10px;
}

.stock {
  color: #666;
  font-size: 16px;
}

@media (max-width: 768px) {
  .filters {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-box {
    min-width: auto;
  }
  
  .filter-controls {
    justify-content: center;
  }
  
  .product-detail {
    flex-direction: column;
  }
}
</style>
