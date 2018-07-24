<template>
  <div class="container">
    <div class="toolbar">
      <Button type="success" icon="android-list" @click="savePipeline">保存流水线</Button>
      <Button type="success" icon="trash-a" @click="clearCanvas">清空画布</Button>
    </div>
    <div id="canvas">
      <img src="../../../assets/images/logo.png" style="display:none" ref="img" />
      <ul class="context-menu"
          :style="{left: contextmenu.left,
                  top: contextmenu.top,
                  display: contextmenu.visible ? 'block' : 'none'}">
        <li v-show="selectedItemType === 'node'"><a @click.prevent.stop="deleteNode(selectedNodeId)">删除节点</a></li>
        <li v-show="selectedItemType === 'node'"><a @click.prevent.stop="deleteNodeConnections(selectedNodeId)">删除所有连线</a></li>
        <li v-show="selectedItemType === 'connection'"><a @click.prevent.stop="deleteConnection(selectedConnectionId)">删除连线</a></li>
      </ul>

      <Modal :title="configModal.title" width="600"
              v-model="configModal.visible"
              :mask-closable="false"
              @on-ok="updateConfiguration"
              @on-cancel="hideConfiguration">
        <Form :label-width="80">
          <FormItem v-for="(param, index) in configModal.configuration"
                    :key="param.name"
                    :label="param.name"
                    v-show="!param.conditional  ||
                          (selectedNodeId === 'start' && configModal.configuration[index-1].value !== 'None')
                    ">
            <RadioGroup v-model="param.value" v-if="param.type === 'radio'">
              <Radio v-for="item in param.options" :key="item.value" :label="item.value">{{ item.label }}</Radio>
            </RadioGroup>
            <Select v-model="param.value" v-else-if="param.type === 'select'">
              <Option v-for="item in param.options" :key="item.value" :label="item.value">{{ item.label }}</Option>
            </Select>
            <Input v-model="param.value" v-else />
          </FormItem>
        </Form>
      </Modal>
    </div>
  </div>
</template>

<script>
  /**
   * @说明：流水线创建/更新
   * @param(catalogs) 可用组件信息
   * @param(paper) raphael画布元素
   * @param(canvas) 画布、节点等的配置信息
   * @说明人：jrwangwei3
   * @时间： 2018/7/23
  */
  import Raphael from 'raphael'
  import _ from 'lodash'

  export default {
    name: 'pipeline-container',
    props: {
      catalogs: {
        type: Array,
        default: () => {
          return []
        }
      }
    },
    data () {
      return {
        paper: null,
        canvas: {
          width: 2000, height: 1000,
          nodeWidth: 130, nodeHeight: 30, anchorRadius: 5,
          strokeColor: '#888888', activeColor: '#00a2b3'
        },
        nodeCountMap: {},  // 组件的使用数量
        nodeList: [],  // 流水线所有节点
        connectionList: [],  // 流水线所有连线

        selectedNodeId: null,
        selectedConnectionId: null,
        selectedItemType: null,  // node or connection

        startAnchor: null,  // 连线起始锚点
        drawingConnection: null,
        drawingConnectionStarted: false,
        drawing: false,

        // 右键菜单
        contextmenu: {
          visible: false, top: 0, left: 0, title: ''
        },

        startNodeConfig: [
          {name: '流水线名称'},
          {
            name: '触发机制',
            value: 'None',
            type: 'radio',
            options: [
              {label: '无', value: 'None'},
              {label: '定时任务', value: 'CronSchedule'},
              // {label: '周期性任务', value: 'Periodic'},
              // {label: '一次性任务', value: 'OnceSchedule'},
            ]
          },
          {name: '触发时间', conditional: true}
        ],
        configModal: {
          title: '',
          visible: false,
          configuration: [] // 选中节点的配置信息
        }
      }
    }, 
    methods: {
      init () {
        this.paper = Raphael(document.getElementById('canvas'), this.canvas.width, this.canvas.height)
        this.enableDropNode()
        this.enableDrawingConnection()
        this.initNodeCountMap()
        this.initDelKey()

        // 禁止鼠标右键默认菜单
        this.$el.oncontextmenu = function (evt) {
          return false
        }
        // 点击空白处隐藏自定义菜单/配置面板
        this.$el.onclick = (evt) => {
          this.hideMenu()
          // 连线mouseup后触发该事件，防止选中资源被deactive
          if (this.drawing) {
            this.drawing = false
            return
          }
          this.deactiveNodes()
          this.deactiveConnections()
        }
      },

      // 键盘delete事件，删除active资源
      initDelKey () {
        const _self = this
        document.onkeydown = function (event) {
          var e = event || window.event;
          if (e && e.keyCode === 46){
            _self.selectedItemType && _self.selectedItemType === 'node' ?
              _self.deleteNode(_self.selectedNodeId) : _self.deleteConnection(_self.selectedConnectionId)
          }
        }
      },

      getComponentList () {
        return _.flattenDeep(_.map(this.catalogs, item => item.components))
      },

      // 初始化每个组件的使用数量
      initNodeCountMap () {
        _.forEach(this.getComponentList(), item => {
          this.nodeCountMap[item.name] = 0
        })
      },

      // 通过组件id获取对应的inputs参数
      getNodeInputParams (id) {
        const component =  _.filter(this.getComponentList(), item => item.name === id)
        return _.get(component, '0.inputs.parameters')
      },
      getNodeOutputParams (id) {
        const component =  _.filter(this.getComponentList(), item => item.name === id)
        return _.get(component, '0.outputs.parameters')
      },

      getNode (nodeId) {
        let node = null
        _.forEach(this.nodeList, item => {
          if (nodeId === item.id) {
            node = item
            return false
          }
        })
        return node
      },

      // 通过模板数据重绘pipeline
      drawPipeline (nodes, connections) {
        this.initNodeCountMap()
        _.forEach(nodes, node => {
          const id = node.id.replace(/(-\d+)$/, '')
          this.drawNode(id, node.config, node.x, node.y)
        })

        _.forEach(connections, conn => {
          const startAnchor = this.paper.getById(conn.startId)
          const endAnchor = this.paper.getById(conn.endId)
          this.drawConnection(startAnchor, endAnchor, true)
        })
      },

      enableDropNode () {
        this.$el.ondragover = (evt) => {
          evt.preventDefault()
          return true
        }

        // 将组件name作为唯一id。另防止多个相同节点出现id冲突，加上数量后缀
        this.$el.ondrop = (evt) => {
          const id = evt.dataTransfer.getData('id')
          // start 节点只能放置一个
          if (id === 'start' && this.getNode('start')) {
            this.$Message.warning('流水线只能包含一个开始组件')
            return
          }

          const config = id === 'start' ? 
                        _.concat(this.startNodeConfig) :
                        _.concat(this.getNodeInputParams(id))
          this.drawNode(id, config, evt.layerX, evt.layerY)
          return false
        }
      },

      drawNode (id, config, x, y) {
        const nodeId = this.nodeCountMap[id] === 0 ?
                    id :
                    `${id}-${this.nodeCountMap[id]}`
        
        const text = this.paper.text(x + 30, y + 15, nodeId)
          .attr({
            'text-anchor': 'start',
            stroke: this.canvas.strokeColor
          })
        text.id = nodeId + '-text'

        const nodeInputParams = this.getNodeInputParams(id)
        const inputKeys = _.map(nodeInputParams, input => input.name)
        const ra_node = this.paper.rect(x, y, this.canvas.nodeWidth, this.canvas.nodeHeight, 10)
          .attr({
            cursor: 'move',
            fill: 'rgba(255, 255, 255, 0)',
            stroke: this.canvas.strokeColor
          }).click(evt => {
            evt.stopPropagation()
          })
        ra_node.id = nodeId
        ra_node.inputKeys = inputKeys

        const image = this.paper.image(this.$refs.img.src, x, y + 2.5, 25, 25)
          .attr({
            cursor: 'pointer'
          }).click((evt) => {
            evt.stopPropagation()
            this.activeNode(nodeId)
            this.showConfiguration()
          })
        image.id = nodeId + '-image'

        this.setAnchors(nodeId)
        this.activeNode(nodeId)
        this.nodeContextMenu(nodeId)
        this.makeNodeDraggable(nodeId)

        id !== 'start' && this.nodeCountMap[id]++
        this.nodeList = _.concat(this.nodeList, {
          id: nodeId,
          config
        })
      },

      removeDrawingConnection () {
        this.drawingConnectionStarted = false
        this.drawingConnection && this.drawingConnection.remove()
        this.drawingConnection = null
      },

      enableDrawingConnection () {
        // 锚点和鼠标位置连线
        this.$el.onmousemove = (evt) => {
          if (this.drawingConnectionStarted) {
            this.drawing = true
            const startPoint = {
              x: parseFloat(this.startAnchor.attrs.cx),
              y: parseFloat(this.startAnchor.attrs.cy)
            }
            const endPoint = {
              x: parseFloat(evt.layerX),
              y: parseFloat(evt.layerY)
            }
            const len = Math.sqrt(Math.pow(endPoint.x - startPoint.x, 2) + Math.pow(endPoint.y - startPoint.y, 2))
            if (len < this.canvas.anchorRadius*2) return
            const path = this.getPath(startPoint, endPoint)

            if (this.drawingConnection) {
              this.drawingConnection.attr({
                path: path
              })
            } else {
              this.drawingConnection = this.paper.path(path).attr({
                'arrow-end': 'classic-wide-long',
                'stroke-dasharray': '-',
                'stroke': this.canvas.strokeColor,
                "stroke-width": 2
              })
            }
          }
        }

        // 在空白处触发mouseup事件，删除drawingConnectin
        this.$el.onmouseup = (evt) => {
          if (this.drawingConnectionStarted) {
            this.removeDrawingConnection()
          }
        }
      },

      nodeContextMenu (nodeId) {
        const _self = this
        this.paper.getById(nodeId).mouseup(function (evt) {
          _self.activeNode(this.id)
          if (evt.button === 2) {
            evt.stopPropagation()
            _self.showMenu(evt.layerX + 10, evt.layerY)
          }
        })
      },

      makeNodeDraggable (nodeId) {
        const _self = this
        this.paper.getById(nodeId).drag(onmove, onstart, onend)
        function onmove (dx, dy) {
          if (this.dragging) {
            const x = this.ox + dx
            const y = this.oy + dy
            // exceed border
            if (x < 0 || x > _self.canvas.width - _self.canvas.nodeWidth || y < 0 || y > _self.canvas.height - _self.canvas.nodeHeight) return
            this.attr({x, y})

            _self.paper.getById(`${this.id}-image`).attr({x: x, y: y + 2.5})
            _self.paper.getById(`${this.id}-text`).attr({x: x + 30, y: y + 15})

            // move anchor
            let i = 0
            const inputNum = this.inputKeys.length
            while (i < inputNum) {
              _self.paper.getById(`${this.id}-anchor-top-${i}`).attr({
                cx: x + _self.canvas.nodeWidth*(i + 1)/(inputNum + 1),
                cy: y 
              })
              i++
            }
            _self.paper.getById(`${this.id}-anchor-bottom`).attr({cx: x + _self.canvas.nodeWidth/2, cy: y + _self.canvas.nodeHeight})

            //move connection
            _.forEach(_self.connectionList, connection => {
              if (connection.startAnchor.nodeId === this.id || connection.endAnchor.nodeId === this.id) {
                const startAnchorPoint = {
                  x: parseFloat(connection.startAnchor.attrs.cx),
                  y: parseFloat(connection.startAnchor.attrs.cy)
                }
                const endAnchorPoint = {
                  x: parseFloat(connection.endAnchor.attrs.cx),
                  y: parseFloat(connection.endAnchor.attrs.cy)
                }
                const path = _self.getPath(startAnchorPoint, endAnchorPoint)
                connection.attr({path: path})
              }
            })
          }
        }
        function onstart (x, y, evt) {
          evt.stopPropagation()
          if (evt.button !== 2) {
            this.dragging = true
            this.ox = this.attr('x')
            this.oy = this.attr('y')
          }
        }
        function onend () {
          this.dragging = false
        }
      },

      deactiveConnections () {
        this.selectedItemType = null
        this.selectedConnectionId = null
        _.forEach(this.connectionList, item => {
          this.paper.getById(item.id).attr({stroke: this.canvas.strokeColor})
        })
      },
      activeConnection (connectionId) {
        this.deactiveNodes()
        this.deactiveConnections()
        this.paper.getById(connectionId).attr({stroke: this.canvas.activeColor})
        this.selectedItemType = 'connection'
        this.selectedConnectionId = connectionId
      },
      deactiveNodes () {
        this.selectedItemType = null
        this.selectedNodeId = null
        _.forEach(this.nodeList, item => {
          this.paper.getById(item.id).attr({stroke: this.canvas.strokeColor})
        })
      },
      activeNode (nodeId) {
        this.deactiveNodes()
        this.deactiveConnections()
        this.paper.getById(nodeId).attr({stroke: this.canvas.activeColor})
        this.selectedItemType = 'node'
        this.selectedNodeId = nodeId
      },


      // 开始连线
      anchorMouseDown (obj) {
        this.startAnchor = obj
        this.drawingConnectionStarted = true
      },

      anchorMouseUp (obj) {
        if (this.drawingConnectionStarted) {
          // 不能连接自身节点；两个锚点不能多次连接；同一个入口锚点不能有多条连线
          if (this.startAnchor.nodeId !== obj.nodeId) {
            let exist = false, endAnchorUsed = false
            const mixedIds = [`${this.startAnchor.id}_${obj.id}`, `${obj.id}_${this.startAnchor.id}`]
            _.forEach(this.connectionList, conn => {
              if (mixedIds.includes(conn.id)) {
                exist = true
              }
              if (conn.endAnchor.id === obj.id) {
                endAnchorUsed = true
              }
            })
            if (!exist && !endAnchorUsed) {
              this.drawConnection(this.startAnchor, obj)
            }
          }
        }
      },

      // flag标识是否为重绘动作
      drawConnection (startAnchor, endAnchor, flag) {
        const startAnchorPoint = {
          x: parseFloat(startAnchor.attrs.cx),
          y: parseFloat(startAnchor.attrs.cy)
        }
        const endAnchorPoint = {
          x: parseFloat(endAnchor.attrs.cx),
          y: parseFloat(endAnchor.attrs.cy)
        }
        const path = this.getPath(startAnchorPoint, endAnchorPoint)
        const connection = this.paper.path(path).attr({
          'arrow-end': 'classic-wide-long',
          'stroke': this.canvas.strokeColor,
          'stroke-width': 2,
          'cursor': 'pointer'
        }).click(evt => {
          evt.stopPropagation()
        }).toBack() // 连线隐藏在锚点下面
        connection.startAnchor = startAnchor
        connection.endAnchor = endAnchor
        connection.id = `${startAnchor.id}_${endAnchor.id}`
        this.connectionList = _.concat(this.connectionList, connection)

        this.connectionContextMenu(connection)
        this.removeDrawingConnection()
        !flag && this.setOutputNodeConfig(startAnchor, endAnchor)
      },

      connectionContextMenu (connection) {
        const _self = this
        connection.mousedown(function (evt) {
          evt.stopPropagation()
        }).mouseup(function (evt) {
          _self.activeConnection(this.id)
          if (evt.button === 2) {
            evt.stopPropagation()
            _self.showMenu(evt.layerX + 10, evt.layerY)
          }
        })
      },

      setOutputNodeConfig (startAnchor, endAnchor) {
        if (startAnchor.nodeId === 'start') return
        const startId = startAnchor.nodeId.replace(/(-\d+)$/, '')
        const outputName = this.getNodeOutputParams(startId)[0].name

        const inputIdx = endAnchor.id.substring(endAnchor.id.lastIndexOf('-') + 1)
        const endNode = this.getNode(endAnchor.nodeId)
        endNode.config[inputIdx].value = `${startId}.output.${outputName}`
      },

      deleteNodeConnections (nodeId) {
        this.hideMenu()
        _.forEach(_.cloneDeep(this.connectionList), connection => {
          if (connection.startAnchor.nodeId === nodeId || connection.endAnchor.nodeId === nodeId) {
            this.deleteConnection(connection.id)
          }
        })
      },

      deleteNode (nodeId) {
        this.hideMenu()
        this.selectedNodeId = null
        this.deleteNodeConnections(nodeId)

        let i = 0
        const inputNum = this.paper.getById(nodeId).inputKeys.length
        while (i < inputNum) {
          this.paper.getById(`${nodeId}-anchor-top-${i}`).remove()
          i++
        }
        this.paper.getById(nodeId + "-anchor-bottom").remove()

        this.paper.getById(nodeId + "-text").remove()
        this.paper.getById(nodeId + "-image").remove()

        _.forEach(_.cloneDeep(this.nodeList), (item, idx) => {
          if (nodeId === item.id) {
            this.nodeList.splice(idx, 1)
            return false
          }
        })
        this.paper.getById(nodeId).remove()
      },

      deleteConnection (connectionId) {
        this.hideMenu()
        this.selectedConnectionId = null
        _.forEach(this.connectionList, (item, idx) => {
          if (connectionId === item.id) {
            this.paper.getById(connectionId).remove()
            this.connectionList.splice(idx, 1)
            return false
          }
        })
      },

      // 给节点设置输入输出锚点
      setAnchors (nodeId) {
        const _self = this
        const node = this.paper.getById(nodeId)
        const coordinates = {
          bottom: {x: node.attrs.x + this.canvas.nodeWidth/2, y: node.attrs.y + this.canvas.nodeHeight}
        }
        let i = 0
        const inputNum = node.inputKeys.length
        while (i < inputNum) {
          coordinates[`top-${i}`] = {
            x: node.attrs.x + this.canvas.nodeWidth*(i + 1)/(inputNum + 1),
            y: node.attrs.y,
            title: node.inputKeys[i]
          }
          i++
        }

        _.forEach(coordinates, (val, key) => {
          let anchor = this.paper.circle(val.x, val.y, this.canvas.anchorRadius)
            .attr({
              fill: '#ffffff',
              cursor: 'pointer',
              stroke: this.canvas.strokeColor
            }).click(evt => {
              evt.stopPropagation()
            })
          anchor.id = `${nodeId}-anchor-${key}`
          anchor.nodeId = nodeId
          anchor.anchor_type = key
          // 连线只能从输出锚点开始，在输入锚点结束
          if (key === 'bottom') {
            anchor.mousedown(function (evt) {
              _self.anchorMouseDown(this)
            })
          } else {
            anchor.attr({
              title: val.title
            })
            anchor.mouseup(function (evt) {
              _self.anchorMouseUp(this)
            })
          }
        })
      },

      getPath (startPoint, endPoint) {
        const c0 = {
          x: startPoint.x,
          y: startPoint.y + (endPoint.y - startPoint.y)/2
        }
        const c1 = {
          x: endPoint.x,
          y: startPoint.y + (endPoint.y - startPoint.y)/2
        }
        return `M${startPoint.x} ${startPoint.y} C${c0.x} ${c0.y} ${c1.x} ${c1.y} ${endPoint.x} ${endPoint.y}` 
      },

      showConfiguration () {
        _.forEach(this.nodeList, item => {
          if (item.id === this.selectedNodeId) {
            this.configModal.title = item.id
            this.configModal.configuration = _.cloneDeep(item.config)
            return
          }
        })

        this.configModal.visible = true
      },
      hideConfiguration () {
        this.configModal.visible = false
      },
      updateConfiguration () {
        _.forEach(this.nodeList, item => {
          if (item.id === this.selectedNodeId) {
            item.config = this.configModal.configuration
            return
          }
        })
        this.hideConfiguration()
      },
      showMenu (x, y) {
        this.contextmenu.left = x + 'px'
        this.contextmenu.top = y + 'px'
        this.contextmenu.visible = true
      },
      hideMenu () {
        this.contextmenu.visible = false
      },

      clearCanvas () {
        this.paper.clear()
        this.nodeList = []
        this.connectionList = []
        this.selectedItemType = null
        this.selectedNodeId = null
        this.selectedConnectionId = null
        this.initNodeCountMap()
      },

      validatePipeline () {
        if (!this.getNode('start')) {
          this.$Notice.error({title: '请添加开始节点！'})
          return false
        } else if (this.nodeList.length === 1) {
          this.$Notice.error({title: '流水线不能为空！'})
          return false
        }
        return true
      },

      getTemplate () {
        let nodes = [], connections = []
        _.forEach(this.nodeList, node => {
          const ra_node = this.paper.getById(node.id)
          nodes.push({
            id: node.id,
            config: node.config,
            x: ra_node.attrs.x,
            y: ra_node.attrs.y
          })
        })

        _.forEach(this.connectionList, conn => {
          connections.push({
            id: conn.id,
            startId: conn.startAnchor.id,
            endId: conn.endAnchor.id
          })
        })
        // this.clearCanvas()
        // setTimeout(function () {
        //   this.drawPipeline(nodes, connections)
        // }.bind(this), 3000)
        return {
          nodes, connections
        }
      },

      savePipeline () {
        if (!this.validatePipeline()) return
        const template = this.getTemplate()
        const startNode = this.getNode('start')
        let yamlData = {
          kind: 'compile',
          metadata: {
            name: _.partition(startNode.config, {name: '流水线名称'})[0][0].value
          },
          spec: []
        }

        let plugin = {}
        _.forEach(this.nodeList, node => {
          if (node.id === 'start') return
          plugin[node.id.replace(/(-\d+)$/, '')] = {
            input: _.map(node.config, item => {
              let res = {}
              res[item.name] = item.value
              return res
            })
          }
        })

        _.forEach(plugin, (val, key) => {
          let map = {}
          map[key] = val
          yamlData.spec.push(map)
        })

        console.log(yamlData)

      },
      
    },
    mounted () {
      // 禁止text被选中
      this.$el.onselectstart = function () {
        return false
      }
      setTimeout(this.init, 0)
    }
  }
</script>

<style lang="less" scoped>
  .container {
    user-select: none;
    height: 100%;
  }
  .toolbar {
    width: 100%;
    background-color: #fff;
    padding: 0 10px;
    height: 51px;
    line-height: 51px;
    border-bottom: 1px solid #f0f2f5;
  }
  #canvas {
    position: relative;
    height: calc(100% - 51px);
    overflow: auto;
  }
  .context-menu {
    display: none;
    position: absolute;
    list-style: none;
    background-color: #fff;
    border: 1px solid #ccc;
    border-radius: 5px;
    padding: 5px 0;
    li {
      &:hover {
        background-color: #eee;
      }
      a {
        padding: 10px 30px;
        cursor: pointer;
        color: inherit;
      }
    }
  }
</style>
