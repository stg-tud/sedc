package sc.scala_introduction.privateThis

class Trial {
  protected[privateThis] var someValue = 5

  def inc {
    someValue += 1
  }

  def dec(t: Trial) {
    t.someValue -= 1
  }

  def get: Int = someValue
}

class Next extends Trial {
  def compare(t1: Trial, t2: Trial) = {
    println("%s , %s" format (t1.someValue, t2.someValue))
  }

  def test() = {
    var x = 3
    var y = 6
    var gcd: Int = 1
    while (y != 0) {
      val tmp = x % y
      x = y
      y = tmp
    }
    gcd = x
  }
}

object main extends App {
  val t1 = new Trial
  println(t1.get)
  val t2 = new Trial
  t2.inc
  println("%s should be different to %s" format (t1.get, t2.get))
}