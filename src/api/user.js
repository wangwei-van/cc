import axios from 'axios'
import _ from 'lodash'

const baseURL = '/uim/api/v1'

export default {
  getCurrentUser () {
    // todo
    return axios.get('/uim/currentuser')
    // return axios.get('http://localhost:8080/uim/currentuser')
  },

  listAllUsers () {
    return axios.get('/users', {baseURL})
  },

  createUser (formData) {
    return axios.post('/users', formData, {baseURL})
  },

  deleteUsers (names) {
    return Promise.all(names.map(name =>
      axios.delete(`/users/${name}`, {baseURL})
    ))
  },

  /***** role ******/
  listUserRoles (name) {
    return axios.get('/userroles/roles/', {baseURL, params: {user: name}})
  },
  modifyUser (name, formData) {
    // todo: 后端修改接口
    const addIds = _.difference(formData.roles, formData.oldRoles)
    const deleteIds = _.difference(formData.oldRoles, formData.roles)
    return Promise.all([
      axios.put(`/users/${name}`, _.pick(formData, ['mail', 'description']), {baseURL}),
      ...addIds.map(id => axios.post('/userroles/', {}, {baseURL, params: {user: name, role: id}})),
      ...deleteIds.map(id => axios.delete('/userroles/', {baseURL, params: {user: name, role: id}})),
    ])
  },

  /***** group ******/
  listGroups () {
    return axios.get('/groups', {baseURL})
  },
  createGroup (formData) {
    return axios.post('/groups', formData, {baseURL})
  },
  deleteGroups (groupIds) {
    return Promise.all(groupIds.map(id =>
      axios.delete(`/groups/${id}`, {baseURL})
    ))
  },
  listGroupRoles (groupId) {
    return axios.get('/grouproles/roles', {baseURL, params: {group: groupId}})
  },
  modifyGroup (formData) {
    // todo: 后端修改接口
    const group = _.pick(formData, ['description'])
    const groupId = formData.id
    const addUsers = _.difference(formData.users, formData.oldUsers)
    const delUsers = _.difference(formData.oldUsers, formData.users)
    const addRoles = _.difference(formData.roles, formData.oldRoles)
    const deleteRoles = _.difference(formData.oldRoles, formData.roles)
    return Promise.all([
      axios.put(`/groups/${groupId}`, group, {baseURL}),
      ...addUsers.map(user => this.addGroupUser(groupId, user)),
      ...delUsers.map(user => this.deleteGroupUser(groupId, user)),
      ...addRoles.map(role => this.addGroupRole(groupId, role)),
      ...deleteRoles.map(role => this.deleteGroupRole(groupId, role))
    ])
  },
  addGroupRole (groupId, roleId) {
    return axios.post('/grouproles/', {}, {baseURL, params: {group: groupId, role: roleId}})
  },
  deleteGroupRole (groupId, roleId) {
    return axios.delete('/grouproles/', {baseURL, params: {group: groupId, role: roleId}})
  },
  addGroupUser (groupId, userName) {
    return axios.post('/usergroups/', {}, {baseURL, params: {user: userName, group: groupId}})
  },
  deleteGroupUser (groupId, userName) {
    return axios.delete('/usergroups/', {baseURL, params: {user: userName, group: groupId}})
  },

  /****** role ******/
  listRoles () {
    return axios.get('/roles', {baseURL})
  },
  createRole (formData) {
    return axios.post('/roles', formData, {baseURL})
  },
  deleteRoles (roleIds) {
    return Promise.all(
      roleIds.map(
        id => axios.delete(`/roles/${id}`, {baseURL})
      )
    )
  },
  modifyRole (formData) {
    const roleId = formData.id
    const roleMetaData = _.pick(formData, ['description'])
    const addPri = _.difference(formData.privileges, formData.oldPrivileges)
    const delPri = _.difference(formData.oldPrivileges, formData.privileges)

    return Promise.all([
      axios.put(`/roles/${roleId}`, roleMetaData, {baseURL}),
      ...addPri.map(id => axios.post('/privilegeroles/', {}, {baseURL, params: {role: roleId, privilege: id}})),
      ...delPri.map(id => axios.delete('/privilegeroles/', {baseURL, params: {role: roleId, privilege: id}}))
    ])
  },
  listRolePrivileges (roleId) {
    return axios.get('/privilegeroles/privileges/', {baseURL, params: {role: roleId}})
  },

  /******* privileges ********/
  listPrivileges () {
    return axios.get('/privileges', {baseURL})
  },
  createPrivilege (formData) {
    formData.action = formData.action.join(',')
    return axios.post('/privileges', formData, {baseURL})
  },
  modifyPrivilege (formData) {
    formData.action = formData.action.join(',')
    const data = _.pick(formData, ['action', 'description', 'resource'])
    return axios.put(`/privileges/${formData.id}`, data, {baseURL})
  },
  deletePrivileges (privilegeIds) {
    return Promise.all(privilegeIds.map(
      id => axios.delete(`/privileges/${id}`, {baseURL})
    ))
  }

}
