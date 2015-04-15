#Scala Introduction

+~[Scala - a blend of different concepts]slide
Scala - a blend of different concepts
==============================================
* Fusion of functional and object-oriented programming
* Advanced language features 
	* Mixin composition with traits
	* Closures
	* Pattern matching with case classes
	* Expressive language
	* Macros 
* Advanced static type system
	* Unified type system 
	* Type inference (leads to more concise code)
	* Path-dependent types
	* Better documentation 
	
+~[Other features]aside
* Since 2.10 a subset of dynamic typing is available (via ['Dynamic'](https://weblogs.java.net/blog/cayhorstmann/archive/2012/12/13/dynamic-types-scala-210))
~+
	
+~[How is the expressive syntax achieved?]aside
* User-defined implicit conversions
* Changed sides of type annotation
* Semicolon inference
~+

~+
Scala lets you program in a pleasantly concise style and at the same time "you have the assurance that you will not outgrow the language" [s. PIS p 42-43]. Because Scala was designed to be easily extended and adapted to the needs of the people programming it, it gives you convenience and flexibility at the same time. It allows you to implement your own abstractions that address new domains, yet still feel like native language support, i.e. you can write your own types, control constructs or even a whole domain specific language and their use would 'feel' just like using built-in types or language features. 

Scala blends object-orientated and functional programming. In Scala really everything is an object, from primitives to function values, and every operation is a method call. For example, when you say `1+1` you are invoking the method `+` defined in the class `Int` on `1` - just as if you had written `1.+(1)`. 

Scala is also a functional language, i.e. it supports the following two main ideas:
* Functions are first-class values
* Operations should map input values to output values, rather than change data in place

The first means that you can pass functions as arguments to other functions, return them as results and bind them to variables. It is also possible to define a function in another function or to use functions anonymously. These features are convenient means for abstracting over operations and creating new control structures. They provide great expressiveness, which leads to legible and succinct programs. 

The second idea can also be stated in the way, that methods should not have any side effects. Functional programming usually encourages the use of immutable data structures and referentially transparent methods (for any given input the method call could be replaced by its result without affecting the programs semantics), but Scala gives you a choice here: When you want to, you can write in an imperative style with mutable data and side effects - i.e. writing statements rather than expressions - or you can choose to take the functional route and avoid imperative constructs.

[s. Programming in Scala 49ff]

Suereth (Scala in Depth) gives a quick overview over attributes commonly associated with the two different paradigms in Scala in Depth :

<table>
    <tr>
        <th>Object-orientated programming</th>
		<th>Functional programming</th>
    </tr>
	<tr>
        <td>Composition of objects </td>
		<td>Compositions of functions</td>
    </tr>
	<tr>
        <td>Encapsulated stateful interaction</td>
		<td>Deferred side effects [Immutable objects!]</td>
    </tr>
	<tr>
        <td>Iterative algorithms</td>
		<td>Recursive algorithms</td>
    </tr>
	<tr>
        <td>Imperative flow</td>
		<td>Lazy evaluation</td>
    </tr>
	<tr>
        <td>N/A</td>
		<td>Pattern matching</td>
    </tr>
</table>

He illustrates this with two code examples that achieve the same results (a full cat) with different means:

```scala
class Bird
class Cat{
	def catch(b:Bird): Unit = ...
	def eat():Unit = ...
}
val cat = new Cat
val bird = new Bird
cat.catch(bird)
cat.eat
```

```scala
trait Cat
trait Bird
trait Catch
trait FullTummy

def catch(hunter: Cat, prey: Bird): Cat with Catch
def eat(consumer: Cat with Catch): Cat with FullTummy

val story = (catch _) andThen (eat _) // functional composition
story(new Cat, new Bird)
```

+~[Literature]slide
Literature
==================
* Odersky, M., Spoon, L. & Venners, B. 2011. *Programming in Scala (2nd ed.)*.
* Suereth, Joshua D. 2021. *Scala in Depth*.
* Larman, C. 2004. *Applying UML and Patterns: An Introduction to Object-Oriented Analysis and Design and Iterative Development*.
* Gamma, E., Helm, R. & Johnson, Ralph E. 1994. *Design Patterns: Elements of Reusable Object-Oriented Software*.
* Meszaros, G. *xUnit Test Patterns: Refactoring Test Code*.
* Martin, Robert C. 2008. *Clean Code: A Handbook of Agile Software Craftsmanship*.
* Martin, Robert C. 2011. *Agile Software Development - Principles, Patterns and Practices*.

~+

Additional Learning Resources
---------
A good starting point would be [the Scala documentation.](http://www.scala-lang.org/documentation/)

Twitter made a series of concise and succinct in-house lectures public: [Scala School](http://twitter.github.io/scala_school/)

There are numerous blogs, for example:

   <http://joelabrahamsson.com/programming/scala>

   <http://www.codecommit.com/blog/scala/scala-for-java-refugees-part-1>
   
   <http://danielwestheide.com/scala/neophytes.html> (for the advanced learner)

A free eBook, if you like:

[Odersky, M., Spoon, L. & Venners, B. 2008. Programming in Scala.](http://www.artima.com/pins1ed/)

Or a free video tutorial that focusses on functional programming by Martin Odersky:

[Functional Programming Principles in Scala](https://www.coursera.org/course/progfun)

+~[Use the Read Eval Print Loop]aside
Use the Read Eval Print Loop
===
We strongly encourage you to get your hands on as early as possible and experiment with the language while learning the core concepts: *It is more fun and helps you to stay motivated!*

Assuming that you have Scala properly installed and set your path - [look here for help](http://www.scala-lang.org/old/node/201) - you can experiment with the language by using the Read Eval Print Loop (REPL). The REPL is an interactive shell, that compiles Scala code and returns results/type immediately. To work around the REPLs eager parsing, you can use the command `:past` or use a Scala IDE-plugin called `Worksheet`, i.e. a multi-line REPL that evaluates every time you save it. A workaround for dynamically reloading class files within a running JVM can be found on p.21 in Suereth, J. 2012. `Scala in depth`.

Now start the REPL by running 'scala' on the command line and print "Hello World" on the screen.

```scala
scala> Console.println("Hello World!")
```
Can you think of other ways to print "Hello World!"?

~+

+~aside
```scala
scala> println("Hello World!")
scala> Console println "Hello World!"
scala> System.out.println("Hello World!")
```
~+

#Getting a glimpse of the syntax
+~[Getting a glimpse of the syntax]slide
Getting a glimpse of the syntax
===
```scala
 def quicksort[T <% Ordered[T]](list: List[T]): List[T] = {
    list match {
      case Nil => Nil;
      case x :: xs =>
        val (before, after) = xs.partition({ i => i.<(x) });
        quicksort(before).++(quicksort(after).::(x));
    };
  }
```
[SID, p.9]

~+

* `T <% Ordered[T]`  
This function accepts a list of some type T, that is able to be implicitly converted into a variable of type Ordered[T]
* `match`  
For now, think of this as a very powerful switch-statement
* `x :: xs`   
If we do not encounter an empty list, we extract the head and tail of the list and name them x and xs
* `xs.partition({ i => i.<(x) });`   
We then call a function on the tail, that partitions the list according to a (anonymous) function `i => i.<(x)` that compares each element in tail to the pivot-element x   
* `quicksort(before).++(quicksort(after).::(x));`   
We call quicksort recursively and combine the sorted partition and the head into a new list

+~slide
Getting a glimpse of the syntax
===
```scala
 def quicksort[T <% Ordered[T]](list: List[T]): List[T] = {
    list match {
      case Nil => Nil;
      case x :: xs =>
        val (before, after) = xs.partition({ i => i.<(x) });
        quicksort(before).++(quicksort(after).::(x));
    };
  }
```
"You may be thinking, 'Wow, Scala looks ugly.' In this case you would be right." [SID, p.10]

So let's do better...

~+

+~slide
Getting a glimpse of the syntax
===

```scala
def quicksort[T <% Ordered[T]](list: List[T]): List[T] = list match {
    case Nil => Nil;
    case x :: xs =>
      val (before, after) = xs partition (_ < x);
      quicksort(before) ++ (x :: quicksort(after));
  }
```

Note that 
* `x.foo();` is the same as `x foo`
* `x.foo(y);` is the same as `x foo y`
* `x.::(y);` is the same as `y :: x`

+~[Why is cons right associative?]aside
Every method that ends on a `:` reverses the order of the method call. `cons` (i.e. '::') for example, is therefore right associative. That means, in our example cons is invoked on `quicksort(after)`, passing x as a parameter. Note that x is prepended in constant time! 

~+

~+



# Variables

+~[Variables]slide
Variables
===

```scala
// some values
val pi = 3.142          // implicit-type: Double
val e: Float = 2.718f   // explicit-type: Float
val g = 9.81f           // implicit-type: Float

// some variables
var r: Float = 5            // Type: Float
var cycleArea = pi * r * r  // Type: Double

var mass = 60               // Type: Int
var force = mass * g        // Type: Float


// Greatest common divisor of x and y
var x = 3
var y = 6
while (y != 0) {
  val tmp = x % y
  x = y
  y = tmp
}
val gcd = x
```

~+

## Value types
Scala's type-system has a separated sub-system with value-types (every type extending `AnyVal`).
Scala supports the same types than Java (except of capitalisation):
* floating point number: Float, Double
* integer: Byte, Short, Int, Long
* character: Char
* logical data type: Boolean

Different to Java these types are defined as classes and operations (like `+`, `==`, `&&`, ...) are defined as functions on this classes.

## Variables
A variable can be declared with the keyword `var`:
* `var <variable_name> = <initial_value>`

Local variables must have a initial value.

As you can see, in Scala you don't need an explicit type-declaration if the compiler can infer the right type. But if you need a specific type or the compiler might be unable to infer the type, you can always manually declare a type:
* `var <variable_name>[:<type>] = <initial_value>`

The `r`-declaration is a good example where a type-declaration can be needed: the compiler would have inferred the type `Int` but if you strictly (for whatever reason) need or would like to have a `Float`-value you can declare `r` to be so.

If you declare a variable of some explicit type and want to initialize with a default-value, you can use the default-value `_`. This default-value can be used for every type and gets converted into:
* `0` for number-types
* `false` for boolean variables
* `null` for reference-types

## Values
A value can be declared with the keyword `val`:
* `val <value_name>[:<type>] = <initial_value>`

A value is a variable, that can only be assigned once.

As in the example of variables, value don't need an explicit type but can have one.

## Constants
A constant in Scala can be declared with:
* `final val <constant_name>[:<type>] = <initial_value>`

The difference between values and constants is, that a constant always returns the same result, whereas a value (for example a class attribute) can in some cases be overridden by a subclass.

## Class attributes
A declaration of a class attribute is similar to a declaration of a local variable, value or constant:
* `var <attribute_name>[:<type>] = <initial_value>`
* `val <value_name>[:<type>] = <initial_value>`
* `final val <class_constant>[:<type>] = <initial_value>`

Class attributes can be declared as variables, value or constants and can have explicit types.

# Loops

## While-loops
Java knows a `while`- and a `do-while`-loop. Both structures are available in Scala, too. The syntax in Java and Scala is the same:

```scala
while(condition) {
  statement
}

do {
  statement
} while(condition)
```

## For-loops in Java (small revision)
Java knows two kinds of `for`-loops:
1. a variant to use some variable that gets modified after each iteration
1. a variant to iterate over something extending `Iterable`

### For with some variable
The first structure isn't much more than some additional syntactic sugar to a `while`-loop.

```java
for (declaration; condition; modifier) {
  statement
}
```

is the same as

```java
declaration
while (condition) {
  statement
  modifier
}
```

### For with iterable
The second variant omits some 'counter' and uses an `Iterator` and hence the following constructs are equivalent (except of the fact, that the variable `it` isn't accessible):

```java
for (Type tmp_name : iterable) {
  statement
}
```

```java
Iterator it = iterable.iterator();
while (it.hasNext()) {
  Type tmp_name = it.next();
  statement
}
```

## For-loops in Scala
To explain `for`-loops in Scala, it is easier to start with the second variant. Scala uses (as usual) some other syntax but the semantic is the same:

```scala
for (tmp_name <- iterable) {
  statement
}
```

The temporary variable can be declared together with some explicit type (compatible with the one of the `Iterable`'s elements) but needn't to.

+~aside
The first variant isn't available in Scala and hence if you need some loop **exaclty** behaving like a `for`-loop with variable (for example if the statement should be able to manipulate the variable, too) you have to use the while-counterpart. But as shown below, in most cases some pretty alternatives are possible.

~+

Scala offers some possibility to use the Scala `for`-loop much like the Java `for`-loop with variable:  
In Scala you can declare a `Range` of numbers with can be seen as a list-like collection containing the elements between the given limits:

```scala
scala> (0 to 5)
res0: scala.collection.immutable.Range.Inclusive = Range(0, 1, 2, 3, 4, 5)

scala> (0 until 5)
res1: scala.collection.immutable.Range = Range(0, 1, 2, 3, 4)
```

This `Range` is iterable and hence you can use the `for`-loop like:

```scala
for (i <- 0 to 5) {
  statement
}
```

which is pretty much like the Java's

```java
for (int i = 0; i <= 5; i ++) {
  statement
}
```

As you can see, the increment isn't specified in the Scala version, because Scala uses a default increment with +1. But you can add some increment-policy to the `Range`:

```scala
for (i <- 0 to 5 by 2) {
  statement
}
```
which would lead to executions with `i` having the values 0, 2 and 4.

Using a policy, decrements are possible, too:

```scala
for (i <- 5 to 0 by -1) {
  statement
}
```

Ranges aren't limited to integer numbers but can be used with floating point numbers (and floating point increments), too.

### Filter
Within a `for`-loop some filters can be applied:

```scala
for (i <- 0 to 100 if i % 2 == 0; if i % 3 == 0) {
  statement
}
```

This examples shows a loop that will be executed each time `i` is less or equal to 100 and is a multiple of 6 (checked by two different filters). To omit the semicolon, the parantheses can be replaced by curly braces and then the single statements can also be separated by linebreaks:

```scala
for {i <- 0 to 100
    if i % 2 == 0
    if i % 3 == 0} {
  statement
}
```

### Nested loop
Instead of using two nested `for`-loops, this can be done by one `for`-loop declaring two variables:

```scala
val lists = List(List(0, 1, 2, 3), List(-5, -3, 7), List(5), List(42, 23))
for {list <- lists
    if list.length > 1
    el <- list
    if el > 0} {
  println(el)
}
```

In this example the List of Lists gets iterated and every list containing more than one element (which means that `List(5)` is skipped) gets iterated and finally every positive element gets handled and therefore printed.

```scala
for {x <- 0 to 100
    y <- x to 100} {
  statement
}
```

### Functional alternative
Using Scala's functional aspects `for`-loops also can be written without any loop:

```scala
(0 to 5).foreach(println)
```

If you want to apply some function to every value of the 'counter'-variable, you can also declare the `Range` and than pass the function and let the `Range` apply the function to each element.

Or you can use the values to instantiate some class within some new `Collection`:

```scala
scala> class Value(i: Int) {def get = i; override def toString() = "Value(" + i + ")"}
defined class Value

scala> (1 to 3).map(new Value(_)).toList
res2: List[Value] = List(Value(1), Value(2), Value(3))
```

The `map`-function returns some (list-like) `Collection`; the `toList`-function then returns a `List`.


# Functions
+~[Functions]slide
Functions
===

```scala
def add(x: Int, y: Int): Int = x + y
def nextRandomInt(): Int = { ... }
def getValue: Int = { ... }
def setValue(value: Int): Unit = { ... }  // return-type Unit explicit
def applyFunction(f: (Int, Int) => Int)(x: Int, y: Int): Int = {
  f(x, y)
}

def exampleCalls = {                      // return-type Unit implicit
  val result = applyFunction((x: Int, y: Int) => x + y)(4, 5)
  val random = nextRandomInt()   // with optional braces
  val someValue = getValue
}

def difference(a:Int, b:Int): Int = {
  val rawDiff = a - b
  if (rawDiff < 0)   // the return-value is the result of this if expression
    -rawDiff
  else
    rawDiff
}

def gcd(x: Int, y: Int): Int = {
  if (y == 0) x else gcd(y, x % y)
}
```

~+

## Function Definition and Usage
To define a function you need the keyword `def`:
* `def <function_name>(<parameter_list>)[:<return_type>] = {<function_body>}`  
where `<parameter_list> := [<formal_parameter>: <type>]*`

As a consequence of the fact that nearly everything in Scala is an expression, you don't need the keyword `return` to specify the return-value. The function-body is the return-value. If your function is built up of multiple statements, the last one specifies the return-value (difference-example).

If your function should not have any return-value you can set the return-type to `Unit` (the Scala equivalence to Java's `void`):
* `def setX(x: Int): Unit = {...}`

If the compiler can determine the function-body's result-type you can omit the return-type.
* `def setY(y: Int) = {...}` is equivalent the the one above if the last statement in the function-body is of type Unit

If your function doesn't have any parameters you can omit the braces, but the function's behavior depends on the kind of declaration:
* a function-call of a parameterized function works like in Java:  
`add(4, 5)`
* a function-call of a not-parameterized function with braces also works like in Java:  
`nextRandomInt()`  
**but**: the expression `nextRandomInt` can mean both the function (e.g. as parameter) or the function-call. The compiler analyzes the target-type and depending on this type either evaluates the function or simply returns the function-definition.
	* if the target-type is the result-type, the function gets evaluated
		```scala
		scala> val x: Int = nextRandomInt
		x: Int = 5 // some random int
		```
	* if the target-type is a function (with same signature), the function gets assigned
		```scala
		scala> val x: ()=> Int = nextRandomInt
		x: () => Int = <function0>
		```
	* if the target-type isn't explicitly given, the function gets evaluated
		```scala
		scala> val x = nextRandomInt
		x: Int = 2 // some random int
		```
	* if the target-type isn't suitable, the code doesn't compile
		```scala
		scala> val x: String = nextRandomInt
		<console>:8: error: type mismatch;
		 found   : Int
		 required: String
		       val x: String = nextRandomInt
		                       ^
		```
* a function-call of a not-parameterized function without braces works like an attribute:  
`getValue` returns the result (`getValue()` does not compile)

Scala supports higher-order functions. That means that one function (`applyFunction`) can accept another function (e.g. `add` or the given lambda-expression) as parameter. A function can be passed to another function by naming the function and omitting the braces. This works well for functions with braces at definition. For functions without braces you have to define some kind of anonymus function using the underscore (for example `getValue _`).

## Function Types
A function can be represented by it's type. This type describes the argument types and return type:
```scala
Function-Type  ::= FunctionArgs '=>' ReturnType
FunctionArgs   ::= '(' [ ParamType {',' ParamType } ] ')'
```

Examples:
* `add` has type `(Int, Int) => Int` because it returns an Int and accepts exactly two Int arguments
* `nextRandomInt` has type `() => Int` because it returns an Int but doesn't accept arguments
* `setValue` has type `(Int) => Unit`
* `applyFunction` has type `((Int, Int) => Int) => ((Int, Int) => Int)` where the first argument is a function type itself
* some function `fun(x: T1*): T2` where `x: T1*` is the Scala counterpart to Java's `T1... x` which both means, that any number of values of the given type can be passed in, would have type `(Seq[T1]) => T2`

Functions can be defined anonymously like the first parameter of the `applyFunction`-application in `exampleCalls`. The lambda-expression defined here is equivalent to the add function. As you can see, you define a lambda-expression by declaring the typed function-arguments and the function-body.
* `<parameter_list> => <function_body>`  
 where `<parameter_list>` is defined like it is for named function-definitions.

To apply a given function just pass the arguments to the function as you would do it with other defined functions.

## Currying
A function-definition can have multiple braces with multiple arguments (as in the `applyFunction`-example). This leads to functions that will be executed in several steps. If we take a look at `applyFunction`: First, a "calculation rule" is passed to the function, which results in some mathematical function; Then the arguments can be passed to evaluate the function's result.
* `applyFuntion(add)` would result in a function with the signature `(Int, Int) => Int` and would behave like `add`.

Functions can be defined nested. That means that you can define a function inside another function. The nested definition is only visible inside the surrounding function.

# Classes

+~[Classes]slide
Classes
===

```scala
class Rational(n: Int, d: Int) {
  private val g = gcd(n, d)
  val numerator: Int = n / g
  val denominator: Int = d / g
  private def gcd(x: Int, y: Int): Int = {
    if (x == 0) y
    else if (x < 0) gcd(-x, y)
    else if (y < 0) -gcd(x, -y)
    else gcd(y % x, x)
  }
  def +(r: Rational) =
    new Rational(numerator * r.denominator + r.numerator * denominator, 
	denominator * r.denominator)
  def -(r: Rational) =
    new Rational(numerator * r.denominator - r.numerator * denominator, 
	denominator * r.denominator)
  def *(r: Rational) = new Rational(numerator * r.numerator, 
    denominator * r.denominator)
  def /(r: Rational) = new Rational(numerator * r.denominator, 
    denominator * r.numerator)
  override def toString = numerator + "/" + denominator
}
```

+~[Constructors]aside
The identifiers n and d in the parentheses directly after the class name, are called class parameters. The compiler takes them and creates a primary constructor that takes these two arguments. In fact everything in the class body that is not part of a field or method definition is placed in this constructor, like the debug message in the example below. The class parameters can be accessed from inside the class, but not be reassigned. If you would prefix the class parameters with `val` resp. `var`, they would be maintained as fields and getters respectively getters & setters would be implicitly provided. Preconditions can be checked with [`require`](http://www.scala-lang.org/api/current/index.html#scala.Predef$). Every other constructor in the class is an auxiliary constructor. Every auxiliary constructor must invoke another constructor of the same class first, either another auxiliary or the primary constructor. The first statement will therefore always be `this(...)`. Every constructor will eventually end up calling the primary constructor and from there, superclass-constructors can be called. A constructor is not a special method, so the parameters visibility could be private or protected as well. It is also possible to provide default values. Every arbitrary field that is not given a value at object creation time uses the standard values:

```scala
scala> class Constructors(a1: Int = 1, a2: Int = 2, a3: Int = 3){
     | println("A1: %s, A2: %s, A3:%s" format(a1, a2, a3))}
defined Class Constructors
scala> new Constructors() 
A1:1, A2:2, A3:3
res1: Constructors = Constructors@...
```
We again recommend that you try it for yourself with the REPL. Define the class and make some objects.

```scala
scala> new Constructors(5, 5) 
A1: 5, A2: 5, A3: 3
...
scala> new Constructors(a1 = 5, a3 = 5)
A1: 5, A2: 2, A3: 5
...
```
[More information on constructors (German language)](http://timpt.de/topic179.html])

~+

~+

The example is taken from Odersky, M.(2011). [Scala by Example](http://www.artima.com/pins1ed/functional-objects.html)
If you would like to get a more thorough understanding of the example (and further refined versions of it), feel free to skim over its sixth chapter.   
The fields numerator and denominator are defined as values, but could have been defined as parameterless methods as well: `def numerator :  Int = n / g`. The difference is, that as a value, the right-hand side is evaluated when the object is created and the method evaluates every time it is called.

# Objects
+~[Singleton objects]slide
Singleton objects
===

```scala
object Rational {
  def apply(n: Int, d: Int) = {
    new Rational(n, d)
  }
}
object printRational extends App {
  val one_half = Rational(1, 2)
  println(one_half)
}
```

+~[The apply-method]aside
The *apply*-method is called every time arguments in parentheses are applied to an object. 

```scala
val nums = Array(1,2,3,4,5,6,7,8,9,10) 
//calls `apply`, is equal to val nums = Array.apply(1,2,3,4,5,6,7,8,9,10)
```
Of course, you can define apply in your own class and use it for a factory method for example:

```scala
class Fubar {}
object Fubar {
  def apply() = new Fubar
}
val myFubar = Fubar() //my:Fubar = Fubar@...
```

~+

~+

Classes and objects can have the same name. If they are in the same source file, then the object is called a `companion object` and the class `companion class`. A companion object can access its classes private fields et vice versa. Scala classes cannot have static members. Any static methods you would have written in Java go into Singleton object(s) in Scala (the Java analogy to a companion object in Scala would be a class with static methods). They are invoked via the objects name, followed by a dot and the function name. 

Objects do not define a type!

# Case Classes
+~[Case Classes]slide
Case Classes 
===
* `case` modifier makes the compiler add some things to your class
	* a factory method
	* 'natural' implementations of `toString`, `equals` and `hashCode`
	* all arguments in parameter list get a `val` prefix, i.e. they are visible from the outside and cannot be reassigned
	* support arbitrarily deep pattern matching, i.e. the members of an object are checked for further patterns
```scala
scala> case class Address(street:String)
defined class Address

scala> case class Employee(address:Address)
defined class Employee

scala> val person = Employee(new Address("Sesamestreet"))
person: Employee = Employee(Address(Sesamestreet))

scala> person match {case Employee(Address(street))=>println(street)}
Sesamestreet
```	
	
+~[How Scala´s equals differs from Java´s]aside
In Java `==` compares reference equality on reference types. If you would like to do this in Scala,
you would have to use `eq` or `ne`. In Scala `equals`, respectively `==`, compares value equality on all types.

~+

~+

# Traits

+~[Traits]slide
Traits
===
* Collection of behaviour and state 

* A trait with only abstract members translates directly to a Java interface

* Mixin composition allows to take the members of a class and add the members of (multiple) traits to it without running into the diamond-inheritance problem 

* Traits can add new functionality to an unspecified superclass
~+

+~slide
Traits
===

```scala
abstract class Robot {

}
class Android extends Robot {
  def calculate(s: String) = "Calculating " + s
}
trait GenuinePeoplePersonality extends Robot {
  def nag(s: String) = s + "...I feel bored and depressed!"
}
object TestMarvin extends App {
  val Marvin = new Android with GenuinePeoplePersonality   
  val calculateWithGPP = Marvin.calculate _ andThen Marvin.nag _
  println(calculateWithGPP("1+1")) 
  //Calculating 1+1...I feel bored and depressed
}
``` 

"Mixin-class composition allows the programmers to reuse the delta of a class definition, i.e. all new definitions that are not inherited"
[(A Tour of Scala)](http://www.scala-lang.org/old/node/117)

~+


+~slide
Traits versus abstract classes
===
* One class can extend *several* traits using the `with` keyword
* Abstract classes can take parameters - traits do not have constructors
* Subclassing traits in Java code can be awkward
* When a trait gains or loses a member, any classes that inherit from it must be recompiled

~+

Keep traits short and try to express the smallest related idea possible to achieve greater modularization! 

# Inheritance
+~[Inheritance]slide
Inheritance
===
* Compiler assumes that all classes extend [scala.AnyRef](http://www.scala-lang.org/api/current/index.html#scala.AnyRef) 
* As in Java `A extends B` means, that 
	* A becomes a subtype of B
	* A inherits all non-private members from B
	* A overrides members of B with the same name and parameters
	* A implements members of B if they are abstract	
* (Subtyping) polymorphism and dynamic binding as you would expect it coming from Java

~+

+~slide
Inheritance
===
* `abstract` modifier is mandatory for classes with abstract members
* `abstract` modifier is not necessary or allowed for abstract methods (no body or no '=')
* `override` modifier is
	* *optional* if a member implements an abstract member with the same name
	* *required* if a member overrides a concrete member in a parent class
	* *forbidden* if a member does not override or implement some other member 
* `final` members cannot be overridden
* Invoking superclass constructors is straightforward
	```scala
	...extends B(someValue)...
	```

+~[Override conventions and the 'fragile base class problem']aside
If a method with a name that is already used by clients is introduced in your framework, the clients are given an error once they recompile their code (instead of changed, possibly wrong behaviour) 

~+

~+

+~slide
Inheritance
===
* TODO Scala has two namespaces for defining
	* values (fields, methods, packages and singleton objects)
	* types (class and trait names)
	* ```scala 
		class fubar{
			val f = 0
			def f = 1
		}///won´t compile!
		```

+~[Overriding a parameterless method with a field]aside
Since fields and methods are in the same namespace, fields may override parameterless methods

```scala
scala> abstract class rabbit{
     | def isDangerous : Boolean
     | }
defined class rabbit

scala> class trojanRabbit(
     | val isDangerous : Boolean = true) extends rabbit
defined class trojanRabbit
```

~+

~+

# Enums

+~[Enums]slide
Enums
===

```scala
object WeekDay extends Enumeration {
  type Operator = Value
  val Mon, Tue, Wed, Thu, Fri, Sat, Sun = Value
}

object Size extends Enumeration {
  type Size = Value
  val Small = Value("S")
  val Medium = Value("M")
  val Large = Value("L")
}
```

~+

Java offers built-in support for enum-types, so that you can define something like:

```java
public enum WeekDay {
  Mon, Tue, Wed, Thu, Fri, Sat, Sun;
}
```

This comes like some sort of special class. Scala hasn't something like a class-type enum but Scala also supports Enums. In Scala you simply extend the class `Enumeration` and create a value for every element and initialize it with `Value`.

The type-declaration is a simple type-alias so that you can write `Mon` instead of `WeekDay.Mon`.

If you define an enum like in the `WeekEnd`-example (taken from the [Scala Api](http://www.scala-lang.org/api/current/index.html#scala.Enumeration)) each element has a `String`-representation equivalent to the given name. If you want some other kind of representation, you can define the elements together with a specific `String` like in the `Size`-example.

+~[Alternative approach for enums]aside
As enums aren't supported natively there isn't one solution for this problem but several. Besides the one shown here, at least one other is very common: The use of case objects. Both ways have there advantages and disadvantages. An example and a comparison can be found [here](http://stackoverflow.com/questions/1898932/case-classes-vs-enumerations-in-scala)

~+

# Generics
+~[Generics]slide
Generics
===

```scala
val list = List[Number](new Integer(42))
val extendedList = new Integer(23) :: list

def printAlias[T <: Any](arg: T) = println(arg)

def printAll(list: List[Number]): Unit = {
  list match {
    case hd :: tl =>
      printAlias(hd)
      printAll(tl)
    case List() => ()
  }
}

def addToCollection[T <: Number](el: T, list: List[Number]): List[Number] = {
  el :: list
}

val longestList = addToCollection[Integer](new Integer(0), extendedList)

printAll(longestList)
// returns: 0, 23, 42 (one line each)
```
~+

Generics in Scala are semantically identical to Java. The notation differs from each other:
* `Collection<Type>` in Java equals `Collection[Type]` in Scala
* `Collection` or `Collection<?>` in Java equals `Collection[_]` or `Collection[T] forSome { type T }` in Scala 
* `Collection<? extends Number>` in Java equals `Collection[_ <: Number]` or `Collection[T] forSome { type T <: Number }` in Scala
* `public <T extends Number> T add(T n1, T n2)` in Java equals `def method[T <: Number](n1: T, n2: T): T` in Scala

Scala offers the possibility to define types and to (re-)use them later. This types can be generic, too, like in the example of collType.

# Pattern Matching

+~[Pattern Matching]slide
Pattern Matching
===
Basics
---

```scala
val SpecialCase = ...
var intValue: Int = ...
intValue match {
  case SpecialCase => println("number is " + SpecialCase)
  case 1 => println("number is 1")
  case 2 => println("number is 2")
  case 3 | 4 => println("number is 3 or 4")
  case _ => println("number wasn't between 1 and 4 or " + SpecialCase)
}

var someValue: AnyVal = ...
someValue match {
  case i: Int => println("value is an integer: " + i)
  case b: Boolean => println("value is bool: " + b)
  case c: Char => println("value is a char: " + c)
  case _: Double | _: Float => println("value is some floating point number!")
  case ref => println("type couldn't be determined! " + ref.getClass())
}
```

~+

Pattern matching is a very powerful variant of Java's switch-statement.

Different to Java, exactly one case will always get executed. If two patterns would fit, the first one gets executed.

You can use pattern matching like switch-statements in Java (first example).  
Note that the value `SpecialCase` starts with a upper letter and that otherwise the case-clause wouldn't work as expected (the compiler could not find the value otherwise). You can combine several pattern using '`|`' so that the case is executed if at least one of the pattern matches the given argument. The last pattern `case _` is the Scala equivalent to Java's `default`.

You can use pattern matching as a clean solution for type-checking instead of `instanceof`-checks (for example for value-types as shown in the second example).  
If the given value is of type `Int` the first case matches and gets executed and the (`Int`-)value is accessible via the identifier `i`. If you only need the type but not the actual value, you can use the wildcard `_` (`Float`-example). The default case can be 'named', too, like in the `ref`-line, so that you can try some further (manual) checks.

In addition to the patterns you can use so-called **guards** (additional conditions) for further specification.  
You can replace the `case i: Int ...`-line by the following ones to identify integer together with there sign:

```scala
  case 0 => println("value was zero!")
  case i: Int if i > 0 => println("value was a positive integer: " + i)
  case i: Int => println("value was a negative integer: " + i)
```
The last case only gets executed for negative integer because positive integer and zero are handled previously and, as said above, only one case gets executed.

+~[match compared to switch]aside
"match-Expressions can be seen as a generalization of Java-style switches."(Odersky et al.)
But there are three differences to keep in mind:
* `match` is an expression, it always results in a value
* No "fall through" into next case
* If no pattern matches, `MatchError` is thrown - so cover all cases or add a default

~+

+~slide
Pattern Matching
===
Advanced
---

```scala
case class CaseClass(i: Int, s: String)
case class RecCaseClass(c: RecCaseClass = null)

var someRef: AnyRef = ...
someRef match {
  case hd :: Nil => Nil
  case hd :: 7 :: tl => hd :: tl
  case CaseClass(0, "") => CaseClass(1, "initial text")
  case CaseClass(no, "inc") => CaseClass(no + 1, "inc")
  case CaseClass(no, "dec") if no > 1 => CaseClass(no - 1, "dec")
  case CaseClass(42, _) => CaseClass(42, "the answer")
  case c @CaseClass(_, _) => CaseClass(c.s.toInt, c.i.toString)
  case RecCaseClass(RecCaseClass(content)) => content
  case default => default
}

val hd :: tl = List(1, 2, 3) // hd = 1; tl = List(2, 3)
val _ :: el :: _ = List(1, 2, 3) // el = 2
val CaseClass(i, s) = CaseClass(18, "adult") // i = 18, s = "adult"
val (t1, _, t2) = (9, 5, 1) // t1 = 9, t2 = 1
```

~+

Besides the value and the type, the structure of some variable can be matched:
1. for lists with exactly one element the empty list can be returned
1. for lists with some specific element at some specific position, some modifications can be applied (e.g. this element can be removed)
1. for case classes with specific parameters, a completely different instance can be constructed
1. for case classes with some specific parameter, some other parameter can be influenced
1. for case classes with some specific parameter and some additional condition, some other parameter can be influenced
1. for case classes with some specific parameter, some other parameter can be replaced
1. you can bind the whole pattern to some name while matching some class (and possibly some parameters, too)
1. you can match some deep structure and deconstruct it
1. you can simply return the argument if no pattern matched

Pattern matching works also outside of match-statements:
* some list can be deconstructed via a pattern
* some element of a list can be extracted
* some case class can be deconstructed
* some tuple-members can be extracted (further information on Tuples at the end of this slides)

+~[How values got extracted]aside
If you use a sctructural pattern matching, the expressions define some deconstruction-logic. Hence, the used elements must support this deconstruction and therefore have to implement an `unapply`-method. Case classes do this by default (as part of the 'case class-magic') and Lists, too.

The expression `hd :: 7 :: tl` therefore describes a double-deconstruction of a List:
* First the head-element of the List is separated from the tail: `1st :: list'`
* Then the first element of the tail is separated to get a triple of `1st :: 2nd :: list''`
* At least the elements get compared or related to the original pattern `hd = 1st`, `7 == 2nd` and `tl = list''`

Further information about the `unapply`-method (also referred to as Extractor) can be found [here](http://www.scala-lang.org/old/node/112).

~+

# Visibility

+~[Visibility]slide
Visibility
===

```scala
class Visibility {
  private val id = ...
  protected var name = ...
  def compare(v: Visibility): Int = {
    id - v.id // works (v.id is accessed within the defining class)
  }
  def copyNameFrom(v: Visibility) = {
    name = v.name // works (v.name is accessed within the defining class)
  }
}

class Subtype extends Visibility {
  def getName = name // works (is equivalent to this.name)
  override def copyNameFrom(v: Visibility) = {
    name = v.name // would not work (v.name is not accessible)
  }
}
```

~+

Definitions of classes, traits, objects and members of this definitions (functions, attributes, etc) are public by default. But the visibility (and thereby the accessibility) can be limited to private or protected visibility. The visibilities are defined similarly to Java with some small differences:
* protected members can be accessed within the same instance or a subtype, but then only in a context like `this.protectedMember` 
* Scala has no explicit modifier for Java's (default) package-visibility.

At this point of knowledge, Scala seems less powerful than Java, but Scala offers the possibility to parameterize a visibility-modifier:
* you can parameterize the modifier with some class: `protected[class]` or `private[class]`
* you can parameterize the modifier with some class: `protected[package]` or `private[package]`
* you can parameterize the modifier with the active instance: `protected[this]` or `private[this]`

The same parameters are allowed for the private modifier, but private[scope] can be more stricly than protected[scope]:
* `protected` is (very much) the same as protected[classname]
* `private` is (very much) the same as private[classname]
* `private[packagename]` or `protected[packagename]` defines a visibility similar to Java's package-visibility
* using the scope `private[this]` (or `protected[this]`, which would be equivalent) for `id`, the access `v.id` in `compare` would be impossible
* using the scope `protected[packagename]` (or `private[packagename]`) for `name`, the access `v.name` in `copyNameFrom` in `Subtype` would be possible

Note that Scala interprets packages in some kind of hierachy: Assume you have a package called outerPackage and you define a package outerPackage.innerPackage the innerPackage is a sub-package of the outerPackage and therefore classes in the innerPackage can access members of outerpackage with 'package' visibility, which would not be possible in Java.

+~aside
You can find some further information on Scala's visibilities and the differences between Scala and Java [here](http://j2eethoughts.wordpress.com/2010/12/12/access-modifiers-scala-java/).

~+

# Exception Handling

+~[Exception Handling]slide
Exception Handling
===
In Scala all exceptions are unchecked and usually caught via pattern matching

```scala
try {
  PreparedStatement stmt =
    conn.prepareStatement("INSERT INTO urls (url) VALUES (?)")
  stmt.setObject(1, new URL("http://www.codecommit.com"))
  stmt.executeUpdate()
  stmt.close()
} catch {
  case e: SQLException => println("Database error")
  case e: MalformedURLException => println("Bad URL")
  case e => {
    println("Some other exception type:")
    e.printStackTrace()
  }
} finally {
  conn.close()
}
```

see [Scala for Java Refugees Part 4: Pattern Matching and Exceptions](http://www.codecommit.com/blog/scala/scala-for-java-refugees-part-4)

~+

Catching all Throwables with `case e => ...` or `case _ = ...` however is error-prone and should be avoided by any means. Control structures like [break](http://www.scala-lang.org/api/current/index.html#scala.util.control.Breaks) or [continuations](http://www.scala-lang.org/api/current/index.html#scala.util.continuations.package) use [ControlThrowables](http://www.scala-lang.org/api/current/index.html#scala.util.control.ControlThrowable) for flow control, so simply catching all Throwables would possibly break the code. 
Let us have a look at a piece of code from [Spiros Tzavellas Blog](http://www.tzavellas.com/techblog/2010/09/20/catching-throwable-in-scala/) showing another reason, why you really should not catch all Throwables:

```scala
def containsEven(nums: String*): Boolean = {
  try {
    for (i <- nums) {
      if (i.toInt % 2 == 0)
        return true
    }
  } catch { case e => () }
  false
}
```

You would expect the code to take an arbitrary number of strings and return true, if there is an even number among them, right?

Unfortunately, it always returns false, because the body of the for loop throws a [NonLocalReturnControl](http://www.scala-lang.org/api/current/index.html#scala.runtime.NonLocalReturnControl@inheritance-diagram) that is caught by the enclosing try block.
That is because the for loop actually calls `foreach` on `nums` and passes the body of the for loop as a [closure](http://en.wikipedia.org/wiki/Closure_%28computer_science%29), in this case a `Function1`. Because of the return, the closure triggers the return of the enclosing method instead of returning at the point of invocation. This is called a non-local return and is vital for control-flow abstractions using closures. 
To fix the issue, we would better specify the exception that should be caught: `case e : NumberFormatException`.

If you have to catch `Throwable` for some reason by all means, the correct way to do it is to re-throw any `ControlThrowable` in the catch-block.

# Frequently used types

+~[Frequently used types]slide
Frequently used types
===

```scala
val tuple = (42, 23, true, "Foo")
val result = tuple._1 + tuple._2
def swap(t: (Int, Int)): (Int, Int) = (t._2, t._1)

val o1: Option[Double] = Some(4.5)
val o2: Option[Any] = Nones
def matchOption[T <: AnyRef](opt: Option[T], default: T): T = {
  opt match {
    case None => default
    case Some(obj) => obj
  }
}
matchOption(o1, 2.7) // returns 4.5
matchOption(o2, "!") // returns "!"

val e1: Either[Int, String] = Left(42)
val e2: Either[Int, Bool] = Right(true)
def handleEitherWithIntAsLeftSide(e: Either[Int, _]) = {
  e match {
    case Left(i) => println(i)
    case Right(_) => println("No Left-side given!")
  }
}
handleEitherWithIntAsLeftSide(e1) // prints 42
handleEitherWithIntAsLeftSide(e2) // prints "No Left-side given!"
```

~+

Scala offers some very simple but powerful types:
* Tuple
* Option
* Either

## Tuple
In Scala you can pack multiple (1 to 22) values into one object, a so-called tuple.

The values, the tuple is built from, can be of different types **and** accessing one of this values will return the correct type. The compiler remembers, that:
* the first and second value of `tuple` is of type `Int`
* the third value is of type `Boolean`
* and the fourth value is of type `String`

To access some value from a tuple, the tuple offeres some attributes `_1`, `_2`, ... depending on the number of values given at creation-time.

A method can take and return tuples and hence there is no need of defining any return-value-data-container, a method somehow can return mutliple values and not just one (swap-example)

## Option
Scala offers the generic type `Option[A]` that is inspired by the **Null Object pattern**. An instance of `Option[A]` can either be `None` or `Some(A)`. Lets take a method with return-type `Option[A]` as example:
* The method can perform some action and at the end got some result to return
* The method can perform some action but can fail and hence haven't got some result

The caller now can get such an optional return-value and depending on the kind of return-value can act in different ways (e.g. via **pattern matching**).

## Either
The third type presented here is the generic type `Either[A, B]`. An instance of `Either[A, B]` can either be `Left(A)` or `Right(B)`. Very similar to `Option` the value can have two completely different 'types', but by using `Either` you can for example return either some value or an exception (or message) (`Option` only offered the possibility to indicate failure, `Either` additionally can give further information).


##Examples

+~[A "repeat" Abstraction in Scala]slide

A `repeat` Abstraction in Scala
===
Policy: Repeat the same operation n-times and store the results in an array.  

```Scala
object RepeatAbstraction {
  def repeat[T: scala.reflect.ClassTag](times: Int)(f: ⇒ T): Array[T] = {
    val array = new Array[T](times)
    var i = 0
    while (i < times) { array(i) = f ; i += 1 }
    array
} }
```

_Example usage_ (e.g., using the Scala REPL):
  
```Scala  
import RepeatAbstraction._

val result: Array[Int] = repeat(3) { System.in.read() }
// Long version:
// val body /*: () ⇒ Int*/ = () ⇒ { System.in.read() }
// val result : Array[Int] = repeat(3)(/*f =*/ body())

println("Charcodes: "+result.mkString(" "))
```

~+

This solution allows us to reuse our _low-level mechanism_.