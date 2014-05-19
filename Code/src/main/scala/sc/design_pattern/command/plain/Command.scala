package sc.design_pattern.command
package plain

object Application {

  var document: String = ""

}

trait Command {
  def execute(): Unit
  def unexecute(): Unit
}

// the command manager is responsible for calling "execute" and "unexecute"
object CommandManager {

  private var pastCommands: List[Command] = Nil
  private var futureCommands: List[Command] = Nil

  def execute(command: Command) {
    command.execute()
    pastCommands = command :: pastCommands
    futureCommands = Nil // clear all future commands - reapplying them is usually not possible!
  }

  def undo() {
    if (pastCommands.nonEmpty) {
      val c = pastCommands.head
      c.unexecute()

      futureCommands = c :: futureCommands
      pastCommands = pastCommands.tail
    }
  }

  def redo() {
    if (futureCommands.nonEmpty) {
      val c = futureCommands.head
      c.execute()

      pastCommands = c :: pastCommands
      futureCommands = futureCommands.tail
    }
  }

  override def toString: String = {
    "Command history: \n"+
      "\tPast commands: "+pastCommands.mkString(" ; ")+"\n"+
      "\tFuture commands: "+futureCommands.mkString(" ; ")
  }
}

class AddTextCommand(val text: String) extends Command {
  import Application.document
  def execute() {
    document += text
  }

  def unexecute() {
    document = document.substring(0, document.length - text.length)
  }

  override def toString: String = {
    "Add text: "+text
  }
}

// This is also a command!
object askForInput extends (() ⇒ Unit) {

  def apply() {
    import javax.swing.JOptionPane.showInputDialog
    val text = showInputDialog("Please, enter some text.")
    if (text ne null) {
      CommandManager.execute(new AddTextCommand(text))
    }
  }
}

object CommandDemo extends App {
  def printlnDocument() = println("Document:\n\t"+Application.document+"\n")

  for (i ← 0 until 3) {
    askForInput()
    println(CommandManager)
    printlnDocument()
  }

  CommandManager.undo
  println(CommandManager)
  printlnDocument()

  CommandManager.undo
  println(CommandManager)
  printlnDocument()

  CommandManager.redo
  println(CommandManager)
  printlnDocument()

  askForInput()
  println(CommandManager)
  printlnDocument()

  System.exit(0)
}