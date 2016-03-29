class OgController < ApplicationController
  helper OgHelper
  include OgClient
  require 'thrift'

  def index
    @url = params[:url]
    if !@url.blank?
      begin
        client = OgClient::Client.new(ENV["OG_SERVICE_URL"] || "localhost", ENV["OG_SERVICE_PORT"] || 9090)
        result = client.parse(@url)
        @info = OgInfo.new(
          result.title,
          result.type,
          result.image,
          result.url)
      rescue IOError => e
        @error = e
      rescue Thrift::Exception => e
        @error = e
      end
    end
  end
end
