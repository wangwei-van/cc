<template>
  <div class="dropdown">
    <a href="javascript: void(0)" @click.stop="toggleMenu">
      <Icon type="ios-more" />
    </a>
    <ul class="dropdown-menu" v-show="showMenu">
      <li v-for="item in items" :key="item.text" @click.stop="handleClick(item.callback, item.params)">
        <Icon :type="item.iconType"></Icon>
        <span>{{item.text}}</span>
      </li>
    </ul>
  </div>  
</template>

<script>
export default {
  name: 'table-dropdown',
  props: {
    items: Array
  },
  data () {
    return {
      showMenu: false
    }
  },
  methods: {
    toggleMenu () {
      const initStatus = this.showMenu
      document.body.click()
      const dropdownMenu = this.$el.lastChild
      const td = this.$el.offsetParent
      const x = this.$el.offsetLeft + td.offsetLeft
      const y = this.$el.offsetTop + td.offsetTop + document.querySelector('table').offsetHeight + 10
      dropdownMenu.style.left = `${x}px`
      dropdownMenu.style.top = `${y}px`
      this.showMenu = !initStatus
    },
    handleClick (cb, params) {
      cb.apply(cb, params)
      this.showMenu = false
    }
  },
  mounted () {
    this.hideMenu = () => {
      this.showMenu = false
    }
    document.addEventListener('click', this.hideMenu)
  },
  beforeDestroy () {
    document.removeEventListener('click', this.hideMenu)
  }
}
</script>

<style lang="less" scoped>
  .dropdown {
    display: inline-block;
    .dropdown-menu {
      list-style: none;
      position: absolute;
      top: 5px;
      left: 0;
      background-color: #fff;
      margin: 5px 0;
      padding: 5px 0;
      min-width: 100px;
      box-shadow: 0 1px 6px rgba(0, 0, 0, 0.2);
      z-index: 1;
      li {
        padding: 3px 16px;
        cursor: pointer;
        white-space: nowrap;
        &:hover {
          background-color: #eee;
        }
      }
    }
  }
</style>


