package sc.design_pattern.decorator.delegation

import scala.language.existentials

/*
 * The following code shows how to implement a decorator using delegation semantics
 * with dynamic composition. 
 * As the code shows – without explicit support – the implementation is very 
 * complex, hard to maintain and error prone.
 * 
 * The basic idea is that all calls that are (explicitly or implicitly) done with "this" 
 * as the receiver and where the type is component are now done using "self" as the receiver. 
 * 
 * Note that this implementation is not complete! I.e., we do not have delegating semantics
 * for methods defined by Decorator.   
 */

trait Component {

  def self: Component

  def state: String

  def name: String

}

abstract class ConcreteComponent protected (val id: String) extends Component {

  def state = self.name + id

  def name = "ConcreteComponent"
}

object ConcreteComponent {

  def apply(id: String) = new ConcreteComponent(id) { def self: Component = this }

  def create(id: String)(wrapper: Component) = new ConcreteComponent(id) { def self: Component = wrapper }
}

abstract class Decorator protected (val quotes: String) extends Component {

  protected var wrappedComponent: Component = _

  def state = quotes + wrappedComponent.state + quotes

  def name = "Decorator"
}

object Decorator {

  def apply(create: (Component) ⇒ Component, quotes: String) = {
    val d = new Decorator(quotes) { def self: Component = this }
    d.wrappedComponent = create(d)
    d
  }

  def create(create: (Component) ⇒ Component, quotes: String)(wrapper: Component) = {
    val d = new Decorator(quotes) { def self: Component = wrapper }
    d.wrappedComponent = create(d)
    d
  }

  def createWithForwardingSemantics(component: Component, quotes: String) =
    new Decorator(quotes) { this.wrappedComponent = component; def self: Component = this }

}

object Demo extends App {

  val c = ConcreteComponent("CC")
  println(c.state)

  val d = Decorator(ConcreteComponent.create("DCC"), "'")
  println(d.state)

  val forwardC = Decorator.createWithForwardingSemantics(c, "_")
  println(forwardC.state)

  val dd = Decorator(Decorator.create(ConcreteComponent.create("DDCC"), "'"), "-")
  println(dd.state)

}