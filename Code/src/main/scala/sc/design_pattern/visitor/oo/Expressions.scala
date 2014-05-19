package sc.design_pattern.visitor.oo
// The following solution does not use a visitor, but is still open for extension in 
// both dimensions:
// - adding new data-types
// - adding new functionality.

// Base solution (OO Style)

trait Expressions {

  type expression <: Expression
  trait Expression {
    def infixNotation: String
    def eval: Double
  }

  trait Constant extends Expression {
    val v: Double
    def infixNotation = v.toString
    def eval = v
  }
}

trait AddExpressions extends Expressions {

  trait Add extends Expression {
    val l: expression
    val r: expression
    def infixNotation = "("+l.toString+" + "+r.toString+")"
    def eval = l.eval + r.eval
  }

}

trait MultExpressions extends Expressions {

  trait Mult extends Expression {
    val l: expression
    val r: expression
    def infixNotation = l.toString+" * "+r.toString
    def eval = l.eval * r.eval
  }

}

//Adding new types of expressions is easy

object StandardExpressionsFramework extends Expressions with AddExpressions with MultExpressions {
  type expression = Expression

  case class Constant(v: Double) extends super.Constant

  case class Add(val l: expression, val r: expression) extends super.Add

  case class Mult(val l: expression, val r: expression) extends super.Mult

}

// Adding new functionality is possible and safe, but hard
trait PrefixNotationForExpressions extends AddExpressions with MultExpressions {

  type expression <: Expression
  trait Expression extends super.Expression {
    def prefixNotation: String
  }

  trait Constant extends super.Constant with Expression {
    def prefixNotation = v.toString
  }

  trait Add extends super.Add with Expression {
    def prefixNotation = "+"+l.prefixNotation + r.prefixNotation
  }

  trait Mult extends super.Mult with Expression {
    def prefixNotation = "*"+l.prefixNotation + r.prefixNotation
  }
}

trait PostfixNotationForExpressions extends AddExpressions with MultExpressions {

  type expression <: Expression
  trait Expression extends super.Expression {
    def postfixNotation: String
  }

  trait Constant extends super.Constant with Expression {
    def postfixNotation = v.toString
  }

  trait Add extends super.Add with Expression {
    def postfixNotation = l.postfixNotation + r.postfixNotation+" + "
  }

  trait Mult extends super.Mult with Expression {
    def postfixNotation = l.postfixNotation + r.postfixNotation+" * "
  }
}

object ExtendedExpressionsFramework
    extends PrefixNotationForExpressions
    with PostfixNotationForExpressions {
  type expression = Expression
  trait Expression
    extends super[PrefixNotationForExpressions].Expression
    with super[PostfixNotationForExpressions].Expression

  case class Constant(v: Double)
    extends super[PrefixNotationForExpressions].Constant
    with super[PostfixNotationForExpressions].Constant
    with Expression

  case class Add(val l: expression, val r: expression)
    extends super[PrefixNotationForExpressions].Add
    with super[PostfixNotationForExpressions].Add
    with Expression

  case class Mult(val l: expression, val r: expression)
    extends super[PrefixNotationForExpressions].Mult
    with super[PostfixNotationForExpressions].Mult
    with Expression

}

object ExpressionsDemoOO extends App {

  val stdExprs = StandardExpressionsFramework

  val stdExpr = new stdExprs.Mult(new stdExprs.Constant(1.2), new stdExprs.Constant(2.1))
  println(stdExpr.infixNotation)

  val exExprs = ExtendedExpressionsFramework
  val exExpr = new exExprs.Add(new exExprs.Constant(1.2), new exExprs.Constant(2.1))
  println(exExpr.infixNotation)

}

