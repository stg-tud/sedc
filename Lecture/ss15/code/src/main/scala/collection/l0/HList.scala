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


