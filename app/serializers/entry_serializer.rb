class EntrySerializer < ActiveModel::Serializer
  def attributes
    # if @options[:template] == 'show'
    entry = {}
    object.attributes.each do |attr|
      entry[attr[0]] = attr[1]
    end
    entry['definition'] = entry['definition'].gsub(/\u2028/, '')
    entry[:url] = root_path + object.url
    if current_user
      # trim leading slash from edit url
      entry['edit_url'] = root_path + edit_entry_path(object)[1..-1]
    end
    entry
    # end
  end
end
