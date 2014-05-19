package sc.design_principle
package single_responsibility
package r1

trait Lights extends Building {

    trait TLocation extends super.TLocation {

        def lights(): List[Light]

        def turnLightsOn = lights.foreach(_.turnOn())

        def turnLightsOff = lights.foreach(_.turnOff())

    }
    type Location <: TLocation

    trait TRoom extends super.TRoom with TLocation
    type Room <: TRoom with Location

    trait CompositeLocation[L <: Location] extends super.CompositeLocation[L] with TLocation {
        def lights: List[Light] = locations.flatMap(location ⇒ location.lights())
        // "in short":   def lights: List[Light] = locations.flatMap(_.lights())
    }

    trait TFloor extends super.TFloor with CompositeLocation[Room]
    type Floor <: TFloor with Location

    trait THouse extends super.THouse with CompositeLocation[Floor]
    type House <: THouse with Location
}

object BuildingsWithLights extends Lights with App {

    type Location = TLocation
    type Room = TRoom
    type Floor = TFloor
    type House = THouse

    def createRoom(): Room = new Room { var lights: List[Light] = Nil }

    def createFloor(rooms: List[Room]): Floor = new Floor { val locations = rooms }

    def createHouse(floors: List[Floor]): House = new House { val locations = floors }

    val r1 = createRoom()
    val r2 = createRoom()

    val f = createFloor(List(r1, r2))

    println(f.locations)
    println(f.lights)

    val h = buildHouse("two floors with 4 rooms each")
    h.lights
}