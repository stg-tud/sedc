package jv.design_pattern.composite;

public class Leaf implements Component {

	@Override
	public void operation1() {
		System.out.println("Did the first operation");
	}

	@Override
	public void operation2() {
		System.out.println("Did the second operation");
	}
}