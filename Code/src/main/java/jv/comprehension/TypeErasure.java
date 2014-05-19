package jv.comprehension;

@SuppressWarnings("all")
public class TypeErasure {

    public static void main(String[] args) {
        Object o = null;
        try {
            o = TypeErasure.<Double> cast("toto");
        } catch (ClassCastException cce) {
            System.out.println("oops");
        }
        System.out.println(o == null);
        System.out.println(o instanceof String);
        System.out.println(o instanceof Double);
    }

    private static <T> T cast(Object i) {
        return (T) i;
    }

}