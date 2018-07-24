<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>

export default {
  name: 'App',
  beforeCreate () {
    this.$api.user.getCurrentUser()
      .then(res => {
        const data = {
          username: res.data.message.name
        }
        this.$store.commit('setCurrentUser', data)
      })
      .catch(err => {
        // this.$NoticeAjaxError(err, '获取当前用户信息失败')
      })
  }
}
</script>

<style>
  #app {
    height: 100vh;
  }
</style>
