chmod +x fmapper.py
chmod +x freducer.py
/etc/bootstrap.sh
sleep 5
hdfs dfs -put text.txt input/text.txt || exit 123
hadoop jar share/hadoop/tools/lib/hadoop-streaming-2.7.0.jar -input input/text.txt -output foutput -mapper /usr/local/hadoop/fmapper.py -reducer /usr/local/hadoop/freducer.py
hdfs dfs -get foutput ./foutput || exit 124
