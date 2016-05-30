import org.apache.spark.{SparkConf, SparkContext}
import org.tartarus.snowball.ext.{englishStemmer => EngStemmer, russianStemmer => RusStemmer}

import scala.concurrent.duration.durationToPair
import scala.io.Source
import scala.math.Ordering

object Utils {
  def parseCsvLines(csvLines: Seq[String]) =
    csvLines
      .drop(1)
      .map(_.split(",").head.toInt)

  def getFileNames(sc: SparkContext) = {
    val indexCsv = sc.textFile("opencorpora/index.csv").collect
    parseCsvLines(indexCsv)
      .map(num => "%04d".format(num))
      .map(n => f"opencorpora/$n.txt")
  }

  def toLowerCaseWords(ln: String) = """[а-яА-ЯёЁa-zA-Z0-9']+""".r.findAllIn(ln).map(_.toLowerCase)

  val rusStemmer = new RusStemmer
  val engStemmer = new EngStemmer

  def stemWord(w: String) = {
    if (w.last.toString.matches("""[a-z]""")) {
      engStemmer.setCurrent(w)
      engStemmer.stem()
      engStemmer.getCurrent
    } else {
      rusStemmer.setCurrent(w)
      rusStemmer.stem()
      rusStemmer.getCurrent
    }
  }

  def wordCount(words: Traversable[String]) =
    words.foldLeft(Map.empty[String, Int])
    { (count, word) => count + (word -> (count.getOrElse(word, 0) + 1)) }


  def bm25score(query: Seq[String], fileStat: FileStat, totalFileCount: Long, countsOfFilesContainingAWord: Map[String, Long], avgLen: Double) = {
    def idf(q: String) = (totalFileCount - countsOfFilesContainingAWord(q) + 0.5) / (countsOfFilesContainingAWord(q) + 0.5)
    val k1 = 1.2
    val b = 0.5
    query
      .map(q =>  idf(q) * (fileStat.wordCount(q) * (k1 + 1)) /
        (fileStat.wordCount(q) + k1 * (1 - b + b * fileStat.length / avgLen)))
      .sum
  }

  case class FileStat(wordCount: Map[String, Int], length: Int)

  def getStat(content: String) = {
    val wc = wordCount(toLowerCaseWords(content).map(stemWord).toSeq).withDefault(_ => 0)
    FileStat(wc, content.length)
  }
}

object Ranker extends App {
  import Utils._

  val conf = new SparkConf().setAppName("Ranker Application")
  val sc = new SparkContext(conf)
  val queryLn = Source.fromFile("query.txt", "UTF-8").mkString
  sc.setLogLevel("WARN")
  val query = toLowerCaseWords(queryLn).map(stemWord).toSeq
  val fileNames = getFileNames(sc)
  println(f"Got ${fileNames.length} file names")
  val fileStats = sc.wholeTextFiles("opencorpora/")
    .mapValues(getStat)
    .cache()
  println(f"Got file stats")
  val avgLen = fileStats
    .map { case (_, stat) => stat.length }
    .mean
  println(f"Got avg len: $avgLen")
  val countsOfFilesWithQueryWords = fileStats
    .values
    .flatMap(s => query.map(qWord => (qWord, if (s.wordCount.contains(qWord)) 1L else 0L)))
    .reduceByKey(_ + _)
    .collect
    .toMap
    .withDefault(_ => 0L)
  println(f"Got query terms counts: $countsOfFilesWithQueryWords")
  val filesWithScores = fileStats
    .mapValues(st => bm25score(query, st, fileNames.length, countsOfFilesWithQueryWords, avgLen))
    .top(10)(Ordering.by { case (_, score) => score })
  println(filesWithScores.toSeq)
  sc.stop()
}
