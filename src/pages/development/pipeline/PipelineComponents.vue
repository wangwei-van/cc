<template>
  <Collapse accordion>
    <Panel v-for="catalog in catalogs" :key="catalog.name">
        {{catalog.name}}
        <div slot="content">
          <div v-for="component in catalog.components"
               :key="component.id"
               :data-id='component.name'
               class="component-item"
               draggable="true">
            <img src="../../../assets/images/logo.png" />
            <p :title="component.name">{{ component.name }}</p>
          </div>
        </div>
    </Panel>
  </Collapse> 
</template>

<script>
  export default {
    name: 'pipeline-components',
    props: {
      catalogs: Array
    },
    methods: {
      init () {
        document.querySelectorAll('.component-item').forEach(item => {
          item.onselectstart = () => {
            return false
          }

          item.ondragstart = (evt) => {
            evt.dataTransfer.effectAllowed = "move";
            evt.dataTransfer.setData('id', evt.currentTarget.dataset.id)
            return true
          }
        })
      }
    },
    mounted () {
      this.init() 
    },
    watch: {
      catalogs () {
        this.init()
      }
    }
  }
</script>

<style lang="less" scoped>
  .component-item {
    display: inline-block;
    width: 60px;
    height: 60px;
    border: 1px solid #eee;
    border-radius: 3px;
    margin: 5px;
    padding: 2px 0;
    text-align: center;
    p {
      overflow: hidden;
      white-space: nowrap;
      word-break: break-all;
      word-wrap: break-word;
      text-overflow: ellipsis;
    }
  }
</style>
