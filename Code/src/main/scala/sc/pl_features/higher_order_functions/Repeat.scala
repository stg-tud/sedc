package sc.pl_features.higher_order_functions

object ControlFlowStatements {

  def repeat[T: scala.reflect.ClassTag](times: Int)(f: ⇒ T): Array[T] = {
    val array = new Array[T](times)
    var i = 0
    while (i < times) { array(i) = f; i += 1 }
    array
  }

  // Scala's (2.10) different mutable collections do not define a common method to add an element to those
  // collections.

  def repeatAndStoreInList[T](times: Int)(f: ⇒ T): List[T] = {
    var list: List[T] = List()
    var i = 0
    while (i < times) {
      list = f :: list
      i += 1
    }
    list.reverse
  }

  def repeatAndStoreInBuffer[T, X <: scala.collection.mutable.Buffer[T]](times: Int)(f: ⇒ T)(collection: X): X = {
    var i = 0
    while (i < times) {
      collection += f
      i += 1
    }
    collection
  }

}

object Demo extends App {

  import ControlFlowStatements._

  val values = repeat(2) { System.in.read() }
  println(values.toList.mkString(" "))

  val dates: Array[java.util.Date] =
    repeat(5) {
      new java.util.Date()
    }
  println(dates.map(_.getTime()).mkString("\n"))

  val datesInList: List[java.util.Date] =
    repeatAndStoreInList(5) {
      new java.util.Date()
    }

  val millis: scala.collection.mutable.ArrayBuffer[Long] =
    repeatAndStoreInBuffer(5) {
      System.currentTimeMillis()
    }(new scala.collection.mutable.ArrayBuffer[Long]())
  println(millis.mkString("\n"))

}