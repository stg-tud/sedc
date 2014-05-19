package sc.design_pattern.composite

class Composite1 extends Component1 {
  var components = List[Component1]()
  def operation1 = components.foreach(_.operation1)
  def operation2 = components.foreach(_.operation2)

  def add(comp: Component1) = {
    components ::= comp
  }

  def get(index: Int): Component1 = {
    components(index)
  }

  def size(): Int = {
    components.size
  }

  def remove(comp: Component1) = {
    components = components.drop(components.indexOf(comp))
  }
}