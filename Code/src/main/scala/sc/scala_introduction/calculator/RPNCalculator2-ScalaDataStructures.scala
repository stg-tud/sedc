package sc.scala_introduction.calculator

import collection.mutable.Stack

object RPNCalculator2 {

    def evaluate(expression: String): Int = {
        val stack = new Stack[Int]()

        for (token ← expression.split("\\s")) {
            if (token.matches("\\d+")) {
                stack.push(token.toInt)
            }
            else {
                if (stack.size < 2) {
                    throw new IllegalArgumentException("Missing operands for operator: "+token)
                }
                val r = stack.pop()
                val l = stack.pop()
                var t = 0
                if (token.equals("+")) {
                    t = l + r
                }
                else if (token.equals("-")) {
                    t = l - r
                }
                else if (token.equals("*")) {
                    t = l * r
                }
                else if (token.equals("/")) {
                    t = l / r
                }
                else {
                    throw new IllegalArgumentException("Unknown operator: "+token)
                }
                stack.push(t)
            }
        }
        if (stack.size != 1) {
            throw new IllegalArgumentException("Too many operands.")
        }
        // the result is on top of the stack
        return stack.pop()
    }

    def main(args: Array[String]) { println(evaluate(args.mkString(" ").trim())) }
}
