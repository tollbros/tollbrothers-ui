const rotate = (prevArray, index) => {
  const newArray = [...prevArray]
  const shifts = prevArray.length - index
  let iteration = 0
  do {
    iteration = iteration + 1
    newArray.unshift(newArray.pop())
  } while (iteration < shifts)

  return newArray
}

export default rotate
