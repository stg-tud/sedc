package sc.pl_features.inheritance.constructors

class ScalaSuper {

  // executed at the end of the initialization
  printState();

  def printState() {
    println("no state")
  }
}

class ScalaSub extends ScalaSuper {

  var y: Int = 42 // What was the question again?

  override def printState() {
    println("y = "+y)
  }
}

object ScalaDemo extends App {

  val s = new ScalaSub
  s.printState() // after initialization
}
