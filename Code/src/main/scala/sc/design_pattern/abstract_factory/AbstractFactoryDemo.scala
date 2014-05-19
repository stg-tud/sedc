package sc.design_pattern.abstract_factory

trait A extends AnyRef

trait B extends AnyRef

trait C extends AnyRef

trait Factory[F <: Factory[_ <: AnyRef]] {

  type FA <: A
  type FB <: B

  def newA: FA
  def newB: FB

  type FC <: C
  def newC(a: FA, b: FB): FC

  def cmp(a: FA, b: FB): Boolean
}

class FooFactory extends Factory[FooFactory] {

  type FA = FooA
  class FooA(val id: String = "FooFactory.FooA") extends AnyRef with A
  type FB = FooB
  class FooB(val id: String = "FooFactory.FooB") extends AnyRef with B

  def newA = new FooA
  def newB = new FooB

  type FC = FooC
  class FooC(val a: FA, val b: FB) extends C
  def newC(a: FA, b: FB) = new FooC(a, b)

  def cmp(a: FA, b: FB) = a.id == b.id
}
object FooFactory extends FooFactory

class BarFactory extends Factory[BarFactory] {

  type FA = BarA
  class BarA extends AnyRef with A
  type FB = BarB
  class BarB extends AnyRef with B

  def newA = new BarA
  def newB = new BarB

  type FC = BarC
  class BarC(val a: FA, val b: FB) extends C
  def newC(a: FA, b: FB) = new BarC(a, b)

  def cmp(a: FA, b: FB) = a.toString == b.toString
}
object BarFactory extends BarFactory

object AFDemo {

  def someAAndB(a: A, b: B) { /* empty */ }

  def someAAndBFromTheSameExplicitFactory(f: Factory[_])(a: f.FA, b: f.FB) {
    f.newC(a, b)
  }

  def someAAndBFromTheSameFactory[F <: Factory[F]](a: F#FA, b: F#FB) {
    // both: a and b are created by the same type of factory
  }

  val fa = FooFactory.newA
  val fb = FooFactory.newB
  val bb = BarFactory.newB

  someAAndB(fa, bb)

  someAAndBFromTheSameExplicitFactory(FooFactory)(fa, fb)
  // someAAndBFromTheSameExplicitFactory(FooFactory)(fa, bb)

  someAAndBFromTheSameFactory[FooFactory](fa, fb)
  // someAAndBFromTheSameFactory[BarFactory](fa,bb)

}