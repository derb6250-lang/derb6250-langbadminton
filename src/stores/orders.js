import { defineStore } from 'pinia'

export const useOrdersStore = defineStore('orders', {
  state: () => ({
    orders: []
  }),
  
  actions: {
    createOrder(orderData) {
      const newOrder = {
        id: Date.now(),
        ...orderData,
        status: 'pending',
        createdAt: new Date().toISOString()
      }
      this.orders.unshift(newOrder)
      this.saveToLocalStorage()
      return newOrder
    },
    
    updateOrderStatus(orderId, status) {
      const order = this.orders.find(o => o.id === orderId)
      if (order) {
        order.status = status
        this.saveToLocalStorage()
      }
    },
    
    getOrderById(orderId) {
      return this.orders.find(o => o.id === orderId)
    },
    
    getUserOrders(userId) {
      return this.orders.filter(o => o.userId === userId)
    },
    
    saveToLocalStorage() {
      localStorage.setItem('orders', JSON.stringify(this.orders))
    },
    
    loadFromLocalStorage() {
      const orders = localStorage.getItem('orders')
      if (orders) {
        this.orders = JSON.parse(orders)
      }
    }
  }
})
