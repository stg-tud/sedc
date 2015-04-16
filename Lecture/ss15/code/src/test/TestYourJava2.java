package test;

import java.io.File;
import java.io.FileOutputStream;
import java.util.ArrayList;
import java.util.List;

public class TestYourJava2 {

  public static void main(String[] args) throws Exception {
    List<String> l = new ArrayList<>(5);
    System.out.println(l);

    File tempFile = File.createTempFile("Temp", "txt");
    try (FileOutputStream fout = new FileOutputStream(tempFile)) {
      fout.write(101);
    }
  }
}
