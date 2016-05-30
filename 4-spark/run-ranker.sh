hadoop fs -copyFromLocal opencorpora
spark-submit --master local[*] --class Ranker /ranker.jar "ru"