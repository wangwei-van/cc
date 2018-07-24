<template>
  <div style="position: relative;">
    <label>项目空间 :</label>
    <span v-if="namespaces.length === 0">无可用项目空间</span>
    <Dropdown @on-click="handleItemClick" v-else
              @on-visible-change="onVisibleChange"
              style="padding-left: 15px;"
              trigger="click"
              placement="bottom-start">
      <a href="javascript:void(0)">
        <span>{{value}}</span>
        <Icon type="arrow-down-b" :style="{marginLeft: '5px'}"></Icon>
      </a>
      <div slot="list">
        <div style="padding: 0 5px; width: 100%; position: relative; top: -7px; height: 40px;">
          <i-input v-model="searchText" clearable ref="searchInput"></i-input>
        </div>
        <DropdownMenu>
          <DropdownItem v-for="item in showItems"
                        :name="item"
                        :key="item"
                        :selected="item === value">
            {{item}}
          </DropdownItem>
        </DropdownMenu>
      </div>
    </Dropdown>
  </div>

</template>

<script>
  import _ from 'lodash'

  export default {
    name: "NamespaceSelect",
    props: {
      value: String,
      namespaces: {
        type: Array,
        default: () => []
      }
    },
    data () {
      return {
        searchText: '',
        visible: true
      }
    },
    computed: {
      showItems () {
        return this.namespaces
          .map(item => item.name)
          .filter(item => _.includes(item, this.searchText))
      },
    },
    methods: {
      handleItemClick (value) {
        localStorage.setItem('namespace', value)
        const params = {
          ...this.$route.params,
          namespace: value
        }
        this.$router.push({name: this.$route.name, params: params})
      },
      onVisibleChange (newVal) {
        if (newVal) {
          setTimeout(() => {
            this.$refs.searchInput.focus()
          }, 0)
        }
      }
    },
    watch: {
      namespaces () {
        this.searchText = ''
      }
    }
  }
</script>

<style lang="less" scoped>
  /deep/ .ivu-dropdown-menu {
    max-height: 300px;
    overflow-y: auto;
  }
</style>
