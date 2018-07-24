<template>
  <div :style="{display: modalVisible ? 'block' : 'none'}" class="terminal-box" v-if="windowMode === 'inbox'">
    <div class="terminal-frame" :style="containerStyle">
      <div class="terminal-header">
        <span>{{pod}}</span>
        <Icon type="close" @click.native="onClickClose" class="icon-btn" ></Icon>
        <Icon type="share" @click.native="onClickOutBox" class="icon-btn"
              style="margin-right: 18px; font-size: 24px;"></Icon>
      </div>
      <div class="pod-terminal"></div>
    </div>
  </div>
  <div v-else>
    <div class="pod-terminal" style="width: 100%; height: 100vh;"></div>
  </div>

</template>

<script>
  import { Terminal } from 'xterm'
  import io from 'socket.io-client'
  // import io from 'socket.io'
  import * as webLinks from 'xterm/lib/addons/webLinks/webLinks'
  import * as fit from 'xterm/lib/addons/fit/fit'

  Terminal.applyAddon(fit)
  Terminal.applyAddon(webLinks)

  export default {
    name: 'pod-terminal',
    props: {
      namespace: String,
      pod: String,
      container: String,
      width: {
        type: Number,
        default: 800
      },
      height: {
        type: Number,
        default: 600
      },
      visible: Boolean,
      cluster: String,
      windowMode: {
        type: String,
        default: 'inbox'  // outwindow
        // default: 'outwindow'  // outwindow
      }
    },
    data () {
      return {
        terminal: null,
        socket: null,
        modalVisible: false
      }
    },
    methods: {
      initTerminal () {
        this.terminal = new Terminal({
          macOptionIsMeta: true,
          cursorBlink: true
        })

        const dom = document.getElementsByClassName('pod-terminal')[0]
        this.terminal.open(dom)
        this.terminal.writeln('\x1b[1;3;31m欢迎使用京东金融容器平台\x1b[0m')
        // this.terminal.write("Hello from \033[1;3;31mxterm.js\033[0m $ ")
        // this.terminal.writeln('Welcome to xterm.js')
        this.terminal.writeln('Connecting to the kubernetes pod...')
        this.terminal.writeln('')
        this.terminal.fit()
        this.terminal.webLinksInit()
        this.terminal.focus()
        this.connect()
      },
      connect () {
        // todo host setting
        // this.socket = io('http://10.222.16.203:8108')
        this.socket = io(`https://apigw.example.com:8143?namespace=${this.namespace}&pod=${this.pod}`, {
          path: `/socket.io/${this.cluster}`
        })
        this.socket.on('error', function(data) {
          console.error(data);
        });
        this.socket.on('connect', () => {
            console.info("connecting web this.socket");
            this.socket.on('term:connected', this.attach);
            this.socket.emit("term:connect", JSON.stringify({
              "namespace": this.namespace,
              "pod": this.pod,
              "container": this.container
            }))
        })
        this.socket.on('disconnect', this.detach);
      },
      handleTermOutput (data) {
        let str
        if (typeof data === 'object') {
            if (data instanceof ArrayBuffer) {
                if (!myTextDecoder) {
                    myTextDecoder = new TextDecoder();
                }
                str = myTextDecoder.decode(data);
            } else {
                throw 'TODO: handle Blob?';
            }
        }
        this.terminal.write(str || data);
      },
      handleInput (data) {
        console.info("term:stdin", data);
        this.socket.emit("term:stdin", data);
      },
      attach () {
          console.info("container tty connected.");
          this.terminal.writeln("container tty connected.");
          this.socket.on('term:stdout', this.handleTermOutput);
          this.socket.on('term:stderr', this.handleTermOutput);
          this.socket.on('term:terminated', this.detach);
          this.terminal.on("data", this.handleInput);
          this.terminal.on('resize', this.handleResize);
      },
      detach () {
        this.socket.off('term:connected', this.attach);
        this.socket.off('term:stdout', this.handleTermOutput);
        this.socket.off('term:stderr', this.handleTermOutput);
        this.socket.off('term:terminated', this.detach);
        this.terminal.off('data', this.handleInput)
        this.terminal.off('resize', this.handleResize);
      },
      handleResize (size) {
        console.info("resize", size);
        this.socket.emit("term:resize", JSON.stringify(size));
      },
      onClickClose () {
        this.modalVisible = false
        this.$emit('update:visible', false)
        this.destroy()
      },
      destroy () {
        // detach
        try {
          this.detach()
        } catch (err) {}
        // destroy terminal
        try {
          this.terminal.destroy()
        } catch (err) {}
        // close socket
        try {
          this.socket.close()
        } catch (err) {}
      },
      onClickOutBox () {
        this.onClickClose()
        setTimeout(() => {
          window.open(
            `/manage/pod-terminal/${this.cluster}/${this.namespace}/${this.container}/${this.pod}/outwindow`,
            "_blank",
            "toolbar=yes, location=no, directories=no, status=no, menubar=no, scrollbars=yes, resizable=yes," +
            " copyhistory=yes, width=800, height=600"
          )
        }, 0)
      },
      onWindowResize () {
        this.terminal.fit()
      }
    },
    computed: {
      containerStyle () {
        return {
          width: this.width + 'px',
          height: this.height + 'px'
        }
      }
    },
    watch: {
      visible (newVal) {
        if (newVal === this.modalVisible) return
        this.modalVisible = newVal
        if (newVal) {
          setTimeout(() => {
            this.initTerminal()
          })
        } else {
          this.destroy()
        }
      }
    },
    beforeDestroy () {
      this.destroy()
    },
    mounted () {
      if (this.windowMode === 'outwindow') {
        this.initTerminal()
        window.addEventListener('resize', this.onWindowResize)
      }
    }
  }
</script>

<style lang="less" scoped>
  @import '../../../style/variable';

  .terminal-box {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(55, 55, 55, 0.6);
    z-index: 999;
  }

  .terminal-frame {
    margin: 55px auto;
    position: relative;
    // border: 2px solid @border-color-split;

    .terminal-header {
      line-height: 32px;
      background: @primary-color;
      color: white;
      border-top-left-radius: @border-radius-base;
      border-top-right-radius: @border-radius-base;
      text-align: center;
      font-weight: 700;
    }
    .pod-terminal {
      width: 100%;
      height: calc(100% - 32px);
    }
  }

  .icon-btn {
    cursor: pointer;
    float: right;
    line-height: 32px;
    margin-right: 12px;
    font-size: 18px;

    &:hover {

    }
  }

</style>
