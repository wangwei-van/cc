<template>
  <div class="header-body" :style="{height: '100%', lineHeight: height}">
    <div class="header-left">
      <div :style="{height: '100%', verticalAlign: 'top'}" class="top-bar-right-border">
        <Icon type="navicon"
              @click.native="onClickCollapse"
              class="collapse-menu"
              :class="rotateIcon"
              :style="{fontSize: '24px', lineHeight: height, cursor: 'pointer'}">
        </Icon>
      </div>
      <portal-target name="namespace"></portal-target>
    </div>

    <div class="header-right">
      <portal-target name="cluster" class="top-bar-left-border"></portal-target>
      <div class="top-bar-left-border">
        <Dropdown transfer placement="bottom-end" trigger="click" @on-click="onClickUserMenuItem">
          <a href="javascript:void(0)" class="username">
            {{$store.state.username || '匿名用户'}}
            <Icon type="arrow-down-b" :style="{marginLeft: '5px'}"></Icon>
          </a>
          <DropdownMenu slot="list">
            <DropdownItem name="logout">登出</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
    </div>
  </div>
</template>

<script>
  import store from '@/store'

  export default {
    name: "top-bar",
    props: {
      isCollapsed: {
        type: Boolean,
        default: false
      },
      height: {
        type: String,
        default: '50px'
      }
    },
    methods: {
      onClickCollapse () {
        this.$emit('update:isCollapsed', !this.isCollapsed)
      },
      onClickUserMenuItem (name) {
        this.$emit(name)
      }
    },
    computed: {
      rotateIcon () {
        return [
          'menu-icon',
          this.isCollapsed ? 'rotate-icon' : ''
        ]
      }
    },

  }
</script>

<style scoped lang="less">
@import "../../style/variable.less";

.header-body {
  position: absolute;
  width: 100%;
  .header-left {
    height: 100%;
    float: left;
    >div {
      display: inline-block;
      padding: 0 20px;
    }
  }
  .header-right {
    height: 100%;
    float: right;
    >div {
      display: inline-block;
      padding: 0 20px;
    }
  }
}

.top-bar-right-border {
  position: relative;
  &::after {
    content: '';
    width: 1px;
    height: 20px;
    background: @border-color-split;
    position: absolute;
    right: 0;
    top: 15px;
  }
}

.top-bar-left-border {
  position: relative;
  &::before {
    content: '';
    width: 1px;
    height: 20px;
    background: @border-color-split;
    position: absolute;
    left: 0;
    top: 15px;
  }
}
.collapse-menu {
  transition: width .2s ease;
}

.menu-icon{
  transition: all .3s;
}
.rotate-icon{
  transform: rotate(-90deg);
}
.username {
  color: @text-color;
}

</style>
