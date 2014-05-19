package jv.design_pattern.template_method;

public class Lecturer extends Person {
	@Override
	public String getName() {
		return "Dr Eichberg";
	}
	
	public static void main(String[] args) {
		new Lecturer().sayHello();
	}
}