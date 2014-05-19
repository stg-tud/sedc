package sc.scala_introduction.variables

class Protected {
  protected val x = 54
  def method() = {
    new Protected().x
  }
  class Nested {
    println(Protected.this.x)
    println(new Protected().x)
  }
}