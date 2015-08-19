class ChapterSerializer < ActiveModel::Serializer
  def attributes
    chapter = super
    object.attributes.each do |attr|
      if ['items', 'txt', 'segments'].include?(attr[0])
        next
      end
      chapter[attr[0]] = attr[1]
    end
    chapter.delete('_id')
    chapter.delete('_slugs')
    chapter.delete('conc')
    chapter['text'] = object.text
    chapter['url'] = root_path + object.url[1..-1]
    chapter['prvu'] = object.prvu unless object.prvu.nil?
    chapter['nxtu'] = object.nxtu unless object.nxtu.nil?
    chapter
  end
end
