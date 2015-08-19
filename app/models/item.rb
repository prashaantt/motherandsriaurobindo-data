class Item
  include Mongoid::Document

  field :item
  field :desc
  field :t, as: :title
  field :subt, as: :subtitle
  field :no, type: Integer
  field :ordr, as: :order, type: Integer
  field :dt, as: :date
  field :dto, as: :date_obj, type: Date
  field :yr, as: :year, type: Integer
  field :mo, as: :month, type: Integer
  field :dts, as: :date_start, type: Integer
  field :dte, as: :date_end, type: Integer
  field :mts, as: :month_start, type: Integer
  field :mte, as: :month_end, type: Integer
  field :yrs, as: :year_start, type: Integer
  field :yre, as: :year_end, type: Integer
  field :loc, as: :location
  field :txt, as: :text
  field :type

  embedded_in :itemised, polymorphic: true
end
