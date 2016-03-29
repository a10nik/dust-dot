class OgInfo
  attr_reader :title, :type, :image, :url 
  def initialize(title, type, image, url)
    @title = title
    @type = type
    @image = image
    @url = url
  end
end
