/**
 * (c) Michael Eichberg 2013 (eichberg@informatik.tu-darmstadt.de)
 */
package jv.design_principle.single_responsibility.r1;

import java.util.ArrayList;
import java.util.List;

interface Shutter {
    // empty
}

interface Light {
    // empty
}

public interface Location {
    // empty
}

interface CompositeLocation<L extends Location> extends Location {
    abstract List<L> locations();
}

class Room implements Location {
    // empty
}

class Floor implements CompositeLocation<Room> {
    private List<Room> rooms;

    public List<Room> locations() {
        return rooms;
    }
}

class House implements CompositeLocation<Floor> {
    private List<Floor> floors;

    public List<Floor> locations() {
        return floors;
    }
}

interface LocationWithLights extends Location {
    List<Light> lights();

}

class LightedRoom extends Room implements LocationWithLights {

    private List<Light> lights;

    public List<Light> lights() {
        return lights;
    }
}

abstract class CompositeLocationWithLights<LL extends LocationWithLights> implements
        CompositeLocation<LL> {

    public List<Light> lights() {
        List<Light> lights = new ArrayList<Light>();
        for (LocationWithLights child : locations()) {
            lights.addAll(child.lights());
        }
        return lights;
    }
}

// class FloorWithLights extends ... should inherit from (CompositeLocationWithLights
// and Floor) ? (we don't want code
// duplication!)
// class HouseWithLights extends ... should inherit from ? (we don't want code
// duplication!)

// Imagine that we have another additional feature; e.g., shutters and we want
// to avoid code duplication!