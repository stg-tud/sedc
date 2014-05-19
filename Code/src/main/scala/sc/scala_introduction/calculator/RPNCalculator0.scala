package sc.scala_introduction.calculator;

import java.util.Stack;
import java.util.StringTokenizer;

object RPNCalculator0 {

    def evaluate(expression: String): Int = {
        val stack: Stack[Integer] = new Stack[Integer]();

        val stringTokenizer: StringTokenizer = new StringTokenizer(expression);
        while (stringTokenizer.hasMoreTokens()) {
            val token: String = stringTokenizer.nextToken();

            if (token.matches("\\d+")) {
                stack.push(new Integer(token));
            }
            else {
                if (stack.size() < 2) {
                    throw new IllegalArgumentException("Missing operands for operator: "+token);
                }
                val r: Int = stack.pop();
                val l: Int = stack.pop();
                var t: Int = 0;
                if (token.equals("+")) t = l + r;
                else if (token.equals("-")) t = l - r;
                else if (token.equals("*")) t = l * r;
                else if (token.equals("/")) t = l / r;
                else throw new IllegalArgumentException("Unknown operator: "+token);
                stack.push(t);
            }
        }
        if (stack.size() != 1) {
            throw new IllegalArgumentException("Too many operands.");
        }
        // the result is on top of the stack
        return stack.pop();
    }

    def main(args: Array[String]) {
        var expression: String = "";
        for (arg ← args) {
            expression = expression+" "+arg;
        }
        System.out.println(evaluate(expression.trim()));
    }
}
