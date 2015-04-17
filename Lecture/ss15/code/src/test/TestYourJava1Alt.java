package test;

public class TestYourJava1Alt {

  public static void main(String[] args) {
    Double o = null;
    try {
      o = TestYourJava1Alt.<Double> cast("toto");
    } catch (ClassCastException cce) {
      System.out.println("oops");
    }
    System.out.println(o == null);
    // System.out.println(o instanceof String);
    System.out.println(o instanceof Double);
  }

  @SuppressWarnings("unchecked")
  private static <T> T cast(Object i) {
    try {
      return (T) i;
    } catch (ClassCastException cce) {
      System.out.println("this should not happen");
      throw cce;
    }
  }
}
