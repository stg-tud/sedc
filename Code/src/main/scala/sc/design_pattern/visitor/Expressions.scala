package sc.design_pattern.visitor

import scala.language.higherKinds

trait Expressions {

  // This solution does not support adding methods/functionality to an expression 
  // at runtime or by a third-party extension. I.e., an independently developed
  // extension of the Expressions trait cannot contribute to Expression's trait.

  trait Expression {
    def accept[T](visitor: visitor[T]): T
  }

  class Constant(val v: Double) extends Expression {
    def accept[T](visitor: visitor[T]): T = visitor.visitConstant(v)
  }

  type visitor[T] <: Visitor[T]
  trait Visitor[T] {
    def visitConstant(v: Double): T
  }

  trait EvalVisitor extends Visitor[Double] {
    def visitConstant(v: Double): Double = v
  }

  trait InfixNotationVisitor extends Visitor[String] {
    def visitConstant(v: Double): String = v.toString
  }
}

trait AddExpressions extends Expressions {

  class Add(
      val l: Expression,
      val r: Expression) extends Expression {

    def accept[T](visitor: visitor[T]): T = visitor.visitAdd(l, r)
  }

  type visitor[T] <: Visitor[T]
  trait Visitor[T] extends super.Visitor[T] {
    def visitAdd(l: Expression, r: Expression): T
  }

  trait EvalVisitor extends super.EvalVisitor with Visitor[Double] { this: visitor[Double] ⇒
    def visitAdd(l: Expression, r: Expression): Double =
      l.accept(this) + r.accept(this)
  }

  trait InfixNotationVisitor extends super.InfixNotationVisitor with Visitor[String] { this: visitor[String] ⇒
    def visitAdd(l: Expression, r: Expression): String =
      "("+l.accept(this)+" + "+r.accept(this)+")"
  }
}

trait MultExpressions extends Expressions {

  class Mult(
      val l: Expression,
      val r: Expression) extends Expression {

    def accept[T](v: visitor[T]): T = v.visitMult(l, r)
  }

  type visitor[T] <: Visitor[T]
  trait Visitor[T] extends super.Visitor[T] {
    def visitMult(l: Expression, r: Expression): T
  }

  trait EvalVisitor extends super.EvalVisitor with Visitor[Double] { this: visitor[Double] ⇒
    def visitMult(l: Expression, r: Expression): Double =
      l.accept(this) + r.accept(this)
  }

  trait InfixNotationVisitor extends super.InfixNotationVisitor with Visitor[String] { this: visitor[String] ⇒
    def visitMult(l: Expression, r: Expression): String =
      l.accept(this)+" * "+r.accept(this)
  }

}

trait ExtendedExpressions extends AddExpressions with MultExpressions {

  type visitor[T] = Visitor[T] // the data-type hierarchy is now fixed; extension is only possible w.r.t. new functionality
  trait Visitor[T]
    extends super[AddExpressions].Visitor[T]
    with super[MultExpressions].Visitor[T]

  object EvalVisitor
    extends super[AddExpressions].EvalVisitor
    with super[MultExpressions].EvalVisitor
    with Visitor[Double] { this: visitor[Double] ⇒ }

  object InfixNotationVisitor
    extends super[AddExpressions].InfixNotationVisitor
    with super[MultExpressions].InfixNotationVisitor with Visitor[String] { this: visitor[String] ⇒ }
}

object StandardExpressionsFramework extends ExtendedExpressions {

}

trait PrefixNotationForExpressions extends ExtendedExpressions {

  object PrefixNotationVisitor extends super.Visitor[String] { this: visitor[String] ⇒

    def visitConstant(v: Double): String = v.toString+" "

    def visitAdd(l: Expression, r: Expression): String = "+ "+l.accept(this) + r.accept(this)

    def visitMult(l: Expression, r: Expression): String = "* "+l.accept(this) + r.accept(this)

  }
}

trait PostfixNotationForExpressions extends ExtendedExpressions {

  object PostfixNotationVisitor extends super.Visitor[String] { this: visitor[String] ⇒

    def visitConstant(v: Double): String = " "+v.toString

    def visitAdd(l: Expression, r: Expression): String = l.accept(this) + r.accept(this)+" + "

    def visitMult(l: Expression, r: Expression): String = l.accept(this) + r.accept(this)+" * "

  }
}

object ExtendedExpressionsFramework extends PrefixNotationForExpressions with PostfixNotationForExpressions {

}

object ExpressionsDemo extends App {

  val stdExprs = StandardExpressionsFramework

  val stdExpr = new stdExprs.Mult(new stdExprs.Constant(1.2), new stdExprs.Constant(2.1))
  println(stdExpr.accept(stdExprs.InfixNotationVisitor))

  val exExprs = ExtendedExpressionsFramework
  val exExpr = new exExprs.Add(new exExprs.Constant(1.2), new exExprs.Constant(2.1))
  println(exExpr.accept(exExprs.PrefixNotationVisitor))
  println(exExpr.accept(exExprs.InfixNotationVisitor))
  println(exExpr.accept(exExprs.PostfixNotationVisitor))

}