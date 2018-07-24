const parsValidator = function (rule, value, callback, source, options) {
  if (value.length === 1) {
    callback()
  }
  const getLabel = rule.keyLabel ? key => rule.keyLabel[key] : key => key

  const errors = []
  for (const rowData of value) {
    for (const key in rowData) {
      if (rowData.hasOwnProperty(key) && !rowData[key]) {
        const label = getLabel(key)
        if (label) {
          errors.push(new Error(`请输入有效的${getLabel(key)}`))
          break
        }
      }
    }
  }
  callback(errors)
}

const DNSNameRule = {
  type: "string",
  pattern: /^[a-zA-Z\d.-]*$/,
  transform(value) {
    return value && value.trim()
  }
}

export {
  parsValidator,
  DNSNameRule
}
