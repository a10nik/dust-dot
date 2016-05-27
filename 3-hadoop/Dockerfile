from sequenceiq/hadoop-docker

add /fmapper.py /usr/local/hadoop
add /freducer.py /usr/local/hadoop
add /text.txt /usr/local/hadoop
add /run-mapreduce.sh /usr/local/hadoop

env PATH "$PATH:/usr/local/hadoop/bin"
workdir /usr/local/hadoop

run sh run-mapreduce.sh
