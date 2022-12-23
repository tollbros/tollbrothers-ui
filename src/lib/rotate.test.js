import rotate from './rotate'

describe('rotate', () => {
  it('should return the original array', () => {
    const slide = 1
    const original = [1, 2, 3, 4, 5, 6]
    const result = rotate(original, slide - 1)
    result.forEach((value, index) => {
      expect(value).toBe(original[index])
    })
  })
  it('should return a rotated array', () => {
    const original = [1, 2, 3, 4, 5, 6]
    const expected = [4, 5, 6, 1, 2, 3]
    const clickFirstSlide = rotate(original, 0)
    const clickFourthSlide = rotate(clickFirstSlide, 3)
    clickFourthSlide.forEach((value, index) => {
      expect(value).toBe(expected[index])
    })
  })
})
