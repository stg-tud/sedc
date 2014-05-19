package sc.design_pattern.decorator.structural

// Using mixin composition we get delegation semantics basically for free.
// However, it is done statically.

trait Component {

  def state: String

  def name: String

}

case class AComponent(val id: String) extends Component {

  def state = name+":"+id

  def name = "A"
}

trait BComponent extends Component {
  def name = "B"
}

class CComponent extends BComponent {

  def state = name+":"+666

  override def name = "C"
}

trait ComponentDecoratorA extends Component {
  abstract override def name = "ByADecorated:"+super.name
}

trait ComponentDecoratorB extends Component {
  abstract override def name = "ByBDecorated:"+super.name
}

trait ComponentDecoratorC extends CComponent /* <= a class! */ {

  abstract override def name = "ByCDecorated:"+super.name
}

object DemoStructuralDecorator extends App {

  // static composition
  val a = new AComponent("42") with ComponentDecoratorA with ComponentDecoratorB
  println(a.state)

  val c = new CComponent with ComponentDecoratorB with ComponentDecoratorA
  println(c.state)

  val cct = new ComponentDecoratorC {}
  println(cct.state)
}
