<template>
  <div class="pipeline-panel">
    <Breadcrumb class="custom-breadcrumb">
      <BreadcrumbItem>开发</BreadcrumbItem>
      <BreadcrumbItem :to="backRoute">流水线</BreadcrumbItem>
      <BreadcrumbItem>{{pipeline === '/' ? '创建' : '编辑'}}</BreadcrumbItem>
    </Breadcrumb>

    <div class="content-panel">
      <Card dis-hover style="width:20%">
        <p slot="title" style="text-align:center">组件</p>
        <pipeline-components :catalogs="catalogs" v-if="!pluginLoading" />
      </Card>
      <Card dis-hover style="width:80%">
        <pipeline-container :catalogs="catalogs" />
      </Card>
    </div>
  </div>

</template>

<script>
import _ from "lodash";
import PipelineComponents from "./PipelineComponents";
import PipelineContainer from "./PipelineContainer";

export default {
  name: "pipeline-info",
  components: { PipelineComponents, PipelineContainer },
  props: {
    cluster: String,
    namespace: String,
    pipeline: String
  },
  data() {
    return {
      pluginLoading: true,
      catalogs: [
        {
          name: '开始',
          components: [
            {
              name: 'start',
              inputs: {
                parameters: []
              },
              outputs: {
                parameters: []
              },
            }
          ]
        }
      ],
      pluginData: {
        version: "v1",
        plugins: [
          {
            kind: "compile",
            category: "compile",
            input: {
              image: "gcr.io/plugins/git",
              commands: ["go build -v ."],
              workDir: "example/",
              trigger: "none",
              gitRepoUrl: "https://github.com/golang/example",
              reversion: "master",
              user: "jrwangweidong",
              passwd: "123456"
            },
            output: {
              droplets: [
                "http://10.222.16.203:8102/jdjrhelm/wordpress-0.3.0.tgz"
              ]
            }
          },
          {
            kind: "build",
            category: "build",
            input: {
              appName: "myapp",
              appVersion: "2.0.0",
              dropletLocation: "/user/data/wwd-droplet.war"
            },
            output: {
              pullImageCmd: "docker pull gcr.io/2048app:2.1.0"
            }
          },
          {
            kind: "publish",
            category: "publish",
            input: {
              image: "gcr.io/myapp:2.0.0",
              replica: 2
            },
            output: {
              artfacts: [
                "deploy/myappdeploy",
                "pod/myappdeploy-64b6ff8d8c",
                "pod/myappdeploy-7d94644769"
              ]
            }
          }
        ]
      }
    };
  },
  methods: {
    loadData() {
      this.getPlugins()
      if (this.pipeline !== "/") {
        this.$api.cluster(this.cluster).getPipelineInfo(this.namespace, this.pipeline)
          .then(res => {
            this.info = res.data;
          })
          .catch(err => {
            this.$NoticeAjaxError(err, "获取流水线详情失败，请刷新重试");
          });
      }
    },
    getPlugins() {
      // this.$api.cluster(this.cluster).getAllPlugins()
      //   .then(res => {
          let map = {};
          _.forEach(this.pluginData.plugins, plugin => {
            if (!map[plugin.category]) map[plugin.category] = [];
            map[plugin.category].push(plugin);
          });

          _.forEach(map, (val, key) => {
            this.catalogs.push({
              name: key,
              components: _.map(val, item => ({
                name: item.kind,
                inputs: {
                  parameters: _.map(item.input, (inputVal, inputKey) => ({name: inputKey}))
                },
                outputs: {
                  parameters: _.map(item.output, (outputVal, outputKey) => ({name: outputKey}))
                }
              }))
            })
          })
          this.pluginLoading = false
        // });
    }
  },
  computed: {
    backRoute() {
      return {
        name: "develop-pipeline-list",
        params: this.$route.params
      };
    }
  },
  mounted() {
    this.loadData();
  },
  watch: {
    cluster() {
      this.$router.push({ name: "pipeline-list", params: this.$route.params });
    }
  }
};
</script>

<style lang="less" scoped>
.pipeline-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.content-panel {
  flex-grow: 1;
  display: flex;
  flex-direction: row;
  background-color: #fff;
  > div {
    align-self: stretch;
    overflow: hidden;
  }
  /deep/ .ivu-card-body {
    height: 100%;
    padding: 0;
  }
}
</style>
