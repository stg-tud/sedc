package sc.scala_introduction.calculator

import collection.mutable.Stack

object RPNCalculator5 {
    val Number = "(\\d+)".r

    def evaluate(expression: String): Int = {
        val stack = new Stack[Int]

        def compute(op: (Int, Int) ⇒ Int) = {
            val (r, l) = (stack.pop, stack.pop)
            op(l, r)
        }

        expression.split("\\s").foreach { token ⇒
            stack.push(token match {
                case Number(d) ⇒ d.toInt
                case "+"       ⇒ compute((l,r) => l + r)
                case "-"       ⇒ compute((l,r) => l - r)
                case "*"       ⇒ compute((l,r) => l * r)
                case "/"       ⇒ compute((l,r) => l / r)
                case _         ⇒ throw new IllegalArgumentException("Unknown operator: "+token)
            })
        }
        if (stack.size != 1) {
            throw new IllegalArgumentException("Too many operands.")
        }
        // the result is on top of the stack
        stack.pop
    }

    def main(args: Array[String]) { println(evaluate(args.mkString(" ").trim)) }
}