
export function getFieldData(obj, field, attr) {
  return obj[field] && obj[field].und && obj[field].und[0] && obj[field].und[0][attr] || ''
}
