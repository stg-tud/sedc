package sc.design_pattern.template_method

// A Solution relying on first-class functions...

trait LoggingEvent

class BaseAppender(private val append: (LoggingEvent) ⇒ Unit) {

  def doAppend(loggingEvent: LoggingEvent) {
    // filtering,...
    append(loggingEvent)
  }

}

// A solution using Mixin composition and explicitly typed self references...

trait Component

trait LayoutEngine {

  def layout(components: Array[Component])

}

trait BasicLayoutEngine extends LayoutEngine {
  def layout(components: Array[Component]) { /*Basic means nothing..*/ }
}

class Container(private val components: Array[Component]) { this: LayoutEngine ⇒

  def doLayout() {
    layout(components);
  }
}

object LayoutEngineDemo extends App {

  val c: Container = new Container(Array()) with BasicLayoutEngine
  //c.layout (won't compile!)
  c.doLayout
  println(c)

}

// Properties:
//      + The LayoutEngines (our low-level mechanisms) are well modularized and reusable
//      + Basically no overhead (as in case of the template method pattern), because we do not have an 
//        additional object (as in case of Template Method)
//      + The interface of Container is not polluted (conforms to the ISP)
//      - The "strategy" is not dynamically exchangeable
