package collection;

interface HList {

  Object head();

  HList tail();

  Boolean isEmpty();

}

class HCons<H, T extends HList> implements HList {

  private final H head;
  private final T tail;

  public HCons(H head, T tail) {
    this.head = head;
    this.tail = tail;
  }

  public <E> HCons<E, HCons<H, T>> add(E e) {
    return new HCons<>(e, this);
  }

  @Override
  public H head() {
    return this.head;
  }

  @Override
  public T tail() {
    return this.tail;
  }

  @Override
  public Boolean isEmpty() {
    return false;
  }

}

class Nil implements HList {

  public Boolean isEmpty() {
    return true;
  }

  @Override
  public Object head() {
    throw new UnsupportedOperationException();
  }

  @Override
  public HList tail() {
    throw new UnsupportedOperationException();
  }
}

class Demo {

  public static void main(String[] args) {
    Nil Nil = new Nil();
    HCons<Integer, Nil> l0 = new HCons<>(42, Nil);

    HCons<String, HCons<Integer, Nil>> l1 = l0.add("String");

    Integer i = l1.add(2.0).tail().tail().head();

    System.out.println(i);
  }
}



