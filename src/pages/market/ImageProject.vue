<template>
  <DataTable :columns="cols"
             :data="projects"
             :loading="loading"
             size="small">
  </DataTable>    
</template>

<script>
  import dayjs from 'dayjs'
  import _ from 'lodash'

  export default {
    name: 'image-project',
    props: {
      type: String
    },
    data () {
      return {
        projects: [],
        loading: false,
        cols: [
          {
            title: '项目名称',
            key: 'name',
            render: (h, params) => {
              return h('a', {
                on: {
                  click: () => {
                    const routeParams = {
                      ...this.$route.params,
                      projectId: params.row.project_id.toString(),
                      type: this.type,
                      name: params.row.name
                    }
                    this.$router.push({name: 'market-image-list', params: routeParams})
                  }
                }},
                params.row.name
              )
            }
          },
          {title: '创建用户', key: 'owner_name'},
          {title: '创建时间', key: 'creation_time'},
          {title: '镜像数量', key: 'repo_count'}
        ]
      }
    },
    methods: {
      loadData () {
        const params = {
          public: this.type === 'public' ? true : false
        }
        this.loading = true
        return this.$api.image.listProject(params)
          .then(res => {
            this.projects = _.map(res.data, item => {
              item.owner_name = item.owner_name || '--'
              // item.creation_time = dayjs(item.creation_time).toJson()
              return item
            })
          }).catch(err => {
            this.$NoticeAjaxError(err, '加载镜像仓库失败')
          }).then(() => {
            this.loading = false
          })
      }
    },
    created () {
      this.loadData()
    }    
  }
</script>

