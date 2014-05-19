package jv.scala_introduction.calculator;

import java.util.Stack;
import java.util.StringTokenizer;

public class RPNCalculator {

    @SuppressWarnings("boxing")
    public static int evaluate(String expression) {
        Stack<Integer> stack = new Stack<Integer>();
        StringTokenizer stringTokenizer = new StringTokenizer(expression);
        while (stringTokenizer.hasMoreTokens()) {
            String token = stringTokenizer.nextToken();
            if (token.matches("\\d+")) stack.push(new Integer(token));
            else {
                if (stack.size() < 2) {
                    throw new IllegalArgumentException("Missing operands for operator: " + token);
                }
                int r = stack.pop(), l = stack.pop(), t;
                if (token.equals("+"))  t = l + r;  
                else if (token.equals("-"))  t = l - r;  
                else if (token.equals("*"))  t = l * r;  
                else if (token.equals("/"))  t = l / r;  
                else throw new IllegalArgumentException("Unknown operator: " + token);
                stack.push(t);
            }
        }
        if (stack.size() != 1) throw new IllegalArgumentException("Too many operands.");
        return stack.pop();
    }

    public static void main(String[] args) {
        String expression = "";
        for (String arg : args) { expression = expression + " " + arg; }
        System.out.println(evaluate(expression.trim()));
    }
}
