// Technische Universität Darmstadt
// Department of Computer Science
// Software Technology Group
// Michael Eichberg
//
// SED&C WS 16/17
//
// THIS CODE IS EXPECTED TO BE EXECUTED IN THE REPL. 

trait Builder[T,C[T]] {
    def add(t : T) : Unit
    def build : C[T]
}

class ListBuilder[T] extends Builder[T,List] {
    private var l : List[T] = List.empty
    def add(t : T) : Unit = l ::= t 
    def build : List[T] = l
}

case class Singleton[T](t : T) {
    def map[X,C[X]](f : T => X) (builder : Builder[X,C]) : C[X] = {
        builder.add(f(t))
        builder.build
    }
}

Singleton(100).map(_.toString)(new ListBuilder)

////// ADD

class SetBuilder[T] extends Builder[T,Set] {
    private var l : Set[T] = Set.empty
    def add(t : T) : Unit = l += t 
    def build : Set[T] = l
}

class SingletonBuilder[T] extends Builder[T,Singleton] {
    private var l : Singleton[T] = null
    def add(t : T) : Unit = if (l != null) throw new IllegalStateException else l = Singleton(t)
    def build : Singleton[T] = l
}

Singleton(100).map(_.toString)(new SetBuilder)

Singleton(100).map(_.toString)(new SingletonBuilder)

////// ADD (goal: to automatically supply a builder)

trait BuilderFactory[C[_]] {
    def create[T]() : Builder[T,C]
}

val lbf = new BuilderFactory[List] {
    def create[T]() = new ListBuilder[T]
}


///// REFINE

case class Singleton[T](t : T) {
    def map[X,C[X]](f : T => X) (bf : BuilderFactory[C]) : C[X] = {
        val builder = bf.create[X]()
        builder.add(f(t))
        builder.build
    }
}

Singleton(100).map(_.toString)(lbf)

///// REFINE

case class Singleton[T](t : T) {
    def map[X,C[X]](f : T => X) (implicit bf : BuilderFactory[C]) : C[X] = {
        val builder = bf.create[X]()
        builder.add(f(t))
        builder.build
    }
}


implicit val listbf = new BuilderFactory[List] {
    def create[T]() = new ListBuilder[T]
}

implicit val setbf = new BuilderFactory[Set] {
    def create[T]() = new SetBuilder[T]
}

implicit val singletonbf = new BuilderFactory[Singleton] {
    def create[T]() = new SingletonBuilder[T]
}

Singleton(100).map[String,List](_.toString)


///// REFINE


trait LowPriorityImports {
    
    implicit val lbf = new BuilderFactory[List] {
        def create[T]() = new ListBuilder[T]
    }

    implicit val sbf = new BuilderFactory[Set] {
        def create[T]() = new SetBuilder[T]
    }
    
}
object HighPriorityImports extends LowPriorityImports{

    implicit val singletonbf = new BuilderFactory[Singleton] {
        def create[T]() = new SingletonBuilder[T]
    }
}

Singleton(100).map[String,List](_.toString)
