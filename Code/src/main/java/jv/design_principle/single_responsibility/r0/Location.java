/**
 * (c) Michael Eichberg 2013 (eichberg@informatik.tu-darmstadt.de)
 */

package jv.design_principle.single_responsibility.r0;

import java.util.ArrayList;
import java.util.List;

interface Shutter {
    // empty
}

interface Light {
    // empty
}

abstract class Location {

    private List<Shutter> shutters;

    private List<Light> lights;

    public Location(List<Shutter> shutters, List<Light> lights) {
        super();
        this.shutters = shutters;
        this.lights = lights;
    }

    public List<Shutter> shutters() {
        return shutters;
    }

    public List<Light> lights() {
        return lights;
    }
}

abstract class CompositeLocation<L extends Location> extends Location {

    private List<L> locations;

    public CompositeLocation(List<L> locations) {
        super(shutters(locations), lights(locations));
        this.locations = locations;
    }

    public List<L> locations() {
        return locations;
    }

    private static List<Light> lights(List<? extends Location> locations) {
        List<Light> lights = new ArrayList<Light>();
        for (Location child : locations) {
            lights.addAll(child.lights());
        }
        return lights;
    }

    private static List<Shutter> shutters(List<? extends Location> locations) {
        List<Shutter> lights = new ArrayList<Shutter>();
        for (Location child : locations) {
            lights.addAll(child.shutters());
        }
        return lights;
    }
}

class Room extends Location {

    public Room(List<Shutter> shutters, List<Light> lights) {
        super(shutters, lights);
    }
}

class Floor extends CompositeLocation<Room> {
    public Floor(List<Room> locations) {
        super(locations);
    }
}

class House extends CompositeLocation<Floor> {
    public House(List<Floor> locations) {
        super(locations);
    }
}

class Main {

    public static void main(String[] args) {
        House house = new House(null);
        List<Floor> floors = house.locations();
        System.out.println(floors);
    }
}