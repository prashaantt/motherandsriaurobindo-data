class Subsection
  include Mongoid::Document

  field :subs, as: :subsection
  field :t, as: :title
  field :desc
  field :alt, as: :alt_title
  field :subt, as: :subtitle
  field :no, type: Integer
  field :ordr, as: :order, type: Integer

  embedded_in :section

  embeds_many :chapters, as: :readable, cascade_callbacks: true
end
