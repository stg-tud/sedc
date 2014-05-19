package sc.design_principle
package single_responsibility
package r1

trait LightsAndShutters extends Lights with Shutters {

    trait TLocation extends super[Lights].TLocation with super[Shutters].TLocation
    type Location <: TLocation

    trait TRoom extends super[Lights].TRoom with super[Shutters].TRoom with TLocation
    type Room <: TRoom with Location

    trait CompositeLocation[L <: Location]
        extends super[Lights].CompositeLocation[L]
        with super[Shutters].CompositeLocation[L]
        with TLocation

    trait TFloor extends super[Lights].TFloor with super[Shutters].TFloor with CompositeLocation[Room]
    type Floor <: TFloor with Location

    trait THouse extends super[Lights].THouse with super[Shutters].THouse with CompositeLocation[Floor]
    type House <: THouse with Location

}

object BuildingsWithLightsAndShutters extends LightsAndShutters with App {

    type Location = TLocation
    type Room = TRoom
    type Floor = TFloor
    type House = THouse

    def createRoom(): Room = new Room { var lights: List[Light] = Nil; var shutters: List[Shutter] = Nil }

    def createFloor(rooms: List[Room]): Floor = new Floor { val locations = rooms }

    def createHouse(floors: List[Floor]): House = new House { val locations = floors }

    println("We can now create buildings with lights and shutters!")

    val h = buildHouse("three floors with 6 rooms each")
    h.lights
    h.shutters
    h.locations
    h.turnLightsOn

    val r1 = createRoom()
    val r2 = createRoom()
    val f = createFloor(List(r1, r2))

    // a room of a different type of buildings
    val rO = BuildingsWithLights.createRoom()
    // Does it compile?
    // createFloor(List(r1, rO))
}
