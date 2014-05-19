package jv.design_pattern.composite;

import java.util.LinkedList;
import java.util.List;

public class Composite implements Component {

	private List<Component> components = new LinkedList<Component>();
	
	@Override
	public void operation1() {
		for (Component comp : components) {
			comp.operation1();
		}
	}

	@Override
	public void operation2() {
		for (Component comp : components) {
			comp.operation2();
		}
	}

	public boolean add(Component arg0) {
		return components.add(arg0);
	}

	public Component get(int arg0) {
		return components.get(arg0);
	}

	public boolean remove(Object arg0) {
		return components.remove(arg0);
	}

	public int size() {
		return components.size();
	}
}