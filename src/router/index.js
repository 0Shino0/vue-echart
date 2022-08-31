import Vue from 'vue'
import VueRouter from 'vue-router'
// 测试
// import SellerPage from '@/views/SellerPage.vue'
// import TrendPage from '@/views/TrendPage.vue'
// import MapPage from '@/views/MapPage.vue'
// import RankPage from '@/views/RankPage.vue'
// import HotPage from '@/views/HotPage.vue'
// import StockPage from '@/views/StockPage.vue'
import ScreenPage from '@/views/ScreenPage.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/screen'
  },
  {
    path: '/screen',
    component: ScreenPage
  },
  // 测试
  // {
  //   path: '/sellerpage',
  //   component: SellerPage
  // },
  // {
  //   path: '/trendpage',
  //   component: TrendPage
  // },
  // {
  //   path: '/mappage',
  //   component: MapPage
  // },
  // {
  //   path: '/rankpage',
  //   component: RankPage
  // },
  // {
  //   path: '/hotpage',
  //   component: HotPage
  // },
  // {
  //   path: '/stockpage',
  //   component: StockPage
  // },
]

const router = new VueRouter({
  routes
})

export default router
