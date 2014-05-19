// Space... the final frontier

package sc.pl_features.virtual_types_and_method_dependent_types
package param

trait Space {
  def origin: Point[this.type]
}

object TwoDimSpace extends Space {
  def origin = new TwoDimPoint(this, 0, 0)
  def twoDimVector(x: Double, y: Double) = new TwoDimVector(this, x, y)
  def twoDimPoint(x: Double, y: Double) = new TwoDimPoint(this, x, y)
}

object OneDimSpace extends Space {
  def origin = new OneDimPoint(this, 0)
  def oneDimPoint(x: Double) = new OneDimPoint(this, x)
}

abstract class Point[S <: Space](val s: S) {
  def add(v: Vector[s.type]): Point[s.type]
}

abstract class Vector[S <: Space](val s: S) {
  def scale(d: Double): Vector[s.type]
}

class TwoDimVector(s: TwoDimSpace.type, val x: Double, val y: Double) extends Vector(s) {
  def scale(d: Double) = s.twoDimVector(x * d, y * d)
}

class TwoDimPoint(s: TwoDimSpace.type, val x: Double, val y: Double) extends Point(s) {
  def add(v: Vector[s.type]) = null // how to write something like: s.twoDimPoint(x + v.x, y + v.y)
}

class OneDimPoint(s: OneDimSpace.type, val x: Double) extends Point(s) {
  def add(v: Vector[s.type]) = null
}
