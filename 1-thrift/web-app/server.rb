$:.push('gen-rb')

require 'thrift'

require 'calculator'

class CalulatorImpl
  def add(log, a, b)
    print "add called"
    return a+b
  end
  def sub(log, a, b)
    print "add called"
    return a+b
  end
  def mul(log, a, b)
    print "add called"
    return a+b
  end
  def div(log, a, b)
    print "add called"
    return a+b
  end
end

begin
  port = 9090
  protocolFactory = Thrift::CompactProtocolFactory.new
  transportFactory = Thrift::BufferedTransportFactory.new
  handler = CalulatorImpl.new
  processor = Calculator::Processor.new(handler)
  transport = Thrift::ServerSocket.new(port)
  server = Thrift::ThreadedServer.new(processor, transport, transportFactory, protocolFactory)
  server.serve

rescue Thrift::Exception => tx
  print 'Thrift::Exception: ', tx.message, "\n"
end