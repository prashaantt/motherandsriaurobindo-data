class Segment
  include Mongoid::Document

  field :seg, as: :segment
  field :t, as: :title
  field :subt, as: :subtitle
  field :no, type: Integer
  field :ordr, as: :order, type: Integer
  field :desc, as: :description
  # field :dt, as: :date, type: Date
  # field :yr, as: :year, type: Integer
  # field :mon, as: :month, type: Integer
  # field :loc, as: :location
  # field :txt, as: :text

  embedded_in :chapter

  embeds_many :items, as: :itemised, cascade_callbacks: true
end
