package sc.design_pattern.composite

trait Component2 {
  def apply(fun:(Component2) => Unit)
}