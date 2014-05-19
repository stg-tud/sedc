package sc.design_pattern.command

object CommandDemo extends App {

  private var document: String = ""

  trait Command { // <=> Function0[Unit]
    def execute(): Unit
    def unexecute(): Unit
  }

  trait StatefulCommand extends Command {
    def cloneCommand(): StatefulCommand
  }

  object CommandHistory {

    private var pastCommands: List[Command] = Nil
    private var futureCommands: List[Command] = Nil

    def add(command: Command) {
      // here, we simulate multi-dispatch
      val c = command match { case c: StatefulCommand ⇒ c.cloneCommand; case c ⇒ c }
      pastCommands = c :: pastCommands
      futureCommands = Nil // clear all future commands - reapplying them is usually not possible!
    }

    def undo() {
      if (pastCommands.nonEmpty) {
        val c = pastCommands.head
        c.unexecute

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

  class AddTextCommand(
    private var text: String = null)
      extends StatefulCommand {

    def setText(text: String) { this.text = text }

    def execute() {
      document += text
    }

    def unexecute() {
      document = document.substring(0, document.length - text.length)
    }

    override def toString = "Added text: "+text

    def cloneCommand() = new AddTextCommand(this.text)
  }

  def printlnDocument() = println("Document:\n\t"+document+"\n")

  println("Implementation of the Command Design Pattern using the Prototype Pattern for Stateful Commands.")

  val askForInput = new (() ⇒ Unit) {
    val addTextCommand = new AddTextCommand

    def apply() {
      var text = javax.swing.JOptionPane.showInputDialog("Please, enter some text.")
      if (text ne null) {
        addTextCommand.setText(text) // update the command
        addTextCommand.execute()
        CommandHistory.add(addTextCommand)
      }
    }
  }

  for (i ← 0 until 3) {
    print("ADD: "); askForInput()
    println(CommandHistory)
    printlnDocument()
  }

  print("UNDO: "); CommandHistory.undo
  println(CommandHistory)
  printlnDocument()

  print("UNDO: "); CommandHistory.undo
  println(CommandHistory)
  printlnDocument()

  print("REDO: "); CommandHistory.redo
  println(CommandHistory)
  printlnDocument()

  print("ADD: "); askForInput()
  println(CommandHistory)
  printlnDocument()

  System.exit(0)

}