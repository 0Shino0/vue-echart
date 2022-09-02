<template>
  <div class="com-container">
    <div class="com-chart" ref="hot_ref"></div>
    <span class="iconfont arr-left" @click="toLeft" :style="comStyle"
      >&#xe6ef;</span
    >
    <span class="iconfont arr-right" @click="toRight" :style="comStyle"
      >&#xe6ed;</span
    >
    <span class="cat-name">{{ catName }}</span>
  </div>
</template>

<script>
import { mapState } from "vuex";
import { getThemeValue } from "@/utils/theme_utils.js";

export default {
  name: "",
  data() {
    return {
      charInstance: null,
      allData: null, // 从服务器中获取的所有数据
      currentIndex: 0, // 当前展示的一级分类数据
      titleFontSize: 0, //
    };
  },
  created() {
    // 在组件创建完成以后，进行回调函数的注册
    this.$socket.registerCallBack("hotData", this.getData);
  },
  mounted() {
    this.initChart();
    // this.getData();
    //  对屏幕大小进行监听
    window.addEventListener("resize", this.screenAdapter);
    // 发送数据给服务器，告诉服务器，我现在需要数据
    this.$socket.send({
      action: "getData",
      socketType: "hotData",
      chartName: "hot",
      value: "",
    });
    this.screenAdapter();
  },
  destroyed() {
    //   组件销毁时，取消监听
    window.removeEventListener("resize", this.screenAdapter);
    // 在组件销毁时，进行回调函数的取消
    this.$socket.unRegisterCallBack("rankData");
  },
  methods: {
    initChart() {
      this.charInstance = this.$echarts.init(this.$refs.hot_ref, this.theme);
      const initOption = {
        // 初始化相关.
        title: {
          text: "▎ 热销商品占比",
          left: 20,
          top: 20,
        },
        legend: {
          top: "15%",
          icon: "circle",
        },
        tooltip: {
          show: true,
          formatter: (arg) => {
            const thirdCategory = arg.data.children;
            // 计算出所有的三级分类的数值总和
            let total = 0;
            thirdCategory.forEach((item) => {
              total += item.value;
            });
            let retStr = "";
            thirdCategory.forEach((item) => {
              retStr += `
                ${item.name}: ${parseInt((item.value / total) * 100) + "%"} 
                <br/>`;
            });
            return retStr;
          },
        },
        series: [
          {
            type: "pie",
            label: {
              show: false,
            },
            emphasis: {
              // 高亮时效果
              label: {
                show: true,
              },
              labelLine: {
                show: false,
              },
            },
          },
        ],
      };
      this.charInstance.setOption(initOption);
    },
    getData(ret) {
      //  await this.$http.get()
      // const { data: ret } = await this.$http.get("hotproduct");
      this.allData = ret;
      console.log(ret);
      // 对allData进行赋值
      this.updateChart();
    },
    updateChart() {
      // 处理数据
      const legendData = this.allData[this.currentIndex].children.map(
        (item) => {
          return item.name;
        }
      );
      const seriesData = this.allData[this.currentIndex].children.map(
        (item) => {
          return {
            name: item.name,
            value: item.value,
            children: item.children,
          };
        }
      );
      const dataOption = {
        // 数据相关
        legend: {
          data: legendData,
        },
        series: [
          {
            data: seriesData,
          },
        ],
      };
      this.charInstance.setOption(dataOption);
    },
    screenAdapter() {
      this.titleFontSize = (this.$refs.hot_ref.offsetWidth / 100) * 3.6;
      const adapterOption = {
        // 适应性相关
        title: {
          textStyle: {
            fontSize: this.titleFontSize,
          },
        },
        legend: {
          itemWidth: this.titleFontSize,
          itemHeight: this.titleFontSize,
          itemGap: this.titleFontSize / 2,
          textStyle: {
            fontSize: this.titleFontSize / 2,
          },
        },
        series: [
          {
            radius: this.titleFontSize * 4.5,
            center: ["50%", "60%"],
          },
        ],
      };
      this.charInstance.setOption(adapterOption);
      this.charInstance.resize();
    },
    toLeft() {
      this.currentIndex--;
      if (this.currentIndex < 0) {
        this.currentIndex = this.allData.length - 1;
      }
      this.updateChart();
    },
    toRight() {
      this.currentIndex++;
      if (this.currentIndex > this.allData.length - 1) {
        this.currentIndex = 0;
      }
      this.updateChart();
    },
  },
  computed: {
    ...mapState(["theme"]),
    catName() {
      if (!this.allData) {
        return "";
      } else {
        return this.allData[this.currentIndex].name;
      }
    },
    comStyle() {
      return {
        fontSize: this.titleFontSize + "px",
        color: getThemeValue(this.theme).titleColor,
      };
    },
  },
  watch: {
    theme() {
      console.log("主题切换");
      this.charInstance.dispose(); // 销毁当前的图表
      this.initChart(); // 重新以最新的图表主题初始化
      this.screenAdapter(); // 完成屏幕的适配
      this.updateChart(); // 更新图表的展示
    },
  },
};
</script>

<style lang="less" scoped>
.arr-left {
  position: absolute;
  left: 10%;
  top: 50%;
  transform: translate(-50%);
  cursor: pointer;
  color: white;
}
.arr-right {
  position: absolute;
  position: absolute;
  right: 10%;
  top: 50%;
  transform: translate(-50%);
  cursor: pointer;
  color: white;
}
.cat-name {
  position: absolute;
  left: 80%;
  bottom: 20px;
  color: white;
}
</style>