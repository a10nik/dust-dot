$:.push("#{__dir__}/gen-rb")
require 'thrift'
require 'og_service'
 
module OgClient
  class Client
    def initialize(url, port)
      @url = url
      @port = port
    end
    
    def parse(url_to_parse)
      transport = Thrift::BufferedTransport.new(Thrift::Socket.new(@url, @port))
      protocol = Thrift::BinaryProtocol.new(transport)
      client = OgService::Client.new(protocol)
      transport.open()
      begin
        return client.parse(url_to_parse)
      ensure
        transport.close()
      end
      
    end  
  end
end

