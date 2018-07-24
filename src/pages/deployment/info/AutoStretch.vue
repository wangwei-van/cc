<template>
  <Form :label-width="80">
    <Alert>发布过程中，请关闭⾃动伸缩容</Alert>
    <div style="margin: 15px 15px 30px;">
      <i-switch v-model="enableAutoStretch"></i-switch>
      <span>开启自动伸缩功能</span>
    </div>
    <FormItem label="实例数量">
      <div class="flex-item">
        <!-- <Slider v-model="instanceRange"
                style="width: 400px; display: inline-block;"
                :min="0"
                :max="10000"
                :disabled="!enableAutoStretch"
                range>
        </Slider> -->
        <InputNumber v-model="instanceRange[0]"
                     :min="0"
                     :max="instanceRange[1]"
                     :disabled="!enableAutoStretch"
                     class="form-input"
                     style="margin-left: 0;">
        </InputNumber>
        <span> -- </span>
        <InputNumber v-model="instanceRange[1]"
                     :min="instanceRange[0]"
                     :max="1000"
                     :disabled="!enableAutoStretch"
                     class="form-input">
        </InputNumber>
        <span>个</span>
      </div>

    </FormItem>

    <FormItem label="CPU阈值">
      <div class="flex-item">
        <Slider v-model="cpuLimit"
                :disabled="!enableAutoStretch"
                style="width: 200px;">
        </Slider>
        <InputNumber v-model="cpuLimit"
                     :disabled="!enableAutoStretch"
                     :min="0"
                     :max="100"
                     class="form-input">
        </InputNumber>
        <span> %</span>
      </div>
    </FormItem>

    <FormItem label="内存阈值">
      <div class="flex-item">
        <Slider v-model="memLimit"
                :disabled="!enableAutoStretch"
                style="width: 200px;">
        </Slider>
        <InputNumber v-model="memLimit"
                     :disabled="!enableAutoStretch"
                     :min="0"
                     :max="100"
                     class="form-input">
        </InputNumber>
        <span> %</span>
      </div>
    </FormItem>

    <div class="submit-footer">
      <Button type="primary" v-if="!exist" @click="submit" :disabled="!enableAutoStretch" :loading="loading">确定</Button>
      <Button type="primary" v-else @click="update" :loading="loading">修改</Button>
    </div>

  </Form>

</template>

<script>
export default {
  name: "AutoStretch",
  props: {
    cluster: String,
    namespace: String,
    deploymentName: String
  },
  data() {
    return {
      exist: false,
      loading: false,
      instanceRange: [1, 1],
      cpuLimit: 30,
      memLimit: 40,
      enableAutoStretch: false
    };
  },
  methods: {
    resetData () {
      this.exist = false
      this.instanceRange = [1, 1]
      this.cpuLimit = 30
      this.memLimit = 40
    },
    loadHpa () {
      return this.$api
        .cluster(this.cluster)
        .listHpas(this.namespace)
        .then(response =>
          response.data.items.map(item => {
            if (item.metadata.name === this.deploymentName) {
              this.instanceRange = [
                item.spec.minReplicas,
                item.spec.maxReplicas
              ];
              _.forEach(item.spec.metrics, item => {
                if (item.resource && item.resource.name === 'cpu') {
                  this.cpuLimit = item.resource.targetAverageUtilization;
                } else if (item.resource && item.resource.name === 'memory') {
                  this.memLimit = item.resource.targetAverageUtilization;
                }
              })
              this.enableAutoStretch = true;
              this.exist = true;
            }
          })
        )
        .catch(err => {
          this.$NoticeAjaxError(err, "获取容器自动伸缩失败");
        });
    },
    getData () {
      return {
        apiVersion: "autoscaling/v2beta1",
        kind: "HorizontalPodAutoscaler",
        metadata: {
          name: this.deploymentName,
          namespace: this.namespace
        },
        spec: {
          minReplicas: this.instanceRange[0],
          maxReplicas: this.instanceRange[1],
          scaleTargetRef: {
            apiVersion: "extensions/v1beta1",
            kind: "Deployment",
            name: this.deploymentName
          },
          metrics: [
            {
              type: 'Resource',
              resource: {
                name: 'cpu',
                targetAverageUtilization: this.cpuLimit
              }  
            },
            {
              type: 'Resource',
              resource: {
                name: 'memory',
                targetAverageUtilization: this.memLimit
              }  
            }
          ]
        }
      };
    },
    submit () {
      if (this.enableAutoStretch) {
        this.loading = true;
        let hpa = this.getData();
        this.$api.cluster(this.cluster).createHpa(this.namespace, hpa)
          .then(response => {
            this.loading = false;
            this.$Message.success('自动伸缩创建成功！')
          }).catch(err => {
            this.loading = false;
            this.$NoticeAjaxError(err, '自动伸缩创建失败！')
          });
      }
    },
    update () {
      this.loading = true;
      // update
      if (this.enableAutoStretch) {
        let data = {
          spec: {
            minReplicas: this.instanceRange[0],
            maxReplicas: this.instanceRange[1],
            metrics: [
              {
                type: 'Resource',
                resource: {
                  name: 'cpu',
                  targetAverageUtilization: this.cpuLimit
                }
              },
              {
                type: 'Resource',
                resource: {
                  name: 'memory',
                  targetAverageUtilization: this.memLimit
                }
              }
            ]
          }
        };
        this.$api
          .cluster(this.cluster)
          .patchHpa(this.namespace, this.deploymentName, data)
          .then(response => {
            this.loading = false;
            this.$Message.success("自动伸缩修改成功！")
          })
          .catch(err => {
            this.loading = false;
            this.$NoticeAjaxError(err, "自动伸缩修改失败！");
          });
        // delete
      } else {
        this.$api
          .cluster(this.cluster)
          .deleteHpa(this.namespace, this.deploymentName)
          .then(response => {
            this.loading = false;
            this.resetData()
            this.$Message.success("自动伸缩删除成功！")
          }).catch(err => {
            this.loading = false;
            this.$NoticeAjaxError(err, "自动伸缩删除失败！");
          });
      }
    }
  },
  created() {
    this.loadHpa();
  }
};
</script>

<style scoped lang="less">
@import "../../../style/variable";

.form-footer {
  border-top: 1px solid @border-color-split;
}

.flex-item {
  display: flex;
  align-items: center;
}

.form-input {
  margin-left: 10px;
  margin-right: 10px;
  width: 60px;
}

.submit-footer {
  padding: 20px 18px;
  border-top: 1px solid @border-color-split;
}
</style>
