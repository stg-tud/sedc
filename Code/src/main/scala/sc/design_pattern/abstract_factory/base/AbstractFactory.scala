package sc.design_pattern.abstract_factory.base

trait A

trait B

trait Factory {

  type FA <: A
  type FB <: B

  def newA: FA
  def newB: FB
}

object FooFactory extends Factory {

  type FA = FooA
  class FooA extends A
  type FB = FooB
  class FooB extends B

  def newA: FooA = new FooA
  def newB: FooB = new FooB
}

object BarFactory extends Factory {

  type FA = FooA
  class FooA extends A
  type FB = FooB
  class FooB extends B

  def newA = new FooA
  def newB = new FooB
}

object AFDemo {

  def someAAndB(a: A, b: B) { /* empty */ }

  def someAAndBFromTheSameFactory(f: Factory)(a: f.FA, b: f.FB) { /* empty */ }

  //        def someAAndBFromTheSameFactory[F<: Factory,A <: F.FA,B <: F.FB](f: Factory)(a: f.FA, b: f.FB) { /* empty */ }

  val fa = FooFactory.newA
  val fb = FooFactory.newB
  val bb = BarFactory.newB

  someAAndB(fa, bb)
  //someAAndBFromTheSameFactory(FooFactory)(fa, bb)
  someAAndBFromTheSameFactory(FooFactory)(fa, fb)

}