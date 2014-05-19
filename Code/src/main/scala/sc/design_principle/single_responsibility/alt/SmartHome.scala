/**
  * (c) Guido Salvaneschi
  */
package sc.design_principle
package single_responsibility
package alt

trait Location
trait LightLocation extends Location { def lights: List[Light] }
trait ShutterLocation extends Location { def shutters: List[Shutter] }

trait CompositeLocation[L <: Location] extends Location { def locations: List[L] }

trait CompositeLightLocation[L <: LightLocation] extends CompositeLocation[L] {
  def lights: List[Light] = locations.flatMap(_.lights)
}
trait CompositeShutterLocation[L <: ShutterLocation] extends CompositeLocation[L] {
  def shutters: List[Shutter] = locations.flatMap(_.shutters)
}
trait CompositeShutterLightLocation[L <: ShutterLocation with LightLocation] // Compound type
    extends CompositeLightLocation[L]
    with CompositeShutterLocation[L] {
}

class Room extends Location
abstract class LightRoom(val lights: List[Light]) extends Room with LightLocation
abstract class ShutterRoom(val shutter: List[Shutter]) extends Room with ShutterLocation
abstract class ShutterLightRoom(val lights: List[Light], val shutter: List[Shutter])
  extends Room
  with ShutterLocation
  with LightLocation

trait FloorT[T <: Room] extends CompositeLocation[T] // Abstracts generic floors
class Floor(val locations: List[Room]) extends CompositeLocation[Room] with FloorT[Room]

class LightFloor(val locations: List[LightRoom])
  extends FloorT[LightRoom]
  with CompositeLightLocation[LightRoom]

class ShutterFloor(val locations: List[ShutterRoom])
  extends FloorT[ShutterRoom]
  with CompositeShutterLocation[ShutterRoom]

class ShutterLightFloor(val locations: List[ShutterLightRoom])
  extends FloorT[ShutterLightRoom]
  with CompositeShutterLightLocation[ShutterLightRoom]

class House(val locations: List[Floor]) extends CompositeLocation[Floor]

object Main extends App {

  val floors: ShutterLightFloor = new ShutterLightFloor(Nil)

  println(floors.lights)
  println(floors.shutters)
  println(floors.locations)

}









