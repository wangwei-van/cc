<template>
  <div>
  <Modal title="滚动升级"
         v-model="visible"
         :mask-closable="false"
         class="form-dialog"
         width="600px"
         ref="dialog">
    <Form :model="form" :rules="rules" :label-width="80" ref="form" style="padding-right: 30px;">
      <FormItem label="镜像名称" prop="image_name">
        <InputButton :value="form.image_name"
                     icon="search"
                     @click="selectImageDialogVisible = true"
                     placeholder="点击选择"
                     class="form-input">
        </InputButton>
      </FormItem>
      <FormItem label="镜像版本" prop="image_tag">
        <Select v-model="form.image_tag" class="form-input">
          <Option v-for="version in imageVersions" :key="version" :value="version">{{version}}</Option>
        </Select>
      </FormItem>
    </Form>
    <div slot="footer" class="dialog-footer">
      <Button type="text" @click="visible = false">取 消</Button>
      <Button type="primary" @click="submit" :loading="loading">确 定</Button>
    </div>
  </Modal>
    <SelectImageDialog v-model="selectImageDialogVisible" @submit="onSelectImage"></SelectImageDialog>
  </div>
</template>

<script type="text/ecmascript-6">
  import SelectImageDialog from '../create/SelectImageDialog'

  export default {
    name: 'rolling-update-dialog',
    components: { SelectImageDialog },
    props: {
      value: {
        type: Boolean,
        default: false
      },
    },
    data () {
      return {
        visible: this.value,
        loading: false,
        formLabelWidth: 80,
        form: this.getInitFormData(),
        rules: {
          image_name: [
            { required: true, message: '名称不能为空', trigger: 'change' },
          ],
          image_tag: [
            { required: true, message: '版本不能为空', trigger: 'change' },
          ]
        },
        imageVersions: [],
        selectImageDialogVisible: false
      }
    },
    methods: {
      getInitFormData () {
        return {
          image_name: '',
          image_tag: ''
        }
      },
      onSelectImage (name) {
        this.form.image_name = name
        this.$refs.form.validateField('image_name')
        this.reloadImageTags()
      },
      // load data
      reloadImageTags () {
        this.form.image_tag = ''
        this.imageVersions = []
        const image_name = this.form.image_name.startsWith('gcr.io/') ? this.form.image_name.slice(7) : this.form.image_name
        this.$api.image.listImageTag(image_name)
          .then(res => {
            this.imageVersions = res.data.tags
          })
          .catch(err => {
            this.$NoticeAjaxError(err, '获取镜像版本信息失败')
          })
      },
      submit () {
        this.$refs.form.validate((valid) => {
          if (valid) {
            this.loading = true
            this.$emit('submit', this.form)
          } else {
            return false
          }
        })
      },
      clearForm () {
        this.form = this.getInitFormData()
        this.loading = false
        if (this.$refs.form) this.$refs.form.resetFields()
      }
    },
    watch: {
      value (newVal) {
        this.visible = newVal
        if (!newVal) {
          this.clearForm()
        }
      },
      visible (newVal) {
        this.$emit('input', newVal)
      },
      initData () {
        this.form = this.getInitFormData()
      }
    }
  }
</script>

<style lang="less" scoped>


</style>
