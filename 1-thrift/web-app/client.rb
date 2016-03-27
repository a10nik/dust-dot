$:.push('gen-rb')

require 'thrift'

require 'calculator'

begin
  port = ARGV[0] || 9091

  transport = Thrift::BufferedTransport.new(Thrift::Socket.new('og-service', port))
  protocol = Thrift::BinaryProtocol.new(transport)
  client = Calculator::Client.new(protocol)

  transport.open()

  sum = client.add(1,1)
  print "1+1=", sum, "\n"

  sum = client.add(1,4)
  print "1+4=", sum, "\n"

  transport.close()

rescue Thrift::Exception => tx
  print 'Thrift::Exception: ', tx.message, "\n"
end