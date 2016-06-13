package sample.hello

import akka.actor.SupervisorStrategy._
import akka.actor._

import scala.util.Random

object Master {
  case class DirSizeReq(path: String)
  case class DirSizeResult(path: String, size: BigInt)
}

object Client {
}

class Client(masterRef: ActorRef, dir: String) extends Actor with ActorLogging {
  masterRef ! Master.DirSizeReq(dir)
  context watch masterRef

  def receive = {
    case Master.DirSizeResult(path, size) =>
      log.info(f"Result: size of $path is $size")
      context.system.terminate()
    case Terminated(_) =>
      log.info("master has terminated, shutting down")
      context.system.terminate()
  }
}

object Worker {
  case class FileSizeReq(f: java.io.File)
  case class FileSizeError(f: java.io.File)
  case class FileSizeResult(f: java.io.File, size: Long)
  case class SumReq(items: Seq[Long])
  case class SumError()
  case class SumResult(sum: BigInt)

}

class Worker extends Actor with ActorLogging {
  def receive = {
    case Worker.FileSizeReq(f) =>
      sender() ! (if (Random.nextBoolean()) Worker.FileSizeResult(f, f.length) else Worker.FileSizeError(f))
    case Worker.SumReq(items) =>
      sender() ! (if (Random.nextBoolean()) Worker.SumResult(items.sum) else Worker.SumError())
  }

}

class Master extends Actor with ActorLogging {
  import java.io.File

  val workerCount = 10
  val workers = (0 until workerCount).map(i => context.actorOf(Props[Worker], name=f"worker$i"))

  def recursiveListFiles(f: File): Array[File] = {
    val these = Option(f.listFiles).getOrElse(Array())
    these ++ these.filter(_.isDirectory).flatMap(recursiveListFiles)
  }

  var sizes = collection.mutable.Buffer[Long]()
  var files: Seq[File] = _
  var client: ActorRef = _
  var reqPath: String = _

  def receive = {

    case Master.DirSizeReq(p) =>
      reqPath = p
      client = sender()
      files = recursiveListFiles(new File(p))
      log.info(f"found ${files.length} files in $p")
      if (files.isEmpty) {
        sender() ! Master.DirSizeResult(reqPath, 0)
      }
      for ((f, i) <- files.zipWithIndex) {
        log.info(f"sending file size req about ${f.getPath} to ${workers(i % workerCount).path}")
        workers(i % workerCount) ! Worker.FileSizeReq(f)
      }

    case Worker.FileSizeResult(f, size) =>
      log.info(f"got size of $f: $size from ${sender().path}")
      sizes.append(size)
      if (sizes.length == files.length) {
        log.info(f"gathered ${sizes.length} sizes, sending sum request to ${workers(0).path}")
        workers(0) ! Worker.SumReq(sizes)
      }

    case Worker.FileSizeError(f) =>
      log.warning(f"got file size error of $f from ${sender().path}")
      val randomWorker = workers(Random.nextInt(workerCount))
      log.info(f"lets try again with $randomWorker")
      randomWorker ! Worker.FileSizeReq(f)

    case Worker.SumError() =>
      log.warning(f"got sum error from ${sender().path}")
      val randomWorker = workers(Random.nextInt(workerCount))
      log.info(f"lets try again with $randomWorker")
      randomWorker ! Worker.SumReq(sizes)

    case Worker.SumResult(sum) =>
      log.info(f"got sum $sum from ${sender().path}")
      log.info(f"sending back to the client")
      client ! Master.DirSizeResult(reqPath, sum)
  }

}

object Main {

  def main(args: Array[String]): Unit = {
    val system = ActorSystem("Main")
    val master = system.actorOf(Props(classOf[Master]), "master")
    val client = system.actorOf(Props(new Client(master, args.head)), "client")
  }

}