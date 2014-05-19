package sc.design_pattern.composite

class Leaf2 extends Component2 {
  def apply(fun:(Component2) => Unit) = {
    fun(this)
  }
}