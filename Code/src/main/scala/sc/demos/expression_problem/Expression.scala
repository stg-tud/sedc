package sc.demos.expression_problem

sealed trait Expr

final case class Value(val v: Double) extends Expr

final case class Add(val l: Expr, val r: Expr) extends Expr

final case class Mult(val l: Expr, val r: Expr) extends Expr

final case class Div(val l: Expr, val r: Expr) extends Expr

