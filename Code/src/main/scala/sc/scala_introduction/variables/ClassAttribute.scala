package sc.scala_introduction.variables

class ClassAttribute {
  private var privateAttribute = 42 // type can be omitted if compiler can determine
  protected var protectedAttribute: Int = 100 // but nevertheless, a variable can be typed
  var publicAttribute = 23 // default visibility is public; public keyword is not defined

  private val privateConstant = 42l // Java: final attribute <-> Scala: val instead of var
  protected val protectedConstant: Long = 100l
  val publicConstant = 23l

  def manipulateOwnAttributes(): Unit = { // from within the own class all attributes can be accessed
    publicAttribute += publicConstant.toInt / 2
    protectedAttribute += protectedConstant.toInt / 2
    privateAttribute += privateConstant.toInt / 2
  }
  def manipulateForeignInstanceAttributes(): Unit = { // from within the own class all attributes of other instances can be accessed
    val c = new ClassAttribute
    c.publicAttribute += c.publicConstant.toInt / 2
    c.protectedAttribute += c.protectedConstant.toInt / 2
    c.privateAttribute += c.privateConstant.toInt / 2
  }
}

class SInheritor extends ClassAttribute { // within an inheritor all not-private attributes can be accessed
  def manipulateInheritedAttributes(): Unit = {
    publicAttribute += publicConstant.toInt / 2
    protectedAttribute += protectedConstant.toInt / 2
    //privateAttribute  += privateConstant.toInt / 2
  }
  def manipulateInstanceAttributes(): Unit = { // only public attributes of other instances can be accessed
    val c = new ClassAttribute
    c.publicAttribute = c.publicConstant.toInt + 1
    //c.protectedAttribute = c.protectedConstant.toInt + 1
    //c.privateAttribute = c.privateConstant.toInt + 1
  }
}

class SAnyClass {
  def manipulateAttributes(): Unit = { // from within other classes only public attributes are accessable
    val c = new ClassAttribute
    c.publicAttribute = c.publicConstant.toInt + 1
    //c.protectedAttribute = c.protectedConstant.toInt + 1
    //c.privateAttribute = c.privateConstant.toInt + 1
  }
}

class X(var s: String = "") {
  def this() = this("foo")
  def this(int: Int) = this(int.toString)

  def someMethod(): Unit = {
    println(s)
    s += "a"
  }
}

object X {
  def apply(b:Boolean) : X = {
    new X(b.toString)
  }
  def apply(f:Float) : X = {
    new X(f.toString)
  }
}

object main extends App {
  val x = X(true)
  x.someMethod
  x.someMethod
  x.s = "Test"
  x.someMethod
  x.someMethod
}