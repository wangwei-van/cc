<template>
  <div style="padding: 20px 20px; position: relative;">
    <Breadcrumb class="custom-breadcrumb">
        <BreadcrumbItem>账户</BreadcrumbItem>
        <BreadcrumbItem>用户管理</BreadcrumbItem>
    </Breadcrumb>
    <Tabs type="card" v-model="tabName" :animated="false" class="custom-tabs">
      <TabPane label="用户" name="user-list" class="">
        <UserList v-if="tabName === 'user-list'"></UserList>
      </TabPane>
      <TabPane label="用户组" name="group-list">
        <GroupList v-if="tabName === 'group-list'"></GroupList>
      </TabPane>
      <TabPane label="角色" name="role-list">
        <RoleList v-if="tabName === 'role-list'"></RoleList>
      </TabPane>
      <TabPane label="权限" name="privilege-list">
        <PrivilegeList v-if="tabName === 'privilege-list'"></PrivilegeList>
      </TabPane>
    </Tabs>
  </div>

</template>

<script>
  import UserList from './UserList'
  import GroupList from './GroupList'
  import PrivilegeList from './PrivilegeList'
  import RoleList from './RoleList'

  export default {
    name: 'user',
    components: { UserList, GroupList, PrivilegeList, RoleList },
    data () {
      return {
        tabName: 'user-list'
      }
    },
    methods: {

    }
  }
</script>

<style lang="less" scoped>

</style>
