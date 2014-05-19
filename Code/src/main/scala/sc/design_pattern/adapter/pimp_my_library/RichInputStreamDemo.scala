package sc.design_pattern.adapter
package pimp_my_library

object RichInputStreamDemo {

  def main(args: Array[String]) {
    val fin: java.io.InputStream = System.in; // new java.io.FileInputStream(args(0))

    fin.forEachByte((value: Int) ⇒ print(value+" "))

    fin.close();

  }

}