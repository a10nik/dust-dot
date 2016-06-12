sleep 5
python send.py "a" > /dev/null &
python send.py "b" > /dev/null &
python send.py "c" > /dev/null &
python receive.py "a" "b" "c"
