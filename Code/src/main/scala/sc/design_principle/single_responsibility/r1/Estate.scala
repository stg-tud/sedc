package sc.design_principle
package single_responsibility
package r1

// Independent development of a "Garage" extension 

trait Estate extends Building {

    trait Garage extends TLocation
}

trait EstateWithLightsAndShutters extends Estate with LightsAndShutters {

    trait Garage extends super.Garage with super[LightsAndShutters].TLocation

}

object EstatesWithLightsAndShutters extends EstateWithLightsAndShutters {

    type Location = TLocation
    type Room = TRoom
    type Floor = TFloor
    type House = THouse

    def createRoom(): Room = new Room { var lights: List[Light] = Nil; var shutters: List[Shutter] = Nil }
    def createFloor(rooms: List[Room]): Floor = new Floor { val locations = rooms }
    def createHouse(floors: List[Floor]): House = new House { val locations = floors }

    class Garage(val lights: List[Light] = Nil, val shutters: List[Shutter] = Nil) extends super.Garage

    val room = createRoom()
    room.turnLightsOn
    room.turnLightsOff

    val garage = new Garage(Nil, Nil)
    garage.turnLightsOff
    garage.turnLightsOn

    val h = buildHouse("three floors with 6 rooms each")
    h.lights
    h.shutters
    h.locations
    h.turnLightsOn
}


