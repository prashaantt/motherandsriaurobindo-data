class Part
  include Mongoid::Document

  field :part
  field :t, as: :title
  field :alt, as: :alt_title
  field :subt, as: :subtitle
  field :desc
  field :no, type: Integer
  field :ordr, as: :order, type: Integer

  embedded_in :partable, polymorphic: true

  embeds_many :sections, cascade_callbacks: true
  embeds_many :chapters, as: :readable, cascade_callbacks: true
end
