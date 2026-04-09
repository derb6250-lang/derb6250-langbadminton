import { defineStore } from 'pinia'

export const useProductsStore = defineStore('products', {
  state: () => ({
    products: [
      {
        id: 1,
        name: 'YONEX 羽毛球拍 ARC-11',
        price: 1299,
        image: '/images/racket1.jpg',
        category: '球拍',
        brand: 'YONEX',
        stock: 50,
        description: '专业级羽毛球拍，适合进攻型选手',
        rating: 4.8
      },
      {
        id: 2,
        name: 'VICTOR 羽毛球拍 JS-12F',
        price: 899,
        image: '/images/racket2.jpg',
        category: '球拍',
        brand: 'VICTOR',
        stock: 30,
        description: '轻量化设计，适合速度型选手',
        rating: 4.6
      },
      {
        id: 3,
        name: 'YONEX 羽毛球 AS-50',
        price: 89,
        image: '/images/shuttle1.jpg',
        category: '羽毛球',
        brand: 'YONEX',
        stock: 200,
        description: '比赛级羽毛球，飞行稳定',
        rating: 4.9
      },
      {
        id: 4,
        name: 'VICTOR 羽毛球 GOLD ACE',
        price: 65,
        image: '/images/shuttle2.jpg',
        category: '羽毛球',
        brand: 'VICTOR',
        stock: 150,
        description: '训练用羽毛球，性价比高',
        rating: 4.5
      },
      {
        id: 5,
        name: 'YONEX 羽毛球鞋 SHB-65Z3',
        price: 599,
        image: '/images/shoes1.jpg',
        category: '球鞋',
        brand: 'YONEX',
        stock: 25,
        description: '专业羽毛球鞋，舒适透气',
        rating: 4.7
      },
      {
        id: 6,
        name: 'VICTOR 羽毛球鞋 P9200',
        price: 499,
        image: '/images/shoes2.jpg',
        category: '球鞋',
        brand: 'VICTOR',
        stock: 20,
        description: '稳定支撑，适合长时间训练',
        rating: 4.6
      }
    ],
    categories: ['球拍', '羽毛球', '球鞋', '服装', '配件'],
    brands: ['YONEX', 'VICTOR', 'LI-NING', 'KASON'],
    searchQuery: '',
    selectedCategory: '',
    selectedBrand: '',
    sortBy: 'default'
  }),
  
  getters: {
    filteredProducts: (state) => {
      let filtered = state.products
      
      // 按搜索关键词过滤
      if (state.searchQuery) {
        filtered = filtered.filter(product => 
          product.name.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
          product.description.toLowerCase().includes(state.searchQuery.toLowerCase())
        )
      }
      
      // 按分类过滤
      if (state.selectedCategory) {
        filtered = filtered.filter(product => product.category === state.selectedCategory)
      }
      
      // 按品牌过滤
      if (state.selectedBrand) {
        filtered = filtered.filter(product => product.brand === state.selectedBrand)
      }
      
      // 排序
      switch (state.sortBy) {
        case 'price-asc':
          filtered = filtered.sort((a, b) => a.price - b.price)
          break
        case 'price-desc':
          filtered = filtered.sort((a, b) => b.price - a.price)
          break
        case 'rating':
          filtered = filtered.sort((a, b) => b.rating - a.rating)
          break
        case 'name':
          filtered = filtered.sort((a, b) => a.name.localeCompare(b.name))
          break
      }
      
      return filtered
    }
  },
  
  actions: {
    setSearchQuery(query) {
      this.searchQuery = query
    },
    
    setSelectedCategory(category) {
      this.selectedCategory = category
    },
    
    setSelectedBrand(brand) {
      this.selectedBrand = brand
    },
    
    setSortBy(sortBy) {
      this.sortBy = sortBy
    },
    
    addProduct(product) {
      const newId = Math.max(...this.products.map(p => p.id)) + 1
      this.products.push({ ...product, id: newId })
    },
    
    updateProduct(id, updatedProduct) {
      const index = this.products.findIndex(p => p.id === id)
      if (index !== -1) {
        this.products[index] = { ...this.products[index], ...updatedProduct }
      }
    },
    
    deleteProduct(id) {
      this.products = this.products.filter(p => p.id !== id)
    }
  }
})
