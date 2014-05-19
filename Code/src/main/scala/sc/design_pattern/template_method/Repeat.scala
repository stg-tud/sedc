package sc.design_pattern.template_method

object Repeat {

  // a template method that is parameterized by the function f
  def repeat[T: scala.reflect.ClassTag](times: Int)(f: ⇒ T): Array[T] = {
    val array = new Array[T](times)
    var i = 0
    while (i < times) {
      array(i) = f
      i += 1
    }
    array
  }

}

object RepeatDemo extends App {

  import Repeat._

  val body: () ⇒ Int = () ⇒ { System.in.read() }

  //val result : Array[Int] = repeat(3)(f = body())
  val result: Array[Int] = repeat(3)(body())

  // val result: Array[Int] = repeat(3){ System.in.read() }

  println("Charcodes: "+result.mkString(" "))
}