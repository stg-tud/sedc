package sc.design_pattern.composite

class Composite2(private var components: List[Component2] = List()) extends Component2 {
  def this(comps: Component2) = this(List(comps))
  def apply(fun: (Component2) => Unit) = components.foreach(_.apply(fun))

  def add(comp: Component2) = {
    components ::= comp
  }

  def get(index: Int): Component2 = {
    components(index)
  }

  def size(): Int = {
    components.size
  }

  def remove(comp: Component2) = {
    components = components.drop(components.indexOf(comp))
  }
}