<template>
  <Layout :style="{height: '100vh'}">
    <Sider :collapsed-width="60" v-model="isCollapsed" class="left-sider" collapsible hide-trigger>
      <NavMenu :is-collapsed="isCollapsed"></NavMenu>
    </Sider>
    <Header :class="[headerClass, collapsedClass]">
      <TopBar :is-collapsed.sync="isCollapsed" @logout="onLogout"></TopBar>
      <form action="/uim/logout" method="POST" id="logout-form" v-show="false"></form>
    </Header>
    <Content :class="contentClass">
      <router-view></router-view>
    </Content>
  </Layout>

</template>

<script>
  import NavMenu from './nav-menu'
  import TopBar from './top-bar'

  export default {
    name: "main-frame",
    components: {NavMenu, TopBar},
    data () {
      return {
        isCollapsed: this.getCollapsed(),
        headerClass: 'head',
        contentClass: 'main-content'
      }
    },
    computed: {
      collapsedClass () {
        if (this.isCollapsed) {
          return 'collapsed'
        }
        return ''
      }
    },
    methods: {
      getCollapsed () {
        return localStorage.getItem('nav-collapsed') === 'true'
      },
      onLogout () {
        document.getElementById('logout-form').submit()
      }
    },
    watch: {
      isCollapsed (newVal) {
        localStorage.setItem('nav-collapsed', newVal)
      }
    }
  }
</script>

<style scoped lang="less">
  @import '../../style/variable';
  .left-sider {
    background: @nav-bg-color;
  }
  .head {
    background: #fff;
    box-shadow: 0 1px 2px rgba(0,0,0,.1);
    height: 50px;
    padding: 0;
    position: fixed;
    left: 200px;
    right: 0;
    opacity: 1;
    z-index: 11;
    transition: left ease-in-out 0.2s;
  }
  .collapsed {
    left: 60px;
    transition: left ease-in-out 0.2s;
  }
  .main-content {
    margin-top: 50px;
    overflow: hidden;
    overflow-y: auto;
    width: calc(100% - 50px);
  }
</style>
