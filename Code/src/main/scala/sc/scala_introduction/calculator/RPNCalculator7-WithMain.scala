package sc.scala_introduction.calculator

import collection.mutable.Stack

object RPNCalculator7 extends App {
    val Number = "(\\d+)".r

    def evaluate(expression: String): Int = {
        val stack = new Stack[Int]

        def compute(op: (Int, Int) ⇒ Int) = {
            val (r, l) = (stack.pop, stack.pop)
            op(l, r)
        }

        expression.split("\\s") foreach { token ⇒
            stack.push(token match {
                case Number(d) ⇒ d.toInt
                case "+"       ⇒ compute(_ + _)
                case "-"       ⇒ compute(_ - _)
                case "*"       ⇒ compute(_ * _)
                case "/"       ⇒ compute(_ / _)
                case _         ⇒ throw new IllegalArgumentException("Unknown operator: "+token)
            })
        }
        if (stack.size != 1) {
            throw new IllegalArgumentException("Too many operands.")
        }
        // the result is on top of the stack
        stack.pop
    }

    println(evaluate(args.mkString(" ")))
}