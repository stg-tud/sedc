/**
  * This is a Java-inspired solution/A more-or-less direct translation of a Java solution!
  *
  * (c) Michael Eichberg 2013 (eichberg@informatik.tu-darmstadt.de)
  */
package sc.design_principle
package single_responsibility
package r0

abstract class Location {
    def shutters: List[Shutter]
    def lights: List[Light]
}

class Room(
    val lights: List[Light],
    val shutters: List[Shutter]) extends Location

abstract class CompositeLocation[+L <: Location] extends Location {
    def lights: List[Light] = locations.flatMap(_.lights)
    def shutters: List[Shutter] = locations.flatMap(_.shutters)
    def locations: List[L]
}

class Floor(val locations: List[Room]) extends CompositeLocation[Room]

class House(val locations: List[Floor]) extends CompositeLocation[Floor]

object Main extends App {
    val house = new House(new Floor(new Room(Nil, Nil) :: Nil) :: Nil)
    val floors: List[Floor] = new House(Nil).locations
}