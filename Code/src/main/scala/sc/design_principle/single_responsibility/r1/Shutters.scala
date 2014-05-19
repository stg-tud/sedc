package sc.design_principle
package single_responsibility
package r1

trait Shutters extends Building {

    trait TLocation extends super.TLocation {
        def shutters(): List[Shutter]
    }
    type Location <: TLocation

    trait TRoom extends super.TRoom with TLocation
    type Room <: TRoom with Location

    trait CompositeLocation[L <: Location] extends super.CompositeLocation[L] with TLocation {
        def shutters: List[Shutter] = locations.flatMap(_.shutters())
    }

    trait TFloor extends super.TFloor with CompositeLocation[Room]
    type Floor <: TFloor with Location

    trait THouse extends super.THouse with CompositeLocation[Floor]
    type House <: THouse with Location
}