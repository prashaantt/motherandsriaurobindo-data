class Section
  include Mongoid::Document

  field :sec, as: :section
  field :t, as: :title
  field :desc
  field :alt, as: :alt_title
  field :subt, as: :subtitle
  field :no, type: Integer
  field :ordr, as: :order, type: Integer

  embedded_in :part

  embeds_many :subsections, cascade_callbacks: true
  embeds_many :chapters, as: :readable, cascade_callbacks: true
end
