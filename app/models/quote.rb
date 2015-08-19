class Quote
  include Mongoid::Document
  include Mongoid::Timestamps

  field :sel
  field :ref
  field :auth
  field :comp
  field :vol
  field :t
  field :created_by
  field :updated_by
  field :tags, type: Array

  before_save :clear_blanks

  private

  def clear_blanks
    unless self.tags.nil?
      tags = self.tags.each {|tag| tag.strip!}.reject {|tag| tag.blank?}
      if tags.empty?
        self.unset(:tags)
      end
    end
  end
end
