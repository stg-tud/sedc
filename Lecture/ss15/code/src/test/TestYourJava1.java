package test;

public class TestYourJava1 {

  public static void main(String[] args) {
    Object o = null;
    try {
      o = TestYourJava1.<Double> cast("toto");
    } catch (ClassCastException cce) {
      System.out.println("oops");
    }
    System.out.println(o == null);
    System.out.println(o instanceof String);
    System.out.println(o instanceof Double);
  }

  @SuppressWarnings("unchecked")
  private static <T> T cast(Object i) {
    return (T) i;
  }

}
