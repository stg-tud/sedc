package sc.design_pattern.template_method

abstract class CaffeinatedBeverageTemplate{
	def prepare() = {
		boilWater()
		brew()
		pourInCup()	
	}
	def brew()	
	def boilWater() = println("Boiling Water")
	//Operator Notation
	def pourInCup() = Console println "Pouring into Cup"
	/**
	 * Many other styles are possible, experiment with the REPL!
	 */
}

class Coffee extends CaffeinatedBeverageTemplate{
		@Override
		def brew = System.out.println("Brewing a hot coffee")
}
class Tea extends CaffeinatedBeverageTemplate{
		@Override
		def brew = System.out.println("Brewing a hot tea")
}
object Coffeebreak extends App {
		  val myDrink = new Coffee()
		  myDrink.prepare()
}