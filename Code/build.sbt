name := "Lecture - Software Engineering Design and Construction (SED&C) - Winter Semester 2013"

scalaVersion := "2.10.3"

autoCompilerPlugins := true

addCompilerPlugin("org.scala-lang.plugins" % "continuations" % "2.10.3")

scalacOptions += "-P:continuations:enable"

scalacOptions in (Compile,compile) += "–deprecation" 

scalacOptions in (Compile,compile) += "–target:jvm-1.7" 
 
scalacOptions in (Compile,compile) += "-feature" 

libraryDependencies += "org.scala-lang" % "scala-reflect" % "2.10.3" 
