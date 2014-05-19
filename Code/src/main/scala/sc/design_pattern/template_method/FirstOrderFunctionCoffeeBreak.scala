package sc.design_pattern.template_method

class FirstOrderFunctionCoffeeBreak{
	def prepare( brew : () => Unit) = {
	  boilWater
	  brew()
	  pourInCup
	}
	def boilWater = println("Boiling Water")
	def pourInCup = println("Pouring into Cup")
}

object FirstOrderFunctionCoffeeBreak extends App {
    def brewCoffee () : Unit = println("Brewing a hot coffee")
	val myCoffee = new FirstOrderFunctionCoffeeBreak prepare brewCoffee 
}