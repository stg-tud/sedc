package sc.scala_introduction.variables

object TestWorksheet {
  println("Welcome to the Scala worksheet")       //> Welcome to the Scala worksheet

  "My name is Dennis"                             //> res0: String("My name is Dennis") = My name is Dennis
  23 + 42                                         //> res1: Int(65) = 65
  trait Bird
  trait Head
  trait Wing
  trait Robin extends Bird with Head with Wing
  def doSomething(w: Bird with Wing): Unit = {}   //> doSomething: (w: sc.scala_introduction.variables.TestWorksheet.Bird with sc.
                                                  //| scala_introduction.variables.TestWorksheet.Wing)Unit
  doSomething(new Robin {})

  trait Cat
  trait Catch
  trait FullTummy
  class CatWithFullTummy(cat: Cat, ca: Catch) extends Cat with FullTummy {
    def sleep(): Cat = { cat }
  }

  def eat(cat: Cat, ca: Catch): Cat with FullTummy = {
    new CatWithFullTummy(cat, ca)
  }                                               //> eat: (cat: sc.scala_introduction.variables.TestWorksheet.Cat, ca: sc.scala_i
                                                  //| ntroduction.variables.TestWorksheet.Catch)sc.scala_introduction.variables.Te
                                                  //| stWorksheet.Cat with sc.scala_introduction.variables.TestWorksheet.FullTummy
                                                  //| 
  def sleep(cat: Cat with FullTummy) : Cat = {
  cat.asInstanceOf[CatWithFullTummy].sleep}       //> sleep: (cat: sc.scala_introduction.variables.TestWorksheet.Cat with sc.scala
                                                  //| _introduction.variables.TestWorksheet.FullTummy)sc.scala_introduction.variab
                                                  //| les.TestWorksheet.Cat
  val someCat = new Cat{}                         //> someCat  : sc.scala_introduction.variables.TestWorksheet.Cat = sc.scala_intr
                                                  //| oduction.variables.TestWorksheet$$anonfun$main$1$$anon$2@7a8dfdd4
  val theCatch = new Catch{}                      //> theCatch  : sc.scala_introduction.variables.TestWorksheet.Catch = sc.scala_i
                                                  //| ntroduction.variables.TestWorksheet$$anonfun$main$1$$anon$3@a84da22
  val fullCat = eat(someCat, theCatch)            //> fullCat  : sc.scala_introduction.variables.TestWorksheet.Cat with sc.scala_i
                                                  //| ntroduction.variables.TestWorksheet.FullTummy = sc.scala_introduction.variab
                                                  //| les.TestWorksheet$$anonfun$main$1$CatWithFullTummy$1@66e27547
  val hungryCat = sleep(fullCat)                  //> hungryCat  : sc.scala_introduction.variables.TestWorksheet.Cat = sc.scala_in
                                                  //| troduction.variables.TestWorksheet$$anonfun$main$1$$anon$2@7a8dfdd4
  someCat == hungryCat                            //> res2: Boolean = true
  //(Type) instance <-> instance.asInstanceOf[Type]
}