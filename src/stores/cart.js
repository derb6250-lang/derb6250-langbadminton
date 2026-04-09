import { defineStore } from 'pinia'

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: []
  }),
  
  getters: {
    totalItems: (state) => {
      return state.items.reduce((total, item) => total + item.quantity, 0)
    },
    
    totalPrice: (state) => {
      return state.items.reduce((total, item) => total + (item.price * item.quantity), 0)
    }
  },
  
  actions: {
    addToCart(product, quantity = 1) {
      const existingItem = this.items.find(item => item.id === product.id)
      
      if (existingItem) {
        existingItem.quantity += quantity
      } else {
        this.items.push({
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          quantity: quantity,
          stock: product.stock
        })
      }
      
      this.saveToLocalStorage()
    },
    
    removeFromCart(productId) {
      this.items = this.items.filter(item => item.id !== productId)
      this.saveToLocalStorage()
    },
    
    updateQuantity(productId, quantity) {
      const item = this.items.find(item => item.id === productId)
      if (item) {
        if (quantity <= 0) {
          this.removeFromCart(productId)
        } else {
          item.quantity = quantity
        }
        this.saveToLocalStorage()
      }
    },
    
    clearCart() {
      this.items = []
      this.saveToLocalStorage()
    },
    
    saveToLocalStorage() {
      localStorage.setItem('cart', JSON.stringify(this.items))
    },
    
    loadFromLocalStorage() {
      const cart = localStorage.getItem('cart')
      if (cart) {
        this.items = JSON.parse(cart)
      }
    }
  }
})
