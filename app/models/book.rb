class Book
  include Mongoid::Document

  field :book
  field :t, as: :title
  field :alt, as: :alt_title
  field :subt, as: :subtitle
  field :no, type: Integer
  field :ordr, as: :order, type: Integer

  embedded_in :volume

  embeds_many :parts, as: :partable, cascade_callbacks: true
  embeds_many :chapters, as: :readable, cascade_callbacks: true
end
