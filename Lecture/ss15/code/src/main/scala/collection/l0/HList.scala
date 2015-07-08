package collection.l0

sealed trait HList {

    def isEmpty: Boolean

}

case class HCons[H, T <: HList](head: H, tail: T) extends HList {

    def isEmpty = false

    def ::[B](e: B): HCons[B, HCons[H, T]] = HCons(e, this)

}

final case object Empty extends HList {

    def isEmpty = true

    def ::[B](e: B): HCons[B, this.type] = HCons(e, this)

}

object Demo extends App {

    type ::[H, T <: HList] = HCons[H, T]
    val :: = HCons
    type Empty = Empty.type

    val l0 = 42 :: Empty
    val l1: HCons[String, HCons[Int, Empty.type]] = "the answer is" :: l0
    val lh: String = l1.head
    val lt: HCons[Int, Empty.type] = l1.tail

    // Using an extractor...
    val (a :: b :: Empty) = l1

    val t = ((1 :: "2" :: Empty) :: (2.0f :: 3d :: Empty) :: Empty)

}

import scala.collection.mutable.{Buffer,ArrayBuffer}
import scala.collection.mutable.{Set,HashSet}
object ControlFlowStatements{
    trait Mutable[-C[_]] {
        def add[T](collection: C[T], elem: T): Unit
    }

    implicit object Set extends Mutable[Set] {
        def add[T](collection: Set[T], elem: T) { collection += elem }
    }

    implicit object Buffer extends Mutable[Buffer] {
        def add[T](collection: Buffer[T], elem: T) { collection += elem }
    }

    def repeatWithContextBound[T, C[T] <: AnyRef: Mutable](
        times: Int)(f: ⇒ T)(collection: C[T]): collection.type = {
        var i = 0
        while (i < times) {
            implicitly[Mutable[C]].add(collection, f); i += 1
        }
        collection
    }
}

object CFSDemo extends App {
  import ControlFlowStatements._

  val nanos_1: Set[Long] =
    repeatWithContextBound(5){ System.nanoTime() }(new HashSet[Long]())

  val nanos_2: Buffer[Long] =
    repeatWithContextBound(5){ System.nanoTime() }(new ArrayBuffer[Long]())

  val nanos_3: nanos_1.type =
    repeatWithContextBound(5) {System.nanoTime() }(nanos_1)

  def stricterEquals[X <: AnyRef](a: X)(b: a.type) = a == b
  stricterEquals(nanos_1)(nanos_3)
    // /* correctly won't compile */ stricterEquals(nanos_2)(nanos_3)
}
