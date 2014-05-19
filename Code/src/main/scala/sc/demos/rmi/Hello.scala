package sc.demos.rmi

import _root_.java.rmi.server.UnicastRemoteObject

trait Hello {
  def say(): String
}

@remote
class HelloImpl extends UnicastRemoteObject with Hello {

  def say() = "yes"
}

object HelloServer {
  def main(args: Array[String]) {

    val host = "localhost" // args(0);
    val service = "rmi://"+host+"/Hello"
    val hello = new HelloImpl
    java.rmi.Naming.rebind(service, hello);
    println("Server is up and running; press any key to shut down"); System.in.read
    java.rmi.Naming.unbind(service)
    UnicastRemoteObject.unexportObject(hello, true)
    println("Server has shut down")
  }

}

object HelloClient {

  def main(args: Array[String]) {
    val host = "localhost" // args(0)
    val remoteObject = java.rmi.Naming.lookup("rmi://"+host+"/Hello")
    val hello = remoteObject.asInstanceOf[Hello];
    println("say: "+hello.say)
  }
}

object RMIRegistry {

  def main(args: Array[String]) {
    java.rmi.registry.LocateRegistry.createRegistry(1099);
    System.out.println("RMI registry ready.");
    println("Press any key to abort.")
    System.in.read
    System.out.println("RMI registry killed.");
  }
}