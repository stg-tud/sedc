package sc.demos.expression_problem

import scala.language.implicitConversions

object Demo extends App {

  implicit def doubleToValue(d: Double): Value = Value(d)

  def evalExpr(expr: Expr): Double = {
    expr match {
      case Value(d)     ⇒ d
      case Div(e1, e2)  ⇒ evalExpr(e1) / evalExpr(e2)
      case Add(e1, e2)  ⇒ evalExpr(e1) + evalExpr(e2)
      case Mult(e1, e2) ⇒ evalExpr(e1) * evalExpr(e2)
    }
  }

  val expr = Mult(3, Add(2, 3))
  println(expr+" = "+evalExpr(expr))

  val illegalExpr = Mult(Value(5), Add(2, 3))
  println(illegalExpr+" = "+evalExpr(illegalExpr)) // will fail with scala.MatchError
}