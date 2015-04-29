package two

import one.CaseClasses

object Main extends App {

    val c = CaseClasses("F")
    println(c)
    println(
        c match {
            case CaseClasses("B") ⇒ "Buh"
            case CaseClasses("F") ⇒ "Yeah"
        }
    )
}

