package jv.design_pattern.template_method;

public abstract class Person {
	
	public abstract String getName();
	
	public void sayHello() {
		System.out.println(String.format("Hello, %s!", getName()));
	}
}