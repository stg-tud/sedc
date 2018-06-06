class Person(val name : String) {
    override def equals(a : Any) : Boolean = {
      a match {case p : Person => p.name == this.name }
  } }
