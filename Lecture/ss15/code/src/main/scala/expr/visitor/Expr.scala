package expr.visitor

import scala.language.higherKinds

trait Expressions {

    trait Expression { def accept[T](visitor: Visitor[T]): T }

    class Constant(val v: Double) extends Expression {
        def accept[T](visitor: Visitor[T]): T = visitor.visitConstant(v)
    }

    type Visitor[T] <: TVisitor[T]
    trait TVisitor[T] {
        def visitConstant(v: Double): T
    }

    trait EvalVisitor extends TVisitor[Double] {
        def visitConstant(v: Double): Double = v
    }
}

trait AddExpressions extends Expressions {

    class Add(
            val l: Expression,
            val r: Expression) extends Expression {

        def accept[T](visitor: Visitor[T]): T = visitor.visitAdd(l, r)
    }

    type Visitor[T] <: TVisitor[T]
    trait TVisitor[T] extends super.TVisitor[T] {
        def visitAdd(l: Expression, r: Expression): T
    }

    trait EvalVisitor extends super.EvalVisitor with TVisitor[Double] {
        this: Visitor[Double] ⇒
        def visitAdd(l: Expression, r: Expression): Double =
            l.accept(this) + r.accept(this)
    }
}

trait MultExpressions extends Expressions {

    class Mult(
            val l: Expression,
            val r: Expression) extends Expression {

        def accept[T](visitor: Visitor[T]): T = visitor.visitMult(l, r)
    }

    type Visitor[T] <: TVisitor[T]
    trait TVisitor[T] extends super.TVisitor[T] {
        def visitMult(l: Expression, r: Expression): T
    }

    trait EvalVisitor extends super.EvalVisitor with TVisitor[Double] {
        this: Visitor[Double] ⇒
        def visitMult(l: Expression, r: Expression): Double =
            l.accept(this) * r.accept(this)
    }
}

trait ExtendedExpressions extends AddExpressions with MultExpressions {

    type Visitor[T] = TVisitor[T]
    trait TVisitor[T]
        extends super[AddExpressions].TVisitor[T]
        with super[MultExpressions].TVisitor[T]

    object EvalVisitor
            extends super[AddExpressions].EvalVisitor
            with super[MultExpressions].EvalVisitor
            with TVisitor[Double] {
        this: Visitor[Double] ⇒
    }
}

trait PrefixNotationForExpressions extends ExtendedExpressions {

    object PrefixNotationVisitor extends super.TVisitor[String] {
        this: Visitor[String] ⇒

        def visitConstant(v: Double): String = v.toString+" "

        def visitAdd(l: Expression, r: Expression): String =
            "+ "+l.accept(this) + r.accept(this)

        def visitMult(l: Expression, r: Expression): String =
            "* "+l.accept(this) + r.accept(this)

    }
}
