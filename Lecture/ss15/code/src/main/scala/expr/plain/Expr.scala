package expr.plain


trait Expressions {

    type Expression <: TExpression
    trait TExpression {
        def eval: Double
    }

    trait Constant extends TExpression {
        val v: Double
        def eval = v
    }
}

trait AddExpressions extends Expressions {
    trait Add extends TExpression {
        val l: Expression
        val r: Expression
        def eval = l.eval + r.eval
    }
}

trait PrefixNotationForExpressions extends AddExpressions {

    type Expression <: TExpression
    trait TExpression extends super.TExpression {
        def prefixNotation: String
    }

    trait Constant extends super.Constant with TExpression {
        def prefixNotation = v.toString
    }

    trait Add extends super.Add with TExpression {
        def prefixNotation = "+"+l.prefixNotation + r.prefixNotation
    }
}

trait PostfixNotationForExpressions extends AddExpressions {

    type Expression <: TExpression
    trait TExpression extends super.TExpression {
        def postfixNotation: String
    }

    trait Constant extends super.Constant with TExpression {
        def postfixNotation = v.toString
    }

    trait Add extends super.Add with TExpression {
        def postfixNotation = "("+l.postfixNotation + r.postfixNotation+")"+" + "
    }
}

object ExpressionsFramework
        extends PrefixNotationForExpressions
        with PostfixNotationForExpressions {

    type Expression = TExpression
    trait TExpression
        extends super[PrefixNotationForExpressions].TExpression
        with super[PostfixNotationForExpressions].TExpression

    case class Constant(v: Double)
        extends super[PrefixNotationForExpressions].Constant
        with super[PostfixNotationForExpressions].Constant
        with Expression

    case class Add(val l: Expression, val r: Expression)
        extends super[PrefixNotationForExpressions].Add
        with super[PostfixNotationForExpressions].Add
        with Expression
}
