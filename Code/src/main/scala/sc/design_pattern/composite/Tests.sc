package sc.design_pattern.composite

object Tests {
  println("Welcome to the Scala worksheet")       //> Welcome to the Scala worksheet
  trait Super
  trait Sub extends Super
  def x(s: Super): Long = s.hashCode()            //> x: (s: sc.design_pattern.composite.Tests.Super)Long
  val s = new Super {}                            //> s  : sc.design_pattern.composite.Tests.Super = sc.design_pattern.composite.T
                                                  //| ests$$anonfun$main$1$$anon$2@61e77272
  val su = new Sub {}                             //> su  : sc.design_pattern.composite.Tests.Sub = sc.design_pattern.composite.Te
                                                  //| sts$$anonfun$main$1$$anon$1@72fd5ba8
  s.hashCode()                                    //> res0: Int = 1642558066
  su.hashCode()                                   //> res1: Int = 1929206696
  x(s)                                            //> res2: Long = 1642558066
  x(su)                                           //> res3: Long = 1929206696
  
  
  
  val l1 = new Leaf2()                            //> l1  : sc.design_pattern.composite.Leaf2 = sc.design_pattern.composite.Leaf2@
                                                  //| 50625c49
  val l2 = new Leaf2()                            //> l2  : sc.design_pattern.composite.Leaf2 = sc.design_pattern.composite.Leaf2@
                                                  //| 6998e5d9
  val l3 = new Leaf2()                            //> l3  : sc.design_pattern.composite.Leaf2 = sc.design_pattern.composite.Leaf2@
                                                  //| 351a3fb8
  val l4 = new Leaf2()                            //> l4  : sc.design_pattern.composite.Leaf2 = sc.design_pattern.composite.Leaf2@
                                                  //| 4e4d6444
  val l5 = new Leaf2()                            //> l5  : sc.design_pattern.composite.Leaf2 = sc.design_pattern.composite.Leaf2@
                                                  //| 3af1d485
  val l6 = new Leaf2()                            //> l6  : sc.design_pattern.composite.Leaf2 = sc.design_pattern.composite.Leaf2@
                                                  //| 5ab785fe
  val l7 = new Leaf2()                            //> l7  : sc.design_pattern.composite.Leaf2 = sc.design_pattern.composite.Leaf2@
                                                  //| 46be1539
  val comp1 = new Composite2()                    //> comp1  : sc.design_pattern.composite.Composite2 = sc.design_pattern.composit
                                                  //| e.Composite2@17ef771b
  comp1.add(l1)
  comp1.add(l2)
  comp1.add(l3)
  val comp2 = new Composite2()                    //> comp2  : sc.design_pattern.composite.Composite2 = sc.design_pattern.composit
                                                  //| e.Composite2@6a7499e3
  comp2.add(l4)
  comp2.add(l5)
  comp2.add(l6)
  val comp3 = new Composite2(List(comp1, comp2, l7))
                                                  //> comp3  : sc.design_pattern.composite.Composite2 = sc.design_pattern.composit
                                                  //| e.Composite2@6ab345e1
  var str = ""                                    //> str  : String = ""
  comp3.apply((c:Component2)=>{str += c.toString()})
  println(str)                                    //> sc.design_pattern.composite.Leaf2@351a3fb8sc.design_pattern.composite.Leaf2@
                                                  //| 6998e5d9sc.design_pattern.composite.Leaf2@50625c49sc.design_pattern.composit
                                                  //| e.Leaf2@5ab785fesc.design_pattern.composite.Leaf2@3af1d485sc.design_pattern.
                                                  //| composite.Leaf2@4e4d6444sc.design_pattern.composite.Leaf2@46be1539
}