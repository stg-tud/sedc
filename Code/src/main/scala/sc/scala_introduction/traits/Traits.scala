package sc.scala_introduction.traits

trait Base {
    def doIt(): String = "Base"
}

class Sub0 extends Base {
    override def doIt(): String = "SubBase"+super.doIt()
}

trait Sub1 extends Base {
    override def doIt(): String = "Sub1"+super.doIt()
}

trait Sub2 extends Base {
    override def doIt(): String = "Sub2"+super.doIt()
}

trait AbstractBase {
    def doIt(): String
}

trait SubOfAbstractBase1 extends AbstractBase {
    abstract override def doIt(): String = "UsageClass"+super.doIt()
}

trait SubOfAbstractBase2 extends AbstractBase {
    abstract override def doIt(): String = "LogCalls"+super.doIt()
}

object Main extends App {

    val o0 = new Sub0 with Sub1 with Sub2
    println(o0.doIt)

    val o1 = new Base with Sub1 with Sub2
    println(o1.doIt)

    val o2 = new Base with Sub2 with Sub1
    println(o2.doIt)

    trait ConcreteBase extends AbstractBase {
        def doIt(): String = "ConcreteBase"
    }

    val o3 = new ConcreteBase with SubOfAbstractBase2 with SubOfAbstractBase1
    println(o3.doIt)

}

trait NotSoBad {
    def bad() = false
}

trait ReallyBad {
    def bad() = true
}

trait TotalBad extends NotSoBad with ReallyBad {
    override def bad() = super[NotSoBad].bad()
}