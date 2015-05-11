package collection.l1

/**
 * @tparam E The most specific common supertype of all elements of the list.
 */
sealed trait HList[+E] {

    def head: Any

    def tail: HList[E]

    def isEmpty: Boolean

    def foreach(f: E ⇒ Unit)
}

case class HCons[E, H <: E, T <: HList[E]](head: H, tail: T) extends HList[E] {

    def isEmpty = false

    def ::[X >: E, B <: X](e: B): HCons[X, B, HCons[E, H, T]] =
        HCons[X, B, HCons[E, H, T]](e, this)

    def foreach(f: E ⇒ Unit): Unit = { f(head); tail.foreach { f } }
}

final case object Empty extends HList[Nothing] {

    def head = throw new UnsupportedOperationException

    def tail = throw new UnsupportedOperationException

    def isEmpty = true

    def ::[B](e: B): HCons[B, B, this.type] = HCons(e, this)

    def foreach(f: Nothing ⇒ Unit): Unit = { /*Nothing to do.*/ }
}

object Demo extends App {

    type ::[E, H <: E, T <: HList[E]] = HCons[E, H, T]
    val :: = HCons
    type Empty = Empty.type

    val ln = 12l :: 42 :: Empty
    ln.foreach { v ⇒ v.toString() }

    val lsn = Set(12, 23) :: Set(23f, 235d) :: Empty
    lsn.foreach { v ⇒ println(v.mkString(",")) }

    val l0 = 42 :: Empty
    val l1: HCons[Any, String, HCons[Int, Int, Empty.type]] = "the answer is" :: l0
    val lh: String = l1.head

    // Using an extractor...
    val (a :: b :: Empty) = l1

    val t = ((1 :: "2" :: Empty) :: (2.0f :: 3d :: Empty) :: Empty)

}


