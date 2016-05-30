import org.scalatest.FunSuite
import org.scalatest.Matchers._

class Test extends FunSuite {

  test("should trim words correctly") {
    Utils.stemWord("repeats") should equal ("repeat")
    Utils.stemWord("голова") should equal ("голов")
    Utils.stemWord("lolбоги") should equal ("lolбог")
  }

  test("should make file stat with proper wordCount") {
    val line =
      "Если у вас," +
      "Если у вас," +
      "Если у вас нет жены." +
      "Нету... жены!"
    Utils.getStat(line).wordCount should equal (Map(
      ("есл", 3),
      ("у", 3),
      ("вас", 3),
      ("нет", 2),
      ("жен", 2)
    ))
  }

  test("should make file stat with proper length") {
    val line = "123456 890"
    Utils.getStat(line).length should equal (10)
  }

  test("should parse csv lines") {
    val lines = Array(
      "id, omg, wtf is this",
      "1, asdasdasd",
      "2, asdas,asd,asd"
    )
    Utils.parseCsvLines(lines) should equal (Seq(1,2))
  }
}