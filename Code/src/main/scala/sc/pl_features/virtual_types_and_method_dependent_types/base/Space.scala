// Space... the final frontier

// a straight-forward solution relying on path-dependent types which offers features more-or-less comparable 
// to those offered by virtual classes

package sc.pl_features.virtual_types_and_method_dependent_types
package base

trait Space {

  type point <: Point
  trait Point {
    def add(v: vector): point
  }
  def origin: point

  type vector
  trait Vector {
    def scale(d: Double): vector
  }
}

object OneDimSpace extends Space {

  type point = Point
  case class Point(x: Double) extends super.Point {
    def add(v: Vector) = Point(this.x + v.x)
  }
  def origin: Point = Point(0)

  type vector = Vector
  case class Vector(x: Double) extends super.Vector {
    def scale(d: Double) = Vector(this.x * d)
  }
}

object TwoDimSpace extends Space {

  type point = Point
  case class Point(x: Double, y: Double) extends super.Point {
    def add(v: Vector) = Point(this.x + v.x, this.y + y)
  }
  def origin: Point = Point(0, 0)

  type vector = Vector
  case class Vector(x: Double, y: Double) extends super.Vector {
    def scale(d: Double) = Vector(this.x * d, this.y * d)
  }
}

object Demo extends App {

  val p = OneDimSpace.origin

  val v = TwoDimSpace.Vector(2.0, 3.0)

  // p.add(v) // <= won't compile as it is (correctly) not type safe     
}