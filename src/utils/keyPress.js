export const onKeyUpEnter = (event, func) => {
  if (event.which === 13 || event.keyCode === 13) {
    func()
  }
}
