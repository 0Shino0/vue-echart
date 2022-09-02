<template>
  <div class="com-container" @dblclick="revertMap">
    <div class="com-chart" ref="map_ref"></div>
  </div>
</template>

<script>
import axios from "axios";
import { getProvinceMapInfo } from "@/utils/map_utils.js";
import { mapState } from "vuex";

export default {
  name: "map",
  data() {
    return {
      charInstance: null,
      allData: null, // 从服务器中获取的所有数据
      mapData: {}, // 所获取的省份的地图矢量数据
    };
  },
  created() {
    // 在组件创建完成以后，进行回调函数的注册
    this.$socket.registerCallBack("mapData", this.getData);
  },
  mounted() {
    this.initChart();
    // this.getData();
    // 发送数据给服务器，告诉服务器，我现在需要数据
    this.$socket.send({
      action: "getData",
      socketType: "mapData",
      chartName: "map",
      value: "",
    });
    //  对屏幕大小进行监听
    window.addEventListener("resize", this.screenAdapter);
    this.screenAdapter();
  },
  destroyed() {
    //   组件销毁时，取消监听
    window.removeEventListener("resize", this.screenAdapter);
    // 在组件销毁时，进行回调函数的取消
    this.$socket.unRegisterCallBack("mapData");
  },
  methods: {
    async initChart() {
      this.charInstance = this.$echarts.init(this.$refs.map_ref, this.theme);
      // 获取中国地图矢量数据
      // http://localhost:8999/static/map/china.json
      // 由于我们现在获取的地图矢量数据并不是位于KOA的后台，所以不能使用this.$http
      const ret = await axios.get(
        "https://e-admin.yyshino.top/static/map/china.json"
      );
      // 注册地图
      this.$echarts.registerMap("china", ret.data);
      const initOption = {
        title: {
          text: "▎ 商家分布",
          left: 20,
          top: 20,
        },
        // 初始化相关
        geo: {
          type: "map",
          map: "china",
          top: "5%",
          bottom: "5%",
          itemStyle: {
            areaColor: "#2E72BF",
            borderColor: "#333",
          },
        },
        legend: {
          left: "5%",
          bottom: "5%",
          orient: "vertical",
        },
      };
      this.charInstance.setOption(initOption);
      this.charInstance.on("click", async (arg) => {
        // arg.name 得到所点击的省份, 这个省份他是中文
        const proviceInfo = getProvinceMapInfo(arg.name);
        // console.log(proviceInfo);
        // 需要获取这个省份的地图矢量数据
        // 判断当前所点击的这个省份的地图矢量数据在mapData中是否存在
        if (!this.mapData[proviceInfo.key]) {
          const ret = await axios.get(
            "http://localhost:8999" + proviceInfo.path
          );
          this.mapData[proviceInfo.key] = ret.data;
          // console.log(ret);
          this.$echarts.registerMap(proviceInfo.key, ret.data);
        }
        const changeOption = {
          geo: {
            map: proviceInfo.key,
          },
        };
        this.charInstance.setOption(changeOption);
      });
    },
    getData(ret) {
      //  await this.$http.get()
      // const { data: ret } = await this.$http.get("map");
      // 对allData进行赋值
      this.allData = ret;
      console.log(this.allData);
      this.updateChart();
    },
    updateChart() {
      // 处理图标需要的数据
      // 图例的数据
      const legendArr = this.allData.map((item) => {
        return item.name;
      });
      const seriesArr = this.allData.map((item) => {
        // return 的这个对象就代表的是一个类别下的所以散点数据
        // 如果想在地图中显示散点的数据，所以我们需要给散点的图表增加一个配置，coordinateSystem:geo
        return {
          type: "effectScatter",
          rippleEffect: {
            // 涟漪效果
            scale: 5,
            brushType: "stroke",
          },
          name: item.name,
          data: item.children,
          coordinateSystem: "geo",
        };
      });
      // 处理数据
      const dataOption = {
        // 数据相关
        legend: {
          data: legendArr,
        },
        series: seriesArr,
      };
      this.charInstance.setOption(dataOption);
    },
    screenAdapter() {
      const titleFontSize = (this.$refs.map_ref.offsetWidth / 100) * 3.6;
      const adapterOption = {
        // 适应性相关
        title: {
          textStyle: {
            fontSize: titleFontSize,
          },
        },
        legend: {
          itemWidth: titleFontSize / 2,
          itemHeight: titleFontSize / 2,
          textStyle: {
            fontSize: titleFontSize / 2,
          },
        },
      };
      this.charInstance.setOption(adapterOption);
      this.charInstance.resize();
    },
    // 回到中国地图
    revertMap() {
      const revertOption = {
        geo: {
          map: "china",
        },
      };
      this.charInstance.setOption(revertOption);
    },
  },
  computed: {
    ...mapState(["theme"]),
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
</style>