package sc.design_pattern.adapter

package object pimp_my_library {

  // Scala 2.10 onwards:
  implicit class RichInputStream(in: java.io.InputStream) extends java.io.InputStream {

    def read() = in.read()

    def forEachByte(f: Int ⇒ _) {
      var next = read()
      while (next != -1) {
        f(next)
        next = read()
      }
    }
  }
}

