package one

trait Store[+A] {
    def +[B >: A](b: B): Store[B]
    def contains(a: Any): Boolean
    def isEmpty: Boolean
}
object EmptyStore extends Store[Nothing] {
    def +[B](b: B): Store[B] = new LinkedListStore(b, this)
    def contains(b: Any) = false
    def isEmpty = true
}
class LinkedListStore[+A](val v: A, val rest: Store[A]) extends Store[A] {
    def +[B >: A](b: B): LinkedListStore[B] = new LinkedListStore(b, this)
    def contains(a: Any): Boolean = this.v == a || (rest contains a)
    def isEmpty = false // don't use a "val" here... this would lead to a new field!
}

object Main extends App {
    val a: Store[Int] = EmptyStore + 1 + 2
    val b: Store[Any] = a
    println(b contains 1)
    println(b contains 2)
    println(b contains 3)
}
