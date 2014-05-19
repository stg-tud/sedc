package sc.scala_introduction.calculator

import java.util.Stack
import java.util.StringTokenizer

object RPNCalculator1 {

    def evaluate(expression: String): Int = {
        val stack = new Stack[Integer]()

        val stringTokenizer = new StringTokenizer(expression)
        while (stringTokenizer.hasMoreTokens()) {
            val token = stringTokenizer.nextToken()

            if (token.matches("\\d+")) {
                stack.push(new Integer(token))
            }
            else {
                if (stack.size() < 2) {
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
        if (stack.size() != 1) {
            throw new IllegalArgumentException("Too many operands.")
        }
        // the result is on top of the stack
        return stack.pop()
    }

    def main(args: Array[String]) {
        var expression = ""
        for (arg ← args) {
            expression = expression+" "+arg
        }
        System.out.println(evaluate(expression.trim()))
    }
}
