// Space... the final frontier

package sc.pl_features.virtual_types_and_method_dependent_types
package traits
package adv

import scala.reflect.api.TypeTags
import scala.reflect.runtime.universe._
import scala.reflect.runtime.universe.TypeTag._

trait Space {
  def dimensions: Int
}
trait Space2D extends Space {
  def dimensions = 2
}
trait Space3D extends Space {
  def dimensions = 3
}

trait Points { this: Space ⇒

  type point <: Point
  trait Point {
    def isLessOrEqual(p: point): Boolean
    def closerToOriginThan(p: point): Boolean
  }

  def origin: point
}

trait PointsIn2D extends Points { this: Space2D with VectorsIn2D ⇒

  type point <: Point
  trait Point extends super.Point {
    val x: Double
    val y: Double
    def isLessOrEqual(p: point) = x <= p.x && y <= p.y
    def closerToOriginThan(p: point) = Math.sqrt(x * x + y * y) < Math.sqrt(p.x * p.x + p.y * p.y)
    def add(v: Vector) = Point(x + v.x, y + v.y)
  }
  def Point(x: Double, y: Double): point

  val origin = Point(0, 0)
}

trait PointsIn3D extends Points { this: Space3D with VectorsIn3D ⇒

  type point <: Point
  trait Point extends super.Point {
    val x: Double
    val y: Double
    val z: Double

    def isLessOrEqual(p: point) = x <= p.x && y <= p.y && z <= p.z
    def closerToOriginThan(p: point) = Math.sqrt(x * x + y * y + z * z) < Math.sqrt(p.x * p.x + p.y * p.y + p.z * p.z)
    def add(v: Vector) = Point(x + v.x, y + v.y, z + v.z)
  }
  def Point(x: Double, y: Double, z: Double): point

  val origin = Point(0, 0, 0)
}

trait Vectors { this: Space ⇒

  type vector <: Vector
  trait Vector {
    def scale(d: Double): vector
  }
}

trait VectorsIn2D extends Vectors { this: Space2D ⇒

  type vector <: Vector
  trait Vector extends super.Vector {
    val x: Double
    val y: Double
    def scale(d: Double) = Vector(x * d, y * d)
  }
  def Vector(x: Double, y: Double): vector
}

trait VectorsIn3D extends Vectors { this: Space3D ⇒

  type vector <: Vector
  trait Vector extends super.Vector {
    val x: Double
    val y: Double
    val z: Double
    def scale(d: Double) = Vector(x * d, y * d, z * d)
  }
  def Vector(x: Double, y: Double, z: Double): vector
}

trait The2DSpace extends PointsIn2D with VectorsIn2D with Space2D {

  type vector = Vector
  case class VectorIn2D(x: Double, y: Double) extends Vector
  def Vector(x: Double, y: Double) = VectorIn2D(x, y)

  type point = Point
  case class PointIn2D(x: Double, y: Double) extends Point
  def Point(x: Double, y: Double) = PointIn2D(x, y)
}

trait The3DSpace extends PointsIn3D with VectorsIn3D with Space3D {

  type vector = Vector
  case class VectorIn3D(x: Double, y: Double, z: Double) extends Vector
  def Vector(x: Double, y: Double, z: Double) = VectorIn3D(x, y, z)

  type point = Point
  case class PointIn3D(x: Double, y: Double, z: Double) extends Point
  def Point(x: Double, y: Double, z: Double) = PointIn3D(x, y, z)
}

trait Shapes { this: Space with Points ⇒
  type Universe <: Shapes.this.type

  type shape <: Shape
  trait Shape {
    def universe: Universe

    def pointInside(pt: point): Boolean
  }
}

trait BoundedShapes extends Shapes { this: Space with Points ⇒
  type Universe <: BoundedShapes.this.type

  //    type shape <: Shape
  //    trait Shape extends super.Shape

  //    type boundedShape <: BoundedShape
  trait BoundedShape extends Shape {
  }
}

trait SolidShapes extends Shapes { this: Space with Points ⇒
  type Universe <: SolidShapes.this.type

  //    type shape <: Shape
  //    trait Shape extends super.Shape

  //    type solidShape <: SolidShape
  trait SolidShape extends Shape {
    // def pointOnEdge(pt: point): Boolean
  }
}

trait Boxes extends BoundedShapes with SolidShapes { this: Space with Points ⇒
  type Universe <: Boxes.this.type

  //    type shape <: Shape
  //    trait Shape extends super[BoundedShapes].Shape with super[SolidShapes].Shape
  //
  //    type boundedShape <: BoundedShape
  //    trait BoundedShape extends super.BoundedShape with Shape
  //
  //    type solidShape <: SolidShape
  //    trait SolidShape extends super.SolidShape with Shape

  type box <: Box
  abstract class Box(val p1: point, val p2: point) extends BoundedShape with SolidShape {
    def pointInside(pt: point): Boolean = p1.isLessOrEqual(pt) && pt.isLessOrEqual(p2)
    // def pointOnEdge(pt: Point) : Boolean =  
  }
  def Box(p1: point, p2: point): box
}

trait IntersectionShapes extends Shapes { this: Space with Points ⇒
  type Universe <: IntersectionShapes.this.type

  //    type shape <: Shape
  //    trait Shape extends super.Shape
  //
  type intersection <: Intersection
  abstract class Intersection(val s1: shape, val s2: shape) extends Shape {
    def pointInside(pt: point): Boolean = s1.pointInside(pt) && s2.pointInside(pt)
  }
  def Intersection(s1: shape, s2: shape): intersection
}

trait UnionShapes extends SolidShapes with BoundedShapes { this: Space with Points ⇒
  type Universe <: UnionShapes.this.type

  //    type shape <: Shape
  //    trait Shape extends super[SolidShapes].Shape with super[BoundedShapes].Shape {
  //        def universe: Universe
  //    }

  //    type solidShape <: SolidShape
  //    trait SolidShape extends super.SolidShape with Shape
  //
  //    type boundedShape <: BoundedShape
  //    trait BoundedShape extends super.BoundedShape with Shape
  //
  type union <: Union
  abstract class Union(val shape1: shape, val shape2: shape) extends Shape {
    def pointInside(pt: point) = shape1.pointInside(pt) || shape2.pointInside(pt)
  }
  def Union(s1: shape, s2: shape): union // Factory Method
  // Creates a union of two shapes of this(!) space
  //    def Union[S1 <: shape: TypeTag, S2 <: shape: TypeTag](s1: S1, s2: S2): union = (typeOf[S1], typeOf[S2]) match {
  //        case (TypeRef(universe, SolidShape, _), TypeRef(universe, shape, _)) ⇒ createUnion[shape, shape](s1, s2)
  //        case (s1: shape, s2: solidShape) ⇒ createUnion[shape, shape](s1, s2)
  //        case _ ⇒ sys.error("not supported")
  //    }
}

trait ExSpace extends Space with Points with Vectors with Boxes with IntersectionShapes with UnionShapes {
  this: Space with Points with Vectors with Boxes with IntersectionShapes with UnionShapes ⇒
  type Universe <: ExSpace.this.type

  //    type shape <: Shape
  //    trait Shape extends super[Boxes].Shape with super[IntersectionShapes].Shape with super[UnionShapes].Shape
  //
  //    type boundedShape <: BoundedShape
  //    trait BoundedShape extends super[]
  //    
  //    type box <: Box
  //    trait Box extends super.Box with BoundedShape with SolidShape 
  //
  //    type intersection <: Intersection
  //    trait Intersection extends super.Intersection with Shape
  //
  //    type union <: Union
  //    trait Union extends super.Union with Shape
}

trait Ex2DSpace extends The2DSpace with ExSpace {
  type Universe = Ex2DSpace.this.type

  type shape = Shape
  trait Shape extends super.Shape {
    def universe: Universe = Ex2DSpace.this
  }

  type box = Box
  class Box(p1: point, p2: point) extends super.Box(p1, p2) with Shape
  def Box(p1: point, p2: point) = new Box(p1, p2)

  type intersection = Intersection
  class Intersection(s1: Shape, s2: Shape) extends super.Intersection(s1, s2) with Shape
  def Intersection(s1: Shape, s2: Shape) = new Intersection(s1, s2)

  type union = Union
  class Union(s1: Shape, s2: Shape) extends super.Union(s1, s2) with Shape
  def Union(s1: Shape, s2: Shape) = new Union(s1, s2)
}
trait Ex3DSpace extends The3DSpace with ExSpace {
  type Universe = Ex3DSpace.this.type

  type shape = Shape
  trait Shape extends super.Shape {
    def universe: Universe = Ex3DSpace.this
  }

  type box = Box
  class Box(p1: point, p2: point) extends super.Box(p1, p2) with Shape
  def Box(p1: point, p2: point) = new Box(p1, p2)

  type intersection = Intersection
  class Intersection(s1: Shape, s2: Shape) extends super.Intersection(s1, s2) with Shape
  def Intersection(s1: Shape, s2: Shape) = new Intersection(s1, s2)

  type union = Union
  class Union(val s1: Shape, val s2: Shape) extends super.Union(s1, s2) with Shape
  def Union(s1: Shape, s2: Shape) = new Union(s1, s2)
}

object CompleteSpaceDemo extends App {
  val S2D = new Ex2DSpace {}
  val S2DAlt = new Ex2DSpace {}
  val S3D = new Ex3DSpace {}

  val someVector: Vectors#Vector =
    if ((System.currentTimeMillis() % 3 == 0))
      S2D.Vector(2, 1)
    else
      S3D.Vector(2, 1, 0)

  val a2DVector: S2D.Vector = S2D.Vector(2, 2)
  val p12D = S2D.Point(2, 1)
  val p22D = S2D.Point(1, 2)
  val p32D = S2D.Point(3, 2)

  val b12D = S2D.Box(p12D, p22D)
  val b22D = S2D.Box(p22D, p32D)
  val i2D = S2D.Intersection(b12D, b22D)

  val b = p12D closerToOriginThan p22D

  val b12DAlt = S2DAlt.Box(null, null)

  val a3DVector: S3D.Vector = S3D.Vector(3, 3, 3)
  val p13D = S3D.Point(1, 2, 3)
  val p23D = S3D.Point(2, 2, 4)
  val p33D = S3D.Point(3, 3, 6)
  val p43D = p13D.add(a3DVector)
  val b13D = S3D.Box(p13D, p23D)

  // p13D.add(a2DVector)
  // correctly, won't compile: p13D.add(someVector)
  // correctly, won't compile: val i3D = S3D.Intersection(b12D,b13D)

  def inside(s: ExSpace)(pt: s.Point, shape: s.Shape): Boolean = { true /* needs to be refined...*/ }
  inside(S2D)(p12D, b22D)
  // correctly, won't compile: inside(S3D)(p12D, b22D)

  def projectionToS2D(shape: Ex3DSpace#Shape): S2DAlt.Shape = {
    // won't compile: b22D 
    S2DAlt.Box(null, null) // needs to be improved..
  }
  projectionToS2D(b13D)

  def projection(shape: Ex3DSpace#Shape, targetSpace: Ex2DSpace): targetSpace.Shape = {
    // won't compile: b22D 
    targetSpace.Box(null, null) // needs to be improved..
  }

  val gs2D = projection(b13D, S2D)
  val gs2DAlt = projection(b13D, S2DAlt)
  inside(S2D)(p12D, gs2D)
  // correctly, won't compile: inside(S2D)(p12D,gs2DAlt)
  println(gs2D.getClass+" "+gs2DAlt.getClass)

  // correctly, won't compile: projection(b12D)

  val unionShapeS2D = S2D.Union(b12D, b22D)
  // correctly, won't compile: val unionShape = S2D.Union(b12D,b13D) // mixing shape of different spaces
  // correctly, won't compile: val unionShapeS2DS2DAlt = S2D.Union(b12D,b12DAlt) // union of shapes of different 2D spaces

  // Given that we do not have something like MultiMethods, the following will not work:
  //    def UnionAcrossSpaces(s: ExSpace)(s1: ExSpace#Shape, s2: ExSpace#Shape) = {} // most general
  //    def UnionAcrossSpaces(s: ExSpace)(s1: s.Shape, s2: s.Shape) = { s.Union(s1, s2) } 
  //    def UnionAcrossSpaces(s: Ex2DSpace)(s1: Ex2DSpace#Shape, s2: Ex2DSpace#Shape) = {}
  //    val unionASShapeS2D = UnionAcrossSpaces(S2D)(b12D, b22D); println
  //    val unionASShapeS2DA2DAlt = UnionAcrossSpaces(S2D)(b12D, b12DAlt); println
  //    val unionASShapeS2DS3D = UnionAcrossSpaces(S2D)(b12D, b13D); println

  def UnionAcrossSpaces[S1 <: ExSpace#Shape, S2 <: ExSpace#Shape, ST <: ExSpace](s1: S1, s2: S2, target: ST)(implicit s1Tag: TypeTag[S1], s2Tag: TypeTag[S2], spaceTag: TypeTag[ST]) = {
    val spaceType = typeOf[target.type]
    val TypeRef(p1, _, _) = s1Tag.tpe
    val TypeRef(p2, _, _) = s2Tag.tpe

    println("SpaceType of shapes: "+p1+"#"+p1.hashCode+", "+p2+"#"+p2.hashCode+"; type of space: "+spaceType+"#"+spaceType.hashCode())
    println(spaceType.typeSymbol)
    println(p1.typeSymbol)
    println(p2.typeSymbol)

    (s1Tag.tpe, s2Tag.tpe) match {
      case (TypeRef(p1, _, _), TypeRef(p2, _, _)) if p1 =:= p2
        && (s1.universe eq target) ⇒ { // TODO Figure out if there is a more meaningful way
        println("Both shapes are from the same space as the target space: "+p1+" <=> "+p2)
        target.Union(s1.asInstanceOf[target.type#shape], s2.asInstanceOf[target.type#shape]) // these casts should be safe (i.e., should never fail!)
        // s1.universe.Union(s1, s2)
      }
      case (TypeRef(p1, _, _), TypeRef(p2, _, _)) if p1 <:< typeTag[Ex2DSpace].tpe && p2 <:< typeTag[Ex2DSpace].tpe ⇒ {
        println("Both shapes are from a 2D space: "+p1+"("+p1.typeSymbol.fullName+") <=> "+p2+"("+p2.typeSymbol.fullName+"); target: "+spaceType)
        // create a new shape in the target space...
      }
      case _ ⇒ println("Creating a union of this pair of shapes is not supported")
    }
  }

  val unionASShapeS2D = UnionAcrossSpaces(b12D, b22D, S2D); println
  val unionASShapeS2DA2DAlt = UnionAcrossSpaces(b12D, b12DAlt, S2D); println
  val unionASShapeS2DS3D = UnionAcrossSpaces(b12D, b13D, S2D); println

}

