#Test Your Java

+~slide
What will be the output?
===
- - -

```java
public class Test{ 

   public static void main(String[] args) { 
       Object o = null; 
       try{ 
           o = Test.<Double>cast("toto"); 
       }catch(ClassCastException cce){ 
           System.out.println("oops"); 
       } 
       System.out.println(o == null); 
       System.out.println(o instanceof String); 
       System.out.println(o instanceof Double); 
   } 

   private static <T> T cast(Object i) { 
       return (T)i; 
   } 

}  
```

+~[Solution]aside
**The output will be:**

	false
	true
	false
~+

~+


