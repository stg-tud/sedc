package sc.scala_introduction.calculator

import collection.mutable.Stack

object RPNCalculator4 {
    val Number = "(\\d+)".r

    def evaluate(expression: String): Int = {
        val stack = new Stack[Int]

        def operands = (stack.pop, stack.pop)

        for (token ← expression.split("\\s")) {
            var t = 0
            token match {
                case Number(d) ⇒
                    t = d.toInt
                case "+" ⇒
                    val (r, l) = operands; t = l + r
                case "-" ⇒
                    val (r, l) = operands; t = l - r
                case "*" ⇒
                    val (r, l) = operands; t = l * r
                case "/" ⇒
                    val (r, l) = operands; t = l / r
                case _ ⇒
                    throw new IllegalArgumentException("Unknown operator: "+token)
            }
            stack.push(t)
        }
        if (stack.size != 1) {
            throw new IllegalArgumentException("Too many operands.")
        }
        // the result is on top of the stack
        stack.pop
    }

    def main(args: Array[String]) { println(evaluate(args.mkString(" ").trim)) }
}
