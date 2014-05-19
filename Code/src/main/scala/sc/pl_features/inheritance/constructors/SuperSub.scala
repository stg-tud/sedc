package sc.pl_features.inheritance.constructors

class Super {

  // executed at the end of the initialization
  printState();

  def printState() {
    println("no state")
  }
}

class Sub(var y: Int = 42) extends Super {

  override def printState() {
    println("y = "+y)
  }
}

object Demo extends App {

  val s = new Sub
  s.printState() // after initialization
}

