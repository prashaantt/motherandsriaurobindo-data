class Author
  include Mongoid::Document

  field :auth, as: :author
  field :autn, as: :author_name
  field :desc
  field :dest, as: :description_title
  field :comp, as: :compilations, type: Array

  before_save :set_compilations

  private

  def set_compilations
    result = Compilation.where(auth: self.auth)
    if result.count.to_i > 0
      compilations = []
      result.each do |compilation|
        comp = {}
        comp[:t] = compilation.cmpn
        comp[:u] = compilation.curl
        compilations.push(comp)
      end
      self.comp = compilations
    end
  end
end
