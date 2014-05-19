package sc.design_pattern.adapter

import scala.language.implicitConversions
import scala.language.higherKinds

import scala.collection.mutable.{ Set, Buffer, HashSet, ArrayBuffer }

// Scala's (2.10) different mutable collections do not define a common method to add an element to those
// collections.

object ControlFlowStatementsBase {

  abstract class MutableCollection[T] {
    def +=(elem: T): Unit
  }

  implicit def setToMutableCollection[T](set: Set[T]) =
    new MutableCollection[T] { def +=(elem: T) = set += (elem) }

  implicit def bufferToMutableCollection[T](buffer: Buffer[T]) =
    new MutableCollection[T] { def +=(elem: T) = buffer += (elem) }

  // 1. Try:
  // We expect something of type MutableCollection; the conversion will happen before parameter is passed
  // to "repeat"
  // Problem: We return the adapter object!
  def repeat[T](times: Int)(f: ⇒ T)(collection: MutableCollection[T]): collection.type = {
    var i = 0; while (i < times) { collection += f; i += 1 }
    collection // potentially, the adapter object
  }

  // 2. Try: 
  // The implicit conversion is happening inside of "repeatToSet"
  // Problem: 
  // 1) We need a second variant of this method that is completely identical except of the 
  // parameterization of the third parameter (Set => Map).
  // 2) The return type is not precise enough - it is always Set.
  def repeatToSet[T](times: Int)(f: ⇒ T)(collection: Set[T]): collection.type = {
    var i = 0; while (i < times) { collection += f; i += 1 }
    collection // the original collection; however, the precise type is lost, it is "just" Set[T]
  }

  // 3. Try:
  // Similar to the 2nd try, except that we have fixed the issue related to the return type.
  def repeatToSetAdv[T, C[T] <: Set[T]](times: Int)(f: ⇒ T)(collection: C[T]): collection.type = {
    var i = 0; while (i < times) { collection += f; i += 1 }
    collection
  }

  // 4. Try:
  // Now, we use a view bound to state that the collection has to be of type MutableCollection
  // or that a conversion to a MutableCollection has to be in scope.
  def repeatWithViewBound[T, X <% MutableCollection[T]](times: Int)(f: ⇒ T)(collection: X): X = {
    var i = 0; while (i < times) { collection += f; i += 1 }
    collection
  }

  // HERE WE ARE USING CONTEXT BOUNDS (Future Proof)
  // to get further information, you can search for "Type Classes Pattern"

  trait Mutable[-C[_]] {
    def add[T](collection: C[T], elem: T): Unit
  }

  // by making the type parameter of Mutable contravariant [-C], we can now write, e.g., val mhs : Mutable[HashSet] = MutableSet // typeOf(MutableSet ) == Mutable[Set]

  implicit object MutableSet extends Mutable[Set] {
    def add[T](collection: Set[T], elem: T): Unit = { collection += elem }
  }

  implicit object MutableBuffer extends Mutable[Buffer] {
    def add[T](collection: Buffer[T], elem: T): Unit = { collection += elem }
  }

  def repeatWithContextBound[T, C[T] <: AnyRef: Mutable](times: Int)(f: ⇒ T)(collection: C[T]): collection.type = {
    var i = 0
    val mutableDataStructure = implicitly[Mutable[C]]
    while (i < times) {
      mutableDataStructure.add(collection, f)
      i += 1
    }
    collection
  }
}
object CFSDemoBase extends App {

  import ControlFlowStatementsBase._

  val nanos1 = repeat(5) {
    System.nanoTime()
  }(new HashSet[Long]())
  println(nanos1.getClass())

  val nanos2 /* correctly(?), won't compile : HashSet[Long] */ = repeatToSet(5) {
    System.nanoTime()
  }(new HashSet[Long]())
  println(nanos2.getClass())

  val nanos3: HashSet[Long] = repeatToSetAdv(5) {
    System.nanoTime()
  }(new HashSet[Long]())
  println(nanos3.getClass())

  val nanos4_1: HashSet[Long] = repeatWithViewBound(5) {
    System.nanoTime()
  }(new HashSet[Long]())
  println(nanos4_1.getClass())

  val nanos4_2: ArrayBuffer[Long] = repeatWithViewBound(5) {
    System.nanoTime()
  }(new ArrayBuffer[Long]())
  println(nanos4_2.getClass())

  val nanos5_1: HashSet[Long] = repeatWithContextBound(5) {
    System.nanoTime()
  }(new HashSet[Long]())
  println(nanos5_1.getClass())

  val nanos5_2: ArrayBuffer[Long] = repeatWithContextBound(5) {
    System.nanoTime()
  }(new ArrayBuffer[Long]())
  println(nanos5_2.getClass())

  val nanos5_3: nanos5_1.type = repeatWithContextBound(5) {
    System.nanoTime()
  }(nanos5_1)
  println(nanos5_3.getClass())

  def stricterEquals(a: AnyRef)(b: a.type) = a == b
  stricterEquals(nanos5_1)(nanos5_3)
  // /* correctly won't compile */ stricterEquals(nanos5_2)(nanos5_3)

}

//
// A SOLUTION WITHOUT A VIEW / CONTEXT BOUND!
//

object ControlFlowStatements {

  abstract class MutableCollection[T] {
    def +=(elem: T): Unit
  }

  implicit def id[T]: MutableCollection[T] ⇒ MutableCollection[T] =
    (mc: MutableCollection[T]) ⇒ { mc }

  implicit def setToMutableCollection[T]: Set[T] ⇒ MutableCollection[T] =
    (set: Set[T]) ⇒ {
      new MutableCollection[T] { def +=(elem: T): Unit = set += (elem) }
    }

  def repeatAndStore[T, C[T] <: AnyRef](
    times: Int)(
      f: ⇒ T)(
        collection: C[T])(implicit conv: C[T] ⇒ MutableCollection[T]): collection.type = {

    var i = 0; while (i < times) { collection += f; i += 1 }
    collection
  }

}

object CFSDemo extends App {

  import ControlFlowStatements._

  val baseSet = new HashSet[Long]

  val theBaseSet /*: theSet.type*/ = repeatAndStore(5) { System.nanoTime() }(baseSet)

  val someHashSet: HashSet[Long] = repeatAndStore(5) { System.nanoTime() }(baseSet)(setToMutableCollection)

  def stricterEquals[X <: AnyRef](a: X)(b: a.type) = a == b
  stricterEquals(baseSet)(theBaseSet)
  // correctly won't compile: stricterEquals(baseSet)(new HashSet[Long])
  // correctly won't compile: stricterEquals(baseSet)(someHashSet) // **an** instance of "HashSet[Long]" is not compatible with the instance **"theSet"** of HashSet[Long] 

  val mutableBaseSet: MutableCollection[Long] = setToMutableCollection(baseSet)
  val theMutableBaseSet = repeatAndStore(5) { System.nanoTime() }(mutableBaseSet)(id)
}