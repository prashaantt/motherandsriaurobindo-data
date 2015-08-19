class Entry
  include Mongoid::Document

  field :word
  field :definition
  field :url
  field :related_words
  field :created_by
  field :updated_by
  field :updated_at, type: DateTime

  validates :word, presence: true, uniqueness: { case_sensitive: false }
  validates :definition, presence: true,
                         length: { minimum: 5 }

  acts_as_url :word, :sync_url => true

  before_validation :clear_blanks

  def to_param
    url
  end

  private
  
  def clear_blanks
    self.word = self.word.strip
    if related_words.blank?
      self.unset(:related_words)
    else
      self.related_words = related_words.split(',').each { |e| e.strip! }.join(',')
    end
  end
end
