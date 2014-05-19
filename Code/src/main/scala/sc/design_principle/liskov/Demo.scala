package sc.design_principle
package liskov

object Demo extends App {

  def isNull(s: Seq[_]): Boolean = s eq null

  //val f: (Seq[_]) ⇒ Boolean = isNull

  val f: (Seq[_]) ⇒ Boolean = (s) ⇒ { s eq null }

  val af1: (Object) ⇒ Boolean = null // = f ?

  val af2: (List[_]) ⇒ Boolean = null // = f ?

  val af3: (Seq[_]) ⇒ Any = null // = f ?

  //val af4: (Seq[_]) ⇒ Nothing = null // = f ?
  val af4: Function[Seq[_], Nothing] = null // = f ?

}

// W.r.t. to overriding a method of a superclass, Scala behaves as Java. 
// I.e., a method with a contra-variant argument type (and a co-variant 
// or identical) return type, does not override the corresponding method
// in the super class.
class Super {
  def f(s: String) = println(s)
}

class Sub extends Super {

  /*override (Uncommenting will cause a compiler failure.) */
  def f(o: Object) = println("Object: "+o) // this method does not ov
}