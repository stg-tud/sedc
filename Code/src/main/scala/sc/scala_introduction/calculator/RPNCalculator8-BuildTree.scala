package sc.scala_introduction.calculator

import collection.mutable.Stack

object RPNCalculator8 extends App {
    trait Node { def evaluate(): Int }
    case class Value(v: Int) extends Node { def evaluate() = v }
    case class Sum(l: Node, r: Node) extends Node { def evaluate() = l.evaluate + r.evaluate }
    case class Sub(l: Node, r: Node) extends Node { def evaluate() = l.evaluate - r.evaluate }
    case class Mult(l: Node, r: Node) extends Node { def evaluate() = l.evaluate * r.evaluate }
    case class Div(l: Node, r: Node) extends Node { def evaluate() = l.evaluate / r.evaluate }

    val Number = "(\\d+)".r

    def parse(expression: String): Node = {
        val stack = new Stack[Node]
        def createNode(create: (Node, Node) ⇒ Node) = {
            val (r, l) = (stack.pop, stack.pop)
            create(l, r)
        }
        expression.split("\\s") foreach { token ⇒
            stack.push(token match {
                case Number(d) ⇒ Value(d.toInt)
                case "+"       ⇒ createNode(Sum)
                case "-"       ⇒ createNode(Sub)
                case "*"       ⇒ createNode(Mult)
                case "/"       ⇒ createNode(Div)
                case _         ⇒ throw new IllegalArgumentException("Unknown operator: "+token)
            })
        }
        if (stack.size != 1) throw new IllegalArgumentException("Too many operands.")
        stack.pop
    }
    println(parse(args.mkString(" ")).evaluate)
}