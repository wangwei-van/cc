<template>
  <div class="wrapper">
    <div class="main-logo" @click="backOverview">
      <img src="../../assets/images/logo.png" alt="">
      <span>容器管理</span>
    </div>
    <div class="menu-wrapper">
      <div :style="menuOuterStyle">
    <Menu width="auto" theme="dark" :accordion="true" ref="menu"
          id="main-nav"
          :class="menuitemClasses"
          :active-name="activeName"
          :open-names="openNames"
          @on-select="onItemSelect">
      <template v-for="item in items">
        <Submenu v-if="item.children"
                 :key="item.name"
                 :name="item.name"
                 @mouseenter.native="mouseEnter(item.name)"
                 @mouseleave.native="mouseLeave(item.name)"
                 class="submenu-item"
                 :class="{'collapsed-select-group': isCollapsed && groupName === item.name}">
          <template slot="title">
            <Icon v-if="item.iconType" :type="item.iconType"></Icon>
            <i v-else-if="item.iconClass" :class="iconClass"></i>
            <span>{{item.title}}</span>
            <PopMenu :value="isCollapsed && hoverName === item.name"
                     :item="item"
                     @mouse-enter="mouseEnter(item.name)"
                     @mouse-leave="mouseLeave(item.name)"
                     @on-select="onItemSelect">
            </PopMenu>
          </template>
          <MenuItem v-for="subItem in item.children"
                    :key="subItem.name"
                    :name="subItem.name"
                    v-show="!isCollapsed">
            <Icon v-if="subItem.iconType" :type="subItem.iconType"></Icon>
            <i v-else-if="subItem.iconClass" :class="subItem.iconClass"> </i>
            <span>{{subItem.title}}</span>
            <Icon v-if="subItem.mark" type="android-star-outline" :size="10" style="color: red;margin: 0 0 -3px 5px"></Icon>
          </MenuItem>
        </Submenu>
        <MenuItem v-else :key="item.name" :name="item.name" class="menu-item"
                  @mouseenter.native="mouseEnter(item.name)"
                  @mouseleave.native="mouseLeave(item.name)">
          <Icon v-if="item.iconType" :type="item.iconType"></Icon>
          <i v-else-if="item.iconClass" :class="iconClass"></i>
          <span>{{item.title}}</span>
          <Tooltip :content="item.title" placement="right" transfer
                  :value="isCollapsed && hoverName === item.name"
                  style="position: absolute; right: 0; top: 10px;">
          </Tooltip>
        </MenuItem>
      </template>
    </Menu>
    </div></div>
    <div class="redirect" v-if="system === 'operation'" @click="goManage">
      <Icon type="ios-shuffle" size="20"></Icon>
    </div>
  </div>

</template>

<script>
  import PopMenu from './pop-menu'
  import _ from 'lodash'

  const config = require('../../config')
  const items = require('../../menu-items/index.js')

  export default {
    name: "nav-menu",
    components: {PopMenu},
    props: {
      isCollapsed: Boolean
    },
    data () {
      return {
        items: items,
        hoverName: '',
        openNames: [this.$route.name.split('-')[0]],
        groupName: this.$route.name.split('-')[0],
        activeName: _.isEmpty(this.$route.meta) ? this.$route.name : this.$route.meta.menu,
        system: config.system
      }
    },
    computed: {
      menuOuterStyle (){
        if (this.isCollapsed) {
          return {width: '60px'}
        } else {
          return {width: '200px'}
        }
      },
      menuitemClasses () {
        return [
          'nav-menu',
          this.isCollapsed ? 'collapsed-menu' : ''
        ]
      }
    },
    methods: {
      backOverview () {
        this.$router.push({
          name: 'overview',
          params: this.$route.params
        })
      },
      onItemSelect (name) {
        const params = {...this.$route.params}
        this.$router.push({name: name, params})
      },
      mouseEnter (name) {
        this.mouseCount = this.mouseCount ? this.mouseCount + 1 : 1
        this.hoverName = name
      },
      mouseLeave (name) {
        const thisCount = this.mouseCount
        setTimeout(() => {
          if (this.mouseCount === thisCount) {
            this.hoverName = ''
          }
        }, 500)
      },
      goManage () {
        window.location.href = `${window.location.protocol}${window.location.hostname}:8143`
      }
    },
    mounted () {
      if (this.system === 'operation') {
        document.querySelector('.menu-wrapper').style.height = 'calc(100% - 95px)'
      }
    },
    watch: {
      $route () {
        this.groupName = this.$route.name.split('-')[0]
        this.openNames = [this.$route.name.split('-')[0]]
        // 跳转或者从二级导航跳状态点击进入一级导航，open-names没有生效，故强制更新
        this.$nextTick(() => {
          this.$refs.menu.updateOpened()
        })
        this.activeName = _.isEmpty(this.$route.meta) ? this.$route.name : this.$route.meta.menu
      }
    }
  }
</script>

<style scoped lang="less">
@import '../../style/variable';

.main-logo {
  height: 50px;
  padding: 10px 6px;
  overflow: hidden;
  cursor: pointer;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  background: darken(@primary-color, 30%);

  img {
    height: 30px;
    display: inline-block;
  }

  span {
    display: inline-block;
    line-height: 30px;
    font-size: 16px;
    vertical-align: top;
    margin-left: 5px;
    color: @sub-text-color;
  }
}

i.dot {
  position: relative;
  margin-right: 12px;

  &::before {
    content: "";
    display: inline-block;
    position: absolute;
    top: 50%;
    margin-top: -3px;
    border-radius: 6px;
    width: 6px;
    height: 6px;
    background: fade(#fff, 70%);
  }
}

.nav-menu span{
    display: inline-block;
    overflow: hidden;
    // width: 69px;
    text-overflow: ellipsis;
    white-space: nowrap;
    vertical-align: bottom;
    transition: width .2s ease .2s;
}
.nav-menu i{
    transform: translateX(0px);
    transition: font-size .2s ease, transform .2s ease;
    vertical-align: middle;
    font-size: 16px;
}
.collapsed-menu span{
    width: 0px;
    transition: width .2s ease;
}
.collapsed-menu i{
    transform: translateX(5px);
    transition: font-size .2s ease .2s, transform .2s ease .2s;
    vertical-align: middle;
    font-size: 22px;
}
.collapsed-menu .menu-item {
  padding: 11px 12px;
}
.menu-item, .submenu-item {
  white-space: nowrap;
}

.pop-menu span {
  color: black;
}

</style>

<style lang="less">
@import '../../style/variable';

.collapsed-menu .ivu-menu-submenu-title {
  padding: 11px 12px;
  white-space: nowrap;
  & > i:last-child {
    display: none;
  }
}
#main-nav {
  @selected-color: #fff;
  @selected-bg-color: @primary-color;

  line-height: 1;
  background: @nav-bg-color;
  z-index: 9;

  .ivu-menu-item:hover, .ivu-menu-item-selected {
    background: @nav-active-bg-color!important;
    color: @selected-color;

    & .dot {
      background: @selected-color;
    }
  }
  .ivu-menu-submenu-title, .submenu-item {
    background: @nav-bg-color;
  }

  .collapsed-select-group > .ivu-menu-submenu-title {
    background: @selected-bg-color;
  }
  &.collapsed-menu .ivu-menu-submenu-title {
    padding-left: 12px;
  }
}
.wrapper {
  height: 100%;
  overflow: hidden;
}
.menu-wrapper {
  height: calc(100% - 50px);
  width: calc(100% + 20px);
  overflow-x: hidden;
  overflow-y: auto;
}
.redirect {
  background-color: @nav-bg-color;
  position: absolute;
  width: 100%;
  height: 45px;
  line-height: 45px;
  text-align: center;
  bottom: 0px;
  border-top: 1px solid rgba(255, 255, 255, 0.3);
  cursor: pointer;
  z-index: 10;
}

</style>
