mkdir generated
for f in *.thrift; do
  thrift -o ./generated --gen rb "$f"
  thrift -o ./generated --gen hs "$f"
  thrift -o ./generated --gen py "$f"
done
