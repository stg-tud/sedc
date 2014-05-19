package sc.pl_features.continuations

import _root_.scala.util.continuations._

object Demo extends App {

  def foo(): Int @cps[Int] = { // could leave out return type
    println("outer")

    shift { k: (Int ⇒ Int) ⇒
      {
        var x = 1
        println("before")
        val y = k(x)
        println("after")
        y + 5
      }
    } + { println("rest"); 2 }
  }

  val f = foo _

  println(reset { println("start reset"); f() * 2 } + 1)

}
