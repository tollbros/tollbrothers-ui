const reorder = (array = [], initialIndex = 0) => {
  const reorderedArray = []

  if (!array?.length) return []

  array
    .map((item, index) => {
      return {
        ...item,
        reorderIndex: index
      }
    })
    .forEach((item) => {
      if (item.reorderIndex === initialIndex) reorderedArray.unshift(item)
      else reorderedArray.push(item)
    })

  return reorderedArray
}

export default reorder
