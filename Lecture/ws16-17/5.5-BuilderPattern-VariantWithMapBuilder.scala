// Technische Universität Darmstadt
// Department of Computer Science
// Software Technology Group
// Michael Eichberg
//
// SED&C WS 16/17
//

trait Builder[T,That] {
    def add(t : T) : Unit
    def build : That
}

class ListBuilder[T] extends Builder[T,List[T]] {
    private var l : List[T] = List.empty
    def add(t : T) : Unit = l ::= t 
    def build : List[T] = l
}

class SetBuilder[T] extends Builder[T,Set[T]] {
    private var l : Set[T] = Set.empty
    def add(t : T) : Unit = l += t 
    def build : Set[T] = l
}

class MapBuilder[X,Y] extends Builder[(X,Y),Map[X,Y]]{
    private var l : Map[X,Y] = Map.empty
    def add(t : (X,Y)) : Unit = l += t 
    def build : Map[X,Y] = l
}

trait BuilderFactory[To,That] {
    def create() : Builder[To,That]
}

case class Singleton[T](t : T) {
    def map[To,That](f : T => To) (implicit bf : BuilderFactory[To,That]) : That = {
        val builder = bf.create()
        builder.add(f(t))
        builder.build
    }
}

class SingletonBuilder[T] extends Builder[T,Singleton[T]] {
    private var l : Singleton[T] = null
    def add(t : T) : Unit = if (l != null) throw new IllegalStateException else l = Singleton(t)
    def build : Singleton[T] = l
}


trait LowPriorityImports {
    implicit def mbf[X,Y] = new BuilderFactory[(X,Y),Map[X,Y]] {
        def create() = new MapBuilder[X,Y]
    }
    implicit def lbf[T] = new BuilderFactory[T,List[T]] {
        def create() = new ListBuilder[T]
    }
    implicit def sbf[T] = new BuilderFactory[T,Set[T]] {
        def create() = new SetBuilder[T]
    }
}
object HighPriorityImports extends LowPriorityImports{
    implicit def singletonbf[T] = new BuilderFactory[T,Singleton[T]] {
        def create() = new SingletonBuilder[T]
    }
}
import HighPriorityImports._

Singleton(100).map(_.toString)

Singleton(100).map[String,List[String]](_.toString)

Singleton(100).map[(String,Int),Map[String,Int]](e => (e.toString,e))

Singleton(100).map(e => (e.toString,e))(mbf) // we (can always) speficy the builder factory
