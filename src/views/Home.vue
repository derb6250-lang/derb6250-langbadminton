<template>
  <div class="home">
    <!-- 轮播图 -->
    <el-carousel height="400px" indicator-position="outside">
      <el-carousel-item v-for="item in banners" :key="item.id">
        <div class="banner-item" :style="{ backgroundImage: `url(${item.image})` }">
          <div class="banner-content">
            <h2>{{ item.title }}</h2>
            <p>{{ item.description }}</p>
            <el-button type="primary" size="large" @click="router.push('/products')">
              立即购买
            </el-button>
          </div>
        </div>
      </el-carousel-item>
    </el-carousel>

    <!-- 特色商品 -->
    <div class="featured-products">
      <h2 class="section-title">热门商品</h2>
      <div class="products-grid">
        <div 
          v-for="product in featuredProducts" 
          :key="product.id" 
          class="product-card"
          @click="router.push(`/products?id=${product.id}`)"
        >
          <div class="product-image">
            <img :src="product.image" :alt="product.name" />
            <div class="product-overlay">
              <el-button type="primary" @click.stop="addToCart(product)">
                加入购物车
              </el-button>
            </div>
          </div>
          <div class="product-info">
            <h3>{{ product.name }}</h3>
            <p class="product-price">¥{{ product.price }}</p>
            <div class="product-rating">
              <el-rate v-model="product.rating" disabled show-score />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 分类导航 -->
    <div class="categories">
      <h2 class="section-title">商品分类</h2>
      <div class="category-grid">
        <div 
          v-for="category in categories" 
          :key="category.name"
          class="category-item"
          @click="router.push(`/products?category=${category.name}`)"
        >
          <div class="category-icon">
            <el-icon :size="40">
              <component :is="category.icon" />
            </el-icon>
          </div>
          <h3>{{ category.name }}</h3>
          <p>{{ category.description }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useProductsStore } from '../stores/products'
import { useCartStore } from '../stores/cart'
import { Trophy, Basketball, User, Setting } from '@element-plus/icons-vue'

const router = useRouter()
const productsStore = useProductsStore()
const cartStore = useCartStore()

const banners = ref([
  {
    id: 1,
    title: '专业羽毛球装备',
    description: '精选优质品牌，为您提供专业的羽毛球运动体验',
    image: '/images/banner1.jpg'
  },
  {
    id: 2,
    title: '新品上市',
    description: '最新款羽毛球拍，科技与运动的完美结合',
    image: '/images/banner2.jpg'
  },
  {
    id: 3,
    title: '限时优惠',
    description: '全场8折起，错过再等一年',
    image: '/images/banner3.jpg'
  }
])

const categories = ref([
  { name: '球拍', icon: 'Trophy', description: '专业羽毛球拍' },
  { name: '羽毛球', icon: 'Basketball', description: '比赛级羽毛球' },
  { name: '球鞋', icon: 'Setting', description: '专业运动鞋' },
  { name: '服装', icon: 'User', description: '运动服装' }
])

const featuredProducts = computed(() => {
  return productsStore.products
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 4)
})

const addToCart = (product) => {
  cartStore.addToCart(product)
  ElMessage.success('已添加到购物车')
}
</script>

<style scoped>
.home {
  max-width: 1200px;
  margin: 0 auto;
}

.banner-item {
  height: 400px;
  background-size: contain;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.banner-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
}

.banner-content {
  text-align: center;
  color: white;
  z-index: 1;
  position: relative;
}

.banner-content h2 {
  font-size: 48px;
  margin-bottom: 20px;
  font-weight: bold;
}

.banner-content p {
  font-size: 20px;
  margin-bottom: 30px;
}

.section-title {
  text-align: center;
  font-size: 32px;
  margin: 60px 0 40px;
  color: #333;
}

.featured-products {
  margin: 60px 0;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 30px;
  margin-top: 40px;
}

.product-card {
  background: rgb(248, 248, 248);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.3s, box-shadow 0.3s;
  cursor: pointer;
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
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.product-card:hover .product-overlay {
  opacity: 1;
}

.product-info {
  padding: 20px;
}

.product-info h3 {
  font-size: 18px;
  margin-bottom: 10px;
  color: #333;
}

.product-price {
  font-size: 24px;
  font-weight: bold;
  color: #e74c3c;
  margin-bottom: 10px;
}

.product-rating {
  display: flex;
  align-items: center;
  gap: 10px;
}

.categories {
  margin: 60px 0;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 30px;
  margin-top: 40px;
}

.category-item {
  text-align: center;
  padding: 30px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
  cursor: pointer;
}

.category-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.category-icon {
  color: #13bc35;
  margin-bottom: 15px;
}

.category-item h3 {
  font-size: 20px;
  margin-bottom: 10px;
  color: #333;
}

.category-item p {
  color: #666;
  font-size: 14px;
}
</style>
