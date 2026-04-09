<template>
  <div class="footer">
    <div class="footer-content">
      <div class="footer-section">
        <h4>关于我们</h4>
        <p>专业的羽毛球装备销售平台</p>
        <p>提供优质的产品和服务</p>
      </div>
      
      <div class="footer-section">
        <h4>联系方式</h4>
        <p>电话：400-123-4567</p>
        <p>邮箱：service@badminton.com</p>
        <p>地址：北京市朝阳区体育中心</p>
      </div>
      
      <div class="footer-section">
        <h4>服务支持</h4>
        <p>7天无理由退货</p>
        <p>全国包邮</p>
        <p>专业客服</p>
      </div>
    </div>
    
    <div class="footer-bottom">
      <p>&copy; 2024 羽毛球销售系统. 保留所有权利.</p>
    </div>
  </div>
</template>

<script setup>
// Footer组件不需要特殊逻辑
</script>

<style scoped>
.footer {
  background-color: #f5f5f5;
  color: #666;
  padding: 40px 0 20px;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 40px;
  padding: 0 20px;
}

.footer-section h4 {
  color: #333;
  margin-bottom: 15px;
  font-size: 16px;
}

.footer-section p {
  margin: 8px 0;
  font-size: 14px;
  line-height: 1.5;
}

.footer-bottom {
  text-align: center;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #ddd;
}

.footer-bottom p {
  margin: 0;
  font-size: 14px;
}
</style>
