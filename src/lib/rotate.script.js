import rotate from './rotate'

const run = () => {
  const array = [1, 2, 3, 4, 5, 6]
  array.forEach((item, index) => {
    const newArray = [...array]
    console.log('Shift to index ' + index, rotate(newArray, index))
    console.log('Shift to index ' + index, rotate(newArray, index))
  })
}

run()
