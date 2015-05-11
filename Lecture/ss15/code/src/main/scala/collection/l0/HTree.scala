package collection.l0

sealed trait HTree {

    def v: Any

    def successors: List[HTree]

}

case class HNode[V, N <: HTree](v: V, successors: List[N]) extends HTree {

    def +[NextN >: N <: HTree](successor: NextN): HNode[V, NextN] =
        HNode(v, successor :: successors)

}

object HNode {

    def apply[V](v: V): HNode[V, Nothing] = HNode(v, Nil)
}

object HTreeDemo extends App {

    def save(s: java.io.Serializable): Unit = {
        // nothing to do
    }

    val tree: HNode[String, HNode[String, HNode[Int, _ <: HNode[String, Nothing]]]] =
        HNode("The Root", List(
            HNode("The Answer", List(
                HNode(42))),
            HNode("Douglas Adams", List(
                HNode(1952))),
            HNode("The Hitchhiker's Guide to the Galaxy", List(
                HNode(1979, List(
                    HNode("date written")))
            ))
        ))

    val leftMostSecondLevel: String = tree.successors.head.v
    println(leftMostSecondLevel)

    val leftMostThridLevel: Int = tree.successors.head.successors.head.v
    println(leftMostThridLevel)

    val rightMostFourthLevel: HNode[Int, _ <: HNode[String, Nothing]] = tree.successors.last.successors.last
    println(rightMostFourthLevel)
    val lastSuccessors: List[HNode[String, Nothing]] = rightMostFourthLevel.successors
    save(lastSuccessors.head.v)
    println(lastSuccessors.head.v)

    val secondLevelElements: List[HNode[Int, _]] = tree.successors.map(_.successors).flatten
    println(secondLevelElements.map(_.v))

    val details = tree.successors
    details.foreach((n: HNode[String, _]) ⇒ println(n))

}


