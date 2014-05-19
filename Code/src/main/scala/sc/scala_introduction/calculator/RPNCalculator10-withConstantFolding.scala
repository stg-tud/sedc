package sc.scala_introduction.calculator

import collection.mutable.Stack

object RPNCalculator10 extends App {
    sealed trait Node {
        def evaluate(values: Map[String, Int]): Int
    }
    case class Value(v: Int) extends Node {
        def evaluate(values: Map[String, Int]) = v
    }
    case class Sum(l: Node, r: Node) extends Node {
        def evaluate(values: Map[String, Int]) = l.evaluate(values) + r.evaluate(values)
    }
    case class Sub(l: Node, r: Node) extends Node {
        def evaluate(values: Map[String, Int]) = l.evaluate(values) - r.evaluate(values)
    }
    case class Mult(l: Node, r: Node) extends Node {
        def evaluate(values: Map[String, Int]) = l.evaluate(values) * r.evaluate(values)
    }
    case class Div(l: Node, r: Node) extends Node {
        def evaluate(values: Map[String, Int]) = l.evaluate(values) / r.evaluate(values)
    }
    case class Var(name: String) extends Node {
        def evaluate(values: Map[String, Int]) = values(name)
    }

    val Number = "(\\d+)".r
    val Variable = "(\\w)".r

    def toInfix(n: Node): String = {
        n match {
            case Value(v)   ⇒ v.toString()
            case Var(x)     ⇒ x
            case Sum(l, r)  ⇒ "("+toInfix(l)+"+"+toInfix(r)+")"
            case Sub(l, r)  ⇒ "("+toInfix(l)+"-"+toInfix(r)+")"
            case Mult(l, r) ⇒ toInfix(l)+"*"+toInfix(r)
            case Div(l, r)  ⇒ toInfix(l)+"/"+toInfix(r)
        }
    }

    def fold(n: Node): Node = {
        (n match {
            case Sum(n1, n2)  ⇒ Sum(fold(n1), fold(n2))
            case Sub(n1, n2)  ⇒ Sub(fold(n1), fold(n2))
            case Mult(n1, n2) ⇒ Mult(fold(n1), fold(n2))
            case Div(n1, n2)  ⇒ Div(fold(n1), fold(n2))
            case _            ⇒ n
        }) match {
            case Sum(Value(v1), Value(v2))  ⇒ Value(v1 + v2)
            case Sub(Value(v1), Value(v2))  ⇒ Value(v1 - v2)
            case Mult(Value(v1), Value(v2)) ⇒ Value(v1 * v2)
            case Div(Value(v1), Value(v2))  ⇒ Value(v1 / v2)
            case folded                     ⇒ folded
        }
    }

    def parse(expression: String): Node = {
        val stack = new Stack[Node]
        def createNode(create: (Node, Node) ⇒ Node) = {
            val (r, l) = (stack.pop, stack.pop)
            create(l, r)
        }
        expression.split("\\s") foreach { token ⇒
            stack.push(token match {
                case Number(d)   ⇒ Value(d.toInt)
                case Variable(v) ⇒ Var(v)
                case "+"         ⇒ createNode(Sum)
                case "-"         ⇒ createNode(Sub)
                case "*"         ⇒ createNode(Mult)
                case "/"         ⇒ createNode(Div)
                case _           ⇒ throw new IllegalArgumentException("Unknown operator: "+token)
            })
        }
        if (stack.size != 1) throw new IllegalArgumentException("Too many operands.")
        stack.pop
    }

    val exprTree = parse(args.mkString(" "))
    println(toInfix(exprTree)+"="+toInfix(fold(exprTree))+"="+exprTree.evaluate(Map(("x" -> 2))))
}