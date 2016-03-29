module OgHelper
  def print_error(error)
    return "Not a valid URL" if error.kind_of? BadUrl
    return "Cannot connect to the site" if error.kind_of? CannotConnect
    return "Encountered HTTP error #{error.errorCode}" if error.kind_of? HttpFailure
    return error.to_s
  end
end
