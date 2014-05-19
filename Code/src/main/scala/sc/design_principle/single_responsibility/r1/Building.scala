package sc.design_principle
package single_responsibility
package r1

trait Building {

    trait TLocation {}
    type Location <: TLocation

    trait TRoom extends TLocation
    type Room <: TRoom with Location
    def createRoom(): Room

    trait CompositeLocation[L <: Location] extends TLocation {
        def locations: List[L]
    }

    trait TFloor extends CompositeLocation[Room]
    type Floor <: TFloor with Location
    def createFloor(locations: List[Room]): Floor

    trait THouse extends CompositeLocation[Floor]
    type House <: THouse with Location
    def createHouse(locations: List[Floor]): House

    def buildHouse(specification: String): House = {
        // imagine to parse the specification...
        createHouse(List(createFloor(List(createRoom()))))
    }
}

object Main extends App {

    object BasicHome extends Building {
        type Location = TLocation
        type Room = TRoom
        type Floor = TFloor
        type House = THouse

        def createRoom(): Room = new Room {}
        def createFloor(rooms: List[Room]): Floor = new Floor { val locations = rooms }
        def createHouse(floors: List[Floor]): House = new House { val locations = floors }

    }

    val house = BasicHome.buildHouse("two floors with 4 rooms each");
}