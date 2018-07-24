<template>
  <div style="position: relative;">
    <label>集群 :</label>
    <span v-if="clusters.length === 0">无可用集群</span>
    <Dropdown @on-click="handleItemClick" v-else
              style="padding-left: 15px;"
              trigger="click"
              placement="bottom-start">
      <a href="javascript:void(0)">
        <span>{{value}}</span>
        <Icon type="arrow-down-b" :style="{marginLeft: '5px'}"></Icon>
      </a>
      <DropdownMenu slot="list">
        <DropdownItem v-for="item in clusters"
                      :name="item.metadata.name"
                      :key="item.metadata.name"
                      :selected="item.metadata.name === value">
          {{item.metadata.name}}
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  </div>
</template>

<script>
  export default {
    name: "ClusterSelect",
    props: {
      value: String,
      clusters: Array
    },
    methods: {
      handleItemClick (value, selectedData) {
        this.$emit('on-change', value)
        this.$emit('input', value)
      },
    }
  }
</script>

<style scoped lang="less">
  /deep/ .ivu-dropdown-menu {
    max-height: 300px;
    overflow-y: auto;
  }
</style>
